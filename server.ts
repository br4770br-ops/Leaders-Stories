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
    const resp = await fetch(`${base}/${docPath}`, { headers });
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
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
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
  const memories = Array.isArray(body.memories) ? body.memories.slice(-5) : [];
  const recentMessages = Array.isArray(body.recentMessages) ? body.recentMessages.slice(-7) : [];

  const historyBlock = recentMessages
    .map((m) => {
      if (m.role === 'user') {
        return `USER: ${sanitizeText(m.userText, 400)}`;
      }
      return (m.beats || [])
        .map((b) =>
          b.type === 'narration'
            ? `*${sanitizeText(b.text, 280)}*`
            : `${sanitizeText(b.speakerName, 40)}: "${sanitizeText(b.text, 280)}"`
        )
        .join('\n');
    })
    .join('\n---\n');

  const characterBlock = characters
    .map(
      (c) =>
        `- ${c.name}${c.age ? ` (${c.age})` : ''} [${c.role}]: ${sanitizeText(c.personality, 140)} Style: ${sanitizeText(c.speakingStyle, 100)}. Relation: ${sanitizeText(c.relationshipToUser, 100)}.`
    )
    .join('\n');

  const meterBlock = meters.map((m) => `${m.id}:${m.value}/${m.max}`).join(', ');
  const memoryBlock =
    memories.length > 0
      ? memories.map((mem) => `- ${sanitizeText(mem.summary, 160)}`).join('\n')
      : 'None yet.';

  const castNames = characters.map((c) => sanitizeText(c.name, 60)).filter(Boolean);
  const turnNumber = Math.max(1, sceneIndex + 1);

  const systemInstruction = [
    `Interactive multi-character roleplay director for "${story?.title}" (${(story?.tags || []).slice(0, 4).join(', ')}).`,
    `Setting: ${sanitizeText(story?.setting, 240)}. Premise: ${sanitizeText(story?.about, 480)}`,
    `CAST:\n${characterBlock}`,
    `RULES:\n1. Stay strictly in-character; never act like an AI assistant or repeat the opening.\n2. ONE SPEAKER BY DEFAULT: Normally ONLY ONE character speaks this turn (1 short 'narration' beat + 1 'dialogue' beat for that character). Only add a 2nd character's dialogue beat if another cast member genuinely MUST react too (separate card). NEVER let the same character have 2 dialogue beats in one turn!\n3. SPEAKER ACCURACY: On every 'dialogue' beat, "speakerName" MUST be the exact full name from CAST (${castNames.join(', ') || 'Character'}) of the person actually speaking that line (on 'narration' beats set speakerName to "Narrator"). NEVER put "Name:" inside dialogue "text".\n4. Let characters react to the user AND each other naturally without confusing who is speaking vs who is being addressed.\n5. Adjust meterChanges (-8..+8) gradually so feelings keep shifting naturally.\n6. Set newMemory.shouldSave=true only for major reveals/promises; return 2-3 storyChoices only at major turning points, else [].\n7. UNLIMITED ONGOING STORY (Turn ${turnNumber}): NEVER end, conclude, or wrap up the story. Keep the roleplay running endlessly with fresh twists, evolving locations, secrets, rivalries, and drama.`,
    getLanguageInstruction(language),
  ].join('\n\n');

  const actionPrompt =
    mode === 'continue'
      ? `ACTION: Auto-advance (Fast-Forward). User stayed silent—continue immediately from the last beat with 1 natural character reaction (or 2 distinct characters only if urgently needed), without speaking for the user.`
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

function isTransientGeminiError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /429|500|502|503|504|RESOURCE_EXHAUSTED|UNAVAILABLE|INTERNAL|DEADLINE_EXCEEDED|ECONNRESET|ETIMEDOUT|fetch failed|high demand|overloaded/i.test(
    msg
  );
}

function isRetryableStoryError(err: unknown): boolean {
  if (isTransientGeminiError(err)) return true;
  const msg = err instanceof Error ? err.message : String(err);
  return /empty story response|incomplete/i.test(msg);
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
  if (
    lower.includes('high demand') ||
    lower.includes('unavailable') ||
    lower.includes('service unavailable') ||
    lower.includes('503')
  ) {
    return 'Story AI servers are busy right now. Please tap Retry in a second.';
  }
  if (lower.includes('resource_exhausted') || lower.includes('429') || lower.includes('quota')) {
    return 'Too many requests right now. Please wait a couple seconds and tap Retry.';
  }
  if (lower.includes('api_key_invalid') || lower.includes('permission_denied') || lower.includes('403')) {
    return 'AI service key error on server. Please contact the administrator.';
  }
  return msg.trim().slice(0, 220) || fallbackMsg;
}

const STORY_MODEL_COOLDOWN_MS = 35_000;
let hydrogenCooldownUntil = 0;
let liteCooldownUntil = 0;

interface StoryModelAttempt {
  model: string;
  thinkingLevel?: ThinkingLevel;
  mode: 'stream' | 'unary';
  delayBeforeMs: number;
}

function getOrderedStoryStreamAttempts(): StoryModelAttempt[] {
  const now = Date.now();
  const hydrogenHot = now >= hydrogenCooldownUntil;
  const liteHot = now >= liteCooldownUntil;

  if (!hydrogenHot && liteHot) {
    return [
      { model: 'gemini-3.1-flash-lite', mode: 'stream', delayBeforeMs: 0 },
      { model: 'gemini-3.1-flash-lite', mode: 'unary', delayBeforeMs: 350 },
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, mode: 'stream', delayBeforeMs: 750 },
      { model: 'gemini-3.1-flash-lite', mode: 'unary', delayBeforeMs: 1200 },
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, mode: 'unary', delayBeforeMs: 1600 },
    ];
  }

  return [
    { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, mode: 'stream', delayBeforeMs: 0 },
    { model: 'gemini-3.1-flash-lite', mode: 'stream', delayBeforeMs: 300 },
    { model: 'gemini-3.1-flash-lite', mode: 'unary', delayBeforeMs: 700 },
    { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, mode: 'unary', delayBeforeMs: 1200 },
    { model: 'gemini-3.1-flash-lite', mode: 'unary', delayBeforeMs: 1700 },
  ];
}

function getOrderedStoryUnaryAttempts(): { model: string; thinkingLevel?: ThinkingLevel; delayBeforeMs: number }[] {
  const now = Date.now();
  if (now < hydrogenCooldownUntil && now >= liteCooldownUntil) {
    return [
      { model: 'gemini-3.1-flash-lite', delayBeforeMs: 0 },
      { model: 'gemini-3.1-flash-lite', delayBeforeMs: 550 },
      { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, delayBeforeMs: 1000 },
      { model: 'gemini-3.1-flash-lite', delayBeforeMs: 1500 },
    ];
  }
  return [
    { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, delayBeforeMs: 0 },
    { model: 'gemini-3.1-flash-lite', delayBeforeMs: 400 },
    { model: 'gemini-3.1-flash-lite', delayBeforeMs: 950 },
    { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, delayBeforeMs: 1500 },
  ];
}

function markModelCooldownIfTransient(model: string, err: unknown) {
  if (!isTransientGeminiError(err)) return;
  if (model === 'gemini-4-hydrogen') {
    hydrogenCooldownUntil = Date.now() + STORY_MODEL_COOLDOWN_MS;
  } else if (model === 'gemini-3.1-flash-lite') {
    liteCooldownUntil = Date.now() + STORY_MODEL_COOLDOWN_MS;
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
    if (extracted.length > 0) {
      safeBeats = extracted;
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

/**
 * Incrementally extracts completed JSON objects from the top-level "beats": [ ... ] array
 * while Gemini is still streaming the rest of the response.
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
  private readonly castNames: string[];

  constructor(castNames: string[] = []) {
    this.castNames = castNames;
  }

  push(chunk: string): CleanStoryBeat[] {
    if (!chunk || this.arrayEnded) {
      this.buffer += chunk;
      return [];
    }
    this.buffer += chunk;
    const extracted: CleanStoryBeat[] = [];

    if (!this.inBeatsArray) {
      const keyMatch = /"beats"\s*:\s*\[/.exec(this.buffer);
      if (!keyMatch) return extracted;
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
        }
        this.braceDepth += 1;
      } else if (ch === '}') {
        if (this.braceDepth > 0) {
          this.braceDepth -= 1;
          if (this.braceDepth === 0 && this.objectStart !== -1) {
            const objSlice = this.buffer.slice(this.objectStart, i + 1);
            this.objectStart = -1;
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
                  extracted.push(cleanBeat);
                  this.extractedBeats.push(cleanBeat);
                } else {
                  extracted.push(beat);
                  this.extractedBeats.push(beat);
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

    return extracted;
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

    let clientClosed = false;
    req.on('close', () => {
      clientClosed = true;
    });

    try {
      const ai = getGeminiClient();
      const candidates = getOrderedStoryStreamAttempts();
      let lastError: unknown;
      let emittedBeatsCount = 0;

      for (let idx = 0; idx < candidates.length; idx++) {
        if (clientClosed || res.writableEnded) return;
        const candidate = candidates[idx];
        if (candidate.delayBeforeMs > 0) {
          await new Promise((r) => setTimeout(r, candidate.delayBeforeMs));
          if (clientClosed || res.writableEnded) return;
        }

        const extractor = new IncrementalBeatsExtractor(castNames);
        try {
          const config: Record<string, unknown> = {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema,
          };
          if (candidate.thinkingLevel) {
            config.thinkingConfig = { thinkingLevel: candidate.thinkingLevel };
          }

          if (candidate.mode === 'stream') {
            const stream = await ai.models.generateContentStream({
              model: candidate.model,
              contents: prompt,
              config,
            });

            for await (const chunk of stream) {
              if (clientClosed || res.writableEnded) return;
              const chunkText = chunk.text || '';
              if (!chunkText) continue;
              const freshBeats = extractor.push(chunkText);
              for (const beat of freshBeats) {
                emittedBeatsCount += 1;
                writeEvent('beat', beat);
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
            writeEvent('done', payload);
            res.end();
            return;
          }

          // Unary fallback attempt (hits non-streaming endpoint pool)
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
          for (const beat of payload.beats) {
            emittedBeatsCount += 1;
            writeEvent('beat', beat);
          }
          writeEvent('done', payload);
          res.end();
          return;
        } catch (err) {
          lastError = err;
          markModelCooldownIfTransient(candidate.model, err);
          // If beats already streamed before an interruption, finalize gracefully with extracted beats
          const salvaged = extractor.getExtractedBeats();
          if (emittedBeatsCount > 0 || salvaged.length > 0) {
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
          // Retry / fall back if no beats were streamed yet and error is transient or empty output
          if (emittedBeatsCount === 0 && idx < candidates.length - 1 && isRetryableStoryError(err)) {
            continue;
          }
          throw err;
        }
      }

      throw lastError || new Error('Story generation failed.');
    } catch (err) {
      console.error('Story stream error:', err);
      writeEvent('error', { error: extractFriendlyGeminiError(err, 'Unable to continue story right now.') });
      res.end();
    }
  });

  app.post('/api/story/turn', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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
        const candidate = candidates[idx];
        if (candidate.delayBeforeMs > 0) {
          await new Promise((r) => setTimeout(r, candidate.delayBeforeMs));
        }
        try {
          const config: Record<string, unknown> = {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema,
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
          markModelCooldownIfTransient(candidate.model, err);
          if (idx < candidates.length - 1 && isRetryableStoryError(err)) {
            continue;
          }
          throw err;
        }
      }

      throw lastError || new Error('Story generation failed.');
    } catch (err) {
      console.error('Story turn error:', err);
      const status = isTransientGeminiError(err) ? 503 : 500;
      res.status(status).json({ error: extractFriendlyGeminiError(err, 'Story generation failed.') });
    }
  });

  app.post('/api/story/suggestions', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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
      const suggestionModels: { model: string; thinkingLevel?: ThinkingLevel; delayBeforeMs: number }[] = [
        { model: 'gemini-3.1-flash-lite', delayBeforeMs: 0 },
        { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, delayBeforeMs: 450 },
        { model: 'gemini-3.1-flash-lite', delayBeforeMs: 900 },
      ];
      let lastError: unknown;

      for (let idx = 0; idx < suggestionModels.length; idx++) {
        const candidate = suggestionModels[idx];
        if (candidate.delayBeforeMs > 0) {
          await new Promise((r) => setTimeout(r, candidate.delayBeforeMs));
        }
        try {
          const config: Record<string, unknown> = {
            systemInstruction: `Generate 3-4 vivid, short roleplay reply options for the user. ${getLanguageInstruction(language)}`,
            responseMimeType: 'application/json',
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
          markModelCooldownIfTransient(candidate.model, err);
          if (idx < suggestionModels.length - 1 && isTransientGeminiError(err)) {
            continue;
          }
          throw err;
        }
      }

      throw lastError || new Error('Unable to generate reply suggestions.');
    } catch (err) {
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
