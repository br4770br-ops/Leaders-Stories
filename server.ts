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

async function withGeminiRetry<T>(fn: () => Promise<T>, maxAttempts = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient = /429|503|RESOURCE_EXHAUSTED|UNAVAILABLE|ECONNRESET|ETIMEDOUT/i.test(msg);
      if (!isTransient || attempt === maxAttempts) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 450 * attempt));
    }
  }
  throw lastError;
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

function normalizeBeat(raw: unknown): CleanStoryBeat | null {
  if (!raw || typeof raw !== 'object') return null;
  const b = raw as { type?: unknown; speakerName?: unknown; text?: unknown };
  const text = sanitizeText(b.text, 800);
  if (!text) return null;
  const type = b.type === 'narration' ? 'narration' : 'dialogue';
  const speakerName = b.speakerName ? sanitizeText(b.speakerName, 60) : undefined;
  return {
    type,
    ...(type === 'dialogue' && speakerName ? { speakerName } : {}),
    text,
  };
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

  const systemInstruction = [
    `Interactive multi-character roleplay director for "${story?.title}" (${(story?.tags || []).slice(0, 4).join(', ')}).`,
    `Setting: ${sanitizeText(story?.setting, 240)}. Premise: ${sanitizeText(story?.about, 480)}`,
    `CAST:\n${characterBlock}`,
    `RULES:\n1. Stay strictly in-character; never act like an AI assistant or repeat the opening.\n2. Write 2-3 crisp, gripping beats (mix 1-sentence 'narration' and punchy 'dialogue' with exact speakerName).\n3. Let characters react to the user AND each other naturally.\n4. Adjust meterChanges (-12..+12) only when earned.\n5. Set newMemory.shouldSave=true only for major reveals/promises.\n6. Return 2-3 storyChoices only at major turning points, else [].\n7. Set endingTriggered ONLY at a genuine climax from: ${(story?.possibleEndings || []).join(' | ') || 'True Ending'}.`,
    getLanguageInstruction(language),
  ].join('\n\n');

  const actionPrompt =
    mode === 'continue'
      ? `ACTION: Auto-advance (Fast-Forward). User stayed silent—continue immediately from the last beat with fresh character dialogue, tension, or movement without speaking for the user.`
      : mode === 'regenerate'
        ? `${userMessage ? `USER: "${userMessage}"\n` : ''}ACTION: Regenerate a distinctly different reaction, dialogue twist, or dramatic angle for this moment.`
        : `USER: "${userMessage}"`;

  const prompt = [
    `SCENE (Turn ${sceneIndex + 1}): ${currentScene} | METERS: ${meterBlock || 'None'}`,
    `MEMORIES:\n${memoryBlock}`,
    `RECENT:\n${historyBlock || '(Opening scene)'}`,
    actionPrompt,
  ].join('\n\n');

  return {
    mode,
    userMessage,
    currentScene,
    systemInstruction,
    prompt,
  };
}

const STORY_TURN_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    beats: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          speakerName: { type: Type.STRING },
          text: { type: Type.STRING },
        },
        required: ['type', 'text'],
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
    endingTriggered: { type: Type.STRING },
  },
  propertyOrdering: [
    'beats',
    'meterChanges',
    'newScene',
    'newMemory',
    'storyChoices',
    'endingTriggered',
  ],
  required: ['beats', 'meterChanges', 'newScene', 'storyChoices', 'endingTriggered'],
};

function normalizeStoryTurnPayload(rawText: string, fallbackScene: string) {
  const parsed = JSON.parse((rawText || '{}').trim()) as Record<string, unknown>;
  const safeBeats = Array.isArray(parsed.beats)
    ? parsed.beats.map(normalizeBeat).filter((b): b is CleanStoryBeat => Boolean(b))
    : [];

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
    endingTriggered: sanitizeText(parsed.endingTriggered, 180),
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
              const beat = normalizeBeat(parsed);
              if (beat) extracted.push(beat);
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
    const { mode, userMessage, currentScene, systemInstruction, prompt } = buildStoryPromptParts(body);

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

    try {
      const ai = getGeminiClient();
      const extractor = new IncrementalBeatsExtractor();

      const stream = await withGeminiRetry(() =>
        ai.models.generateContentStream({
          model: 'gemini-4-hydrogen',
          contents: prompt,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: STORY_TURN_RESPONSE_SCHEMA,
          },
        })
      );

      for await (const chunk of stream) {
        const chunkText = chunk.text || '';
        if (!chunkText) continue;
        const freshBeats = extractor.push(chunkText);
        for (const beat of freshBeats) {
          writeEvent('beat', beat);
        }
      }

      const payload = normalizeStoryTurnPayload(extractor.getFullText(), currentScene);
      writeEvent('done', payload);
      res.end();
    } catch (err) {
      console.error('Story stream error:', err);
      const message = err instanceof Error ? err.message : 'Story generation failed.';
      writeEvent('error', { error: message });
      res.end();
    }
  });

  app.post('/api/story/turn', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const body = req.body as StoryTurnBody;
      const { mode, userMessage, currentScene, systemInstruction, prompt } = buildStoryPromptParts(body);

      if (!body?.story?.title || (mode === 'reply' && !userMessage)) {
        res.status(400).json({ error: 'Story context and user message are required.' });
        return;
      }

      const ai = getGeminiClient();
      const response = await withGeminiRetry(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: prompt,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: STORY_TURN_RESPONSE_SCHEMA,
          },
        })
      );

      res.json(normalizeStoryTurnPayload(response.text || '{}', currentScene));
    } catch (err) {
      console.error('Story turn error:', err);
      const message = err instanceof Error ? err.message : 'Story generation failed.';
      res.status(500).json({ error: message });
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
      const response = await withGeminiRetry(() =>
        ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: `Story: ${story.title}\nScene: ${currentScene}\nRecent:\n${historyBlock}\n\nWrite 3-4 short, punchy roleplay replies the user can send next (<95 chars each).`,
          config: {
            systemInstruction: `Generate 3-4 vivid, short roleplay reply options for the user. ${getLanguageInstruction(language)}`,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
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
          },
        })
      );

      const parsed = JSON.parse((response.text || '{"suggestions":[]}').trim()) as {
        suggestions?: string[];
      };
      res.json({
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 4) : [],
      });
    } catch (err) {
      console.error('Suggestions error:', err);
      const message = err instanceof Error ? err.message : 'Unable to generate reply suggestions.';
      res.status(500).json({ error: message });
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
