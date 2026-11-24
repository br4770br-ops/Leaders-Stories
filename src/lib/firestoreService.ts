import {
  EmailAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentReference,
} from 'firebase/firestore';
import { ADMIN_BOOTSTRAP_EMAIL, auth, db } from './firebase';
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
  language: LanguageCode;
  favorites: FavoriteRecord[];
  progressMap: Record<string, StoryProgressRecord>;
  conversations: ConversationSummary[];
  relationshipsMap: Record<string, RelationshipMeterValue[]>;
  memoriesMap: Record<string, StoryMemoryRecord[]>;
}

/**
 * Ensures a user profile exists in Firestore ONLY if missing.
 * Never overwrites existing cloud data during login or app reinstall.
 */
export async function ensureUserProfile(
  user: User,
  fallbackUsername?: string
): Promise<UserProfileRecord> {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfileRecord;
    }

    const derivedName = (
      fallbackUsername ||
      user.displayName ||
      user.email?.split('@')[0] ||
      'Storyteller'
    )
      .trim()
      .slice(0, 64);

    const profilePayload = {
      uid: user.uid,
      username: derivedName,
      email: (user.email || '').slice(0, 254),
      preferredLanguage: 'hinglish' as LanguageCode,
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
      uid: user.uid,
      username: derivedName,
      email: user.email || '',
      preferredLanguage: 'hinglish',
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function restoreAllUserCloudData(user: User): Promise<RestoredCloudData> {
  const uid = user.uid;
  const profile = await ensureUserProfile(user);

  let language: LanguageCode = profile.preferredLanguage || 'hinglish';
  try {
    const prefSnap = await getDoc(doc(db, 'users', uid, 'preferences', 'settings'));
    if (prefSnap.exists()) {
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
    const favSnap = await getDocs(
      query(collection(db, 'users', uid, 'favorites'), where('uid', '==', uid))
    );
    favorites = favSnap.docs.map((d) => d.data() as FavoriteRecord);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${uid}/favorites`);
  }

  const progressMap: Record<string, StoryProgressRecord> = {};
  try {
    const progSnap = await getDocs(
      query(collection(db, 'users', uid, 'storyProgress'), where('uid', '==', uid))
    );
    progSnap.docs.forEach((d) => {
      const data = d.data() as StoryProgressRecord;
      progressMap[data.storyId] = data;
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${uid}/storyProgress`);
  }

  let conversations: ConversationSummary[] = [];
  try {
    const convSnap = await getDocs(
      query(collection(db, 'users', uid, 'conversations'), where('uid', '==', uid))
    );
    conversations = convSnap.docs.map((d) => d.data() as ConversationSummary);
    conversations.sort((a, b) => {
      const ta = toMillis(a.updatedAt);
      const tb = toMillis(b.updatedAt);
      return tb - ta;
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${uid}/conversations`);
  }

  const relationshipsMap: Record<string, RelationshipMeterValue[]> = {};
  try {
    const relSnap = await getDocs(
      query(collection(db, 'users', uid, 'relationships'), where('uid', '==', uid))
    );
    relSnap.docs.forEach((d) => {
      const data = d.data() as { storyId: string; meters: RelationshipMeterValue[] };
      relationshipsMap[data.storyId] = data.meters || [];
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${uid}/relationships`);
  }

  const memoriesMap: Record<string, StoryMemoryRecord[]> = {};
  try {
    const memSnap = await getDocs(
      query(collection(db, 'users', uid, 'memories'), where('uid', '==', uid))
    );
    memSnap.docs.forEach((d) => {
      const data = { ...(d.data() as StoryMemoryRecord), id: d.id };
      if (!memoriesMap[data.storyId]) memoriesMap[data.storyId] = [];
      memoriesMap[data.storyId].push(data);
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${uid}/memories`);
  }

  return {
    profile,
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
  if (typeof ts === 'number') return ts;
  if (typeof ts === 'object' && ts !== null && 'toMillis' in ts) {
    const fn = (ts as { toMillis?: () => number }).toMillis;
    if (typeof fn === 'function') return fn();
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
    const snap = await getDocs(q);
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

export async function initializeStorySessionInCloud(
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
    const meters: RelationshipMeterValue[] = story.relationshipMeters.map((m) => ({
      ...m,
      value: m.initialValue,
    }));
    const openingBeats = story.openingBeats[language] || story.openingBeats.hinglish;
    const lastBeat = openingBeats[openingBeats.length - 1];
    const lastSpeaker = lastBeat?.speakerName || story.characters[0]?.name || 'Narrator';
    const lastPreview = (lastBeat?.text || story.tagline).slice(0, 1000);
    const msgId = `msg_0_${Date.now()}`;

    const batch = writeBatch(db);
    const convRef = doc(db, 'users', uid, 'conversations', conversationId);
    const convPayload: ConversationSummary = {
      uid,
      conversationId,
      storyId: story.id,
      storyTitle: story.title.slice(0, 140),
      coverImage: story.coverImage.slice(0, 512),
      lastMessage: lastPreview,
      lastSpeaker: lastSpeaker.slice(0, 100),
      messageCount: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    batch.set(convRef, convPayload);

    const msgRef = doc(db, 'users', uid, 'conversations', conversationId, 'messages', msgId);
    const initialMsgPayload = {
      uid,
      conversationId,
      role: 'story' as const,
      sceneSummary: story.openingScene.slice(0, 500),
      beats: openingBeats,
      metersSnapshot: meters.map((m) => ({
        id: m.id,
        label: m.label,
        emoji: m.emoji,
        value: m.value,
      })),
      sequence: 0,
      createdAt: serverTimestamp(),
    };
    batch.set(msgRef, initialMsgPayload);

    const progRef = doc(db, 'users', uid, 'storyProgress', story.id);
    const progPayload: StoryProgressRecord = {
      uid,
      storyId: story.id,
      currentScene: story.openingScene.slice(0, 500),
      sceneIndex: 0,
      status: 'active',
      choicesMade: [],
      savedCharacterIds: story.characters.map((c) => c.id),
      startedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    batch.set(progRef, progPayload);

    const relRef = doc(db, 'users', uid, 'relationships', story.id);
    batch.set(relRef, {
      uid,
      storyId: story.id,
      meters,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();

    return {
      conversation: { ...convPayload, localUpdatedAt: Date.now() },
      initialMessage: { ...initialMsgPayload, id: msgId, localTimestamp: Date.now() },
      meters,
      progress: progPayload,
    };
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
    const userMsgId = `msg_${userSequence}_${now}`;
    const storySeq = userSequence + 1;
    const storyMsgId = `msg_${storySeq}_${now + 1}`;

    const lastBeat = storyBeats[storyBeats.length - 1];
    const lastSpeaker = lastBeat?.speakerName || story.characters[0]?.name || 'Story';
    const lastPreview = (lastBeat?.text || newScene).slice(0, 1000);

    const convRef = doc(db, 'users', uid, 'conversations', conversationId);
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

    const progRef = doc(db, 'users', uid, 'storyProgress', story.id);
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
    batch.update(progRef, progUpdate);

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

    return {
      userMessage: { ...userMsgPayload, id: userMsgId, localTimestamp: now },
      storyMessage: { ...storyMsgPayload, id: storyMsgId, localTimestamp: now + 1 },
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
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
    const snap = await getDocs(q);
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

export async function isUserAdmin(user: User | null): Promise<boolean> {
  if (!user || !user.emailVerified) return false;
  if (user.email === ADMIN_BOOTSTRAP_EMAIL) return true;
  try {
    const adminSnap = await getDoc(doc(db, 'admins', user.uid));
    return adminSnap.exists();
  } catch {
    return false;
  }
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
