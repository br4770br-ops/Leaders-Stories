import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

const MAIN_ADMIN_EMAIL = 'prabhuaj8@gmail.com';

// Read Firebase projectId & firestoreDatabaseId from firebase-applet-config.json if present
let firebaseProjectId = process.env.FIREBASE_PROJECT_ID || '';
let firestoreDatabaseId = process.env.FIRESTORE_DATABASE_ID || '(default)';
try {
  const fbConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(fbConfigPath)) {
    const parsed = JSON.parse(fs.readFileSync(fbConfigPath, 'utf-8')) as {
      projectId?: string;
      firestoreDatabaseId?: string;
    };
    if (parsed.projectId) {
      firebaseProjectId = parsed.projectId;
    }
    if (parsed.firestoreDatabaseId) {
      firestoreDatabaseId = parsed.firestoreDatabaseId;
    }
  }
} catch {
  // Ignore config read issues; will rely on env if needed
}

function getFirestoreRestBase(): string {
  if (!firebaseProjectId) return '';
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(firebaseProjectId)}/databases/${encodeURIComponent(firestoreDatabaseId)}/documents`;
}

async function fetchFirestoreDocWithToken(
  docPath: string,
  bearerToken?: string
): Promise<{ exists: boolean; fields?: Record<string, Record<string, unknown>> }> {
  const base = getFirestoreRestBase();
  if (!base) return { exists: false };
  try {
    const headers: Record<string, string> = {};
    if (bearerToken) {
      headers.Authorization = `Bearer ${bearerToken}`;
    }
    const resp = await fetch(`${base}/${docPath}`, {
      headers,
      signal: AbortSignal.timeout(2500),
    });
    if (resp.status === 404) {
      return { exists: false };
    }
    if (!resp.ok) {
      return { exists: false };
    }
    const json = (await resp.json()) as { fields?: Record<string, Record<string, unknown>> };
    return { exists: true, fields: json.fields };
  } catch {
    return { exists: false };
  }
}

// --- Lightweight Firebase ID Token Verifier using Google public x509 certificates ---
let cachedCerts: Record<string, string> = {};
let certsExpiresAt = 0;

async function getFirebasePublicCerts(): Promise<Record<string, string>> {
  if (Date.now() < certsExpiresAt && Object.keys(cachedCerts).length > 0) {
    return cachedCerts;
  }
  const resp = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
    { signal: AbortSignal.timeout(4000) }
  );
  if (!resp.ok) {
    throw new Error('Unable to fetch Firebase verification certificates');
  }
  const cacheControl = resp.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSec = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;
  cachedCerts = (await resp.json()) as Record<string, string>;
  certsExpiresAt = Date.now() + maxAgeSec * 1000;
  return cachedCerts;
}

function base64UrlToBuffer(str: string): Buffer {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(padded, 'base64');
}

interface VerifiedFirebaseUser {
  uid: string;
  email?: string;
  emailVerified: boolean;
}

async function verifyFirebaseIdToken(token: string): Promise<VerifiedFirebaseUser> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed token');
  }
  const [headerB64, payloadB64, signatureB64] = parts;
  const header = JSON.parse(base64UrlToBuffer(headerB64).toString('utf8')) as {
    alg?: string;
    kid?: string;
  };
  const payload = JSON.parse(base64UrlToBuffer(payloadB64).toString('utf8')) as {
    aud?: string;
    iss?: string;
    sub?: string;
    exp?: number;
    iat?: number;
    email?: string;
    email_verified?: boolean;
  };

  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Invalid token algorithm');
  }
  const certs = await getFirebasePublicCerts();
  const cert = certs[header.kid];
  if (!cert) {
    throw new Error('Unknown signing key');
  }

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${headerB64}.${payloadB64}`);
  verifier.end();
  const validSig = verifier.verify(cert, base64UrlToBuffer(signatureB64));
  if (!validSig) {
    throw new Error('Invalid token signature');
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < nowSec) {
    throw new Error('Session token expired');
  }
  if (firebaseProjectId) {
    if (payload.aud !== firebaseProjectId) {
      throw new Error('Token audience mismatch');
    }
    if (payload.iss !== `https://securetoken.google.com/${firebaseProjectId}`) {
      throw new Error('Token issuer mismatch');
    }
  }
  if (!payload.sub || typeof payload.sub !== 'string') {
    throw new Error('Missing user subject');
  }

  return {
    uid: payload.sub,
    email: payload.email,
    emailVerified: Boolean(payload.email_verified),
  };
}

interface AuthenticatedRequest extends Request {
  firebaseUser?: VerifiedFirebaseUser;
  firebaseToken?: string;
}

function isVerifiedMainAdmin(user?: VerifiedFirebaseUser): boolean {
  return Boolean(
    user &&
      user.emailVerified &&
      user.email &&
      user.email.trim().toLowerCase() === MAIN_ADMIN_EMAIL
  );
}

const USER_STATUS_TTL_MS = 20_000;
const BLOCKED_STATUS_TTL_MS = 10_000;
const SETTINGS_CACHE_TTL_MS = 15_000;

interface CachedUserStatus {
  blocked: boolean;
  reason?: string;
  expiresAt: number;
}

interface CachedAppSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  expiresAt: number;
}

const userStatusCache = new Map<string, CachedUserStatus>();
let appSettingsCache: CachedAppSettings | null = null;

async function getUserBlockStatusCached(
  uid: string,
  bearerToken: string
): Promise<{ blocked: boolean; reason?: string }> {
  const now = Date.now();
  const cached = userStatusCache.get(uid);
  if (cached && now < cached.expiresAt) {
    return { blocked: cached.blocked, reason: cached.reason };
  }

  const [blockedDoc, userDoc] = await Promise.all([
    fetchFirestoreDocWithToken(`blockedUsers/${encodeURIComponent(uid)}`, bearerToken),
    fetchFirestoreDocWithToken(`users/${encodeURIComponent(uid)}`, bearerToken),
  ]);

  const userStatus = userDoc.fields?.status?.stringValue;
  const blocked = Boolean(blockedDoc.exists || userStatus === 'blocked');
  const reason = blocked
    ? (blockedDoc.fields?.reason?.stringValue as string | undefined) ||
      (userDoc.fields?.blockedReason?.stringValue as string | undefined) ||
      'Your account has been suspended by the administrator.'
    : undefined;

  if (userStatusCache.size > 5000) {
    userStatusCache.clear();
  }
  userStatusCache.set(uid, {
    blocked,
    reason,
    expiresAt: now + (blocked ? BLOCKED_STATUS_TTL_MS : USER_STATUS_TTL_MS),
  });
  return { blocked, reason };
}

async function getAppSettingsCached(): Promise<{ maintenanceMode: boolean; maintenanceMessage: string }> {
  const now = Date.now();
  if (appSettingsCache && now < appSettingsCache.expiresAt) {
    return {
      maintenanceMode: appSettingsCache.maintenanceMode,
      maintenanceMessage: appSettingsCache.maintenanceMessage,
    };
  }
  const settingsDoc = await fetchFirestoreDocWithToken('appConfig/settings');
  const maintenanceMode = Boolean(settingsDoc.fields?.maintenanceMode?.booleanValue);
  const maintenanceMessage =
    (settingsDoc.fields?.maintenanceMessage?.stringValue as string | undefined) ||
    'LEADERS STORIES is temporarily undergoing maintenance. Please check back shortly.';
  appSettingsCache = {
    maintenanceMode,
    maintenanceMessage,
    expiresAt: now + SETTINGS_CACHE_TTL_MS,
  };
  return { maintenanceMode, maintenanceMessage };
}

async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Please sign in.' });
      return;
    }
    const token = authHeader.slice(7).trim();
    if (!token) {
      res.status(401).json({ error: 'Missing session token.' });
      return;
    }
    const verified = await verifyFirebaseIdToken(token);
    if (!verified.emailVerified) {
      res.status(403).json({ error: 'Please verify your email address before continuing.' });
      return;
    }

    // Server-side block & maintenance enforcement (TTL-cached for fast turns)
    const [blockState, settingsState] = await Promise.all([
      getUserBlockStatusCached(verified.uid, token),
      getAppSettingsCached(),
    ]);

    if (blockState.blocked) {
      res.status(403).json({
        error: `Account blocked: ${blockState.reason || 'Your account has been suspended by the administrator.'}`,
        code: 'ACCOUNT_BLOCKED',
      });
      return;
    }

    if (settingsState.maintenanceMode && !isVerifiedMainAdmin(verified)) {
      res.status(503).json({
        error: settingsState.maintenanceMessage,
        code: 'MAINTENANCE_MODE',
      });
      return;
    }

    req.firebaseUser = verified;
    req.firebaseToken = token;
    next();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid session';
    res.status(401).json({ error: `Session verification failed: ${message}` });
  }
}

async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const token = authHeader.slice(7).trim();
    if (!token) {
      res.status(401).json({ error: 'Missing session token.' });
      return;
    }
    const verified = await verifyFirebaseIdToken(token);
    if (!isVerifiedMainAdmin(verified)) {
      res.status(403).json({ error: 'Unauthorized: Main Admin privileges required.' });
      return;
    }
    req.firebaseUser = verified;
    req.firebaseToken = token;
    next();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid session';
    res.status(401).json({ error: `Admin session verification failed: ${message}` });
  }
}

let cachedGeminiClient: GoogleGenAI | null = null;
let cachedGeminiApiKey = '';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  if (!cachedGeminiClient || cachedGeminiApiKey !== apiKey) {
    cachedGeminiApiKey = apiKey;
    cachedGeminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedGeminiClient;
}

function sanitizeText(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

const ALLOWED_LANGUAGES = new Set(['hinglish', 'hindi', 'english']);

function getLanguageInstruction(lang: string): string {
  if (lang === 'hindi') {
    return 'LANGUAGE: Pure natural conversational Hindi in Devanagari script (हिंदी). Avoid unnecessary English words.';
  }
  if (lang === 'english') {
    return 'LANGUAGE: Vivid, sharp, emotionally grounded cinematic English dialogue & narration.';
  }
  return 'LANGUAGE: Natural Hinglish (modern Hindi in Roman script with natural everyday English phrases). Example: *Isha ka chehra laal ho jata hai.* Isha: "WHAT?! Tumhari himmat kaise hui?"';
}

interface StoryTurnBody {
  story?: {
    id?: string;
    title?: string;
    tagline?: string;
    about?: string;
    setting?: string;
    tags?: string[];
    characters?: {
      name: string;
      age?: string;
      role: string;
      personality: string;
      speakingStyle: string;
      relationshipToUser: string;
    }[];
    possibleEndings?: string[];
  };
  language?: string;
  currentScene?: string;
  sceneIndex?: number;
  recentMessages?: {
    role: 'user' | 'story';
    userText?: string;
    beats?: { type: string; speakerName?: string; text: string }[];
  }[];
  memories?: { summary: string; importance: number }[];
  relationshipMeters?: {
    id: string;
    label: string;
    emoji: string;
    value: number;
    min: number;
    max: number;
  }[];
  userMessage?: string;
  mode?: 'reply' | 'continue' | 'regenerate';
}

interface CleanStoryBeat {
  type: 'narration' | 'dialogue';
  speakerName?: string;
  text: string;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchCastMember(rawName: string | undefined, castNames: string[]): string | undefined {
  const cleaned = (rawName || '').trim();
  if (!cleaned) return undefined;
  const lower = cleaned.toLowerCase();
  if (lower === 'narrator' || lower === 'story' || lower === 'user' || lower === 'you') {
    return undefined;
  }

  const exact = castNames.find((c) => c.toLowerCase() === lower);
  if (exact) return exact;

  const firstToken = lower.split(/\s+/)[0];
  if (firstToken && firstToken.length >= 2) {
    const partial = castNames.find((c) => {
      const cLower = c.toLowerCase();
      return cLower === firstToken || cLower.startsWith(`${firstToken} `) || cLower.includes(lower);
    });
    if (partial) return partial;
  }
  return cleaned;
}

function detectSpeakerPrefixInText(
  text: string,
  castNames: string[]
): { speaker?: string; strippedText: string } {
  const trimmed = (text || '').trim();
  const unquoted = trimmed.replace(/^["“']\s*/, '');
  for (const fullName of castNames) {
    const firstName = fullName.split(/\s+/)[0] || '';
    const candidates =
      firstName && firstName.toLowerCase() !== fullName.toLowerCase()
        ? [fullName, firstName]
        : [fullName];
    for (const candidate of candidates) {
      const match = new RegExp(`^${escapeRegExp(candidate)}\\s*:\\s*([\\s\\S]+)$`, 'i').exec(unquoted);
      if (match) {
        return {
          speaker: fullName,
          strippedText: match[1].trim(),
        };
      }
    }
  }
  return { strippedText: trimmed };
}

function cleanDialogueText(text: string, speakerName?: string, castNames: string[] = []): string {
  let cleaned = (text || '').trim();
  const namesToStrip = Array.from(new Set([...(speakerName ? [speakerName] : []), ...castNames]));
  for (const name of namesToStrip) {
    const firstName = name.split(/\s+/)[0] || '';
    const prefixRegex = firstName
      ? new RegExp(`^(?:${escapeRegExp(name)}|${escapeRegExp(firstName)})\\s*:\\s*`, 'i')
      : new RegExp(`^${escapeRegExp(name)}\\s*:\\s*`, 'i');
    cleaned = cleaned.replace(prefixRegex, '').trim();
  }
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"') && cleaned.length >= 2) ||
    (cleaned.startsWith('“') && cleaned.endsWith('”') && cleaned.length >= 2)
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

function normalizeBeat(raw: unknown, castNames: string[] = []): CleanStoryBeat | null {
  if (!raw || typeof raw !== 'object') return null;
  const b = raw as { type?: unknown; speakerName?: unknown; text?: unknown };
  const type = b.type === 'narration' ? 'narration' : 'dialogue';
  let text = sanitizeText(b.text, 800);
  if (!text) return null;

  let resolvedSpeaker =
    type === 'dialogue'
      ? matchCastMember(typeof b.speakerName === 'string' ? b.speakerName : '', castNames)
      : undefined;

  if (type === 'dialogue') {
    const detected = detectSpeakerPrefixInText(text, castNames);
    if (detected.speaker) {
      resolvedSpeaker = detected.speaker;
      text = detected.strippedText;
    }
    text = cleanDialogueText(text, resolvedSpeaker, castNames);
  }
  if (!text) return null;

  return {
    type,
    ...(type === 'dialogue' && resolvedSpeaker ? { speakerName: resolvedSpeaker } : {}),
    text,
  };
}

function enforceTurnSpeakerRules(beats: CleanStoryBeat[], castNames: string[]): CleanStoryBeat[] {
  const result: CleanStoryBeat[] = [];
  const seenSpeakers = new Set<string>();
  let dialogueCount = 0;
  let pendingNarration: CleanStoryBeat | null = null;

  for (const beat of beats) {
    if (beat.type === 'narration') {
      pendingNarration = beat;
      continue;
    }

    let speaker = beat.speakerName ? matchCastMember(beat.speakerName, castNames) : undefined;
    if (!speaker) {
      speaker =
        castNames.find((c) => !seenSpeakers.has(c.toLowerCase())) ||
        castNames[0] ||
        'Character';
    }

    const key = speaker.toLowerCase();
    if (seenSpeakers.has(key) || dialogueCount >= 2) {
      pendingNarration = null;
      continue;
    }

    seenSpeakers.add(key);
    dialogueCount += 1;
    if (pendingNarration) {
      result.push(pendingNarration);
      pendingNarration = null;
    }
    result.push({
      type: 'dialogue',
      speakerName: speaker,
      text: beat.text,
    });
  }

  if (result.length === 0 && pendingNarration) {
    result.push(pendingNarration);
  }
  return result;
}

function buildStoryPromptParts(body: StoryTurnBody) {
  const story = body?.story;
  const mode: 'reply' | 'continue' | 'regenerate' =
    body?.mode === 'continue' || body?.mode === 'regenerate' ? body.mode : 'reply';
  const userMessage = sanitizeText(body?.userMessage, 2000);
  const language = ALLOWED_LANGUAGES.has(body?.language || '') ? (body.language as string) : 'hinglish';
  const currentScene = sanitizeText(body?.currentScene, 300);
  const sceneIndex = Number.isFinite(body?.sceneIndex) ? Number(body.sceneIndex) : 0;

  const characters = Array.isArray(story?.characters) ? story.characters.slice(0, 6) : [];
  const meters = Array.isArray(body.relationshipMeters) ? body.relationshipMeters.slice(0, 6) : [];
  const memories = Array.isArray(body.memories) ? body.memories.slice(-4) : [];
  const recentMessages = Array.isArray(body.recentMessages) ? body.recentMessages.slice(-5) : [];

  const historyBlock = recentMessages
    .map((m) => {
      if (m.role === 'user') {
        return `USER: ${sanitizeText(m.userText, 320)}`;
      }
      return (m.beats || [])
        .map((b) =>
          b.type === 'narration'
            ? `*${sanitizeText(b.text, 240)}*`
            : `${sanitizeText(b.speakerName, 40)}: "${sanitizeText(b.text, 240)}"`
        )
        .join('\n');
    })
    .join('\n---\n');

  const characterBlock = characters
    .map(
      (c) =>
        `- ${c.name}${c.age ? ` (${c.age})` : ''} [${c.role}]: ${sanitizeText(c.personality, 130)} Style: ${sanitizeText(c.speakingStyle, 90)}. Relation: ${sanitizeText(c.relationshipToUser, 90)}.`
    )
    .join('\n');

  const meterBlock = meters.map((m) => `${m.id}:${m.value}/${m.max}`).join(', ');
  const memoryBlock =
    memories.length > 0
      ? memories.map((mem) => `- ${sanitizeText(mem.summary, 140)}`).join('\n')
      : 'None yet.';

  const castNames = characters.map((c) => sanitizeText(c.name, 60)).filter(Boolean);
  const turnNumber = Math.max(1, sceneIndex + 1);

  const systemInstruction = [
    `Interactive roleplay director for "${story?.title}" (${(story?.tags || []).slice(0, 4).join(', ')}).`,
    `Setting: ${sanitizeText(story?.setting, 220)}. Premise: ${sanitizeText(story?.about, 420)}`,
    `CAST:\n${characterBlock}`,
    `RULES:\n1. Stay strictly in-character; never repeat the opening or speak for the user.\n2. CONCISE & FAST PACING: Normally 1 crisp 'narration' beat (1-2 vivid sentences) + 1 expressive 'dialogue' beat for ONE speaking character. Only add a 2nd character's dialogue beat when genuinely essential. NEVER let the same character have 2 dialogue beats in one turn!\n3. SPEAKER ACCURACY: On 'dialogue' beats, "speakerName" MUST be the exact name from CAST (${castNames.join(', ') || 'Character'}); on 'narration' beats set "speakerName" to "Narrator". NEVER put "Name:" inside dialogue "text".\n4. Adjust meterChanges (-8..+8) gradually; set newMemory.shouldSave=true only for major promises/reveals.\n5. Keep storyChoices=[] unless at a major turning point (max 2 short choices).\n6. UNLIMITED ONGOING STORY (Turn ${turnNumber}): NEVER end or conclude the story.`,
    getLanguageInstruction(language),
  ].join('\n\n');

  const actionPrompt =
    mode === 'continue'
      ? `ACTION: Auto-advance (Fast-Forward). User stayed silent—continue immediately from the last beat with 1 vivid character reaction (2 distinct characters only if urgently needed), without speaking for the user.`
      : mode === 'regenerate'
        ? `${userMessage ? `USER: "${userMessage}"\n` : ''}ACTION: Regenerate a distinctly different reaction, dialogue twist, or dramatic angle for this moment.`
        : `USER: "${userMessage}"`;

  const prompt = [
    `SCENE (Turn ${turnNumber}): ${currentScene} | METERS: ${meterBlock || 'None'}`,
    `MEMORIES:\n${memoryBlock}`,
    `RECENT:\n${historyBlock || '(Opening scene)'}`,
    actionPrompt,
  ].join('\n\n');

  return {
    mode,
    userMessage,
    currentScene,
    castNames,
    allowEnding: false,
    systemInstruction,
    prompt,
  };
}

function buildStoryTurnSchema(castNames: string[]) {
  const speakerEnum = Array.from(new Set(['Narrator', ...castNames]));
  return {
    type: Type.OBJECT,
    properties: {
      beats: {
        type: Type.ARRAY,
        minItems: '1',
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, format: 'enum', enum: ['narration', 'dialogue'] },
            speakerName:
              castNames.length > 0
                ? { type: Type.STRING, format: 'enum', enum: speakerEnum }
                : { type: Type.STRING },
            text: { type: Type.STRING },
          },
          propertyOrdering: ['type', 'speakerName', 'text'],
          required: ['type', 'speakerName', 'text'],
        },
      },
      meterChanges: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            delta: { type: Type.INTEGER },
            reason: { type: Type.STRING },
          },
          required: ['id', 'delta'],
        },
      },
      newScene: { type: Type.STRING },
      newMemory: {
        type: Type.OBJECT,
        properties: {
          shouldSave: { type: Type.BOOLEAN },
          summary: { type: Type.STRING },
          importance: { type: Type.INTEGER },
          charactersInvolved: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['shouldSave'],
      },
      storyChoices: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
    propertyOrdering: ['beats', 'meterChanges', 'newScene', 'newMemory', 'storyChoices'],
    required: ['beats', 'meterChanges', 'newScene', 'storyChoices'],
  };
}

function extractJsonObject(rawText: string): Record<string, unknown> {
  const trimmed = (rawText || '').trim();
  if (!trimmed) return {};
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
      } catch {
        return {};
      }
    }
    return {};
  }
}

function isDailyQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /GenerateRequestsPerDay|PerDay|daily limit|retry in \d+h/i.test(msg);
}

function parseRetryDelayMs(err: unknown): number {
  const msg = err instanceof Error ? err.message : String(err);
  const secMatch = /"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/i.exec(msg);
  if (secMatch) {
    const secs = Number.parseFloat(secMatch[1]);
    if (Number.isFinite(secs) && secs > 0) {
      return Math.round(secs * 1000);
    }
  }
  return 0;
}

function isAuthOrConfigFatalError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /API_KEY_INVALID|PERMISSION_DENIED|GEMINI_API_KEY is not configured/i.test(msg);
}

function isTransientGeminiError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /429|500|502|503|504|RESOURCE_EXHAUSTED|UNAVAILABLE|INTERNAL|DEADLINE_EXCEEDED|ECONNRESET|ETIMEDOUT|fetch failed|high demand|overloaded|stalled|timeout|timed out|abort/i.test(
    msg
  );
}

function isRetryableStoryError(err: unknown): boolean {
  if (isAuthOrConfigFatalError(err)) return false;
  if (isTransientGeminiError(err)) return true;
  const msg = err instanceof Error ? err.message : String(err);
  return /empty story response|incomplete|no dialogue|400|404|INVALID_ARGUMENT|NOT_FOUND/i.test(msg);
}

function extractFriendlyGeminiError(err: unknown, fallbackMsg = 'Story generation failed.'): string {
  let msg = err instanceof Error ? err.message : String(err || fallbackMsg);
  for (let depth = 0; depth < 4; depth++) {
    const trimmed = msg.trim();
    const jsonStart = trimmed.indexOf('{');
    const jsonEnd = trimmed.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd <= jsonStart) break;
    try {
      const parsed = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1)) as {
        error?: { message?: string } | string;
        message?: string;
      };
      if (typeof parsed.error === 'string') {
        msg = parsed.error;
      } else if (parsed.error && typeof parsed.error === 'object' && typeof parsed.error.message === 'string') {
        msg = parsed.error.message;
      } else if (typeof parsed.message === 'string') {
        msg = parsed.message;
      } else {
        break;
      }
    } catch {
      break;
    }
  }
  const lower = msg.toLowerCase();
  if (isDailyQuotaError(msg)) {
    return 'Free AI daily request quota exceeded for this key. Add a billing-enabled API key in Settings > Secrets or retry later.';
  }
  if (
    lower.includes('high demand') ||
    lower.includes('unavailable') ||
    lower.includes('service unavailable') ||
    lower.includes('503')
  ) {
    return 'Story AI servers are busy right now. Please tap Retry in a second.';
  }
  if (lower.includes('stalled') || lower.includes('timeout') || lower.includes('timed out')) {
    return 'AI took too long to respond. Please tap Retry.';
  }
  if (lower.includes('resource_exhausted') || lower.includes('429') || lower.includes('quota')) {
    return 'AI rate limit reached right now. Please wait a few seconds and tap Retry.';
  }
  if (lower.includes('api_key_invalid') || lower.includes('permission_denied') || lower.includes('403')) {
    return 'AI service key error on server. Please contact the administrator.';
  }
  return msg.trim().slice(0, 220) || fallbackMsg;
}

const STORY_MODEL_TRANSIENT_COOLDOWN_MS = 5_000;
const STORY_MODEL_RATE_COOLDOWN_MS = 20_000;
const MAX_DAILY_QUOTA_COOLDOWN_MS = 2 * 3600_000;
let hydrogenCooldownUntil = 0;
let liteCooldownUntil = 0;

function isModelHot(model: string): boolean {
  const now = Date.now();
  if (model === 'gemini-4-hydrogen') return now >= hydrogenCooldownUntil;
  if (model === 'gemini-3.1-flash-lite') return now >= liteCooldownUntil;
  return true;
}

interface StoryModelAttempt {
  model: string;
  thinkingLevel?: ThinkingLevel;
  mode: 'stream' | 'unary';
  delayBeforeMs: number;
}

function getOrderedStoryStreamAttempts(): StoryModelAttempt[] {
  const liteHot = isModelHot('gemini-3.1-flash-lite');
  const hydrogenHot = isModelHot('gemini-4-hydrogen');
  const list: StoryModelAttempt[] = [];

  if (liteHot && hydrogenHot) {
    return [
      { model: 'gemini-3.1-flash-lite', mode: 'stream', delayBeforeMs: 0 },
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, mode: 'stream', delayBeforeMs: 0 },
      { model: 'gemini-3.1-flash-lite', mode: 'unary', delayBeforeMs: 300 },
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, mode: 'unary', delayBeforeMs: 250 },
    ];
  }

  if (liteHot) {
    return [
      { model: 'gemini-3.1-flash-lite', mode: 'stream', delayBeforeMs: 0 },
      { model: 'gemini-3.1-flash-lite', mode: 'unary', delayBeforeMs: 350 },
      { model: 'gemini-3.1-flash-lite', mode: 'unary', delayBeforeMs: 900 },
    ];
  }

  if (hydrogenHot) {
    return [
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, mode: 'stream', delayBeforeMs: 0 },
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, mode: 'unary', delayBeforeMs: 350 },
    ];
  }

  return [
    { model: 'gemini-3.1-flash-lite', mode: 'stream', delayBeforeMs: 0 },
    { model: 'gemini-3.1-flash-lite', mode: 'unary', delayBeforeMs: 450 },
  ];
}

function getOrderedStoryUnaryAttempts(): { model: string; thinkingLevel?: ThinkingLevel; delayBeforeMs: number }[] {
  const liteHot = isModelHot('gemini-3.1-flash-lite');
  const hydrogenHot = isModelHot('gemini-4-hydrogen');

  if (liteHot && hydrogenHot) {
    return [
      { model: 'gemini-3.1-flash-lite', delayBeforeMs: 0 },
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, delayBeforeMs: 120 },
      { model: 'gemini-3.1-flash-lite', delayBeforeMs: 450 },
    ];
  }
  if (liteHot) {
    return [
      { model: 'gemini-3.1-flash-lite', delayBeforeMs: 0 },
      { model: 'gemini-3.1-flash-lite', delayBeforeMs: 450 },
      { model: 'gemini-3.1-flash-lite', delayBeforeMs: 950 },
    ];
  }
  if (hydrogenHot) {
    return [
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, delayBeforeMs: 0 },
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, delayBeforeMs: 450 },
    ];
  }
  return [
    { model: 'gemini-3.1-flash-lite', delayBeforeMs: 0 },
    { model: 'gemini-3.1-flash-lite', delayBeforeMs: 450 },
  ];
}

function getOrderedSuggestionAttempts(): { model: string; thinkingLevel?: ThinkingLevel; delayBeforeMs: number }[] {
  const liteHot = isModelHot('gemini-3.1-flash-lite');
  const hydrogenHot = isModelHot('gemini-4-hydrogen');
  const list: { model: string; thinkingLevel?: ThinkingLevel; delayBeforeMs: number }[] = [];

  if (liteHot) {
    list.push({ model: 'gemini-3.1-flash-lite', delayBeforeMs: 0 });
  }
  if (hydrogenHot) {
    list.push({ model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, delayBeforeMs: 120 });
  }
  if (liteHot) {
    list.push({ model: 'gemini-3.1-flash-lite', delayBeforeMs: 450 });
  }
  if (list.length === 0) {
    list.push({ model: 'gemini-3.1-flash-lite', delayBeforeMs: 0 });
  }
  return list;
}

function markModelCooldownIfTransient(model: string, err: unknown) {
  if (!isTransientGeminiError(err)) return;
  const msg = err instanceof Error ? err.message : String(err);
  const retryMs = parseRetryDelayMs(err);
  let cooldownMs = STORY_MODEL_TRANSIENT_COOLDOWN_MS;
  if (isDailyQuotaError(err) || retryMs >= 60_000) {
    cooldownMs = Math.min(Math.max(retryMs || 300_000, 120_000), MAX_DAILY_QUOTA_COOLDOWN_MS);
  } else if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) {
    cooldownMs = Math.min(Math.max(retryMs || STORY_MODEL_RATE_COOLDOWN_MS, STORY_MODEL_RATE_COOLDOWN_MS), MAX_DAILY_QUOTA_COOLDOWN_MS);
  }
  if (model === 'gemini-4-hydrogen') {
    hydrogenCooldownUntil = Math.max(hydrogenCooldownUntil, Date.now() + cooldownMs);
  } else if (model === 'gemini-3.1-flash-lite') {
    liteCooldownUntil = Math.max(liteCooldownUntil, Date.now() + cooldownMs);
  }
}

function normalizeStoryTurnPayload(
  rawText: string,
  fallbackScene: string,
  salvagedBeats: CleanStoryBeat[] = [],
  options?: { allowEnding?: boolean; castNames?: string[] }
) {
  const castNames = options?.castNames || [];
  const parsed = extractJsonObject(rawText);
  let safeBeats = Array.isArray(parsed.beats)
    ? parsed.beats
        .map((b) => normalizeBeat(b, castNames))
        .filter((b): b is CleanStoryBeat => Boolean(b))
    : [];

  if (safeBeats.length === 0 && salvagedBeats.length > 0) {
    safeBeats = salvagedBeats;
  }
  if (safeBeats.length === 0 && rawText) {
    const recoveryExtractor = new IncrementalBeatsExtractor(castNames);
    const extracted = recoveryExtractor.push(rawText);
    if (extracted.completed.length > 0) {
      safeBeats = extracted.completed.map((entry) => entry.beat);
    } else if (extracted.partial) {
      safeBeats = [extracted.partial.beat];
    }
  }

  safeBeats = enforceTurnSpeakerRules(safeBeats, castNames);

  return {
    beats: safeBeats,
    meterChanges: Array.isArray(parsed.meterChanges) ? parsed.meterChanges : [],
    newScene: sanitizeText(parsed.newScene, 160) || fallbackScene,
    newMemory:
      parsed.newMemory && typeof parsed.newMemory === 'object'
        ? parsed.newMemory
        : { shouldSave: false },
    storyChoices: Array.isArray(parsed.storyChoices)
      ? parsed.storyChoices.filter((c): c is string => typeof c === 'string' && c.trim().length > 0).slice(0, 3)
      : [],
    endingTriggered: '',
  };
}

function readPartialJsonStringField(
  slice: string,
  fieldName: string
): { found: boolean; complete: boolean; value: string } {
  const keyMatch = new RegExp(`"${escapeRegExp(fieldName)}"\\s*:\\s*"`).exec(slice);
  if (!keyMatch) {
    return { found: false, complete: false, value: '' };
  }
  let idx = keyMatch.index + keyMatch[0].length;
  let value = '';
  while (idx < slice.length) {
    const ch = slice[idx];
    if (ch === '"') {
      return { found: true, complete: true, value };
    }
    if (ch === '\\') {
      if (idx + 1 >= slice.length) {
        return { found: true, complete: false, value };
      }
      const esc = slice[idx + 1];
      if (esc === '"') value += '"';
      else if (esc === '\\') value += '\\';
      else if (esc === '/') value += '/';
      else if (esc === 'b') value += '\b';
      else if (esc === 'f') value += '\f';
      else if (esc === 'n') value += '\n';
      else if (esc === 'r') value += '\r';
      else if (esc === 't') value += '\t';
      else if (esc === 'u') {
        if (idx + 5 >= slice.length) {
          return { found: true, complete: false, value };
        }
        const hex = slice.slice(idx + 2, idx + 6);
        const code = Number.parseInt(hex, 16);
        if (!Number.isNaN(code)) {
          value += String.fromCharCode(code);
        }
        idx += 6;
        continue;
      } else {
        value += esc;
      }
      idx += 2;
      continue;
    }
    value += ch;
    idx += 1;
  }
  return { found: true, complete: false, value };
}

/**
 * Incrementally extracts BOTH completed beat objects AND live partial "text" deltas
 * inside the currently streaming beat so users see real-time character typing.
 */
class IncrementalBeatsExtractor {
  private buffer = '';
  private inBeatsArray = false;
  private arrayEnded = false;
  private scanIndex = 0;
  private inString = false;
  private escaped = false;
  private braceDepth = 0;
  private objectStart = -1;
  private extractedBeats: CleanStoryBeat[] = [];
  private seenSpeakers = new Set<string>();
  private dialogueCount = 0;
  private lastPartialKey = '';
  private readonly castNames: string[];

  constructor(castNames: string[] = []) {
    this.castNames = castNames;
  }

  push(chunk: string): {
    completed: { index: number; beat: CleanStoryBeat }[];
    partial: { index: number; beat: CleanStoryBeat } | null;
  } {
    if (!chunk || this.arrayEnded) {
      this.buffer += chunk;
      return { completed: [], partial: null };
    }
    this.buffer += chunk;
    const completed: { index: number; beat: CleanStoryBeat }[] = [];

    if (!this.inBeatsArray) {
      const keyMatch = /"beats"\s*:\s*\[/.exec(this.buffer);
      if (!keyMatch) return { completed, partial: null };
      this.inBeatsArray = true;
      this.scanIndex = keyMatch.index + keyMatch[0].length;
    }

    for (let i = this.scanIndex; i < this.buffer.length; i++) {
      const ch = this.buffer[i];
      if (this.inString) {
        if (this.escaped) {
          this.escaped = false;
        } else if (ch === '\\') {
          this.escaped = true;
        } else if (ch === '"') {
          this.inString = false;
        }
        continue;
      }

      if (ch === '"') {
        this.inString = true;
        continue;
      }

      if (ch === '{') {
        if (this.braceDepth === 0) {
          this.objectStart = i;
          this.lastPartialKey = '';
        }
        this.braceDepth += 1;
      } else if (ch === '}') {
        if (this.braceDepth > 0) {
          this.braceDepth -= 1;
          if (this.braceDepth === 0 && this.objectStart !== -1) {
            const objSlice = this.buffer.slice(this.objectStart, i + 1);
            this.objectStart = -1;
            this.lastPartialKey = '';
            try {
              const parsed = JSON.parse(objSlice);
              const beat = normalizeBeat(parsed, this.castNames);
              if (beat) {
                if (beat.type === 'dialogue') {
                  const speaker =
                    beat.speakerName ||
                    this.castNames.find((c) => !this.seenSpeakers.has(c.toLowerCase())) ||
                    this.castNames[0] ||
                    'Character';
                  const key = speaker.toLowerCase();
                  if (this.seenSpeakers.has(key) || this.dialogueCount >= 2) {
                    continue;
                  }
                  this.seenSpeakers.add(key);
                  this.dialogueCount += 1;
                  const cleanBeat: CleanStoryBeat = {
                    type: 'dialogue',
                    speakerName: speaker,
                    text: beat.text,
                  };
                  const beatIdx = this.extractedBeats.length;
                  this.extractedBeats.push(cleanBeat);
                  completed.push({ index: beatIdx, beat: cleanBeat });
                } else {
                  const beatIdx = this.extractedBeats.length;
                  this.extractedBeats.push(beat);
                  completed.push({ index: beatIdx, beat });
                }
              }
            } catch {
              // Ignore malformed partial object; full payload at end handles recovery
            }
          }
        }
      } else if (ch === ']' && this.braceDepth === 0) {
        this.arrayEnded = true;
        this.scanIndex = i + 1;
        break;
      }
      this.scanIndex = i + 1;
    }

    let partial: { index: number; beat: CleanStoryBeat } | null = null;
    if (!this.arrayEnded && this.braceDepth === 1 && this.objectStart !== -1) {
      const openSlice = this.buffer.slice(this.objectStart);
      const typeField = readPartialJsonStringField(openSlice, 'type');
      const speakerField = readPartialJsonStringField(openSlice, 'speakerName');
      const textField = readPartialJsonStringField(openSlice, 'text');

      if (typeField.complete && textField.found) {
        const beatType = typeField.value === 'narration' ? 'narration' : 'dialogue';
        if (beatType === 'narration') {
          const cleanText = textField.value.trimStart();
          if (cleanText.length > 0) {
            const sig = `n:${cleanText}`;
            if (sig !== this.lastPartialKey) {
              this.lastPartialKey = sig;
              partial = {
                index: this.extractedBeats.length,
                beat: { type: 'narration', text: cleanText },
              };
            }
          }
        } else if (speakerField.complete) {
          let resolvedSpeaker =
            matchCastMember(speakerField.value, this.castNames) ||
            this.castNames.find((c) => !this.seenSpeakers.has(c.toLowerCase())) ||
            this.castNames[0] ||
            'Character';

          const detected = detectSpeakerPrefixInText(textField.value, this.castNames);
          if (detected.speaker) {
            resolvedSpeaker = detected.speaker;
          }
          const speakerKey = resolvedSpeaker.toLowerCase();
          if (!this.seenSpeakers.has(speakerKey) && this.dialogueCount < 2) {
            let liveText = (detected.speaker ? detected.strippedText : textField.value).replace(
              /^["“]+/,
              ''
            );
            // Strip partial trailing quote if complete, keep clean streaming text
            if (textField.complete) {
              liveText = cleanDialogueText(liveText, resolvedSpeaker, this.castNames);
            }
            if (liveText.trim().length > 0) {
              const sig = `d:${resolvedSpeaker}:${liveText}`;
              if (sig !== this.lastPartialKey) {
                this.lastPartialKey = sig;
                partial = {
                  index: this.extractedBeats.length,
                  beat: {
                    type: 'dialogue',
                    speakerName: resolvedSpeaker,
                    text: liveText,
                  },
                };
              }
            }
          }
        }
      }
    }

    return { completed, partial };
  }

  getFullText(): string {
    return this.buffer;
  }

  getExtractedBeats(): CleanStoryBeat[] {
    return this.extractedBeats;
  }
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      firebaseProjectId: firebaseProjectId || null,
    });
  });

  app.get('/api/admin/session', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    res.json({
      isAdmin: true,
      uid: req.firebaseUser?.uid,
      email: req.firebaseUser?.email,
      emailVerified: req.firebaseUser?.emailVerified,
      role: 'Main Admin',
    });
  });

  app.post('/api/admin/validate-user-action', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { targetUid, action } = (req.body || {}) as { targetUid?: string; action?: string };
    if (!targetUid || typeof targetUid !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(targetUid)) {
      res.status(400).json({ error: 'Invalid target user ID.' });
      return;
    }
    if (targetUid === req.firebaseUser?.uid) {
      res.status(400).json({ error: 'Main Admin account cannot be blocked or demoted.' });
      return;
    }
    if (action !== 'block' && action !== 'unblock') {
      res.status(400).json({ error: 'Unsupported action.' });
      return;
    }
    // Immediately reflect admin block/unblock state in server auth cache
    userStatusCache.delete(targetUid);
    res.json({
      allowed: true,
      targetUid,
      action,
      verifiedBy: req.firebaseUser?.email,
    });
  });

  app.post('/api/story/turn-stream', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const body = req.body as StoryTurnBody;
    const { mode, userMessage, currentScene, castNames, allowEnding, systemInstruction, prompt } =
      buildStoryPromptParts(body);
    const responseSchema = buildStoryTurnSchema(castNames);

    if (!body?.story?.title || (mode === 'reply' && !userMessage)) {
      res.status(400).json({ error: 'Story context and user message are required.' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const writeEvent = (event: string, data: unknown) => {
      if (res.writableEnded) return;
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    const writePing = () => {
      if (res.writableEnded) return;
      res.write(`: ping\n\n`);
    };

    let clientClosed = false;
    let activeAbortController: AbortController | null = null;
    req.on('close', () => {
      clientClosed = true;
      activeAbortController?.abort();
    });

    const pingInterval = setInterval(writePing, 3000);

    const nextChunkWithTimeout = async <T,>(
      iterator: AsyncIterator<T>,
      timeoutMs: number,
      abortCtrl: AbortController
    ): Promise<IteratorResult<T>> => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        return await Promise.race([
          iterator.next(),
          new Promise<never>((_resolve, reject) => {
            timer = setTimeout(() => {
              abortCtrl.abort();
              reject(new Error(`AI response stalled after ${timeoutMs}ms`));
            }, timeoutMs);
          }),
        ]);
      } finally {
        if (timer) clearTimeout(timer);
      }
    };

    try {
      const ai = getGeminiClient();
      const candidates = getOrderedStoryStreamAttempts();
      let lastError: unknown;
      let bestFallbackPayload: ReturnType<typeof normalizeStoryTurnPayload> | null = null;

      for (let idx = 0; idx < candidates.length; idx++) {
        if (clientClosed || res.writableEnded) return;
        const candidate = candidates[idx];
        if (candidate.delayBeforeMs > 0) {
          await new Promise((r) => setTimeout(r, candidate.delayBeforeMs));
          if (clientClosed || res.writableEnded) return;
        }

        const attemptAbort = new AbortController();
        activeAbortController = attemptAbort;
        const extractor = new IncrementalBeatsExtractor(castNames);
        let attemptEmittedPreview = false;

        try {
          const config: Record<string, unknown> = {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema,
            abortSignal: attemptAbort.signal,
          };
          if (candidate.thinkingLevel) {
            config.thinkingConfig = { thinkingLevel: candidate.thinkingLevel };
          }

          if (candidate.mode === 'stream') {
            const connectTimer = setTimeout(() => attemptAbort.abort(), 8000);
            let stream: AsyncIterable<{ text?: string }>;
            try {
              stream = await ai.models.generateContentStream({
                model: candidate.model,
                contents: prompt,
                config,
              });
            } finally {
              clearTimeout(connectTimer);
            }

            const iterator = stream[Symbol.asyncIterator]();
            let gotAnyChunk = false;
            while (true) {
              if (clientClosed || res.writableEnded) {
                attemptAbort.abort();
                return;
              }
              const step = await nextChunkWithTimeout(
                iterator,
                gotAnyChunk ? 7500 : 8000,
                attemptAbort
              );
              if (step.done) break;
              const chunkText = step.value?.text || '';
              if (!chunkText) continue;
              gotAnyChunk = true;

              const { completed, partial } = extractor.push(chunkText);
              for (const item of completed) {
                attemptEmittedPreview = true;
                writeEvent('beat', item);
              }
              if (partial) {
                attemptEmittedPreview = true;
                writeEvent('partial', partial);
              }
            }

            const payload = normalizeStoryTurnPayload(
              extractor.getFullText(),
              currentScene,
              extractor.getExtractedBeats(),
              { allowEnding, castNames }
            );
            if (payload.beats.length === 0) {
              throw new Error('Empty story response from model.');
            }
            const hasDialogue = payload.beats.some((b) => b.type === 'dialogue');
            if (!hasDialogue && idx < candidates.length - 1) {
              bestFallbackPayload = payload;
              throw new Error('Incomplete story response (no dialogue emitted).');
            }
            writeEvent('done', payload);
            res.end();
            return;
          }

          // Unary fallback attempt (fast timeout so server never hangs)
          const unaryTimer = setTimeout(() => attemptAbort.abort(), 14000);
          let response: { text?: string };
          try {
            response = await ai.models.generateContent({
              model: candidate.model,
              contents: prompt,
              config,
            });
          } finally {
            clearTimeout(unaryTimer);
          }
          const payload = normalizeStoryTurnPayload(response.text || '{}', currentScene, [], {
            allowEnding,
            castNames,
          });
          if (payload.beats.length === 0) {
            throw new Error('Empty story response from model.');
          }
          payload.beats.forEach((beat, index) => {
            attemptEmittedPreview = true;
            writeEvent('beat', { index, beat });
          });
          writeEvent('done', payload);
          res.end();
          return;
        } catch (err) {
          lastError = err;
          if (clientClosed || res.writableEnded) return;
          markModelCooldownIfTransient(candidate.model, err);

          const salvaged = extractor.getExtractedBeats();
          const hasCompletedDialogue = salvaged.some((b) => b.type === 'dialogue');
          if (hasCompletedDialogue) {
            const partialPayload = normalizeStoryTurnPayload(
              extractor.getFullText(),
              currentScene,
              salvaged,
              { allowEnding, castNames }
            );
            if (partialPayload.beats.length > 0) {
              writeEvent('done', partialPayload);
              res.end();
              return;
            }
          }

          if (idx < candidates.length - 1 && isRetryableStoryError(err)) {
            if (attemptEmittedPreview) {
              writeEvent('reset', {});
            }
            continue;
          }
          if (bestFallbackPayload && bestFallbackPayload.beats.length > 0) {
            writeEvent('done', bestFallbackPayload);
            res.end();
            return;
          }
          throw err;
        } finally {
          if (activeAbortController === attemptAbort) {
            activeAbortController = null;
          }
        }
      }

      if (bestFallbackPayload && bestFallbackPayload.beats.length > 0) {
        writeEvent('done', bestFallbackPayload);
        res.end();
        return;
      }

      throw lastError || new Error('Story generation failed.');
    } catch (err) {
      console.error('Story stream error:', err);
      writeEvent('error', {
        error: extractFriendlyGeminiError(err, 'Unable to continue story right now.'),
        code: isDailyQuotaError(err) ? 'DAILY_QUOTA_EXHAUSTED' : undefined,
      });
      res.end();
    } finally {
      clearInterval(pingInterval);
    }
  });

  app.post('/api/story/turn', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    let clientClosed = false;
    let activeAbort: AbortController | null = null;
    req.on('close', () => {
      clientClosed = true;
      activeAbort?.abort();
    });

    try {
      const body = req.body as StoryTurnBody;
      const { mode, userMessage, currentScene, castNames, allowEnding, systemInstruction, prompt } =
        buildStoryPromptParts(body);
      const responseSchema = buildStoryTurnSchema(castNames);

      if (!body?.story?.title || (mode === 'reply' && !userMessage)) {
        res.status(400).json({ error: 'Story context and user message are required.' });
        return;
      }

      const ai = getGeminiClient();
      const candidates = getOrderedStoryUnaryAttempts();
      let lastError: unknown;

      for (let idx = 0; idx < candidates.length; idx++) {
        if (clientClosed) return;
        const candidate = candidates[idx];
        if (candidate.delayBeforeMs > 0) {
          await new Promise((r) => setTimeout(r, candidate.delayBeforeMs));
          if (clientClosed) return;
        }
        const attemptAbort = new AbortController();
        activeAbort = attemptAbort;
        const timeoutTimer = setTimeout(() => attemptAbort.abort(), 14000);
        try {
          const config: Record<string, unknown> = {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema,
            abortSignal: attemptAbort.signal,
          };
          if (candidate.thinkingLevel) {
            config.thinkingConfig = { thinkingLevel: candidate.thinkingLevel };
          }
          const response = await ai.models.generateContent({
            model: candidate.model,
            contents: prompt,
            config,
          });
          const payload = normalizeStoryTurnPayload(response.text || '{}', currentScene, [], {
            allowEnding,
            castNames,
          });
          if (payload.beats.length === 0) {
            throw new Error('Empty story response from model.');
          }
          res.json(payload);
          return;
        } catch (err) {
          lastError = err;
          if (clientClosed) return;
          markModelCooldownIfTransient(candidate.model, err);
          if (idx < candidates.length - 1 && isRetryableStoryError(err)) {
            continue;
          }
          throw err;
        } finally {
          clearTimeout(timeoutTimer);
          if (activeAbort === attemptAbort) {
            activeAbort = null;
          }
        }
      }

      throw lastError || new Error('Story generation failed.');
    } catch (err) {
      if (clientClosed) return;
      console.error('Story turn error:', err);
      const status = isTransientGeminiError(err) ? 503 : 500;
      res.status(status).json({ error: extractFriendlyGeminiError(err, 'Story generation failed.') });
    }
  });

  app.post('/api/story/suggestions', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    let clientClosed = false;
    let activeAbort: AbortController | null = null;
    req.on('close', () => {
      clientClosed = true;
      activeAbort?.abort();
    });

    try {
      const body = req.body as StoryTurnBody;
      const story = body?.story;
      const language = ALLOWED_LANGUAGES.has(body?.language || '') ? (body.language as string) : 'hinglish';
      const currentScene = sanitizeText(body?.currentScene, 240);

      if (!story || !story.title) {
        res.status(400).json({ error: 'Story context is required.' });
        return;
      }

      const recentMessages = Array.isArray(body.recentMessages) ? body.recentMessages.slice(-4) : [];
      const historyBlock = recentMessages
        .map((m) => {
          if (m.role === 'user') return `USER: ${sanitizeText(m.userText, 220)}`;
          return (m.beats || [])
            .map((b) =>
              b.type === 'narration'
                ? `*${sanitizeText(b.text, 180)}*`
                : `${sanitizeText(b.speakerName, 36)}: "${sanitizeText(b.text, 180)}"`
            )
            .join('\n');
        })
        .join('\n');

      const ai = getGeminiClient();
      const suggestionModels = getOrderedSuggestionAttempts();
      let lastError: unknown;

      for (let idx = 0; idx < suggestionModels.length; idx++) {
        if (clientClosed) return;
        const candidate = suggestionModels[idx];
        if (candidate.delayBeforeMs > 0) {
          await new Promise((r) => setTimeout(r, candidate.delayBeforeMs));
          if (clientClosed) return;
        }
        const attemptAbort = new AbortController();
        activeAbort = attemptAbort;
        const timeoutTimer = setTimeout(() => attemptAbort.abort(), 8500);
        try {
          const config: Record<string, unknown> = {
            systemInstruction: `Generate 3-4 vivid, short roleplay reply options for the user. ${getLanguageInstruction(language)}`,
            responseMimeType: 'application/json',
            abortSignal: attemptAbort.signal,
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                suggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['suggestions'],
            },
          };
          if (candidate.thinkingLevel) {
            config.thinkingConfig = { thinkingLevel: candidate.thinkingLevel };
          }
          const response = await ai.models.generateContent({
            model: candidate.model,
            contents: `Story: ${story.title}\nScene: ${currentScene}\nRecent:\n${historyBlock}\n\nWrite 3-4 short, punchy roleplay replies the user can send next (<95 chars each).`,
            config,
          });

          const parsed = extractJsonObject(response.text || '{"suggestions":[]}') as {
            suggestions?: unknown[];
          };
          res.json({
            suggestions: Array.isArray(parsed.suggestions)
              ? parsed.suggestions.filter((s): s is string => typeof s === 'string' && s.trim().length > 0).slice(0, 4)
              : [],
          });
          return;
        } catch (err) {
          lastError = err;
          if (clientClosed) return;
          markModelCooldownIfTransient(candidate.model, err);
          if (idx < suggestionModels.length - 1 && isRetryableStoryError(err)) {
            continue;
          }
          throw err;
        } finally {
          clearTimeout(timeoutTimer);
          if (activeAbort === attemptAbort) {
            activeAbort = null;
          }
        }
      }

      throw lastError || new Error('Unable to generate reply suggestions.');
    } catch (err) {
      if (clientClosed) return;
      console.error('Suggestions error:', err);
      const status = isTransientGeminiError(err) ? 503 : 500;
      res.status(status).json({ error: extractFriendlyGeminiError(err, 'Unable to generate reply suggestions.') });
    }
  });

  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  const httpServer = http.createServer(app);

  if (!IS_PROD) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        ws: { server: httpServer },
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distDir, {
        maxAge: '30d',
        setHeaders: (res, filePath) => {
          if (
            filePath.endsWith('index.html') ||
            filePath.endsWith('sw.js') ||
            filePath.endsWith('registerSW.js') ||
            filePath.endsWith('manifest.webmanifest')
          ) {
            res.setHeader('Cache-Control', 'no-cache');
          } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`LEADERS STORIES server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
