import {
  EmailAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  updatePassword,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromCache,
  getDocs,
  getDocsFromCache,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  type Query,
  type QuerySnapshot,
} from 'firebase/firestore';
import { MAIN_ADMIN_EMAIL, auth, db } from './firebase';
import {
  DEFAULT_APP_CONTENT,
  DEFAULT_APP_SETTINGS,
  type AppContentConfig,
  type AppSettingsConfig,
} from '../types/appConfig';
import type {
  ChatTurnMessage,
  ConversationSummary,
  FavoriteRecord,
  LanguageCode,
  RelationshipMeterValue,
  StoryBeat,
  StoryDefinition,
  StoryMemoryRecord,
  StoryProgressRecord,
  UserProfileRecord,
} from '../types/story';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface RestoredCloudData {
  profile: UserProfileRecord;
  isBlocked: boolean;
  blockReason?: string;
  offlineFallback?: boolean;
  language: LanguageCode;
  favorites: FavoriteRecord[];
  progressMap: Record<string, StoryProgressRecord>;
  conversations: ConversationSummary[];
  relationshipsMap: Record<string, RelationshipMeterValue[]>;
  memoriesMap: Record<string, StoryMemoryRecord[]>;
}

function isOfflineOrUnavailableError(err: unknown): boolean {
  const code = (err as { code?: string })?.code || '';
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    code === 'unavailable' ||
    msg.includes('client is offline') ||
    msg.includes('failed to get document') ||
    msg.includes('network')
  );
}

async function getDocResilient(
  ref: DocumentReference<DocumentData>
): Promise<{ snap: DocumentSnapshot<DocumentData> | null; offline: boolean }> {
  try {
    const snap = await getDoc(ref);
    return { snap, offline: false };
  } catch (err) {
    if (!isOfflineOrUnavailableError(err)) {
      throw err;
    }
    // Brief retry in case Firestore WebChannel/long-polling handshake just completed
    await new Promise((r) => setTimeout(r, 450));
    try {
      const retrySnap = await getDoc(ref);
      return { snap: retrySnap, offline: false };
    } catch (retryErr) {
      if (!isOfflineOrUnavailableError(retryErr)) {
        throw retryErr;
      }
      try {
        const cached = await getDocFromCache(ref);
        return { snap: cached, offline: true };
      } catch {
        return { snap: null, offline: true };
      }
    }
  }
}

async function getDocsResilient(
  q: Query<DocumentData>
): Promise<{ snap: QuerySnapshot<DocumentData> | null; offline: boolean }> {
  try {
    const snap = await getDocs(q);
    return { snap, offline: false };
  } catch (err) {
    if (!isOfflineOrUnavailableError(err)) {
      throw err;
    }
    try {
      const cached = await getDocsFromCache(q);
      return { snap: cached, offline: true };
    } catch {
      return { snap: null, offline: true };
    }
  }
}

export function isMainAdminEmail(email?: string | null): boolean {
  return Boolean(email && email.trim().toLowerCase() === MAIN_ADMIN_EMAIL);
}

/**
 * Checks whether a user UID is currently blocked in Firestore.
 */
export async function checkUserBlockedStatus(
  uid: string
): Promise<{ blocked: boolean; reason?: string }> {
  try {
    const { snap } = await getDocResilient(doc(db, 'blockedUsers', uid));
    if (snap && snap.exists()) {
      const data = snap.data() as { reason?: string };
      return { blocked: true, reason: data.reason };
    }
    return { blocked: false };
  } catch {
    return { blocked: false };
  }
}

/**
 * Ensures a user profile exists in Firestore ONLY if missing.
 * Never overwrites existing cloud data during login or app reinstall.
 */
export async function ensureUserProfile(
  user: User,
  fallbackUsername?: string
): Promise<{ profile: UserProfileRecord; offline: boolean }> {
  const path = `users/${user.uid}`;
  const derivedName = (
    fallbackUsername ||
    user.displayName ||
    user.email?.split('@')[0] ||
    'Storyteller'
  )
    .trim()
    .slice(0, 64);
  const role = isMainAdminEmail(user.email) ? ('admin' as const) : ('user' as const);

  try {
    const userRef = doc(db, 'users', user.uid);
    const { snap, offline } = await getDocResilient(userRef);

    if (snap && snap.exists()) {
      const existing = snap.data() as UserProfileRecord;
      if (!offline && existing.status !== 'blocked') {
        // Silently record last login timestamp without touching user data
        void updateDoc(userRef, {
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }).catch(() => {});
      }
      return { profile: existing, offline };
    }

    if (offline) {
      return {
        profile: {
          uid: user.uid,
          username: derivedName,
          email: user.email || '',
          ...(user.photoURL ? { avatarUrl: user.photoURL.slice(0, 512) } : {}),
          preferredLanguage: 'hinglish',
          role,
          status: 'active',
        },
        offline: true,
      };
    }

    const profilePayload = {
      uid: user.uid,
      username: derivedName,
      email: (user.email || '').slice(0, 254),
      ...(user.photoURL ? { avatarUrl: user.photoURL.slice(0, 512) } : {}),
      preferredLanguage: 'hinglish' as LanguageCode,
      role,
      status: 'active' as const,
      lastLoginAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const batch = writeBatch(db);
    batch.set(userRef, profilePayload);
    batch.set(doc(db, 'users', user.uid, 'preferences', 'settings'), {
      uid: user.uid,
      language: 'hinglish',
      autoScroll: true,
      soundEffects: true,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();

    return {
      profile: {
        uid: user.uid,
        username: derivedName,
        email: user.email || '',
        ...(user.photoURL ? { avatarUrl: user.photoURL.slice(0, 512) } : {}),
        preferredLanguage: 'hinglish',
        role,
        status: 'active',
      },
      offline: false,
    };
  } catch (err) {
    if (isOfflineOrUnavailableError(err)) {
      return {
        profile: {
          uid: user.uid,
          username: derivedName,
          email: user.email || '',
          ...(user.photoURL ? { avatarUrl: user.photoURL.slice(0, 512) } : {}),
          preferredLanguage: 'hinglish',
          role,
          status: 'active',
        },
        offline: true,
      };
    }
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function restoreAllUserCloudData(user: User): Promise<RestoredCloudData> {
  const uid = user.uid;
  const [{ profile, offline: profileOffline }, blockState] = await Promise.all([
    ensureUserProfile(user),
    checkUserBlockedStatus(uid),
  ]);

  let anyOffline = profileOffline;

  const isBlocked = blockState.blocked || profile.status === 'blocked';
  const blockReason = blockState.reason || profile.blockedReason;
  if (isBlocked) {
    return {
      profile,
      isBlocked: true,
      blockReason,
      offlineFallback: anyOffline,
      language: profile.preferredLanguage || 'hinglish',
      favorites: [],
      progressMap: {},
      conversations: [],
      relationshipsMap: {},
      memoriesMap: {},
    };
  }

  let language: LanguageCode = profile.preferredLanguage || 'hinglish';
  try {
    const { snap: prefSnap, offline } = await getDocResilient(
      doc(db, 'users', uid, 'preferences', 'settings')
    );
    anyOffline = anyOffline || offline;
    if (prefSnap && prefSnap.exists()) {
      const prefData = prefSnap.data() as { language?: LanguageCode };
      if (prefData.language) {
        language = prefData.language;
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}/preferences/settings`);
  }

  let favorites: FavoriteRecord[] = [];
  try {
    const { snap: favSnap, offline } = await getDocsResilient(
      query(collection(db, 'users', uid, 'favorites'), where('uid', '==', uid))
    );
    anyOffline = anyOffline || offline;
    if (favSnap) {
      favorites = favSnap.docs.map((d) => d.data() as FavoriteRecord);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${uid}/favorites`);
  }

  const progressMap: Record<string, StoryProgressRecord> = {};
  try {
    const { snap: progSnap, offline } = await getDocsResilient(
      query(collection(db, 'users', uid, 'storyProgress'), where('uid', '==', uid))
    );
    anyOffline = anyOffline || offline;
    if (progSnap) {
      progSnap.docs.forEach((d) => {
        const data = d.data() as StoryProgressRecord;
        progressMap[data.storyId] = data;
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${uid}/storyProgress`);
  }

  let conversations: ConversationSummary[] = [];
  try {
    const { snap: convSnap, offline } = await getDocsResilient(
      query(collection(db, 'users', uid, 'conversations'), where('uid', '==', uid))
    );
    anyOffline = anyOffline || offline;
    if (convSnap) {
      conversations = convSnap.docs.map((d) => d.data() as ConversationSummary);
      conversations.sort((a, b) => {
        const ta = toMillis(a.updatedAt);
        const tb = toMillis(b.updatedAt);
        return tb - ta;
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${uid}/conversations`);
  }

  const relationshipsMap: Record<string, RelationshipMeterValue[]> = {};
  try {
    const { snap: relSnap, offline } = await getDocsResilient(
      query(collection(db, 'users', uid, 'relationships'), where('uid', '==', uid))
    );
    anyOffline = anyOffline || offline;
    if (relSnap) {
      relSnap.docs.forEach((d) => {
        const data = d.data() as { storyId: string; meters: RelationshipMeterValue[] };
        relationshipsMap[data.storyId] = data.meters || [];
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${uid}/relationships`);
  }

  const memoriesMap: Record<string, StoryMemoryRecord[]> = {};
  try {
    const { snap: memSnap, offline } = await getDocsResilient(
      query(collection(db, 'users', uid, 'memories'), where('uid', '==', uid))
    );
    anyOffline = anyOffline || offline;
    if (memSnap) {
      memSnap.docs.forEach((d) => {
        const data = { ...(d.data() as StoryMemoryRecord), id: d.id };
        if (!memoriesMap[data.storyId]) memoriesMap[data.storyId] = [];
        memoriesMap[data.storyId].push(data);
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${uid}/memories`);
  }

  return {
    profile,
    isBlocked: false,
    offlineFallback: anyOffline,
    language,
    favorites,
    progressMap,
    conversations,
    relationshipsMap,
    memoriesMap,
  };
}

export function toMillis(ts: unknown): number {
  if (!ts) return 0;
  if (typeof ts === 'number') return Number.isFinite(ts) ? ts : 0;
  if (ts instanceof Date) return Number.isNaN(ts.getTime()) ? 0 : ts.getTime();
  if (typeof ts === 'string') {
    const parsed = Date.parse(ts);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (typeof ts === 'object' && ts !== null) {
    const maybeTs = ts as {
      toMillis?: () => number;
      seconds?: number;
      nanoseconds?: number;
    };
    if (typeof maybeTs.toMillis === 'function') {
      try {
        return maybeTs.toMillis();
      } catch {
        // fall through to seconds fallback
      }
    }
    if (typeof maybeTs.seconds === 'number') {
      return maybeTs.seconds * 1000 + Math.floor((maybeTs.nanoseconds || 0) / 1e6);
    }
  }
  return 0;
}

export async function updateUserLanguageAndProfile(
  uid: string,
  updates: { username?: string; preferredLanguage?: LanguageCode; avatarUrl?: string }
): Promise<void> {
  const path = `users/${uid}`;
  try {
    const batch = writeBatch(db);
    const userPayload: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };
    if (updates.username) userPayload.username = updates.username.trim().slice(0, 64);
    if (updates.preferredLanguage) userPayload.preferredLanguage = updates.preferredLanguage;
    if (typeof updates.avatarUrl === 'string') userPayload.avatarUrl = updates.avatarUrl.slice(0, 512);

    batch.update(doc(db, 'users', uid), userPayload);
    if (updates.preferredLanguage) {
      batch.set(
        doc(db, 'users', uid, 'preferences', 'settings'),
        {
          uid,
          language: updates.preferredLanguage,
          autoScroll: true,
          soundEffects: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function toggleFavoriteStory(
  uid: string,
  story: StoryDefinition,
  currentlyFavorite: boolean
): Promise<void> {
  const path = `users/${uid}/favorites/${story.id}`;
  try {
    const favRef = doc(db, 'users', uid, 'favorites', story.id);
    if (currentlyFavorite) {
      await deleteDoc(favRef);
    } else {
      await setDoc(favRef, {
        uid,
        storyId: story.id,
        title: story.title.slice(0, 140),
        coverImage: story.coverImage.slice(0, 512),
        genre: story.primaryCategory.slice(0, 64),
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

async function commitDeleteOpsInChunks(refs: DocumentReference[]): Promise<void> {
  const CHUNK_SIZE = 450;
  for (let i = 0; i < refs.length; i += CHUNK_SIZE) {
    const batch = writeBatch(db);
    refs.slice(i, i + CHUNK_SIZE).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}

export async function loadConversationMessagesFromCache(
  uid: string,
  conversationId: string,
  maxItems = 80
): Promise<ChatTurnMessage[]> {
  try {
    const q = query(
      collection(db, 'users', uid, 'conversations', conversationId, 'messages'),
      where('uid', '==', uid)
    );
    const snap = await getDocsFromCache(q);
    const items = snap.docs.map((d) => ({
      ...(d.data() as ChatTurnMessage),
      id: d.id,
    }));
    items.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    return items.slice(-maxItems);
  } catch {
    return [];
  }
}

export async function loadConversationMessages(
  uid: string,
  conversationId: string,
  maxItems = 80
): Promise<ChatTurnMessage[]> {
  const path = `users/${uid}/conversations/${conversationId}/messages`;
  try {
    // Single-field equality filter matches firestore.rules without requiring a composite index
    const q = query(
      collection(db, 'users', uid, 'conversations', conversationId, 'messages'),
      where('uid', '==', uid)
    );
    const { snap } = await getDocsResilient(q);
    if (!snap) return [];
    const items = snap.docs.map((d) => ({
      ...(d.data() as ChatTurnMessage),
      id: d.id,
    }));
    items.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    return items.slice(-maxItems);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export function buildInitialStorySessionData(
  uid: string,
  story: StoryDefinition,
  language: LanguageCode,
  msgId = `msg_0_${Date.now()}`
): {
  conversation: ConversationSummary;
  initialMessage: ChatTurnMessage;
  meters: RelationshipMeterValue[];
  progress: StoryProgressRecord;
} {
  const meters: RelationshipMeterValue[] = story.relationshipMeters.map((m) => ({
    ...m,
    value: m.initialValue,
  }));
  const openingBeats = story.openingBeats[language] || story.openingBeats.hinglish;
  const lastBeat = openingBeats[openingBeats.length - 1];
  const lastSpeaker = lastBeat?.speakerName || story.characters[0]?.name || 'Narrator';
  const lastPreview = (lastBeat?.text || story.tagline).slice(0, 1000);
  const now = Date.now();

  return {
    conversation: {
      uid,
      conversationId: story.id,
      storyId: story.id,
      storyTitle: story.title.slice(0, 140),
      coverImage: story.coverImage.slice(0, 512),
      lastMessage: lastPreview,
      lastSpeaker: lastSpeaker.slice(0, 100),
      messageCount: 1,
      localUpdatedAt: now,
    },
    initialMessage: {
      id: msgId,
      uid,
      conversationId: story.id,
      role: 'story',
      sceneSummary: story.openingScene.slice(0, 500),
      beats: openingBeats,
      metersSnapshot: meters.map((m) => ({
        id: m.id,
        label: m.label,
        emoji: m.emoji,
        value: m.value,
      })),
      sequence: 0,
      localTimestamp: now,
    },
    meters,
    progress: {
      uid,
      storyId: story.id,
      currentScene: story.openingScene.slice(0, 500),
      sceneIndex: 0,
      status: 'active',
      choicesMade: [],
      savedCharacterIds: story.characters.map((c) => c.id),
    },
  };
}

export async function initializeStorySessionInCloud(
  uid: string,
  story: StoryDefinition,
  language: LanguageCode,
  msgId = `msg_0_${Date.now()}`
): Promise<{
  conversation: ConversationSummary;
  initialMessage: ChatTurnMessage;
  meters: RelationshipMeterValue[];
  progress: StoryProgressRecord;
}> {
  const conversationId = story.id;
  const path = `users/${uid}/conversations/${conversationId}`;
  try {
    const built = buildInitialStorySessionData(uid, story, language, msgId);
    const batch = writeBatch(db);
    const convRef = doc(db, 'users', uid, 'conversations', conversationId);
    batch.set(convRef, {
      uid,
      conversationId,
      storyId: story.id,
      storyTitle: story.title.slice(0, 140),
      coverImage: story.coverImage.slice(0, 512),
      lastMessage: built.conversation.lastMessage,
      lastSpeaker: built.conversation.lastSpeaker,
      messageCount: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const msgRef = doc(db, 'users', uid, 'conversations', conversationId, 'messages', msgId);
    batch.set(msgRef, {
      uid,
      conversationId,
      role: 'story',
      sceneSummary: built.initialMessage.sceneSummary,
      beats: built.initialMessage.beats,
      metersSnapshot: built.initialMessage.metersSnapshot,
      sequence: 0,
      createdAt: serverTimestamp(),
    });

    const progRef = doc(db, 'users', uid, 'storyProgress', story.id);
    batch.set(progRef, {
      uid,
      storyId: story.id,
      currentScene: built.progress.currentScene,
      sceneIndex: 0,
      status: 'active',
      choicesMade: [],
      savedCharacterIds: built.progress.savedCharacterIds,
      startedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const relRef = doc(db, 'users', uid, 'relationships', story.id);
    batch.set(relRef, {
      uid,
      storyId: story.id,
      meters: built.meters,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
    return built;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveTurnToCloud(params: {
  uid: string;
  story: StoryDefinition;
  conversationExists: boolean;
  userText: string;
  userSequence: number;
  userMessageId?: string;
  storyMessageId?: string;
  storyBeats: StoryBeat[];
  newScene: string;
  sceneIndex: number;
  updatedMeters: RelationshipMeterValue[];
  choicesMade: string[];
  endingTriggered?: string;
  newMemory?: { summary: string; importance: number; charactersInvolved?: string[] } | null;
}): Promise<{ userMessage: ChatTurnMessage; storyMessage: ChatTurnMessage }> {
  const {
    uid,
    story,
    userText,
    userSequence,
    storyBeats,
    newScene,
    sceneIndex,
    updatedMeters,
    choicesMade,
    endingTriggered,
    newMemory,
  } = params;
  const conversationId = story.id;
  const path = `users/${uid}/conversations/${conversationId}/messages`;

  try {
    const batch = writeBatch(db);
    const now = Date.now();
    const userMsgId = params.userMessageId || `msg_${userSequence}_${now}`;
    const storySeq = userSequence + 1;
    const storyMsgId = params.storyMessageId || `msg_${storySeq}_${now + 1}`;

    const lastBeat = storyBeats[storyBeats.length - 1];
    const lastSpeaker = lastBeat?.speakerName || story.characters[0]?.name || 'Story';
    const lastPreview = (lastBeat?.text || newScene).slice(0, 1000);

    const convRef = doc(db, 'users', uid, 'conversations', conversationId);
    const progRef = doc(db, 'users', uid, 'storyProgress', story.id);
    const relRef = doc(db, 'users', uid, 'relationships', story.id);

    if (params.conversationExists) {
      batch.update(convRef, {
        lastMessage: lastPreview,
        lastSpeaker: lastSpeaker.slice(0, 100),
        messageCount: storySeq + 1,
        updatedAt: serverTimestamp(),
      });
    } else {
      batch.set(convRef, {
        uid,
        conversationId,
        storyId: story.id,
        storyTitle: story.title.slice(0, 140),
        coverImage: story.coverImage.slice(0, 512),
        lastMessage: lastPreview,
        lastSpeaker: lastSpeaker.slice(0, 100),
        messageCount: storySeq + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    const userMsgPayload = {
      uid,
      conversationId,
      role: 'user' as const,
      userText: userText.slice(0, 4000),
      sequence: userSequence,
      createdAt: serverTimestamp(),
    };
    batch.set(doc(db, 'users', uid, 'conversations', conversationId, 'messages', userMsgId), userMsgPayload);

    const storyMsgPayload = {
      uid,
      conversationId,
      role: 'story' as const,
      sceneSummary: newScene.slice(0, 500),
      beats: storyBeats.slice(0, 12),
      metersSnapshot: updatedMeters.map((m) => ({
        id: m.id,
        label: m.label,
        emoji: m.emoji,
        value: m.value,
      })),
      sequence: storySeq,
      createdAt: serverTimestamp(),
    };
    batch.set(doc(db, 'users', uid, 'conversations', conversationId, 'messages', storyMsgId), storyMsgPayload);

    const progUpdate: Record<string, unknown> = {
      currentScene: newScene.slice(0, 500),
      sceneIndex,
      status: endingTriggered ? 'completed' : 'active',
      choicesMade: choicesMade.slice(-50),
      savedCharacterIds: story.characters.map((c) => c.id).slice(0, 30),
      updatedAt: serverTimestamp(),
    };
    if (endingTriggered) {
      progUpdate.endingReached = endingTriggered.slice(0, 200);
    }

    if (params.conversationExists) {
      batch.update(progRef, progUpdate);
      batch.update(relRef, {
        meters: updatedMeters,
        updatedAt: serverTimestamp(),
      });
    } else {
      batch.set(progRef, {
        uid,
        storyId: story.id,
        ...progUpdate,
        startedAt: serverTimestamp(),
      });
      batch.set(relRef, {
        uid,
        storyId: story.id,
        meters: updatedMeters,
        updatedAt: serverTimestamp(),
      });
    }

    if (newMemory && newMemory.summary) {
      const memId = `mem_${story.id}_${now}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
      batch.set(doc(db, 'users', uid, 'memories', memId), {
        uid,
        storyId: story.id,
        summary: newMemory.summary.slice(0, 600),
        importance: Math.min(10, Math.max(1, Math.round(newMemory.importance || 6))),
        charactersInvolved: (newMemory.charactersInvolved || []).slice(0, 10),
        createdAt: serverTimestamp(),
      });
    }

    await batch.commit();

    return {
      userMessage: { ...userMsgPayload, id: userMsgId, localTimestamp: now },
      storyMessage: { ...storyMsgPayload, id: storyMsgId, localTimestamp: now + 1 },
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveStoryContinueToCloud(params: {
  uid: string;
  story: StoryDefinition;
  storyBeats: StoryBeat[];
  storySequence: number;
  storyMessageId?: string;
  totalMessageCount: number;
  newScene: string;
  sceneIndex: number;
  updatedMeters: RelationshipMeterValue[];
  endingTriggered?: string;
  newMemory?: { summary: string; importance: number; charactersInvolved?: string[] } | null;
}): Promise<ChatTurnMessage> {
  const {
    uid,
    story,
    storyBeats,
    storySequence,
    totalMessageCount,
    newScene,
    sceneIndex,
    updatedMeters,
    endingTriggered,
    newMemory,
  } = params;
  const conversationId = story.id;
  const path = `users/${uid}/conversations/${conversationId}/messages`;

  try {
    const batch = writeBatch(db);
    const now = Date.now();
    const storyMsgId = params.storyMessageId || `msg_${storySequence}_${now}`;
    const lastBeat = storyBeats[storyBeats.length - 1];
    const lastSpeaker = lastBeat?.speakerName || story.characters[0]?.name || 'Story';
    const lastPreview = (lastBeat?.text || newScene).slice(0, 1000);

    batch.update(doc(db, 'users', uid, 'conversations', conversationId), {
      lastMessage: lastPreview,
      lastSpeaker: lastSpeaker.slice(0, 100),
      messageCount: totalMessageCount,
      updatedAt: serverTimestamp(),
    });

    const storyMsgPayload = {
      uid,
      conversationId,
      role: 'story' as const,
      sceneSummary: newScene.slice(0, 500),
      beats: storyBeats.slice(0, 12),
      metersSnapshot: updatedMeters.map((m) => ({
        id: m.id,
        label: m.label,
        emoji: m.emoji,
        value: m.value,
      })),
      sequence: storySequence,
      createdAt: serverTimestamp(),
    };
    batch.set(doc(db, 'users', uid, 'conversations', conversationId, 'messages', storyMsgId), storyMsgPayload);

    const progUpdate: Record<string, unknown> = {
      currentScene: newScene.slice(0, 500),
      sceneIndex,
      status: endingTriggered ? 'completed' : 'active',
      updatedAt: serverTimestamp(),
    };
    if (endingTriggered) {
      progUpdate.endingReached = endingTriggered.slice(0, 200);
    }
    batch.update(doc(db, 'users', uid, 'storyProgress', story.id), progUpdate);

    batch.update(doc(db, 'users', uid, 'relationships', story.id), {
      meters: updatedMeters,
      updatedAt: serverTimestamp(),
    });

    if (newMemory && newMemory.summary) {
      const memId = `mem_${story.id}_${now}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
      batch.set(doc(db, 'users', uid, 'memories', memId), {
        uid,
        storyId: story.id,
        summary: newMemory.summary.slice(0, 600),
        importance: Math.min(10, Math.max(1, Math.round(newMemory.importance || 6))),
        charactersInvolved: (newMemory.charactersInvolved || []).slice(0, 10),
        createdAt: serverTimestamp(),
      });
    }

    await batch.commit();
    return { ...storyMsgPayload, id: storyMsgId, localTimestamp: now };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function replaceLatestStoryMessageInCloud(params: {
  uid: string;
  story: StoryDefinition;
  oldMessageId: string;
  storyMessageId?: string;
  storySequence: number;
  totalMessageCount: number;
  storyBeats: StoryBeat[];
  newScene: string;
  sceneIndex: number;
  updatedMeters: RelationshipMeterValue[];
  endingTriggered?: string;
}): Promise<ChatTurnMessage> {
  const {
    uid,
    story,
    oldMessageId,
    storySequence,
    totalMessageCount,
    storyBeats,
    newScene,
    sceneIndex,
    updatedMeters,
    endingTriggered,
  } = params;
  const conversationId = story.id;
  const path = `users/${uid}/conversations/${conversationId}/messages`;

  try {
    const batch = writeBatch(db);
    const now = Date.now();
    const newMsgId = params.storyMessageId || `msg_${storySequence}_${now}`;
    const lastBeat = storyBeats[storyBeats.length - 1];
    const lastSpeaker = lastBeat?.speakerName || story.characters[0]?.name || 'Story';
    const lastPreview = (lastBeat?.text || newScene).slice(0, 1000);

    if (oldMessageId && !oldMessageId.startsWith('temp_')) {
      batch.delete(doc(db, 'users', uid, 'conversations', conversationId, 'messages', oldMessageId));
    }

    const storyMsgPayload = {
      uid,
      conversationId,
      role: 'story' as const,
      sceneSummary: newScene.slice(0, 500),
      beats: storyBeats.slice(0, 12),
      metersSnapshot: updatedMeters.map((m) => ({
        id: m.id,
        label: m.label,
        emoji: m.emoji,
        value: m.value,
      })),
      sequence: storySequence,
      createdAt: serverTimestamp(),
    };
    batch.set(doc(db, 'users', uid, 'conversations', conversationId, 'messages', newMsgId), storyMsgPayload);

    batch.update(doc(db, 'users', uid, 'conversations', conversationId), {
      lastMessage: lastPreview,
      lastSpeaker: lastSpeaker.slice(0, 100),
      messageCount: totalMessageCount,
      updatedAt: serverTimestamp(),
    });

    const progUpdate: Record<string, unknown> = {
      currentScene: newScene.slice(0, 500),
      sceneIndex,
      status: endingTriggered ? 'completed' : 'active',
      updatedAt: serverTimestamp(),
    };
    if (endingTriggered) {
      progUpdate.endingReached = endingTriggered.slice(0, 200);
    }
    batch.update(doc(db, 'users', uid, 'storyProgress', story.id), progUpdate);

    batch.update(doc(db, 'users', uid, 'relationships', story.id), {
      meters: updatedMeters,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
    return { ...storyMsgPayload, id: newMsgId, localTimestamp: now };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function rewindLastTurnInCloud(params: {
  uid: string;
  story: StoryDefinition;
  deleteMessageIds: string[];
  remainingLastMessage?: ChatTurnMessage;
  remainingCount: number;
  restoredScene: string;
  restoredSceneIndex: number;
  restoredMeters: RelationshipMeterValue[];
}): Promise<void> {
  const {
    uid,
    story,
    deleteMessageIds,
    remainingLastMessage,
    remainingCount,
    restoredScene,
    restoredSceneIndex,
    restoredMeters,
  } = params;
  const conversationId = story.id;
  const path = `users/${uid}/conversations/${conversationId}/messages`;

  try {
    const batch = writeBatch(db);
    deleteMessageIds.forEach((id) => {
      if (id && !id.startsWith('temp_')) {
        batch.delete(doc(db, 'users', uid, 'conversations', conversationId, 'messages', id));
      }
    });

    const lastBeat = remainingLastMessage?.beats?.[remainingLastMessage.beats.length - 1];
    const lastSpeaker =
      remainingLastMessage?.role === 'user'
        ? 'You'
        : lastBeat?.speakerName || story.characters[0]?.name || 'Story';
    const lastPreview = (
      remainingLastMessage?.userText ||
      lastBeat?.text ||
      restoredScene
    ).slice(0, 1000);

    batch.update(doc(db, 'users', uid, 'conversations', conversationId), {
      lastMessage: lastPreview,
      lastSpeaker: lastSpeaker.slice(0, 100),
      messageCount: remainingCount,
      updatedAt: serverTimestamp(),
    });

    batch.update(doc(db, 'users', uid, 'storyProgress', story.id), {
      currentScene: restoredScene.slice(0, 500),
      sceneIndex: Math.max(0, restoredSceneIndex),
      status: 'active',
      endingReached: '',
      updatedAt: serverTimestamp(),
    });

    batch.update(doc(db, 'users', uid, 'relationships', story.id), {
      meters: restoredMeters,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function restartStoryInCloud(
  uid: string,
  story: StoryDefinition,
  language: LanguageCode
): Promise<{
  conversation: ConversationSummary;
  initialMessage: ChatTurnMessage;
  meters: RelationshipMeterValue[];
  progress: StoryProgressRecord;
}> {
  const conversationId = story.id;
  const path = `users/${uid}/conversations/${conversationId}`;
  try {
    // Single-field equality queries avoid composite index requirements
    const [msgsSnap, memSnap] = await Promise.all([
      getDocs(
        query(
          collection(db, 'users', uid, 'conversations', conversationId, 'messages'),
          where('uid', '==', uid)
        )
      ),
      getDocs(
        query(collection(db, 'users', uid, 'memories'), where('uid', '==', uid))
      ),
    ]);

    const refsToDelete: DocumentReference[] = [
      ...msgsSnap.docs.map((d) => d.ref),
      ...memSnap.docs
        .filter((d) => (d.data() as { storyId?: string }).storyId === story.id)
        .map((d) => d.ref),
      doc(db, 'users', uid, 'conversations', conversationId),
      doc(db, 'users', uid, 'storyProgress', story.id),
      doc(db, 'users', uid, 'relationships', story.id),
    ];

    await commitDeleteOpsInChunks(refsToDelete);

    return await initializeStorySessionInCloud(uid, story, language);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function fetchPublishedAdminStories(): Promise<StoryDefinition[]> {
  try {
    const q = query(collection(db, 'stories'), where('published', '==', true));
    const { snap } = await getDocsResilient(q);
    if (!snap) return [];
    return snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      return {
        id: String(data.id || d.id),
        title: String(data.title || 'Untitled Story'),
        tagline: String(data.tagline || ''),
        about: String(data.about || ''),
        primaryCategory: (data.primaryCategory as StoryDefinition['primaryCategory']) || 'Drama',
        categories: ['For You', 'New', (data.primaryCategory as StoryDefinition['primaryCategory']) || 'Drama'],
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : ['Roleplay'],
        visualStyle: 'Cinematic Realism',
        rating: 4.8,
        chatCountLabel: 'New',
        chatCountNumeric: 1,
        isNew: true,
        coverImage: String(data.coverImage || ''),
        mediaGallery: Array.isArray(data.mediaGallery)
          ? (data.mediaGallery as string[]).map((url, idx) => ({
              id: `admin_media_${idx}`,
              url,
              caption: String(data.title || 'Scene'),
            }))
          : [],
        setting: String(data.openingScene || 'Interactive scene'),
        characters: Array.isArray(data.characters)
          ? (data.characters as StoryDefinition['characters'])
          : [],
        relationshipMeters: Array.isArray(data.relationshipMeters)
          ? (data.relationshipMeters as StoryDefinition['relationshipMeters'])
          : [
              { id: 'trust', label: 'Trust', emoji: '🤝', initialValue: 40, min: 0, max: 100, tone: 'trust' },
              { id: 'bond', label: 'Bond', emoji: '❤️', initialValue: 25, min: 0, max: 100, tone: 'love' },
            ],
        openingScene: String(data.openingScene || 'Scene begins'),
        openingBeats: {
          hinglish: Array.isArray(data.openingBeats)
            ? (data.openingBeats as StoryBeat[])
            : [{ type: 'narration', text: String(data.openingScene || 'Kahani shuru hoti hai...') }],
          hindi: Array.isArray(data.openingBeats)
            ? (data.openingBeats as StoryBeat[])
            : [{ type: 'narration', text: String(data.openingScene || 'कहानी शुरू होती है...') }],
          english: Array.isArray(data.openingBeats)
            ? (data.openingBeats as StoryBeat[])
            : [{ type: 'narration', text: String(data.openingScene || 'The story begins...') }],
        },
        initialChoices: {
          hinglish: ['Aage badho aur baat shuru karo', 'Pehle dhyaan se aas-paas dekho'],
          hindi: ['आगे बढ़ो और बात शुरू करो', 'पहले ध्यान से आसपास देखो'],
          english: ['Step forward and speak', 'Observe the room carefully first'],
        },
        possibleEndings: ['True Resolution', 'Dramatic Turning Point'],
      };
    });
  } catch (err) {
    // Public story catalog failure shouldn't crash unauthenticated home screen if index/rules need sign-in
    console.warn('Could not load custom stories:', err);
    return [];
  }
}

/**
 * Verifies Main Admin access using backend ID-token verification endpoint.
 */
export async function isUserAdmin(user: User | null): Promise<boolean> {
  if (!user || !user.emailVerified || !isMainAdminEmail(user.email)) {
    return false;
  }
  try {
    const token = await user.getIdToken();
    const resp = await fetch('/api/admin/session', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return false;
    const data = (await resp.json()) as { isAdmin?: boolean };
    return Boolean(data.isAdmin);
  } catch {
    return false;
  }
}

export async function fetchAppConfig(): Promise<{
  settings: AppSettingsConfig;
  content: AppContentConfig;
}> {
  try {
    const [{ snap: settingsSnap }, { snap: contentSnap }] = await Promise.all([
      getDocResilient(doc(db, 'appConfig', 'settings')),
      getDocResilient(doc(db, 'appConfig', 'content')),
    ]);

    const settings: AppSettingsConfig = settingsSnap && settingsSnap.exists()
      ? { ...DEFAULT_APP_SETTINGS, ...(settingsSnap.data() as Partial<AppSettingsConfig>) }
      : DEFAULT_APP_SETTINGS;

    const content: AppContentConfig = contentSnap && contentSnap.exists()
      ? { ...DEFAULT_APP_CONTENT, ...(contentSnap.data() as Partial<AppContentConfig>) }
      : DEFAULT_APP_CONTENT;

    return { settings, content };
  } catch {
    return {
      settings: DEFAULT_APP_SETTINGS,
      content: DEFAULT_APP_CONTENT,
    };
  }
}

export async function saveAppSettings(
  adminUser: User,
  settings: AppSettingsConfig
): Promise<void> {
  const path = 'appConfig/settings';
  try {
    const payload = {
      appName: (settings.appName || DEFAULT_APP_SETTINGS.appName).trim().slice(0, 80),
      appSubtitle: (settings.appSubtitle || '').trim().slice(0, 200),
      logoUrl: (settings.logoUrl || '').trim().slice(0, 512),
      supportEmail: (settings.supportEmail || '').trim().slice(0, 254),
      supportNote: (settings.supportNote || '').trim().slice(0, 500),
      allowRegistrations: Boolean(settings.allowRegistrations),
      registrationClosedMessage: (settings.registrationClosedMessage || '').trim().slice(0, 300),
      maintenanceMode: Boolean(settings.maintenanceMode),
      maintenanceMessage: (settings.maintenanceMessage || '').trim().slice(0, 500),
      announcementEnabled: Boolean(settings.announcementEnabled),
      announcementTitle: (settings.announcementTitle || '').trim().slice(0, 120),
      announcementMessage: (settings.announcementMessage || '').trim().slice(0, 500),
      announcementType: ['info', 'warning', 'success'].includes(settings.announcementType)
        ? settings.announcementType
        : 'info',
      themeMode: settings.themeMode === 'light' ? 'light' : 'dark',
      accentColor: /^#[0-9a-fA-F]{6}$/.test(settings.accentColor)
        ? settings.accentColor
        : '#E5233D',
      enableVoiceInput: Boolean(settings.enableVoiceInput),
      enableAiSuggestions: Boolean(settings.enableAiSuggestions),
      updatedBy: adminUser.uid,
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'appConfig', 'settings'), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveAppContent(
  adminUser: User,
  content: AppContentConfig
): Promise<void> {
  const path = 'appConfig/content';
  try {
    const payload = {
      welcomeHeading: (content.welcomeHeading || DEFAULT_APP_CONTENT.welcomeHeading)
        .trim()
        .slice(0, 140),
      welcomeSubheading: (content.welcomeSubheading || '').trim().slice(0, 400),
      heroBadgeText: (content.heroBadgeText || '').trim().slice(0, 80),
      homeFeaturedTitle: (content.homeFeaturedTitle || '').trim().slice(0, 100),
      guestPromptTitle: (content.guestPromptTitle || '').trim().slice(0, 140),
      guestPromptSubtitle: (content.guestPromptSubtitle || '').trim().slice(0, 400),
      helpGuideText: (content.helpGuideText || '').trim().slice(0, 1500),
      footerNote: (content.footerNote || '').trim().slice(0, 300),
      updatedBy: adminUser.uid,
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'appConfig', 'content'), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchAllUsersForAdmin(): Promise<UserProfileRecord[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list = snap.docs.map((d) => {
      const data = d.data() as UserProfileRecord;
      return {
        ...data,
        uid: data.uid || d.id,
        role: isMainAdminEmail(data.email) ? ('admin' as const) : ('user' as const),
        status: data.status === 'blocked' ? ('blocked' as const) : ('active' as const),
      };
    });
    list.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function setUserBlockStatus(
  adminUser: User,
  targetUser: UserProfileRecord,
  shouldBlock: boolean,
  reason = 'Suspended by administrator'
): Promise<void> {
  if (targetUser.uid === adminUser.uid || isMainAdminEmail(targetUser.email)) {
    throw new Error('The Main Admin account cannot be blocked.');
  }
  const token = await adminUser.getIdToken();
  const verifyResp = await fetch('/api/admin/validate-user-action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      targetUid: targetUser.uid,
      action: shouldBlock ? 'block' : 'unblock',
    }),
  });
  const verifyJson = (await verifyResp.json()) as { allowed?: boolean; error?: string };
  if (!verifyResp.ok || !verifyJson.allowed) {
    throw new Error(verifyJson.error || 'Server denied admin user action.');
  }

  const path = `users/${targetUser.uid}`;
  try {
    const batch = writeBatch(db);
    const userRef = doc(db, 'users', targetUser.uid);
    const blockedRef = doc(db, 'blockedUsers', targetUser.uid);
    const cleanReason = reason.trim().slice(0, 500) || 'Suspended by administrator';

    if (shouldBlock) {
      batch.update(userRef, {
        status: 'blocked',
        blockedReason: cleanReason,
        blockedAt: serverTimestamp(),
        blockedBy: adminUser.uid,
        updatedAt: serverTimestamp(),
      });
      batch.set(blockedRef, {
        uid: targetUser.uid,
        email: (targetUser.email || '').slice(0, 254),
        reason: cleanReason,
        blockedBy: adminUser.uid,
        blockedAt: serverTimestamp(),
      });
    } else {
      batch.update(userRef, {
        status: 'active',
        blockedReason: '',
        updatedAt: serverTimestamp(),
      });
      batch.delete(blockedRef);
    }

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function changeUserPassword(
  user: User,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  if (!user.email) {
    throw new Error('No email address associated with this account.');
  }
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

export async function saveAdminStory(user: User, storyInput: {
  id: string;
  title: string;
  tagline: string;
  about: string;
  primaryCategory: string;
  tags: string[];
  coverImage: string;
  openingScene: string;
  published: boolean;
  characters: StoryDefinition['characters'];
}): Promise<void> {
  const cleanId = storyInput.id.trim().replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const path = `stories/${cleanId}`;
  try {
    const ref = doc(db, 'stories', cleanId);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await updateDoc(ref, {
        title: storyInput.title.trim().slice(0, 140),
        tagline: storyInput.tagline.trim().slice(0, 300),
        about: storyInput.about.trim().slice(0, 3000),
        primaryCategory: storyInput.primaryCategory.trim().slice(0, 64),
        tags: storyInput.tags.slice(0, 10),
        coverImage: storyInput.coverImage.trim().slice(0, 1024),
        openingScene: storyInput.openingScene.trim().slice(0, 1000),
        characters: storyInput.characters.slice(0, 10),
        published: storyInput.published,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        id: cleanId,
        title: storyInput.title.trim().slice(0, 140),
        tagline: storyInput.tagline.trim().slice(0, 300),
        about: storyInput.about.trim().slice(0, 3000),
        primaryCategory: storyInput.primaryCategory.trim().slice(0, 64),
        tags: storyInput.tags.slice(0, 10),
        coverImage: storyInput.coverImage.trim().slice(0, 1024),
        openingScene: storyInput.openingScene.trim().slice(0, 1000),
        characters: storyInput.characters.slice(0, 10),
        openingBeats: [
          { type: 'narration', text: storyInput.openingScene.trim().slice(0, 600) },
          {
            type: 'dialogue',
            speakerName: storyInput.characters[0]?.name || 'Lead',
            text: 'Tum finally aa hi gaye. Chalo dekhte hain aage kya hota hai.',
          },
        ],
        published: storyInput.published,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteAccountAndCloudData(user: User, password: string): Promise<void> {
  if (!user.email) {
    throw new Error('Account email missing.');
  }
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);

  const uid = user.uid;
  try {
    const convSnap = await getDocs(
      query(collection(db, 'users', uid, 'conversations'), where('uid', '==', uid))
    );
    const refsToDelete: DocumentReference[] = [];
    for (const c of convSnap.docs) {
      const msgSnap = await getDocs(
        query(collection(db, 'users', uid, 'conversations', c.id, 'messages'), where('uid', '==', uid))
      );
      msgSnap.docs.forEach((m) => refsToDelete.push(m.ref));
      refsToDelete.push(c.ref);
    }

    const subCollections = ['favorites', 'storyProgress', 'relationships', 'memories', 'preferences'];
    for (const sub of subCollections) {
      const snap = await getDocs(query(collection(db, 'users', uid, sub), where('uid', '==', uid)));
      snap.docs.forEach((d) => refsToDelete.push(d.ref));
    }

    await commitDeleteOpsInChunks(refsToDelete);
    await deleteDoc(doc(db, 'users', uid));
    await deleteUser(user);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${uid}`);
  }
}
