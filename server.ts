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

    // Server-side block & maintenance enforcement (using caller's verified Firebase ID token)
    const [blockedDoc, userDoc, settingsDoc] = await Promise.all([
      fetchFirestoreDocWithToken(`blockedUsers/${encodeURIComponent(verified.uid)}`, token),
      fetchFirestoreDocWithToken(`users/${encodeURIComponent(verified.uid)}`, token),
      fetchFirestoreDocWithToken('appConfig/settings'),
    ]);

    const userStatus = userDoc.fields?.status?.stringValue;
    if (blockedDoc.exists || userStatus === 'blocked') {
      const reason =
        (blockedDoc.fields?.reason?.stringValue as string | undefined) ||
        (userDoc.fields?.blockedReason?.stringValue as string | undefined) ||
        'Your account has been suspended by the administrator.';
      res.status(403).json({
        error: `Account blocked: ${reason}`,
        code: 'ACCOUNT_BLOCKED',
      });
      return;
    }

    const maintenanceMode = Boolean(settingsDoc.fields?.maintenanceMode?.booleanValue);
    if (maintenanceMode && !isVerifiedMainAdmin(verified)) {
      const maintenanceMessage =
        (settingsDoc.fields?.maintenanceMessage?.stringValue as string | undefined) ||
        'LEADERS STORIES is temporarily undergoing maintenance. Please check back shortly.';
      res.status(503).json({
        error: maintenanceMessage,
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

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
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
      await new Promise((r) => setTimeout(r, 600 * attempt));
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
    return [
      'LANGUAGE: Pure, natural conversational Hindi written in Devanagari script (हिंदी).',
      'Use natural emotional Hindi expressions and idioms.',
      'Avoid unnecessary English words or Hinglish Roman script unless a character naturally uses a proper noun.',
    ].join(' ');
  }
  if (lang === 'english') {
    return [
      'LANGUAGE: Natural, vivid cinematic English.',
      'Keep dialogue sharp, expressive, emotionally grounded, and never robotic.',
    ].join(' ');
  }
  return [
    'LANGUAGE: Natural conversational Hinglish (modern Indian Hindi written in Roman script with natural everyday English phrases where authentic).',
    'Example tone: *Isha ka chehra ek dum se laal ho jata hai.* Isha: "WHAT?! Tumhari himmat kaise hui aisa sochne ki?"',
    'Keep it natural, dramatic, and easy to read on mobile.',
  ].join(' ');
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
    res.json({
      allowed: true,
      targetUid,
      action,
      verifiedBy: req.firebaseUser?.email,
    });
  });

  app.post('/api/story/turn', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const body = req.body as StoryTurnBody;
      const story = body?.story;
      const userMessage = sanitizeText(body?.userMessage, 2000);
      const language = ALLOWED_LANGUAGES.has(body?.language || '') ? (body.language as string) : 'hinglish';
      const currentScene = sanitizeText(body?.currentScene, 400);
      const sceneIndex = Number.isFinite(body?.sceneIndex) ? Number(body.sceneIndex) : 0;

      if (!story || !story.title || !userMessage) {
        res.status(400).json({ error: 'Story context and user message are required.' });
        return;
      }

      const characters = Array.isArray(story.characters) ? story.characters.slice(0, 8) : [];
      const meters = Array.isArray(body.relationshipMeters) ? body.relationshipMeters.slice(0, 8) : [];
      const memories = Array.isArray(body.memories) ? body.memories.slice(0, 8) : [];
      const recentMessages = Array.isArray(body.recentMessages) ? body.recentMessages.slice(-10) : [];

      const historyBlock = recentMessages
        .map((m) => {
          if (m.role === 'user') {
            return `USER: ${sanitizeText(m.userText, 600)}`;
          }
          const lines = (m.beats || []).map((b) =>
            b.type === 'narration'
              ? `*${sanitizeText(b.text, 400)}*`
              : `${sanitizeText(b.speakerName, 40)}: "${sanitizeText(b.text, 400)}"`
          );
          return lines.join('\n');
        })
        .join('\n---\n');

      const characterBlock = characters
        .map(
          (c) =>
            `- ${c.name}${c.age ? ` (${c.age})` : ''} [${c.role}]: ${c.personality} Speaking style: ${c.speakingStyle}. Relationship to user: ${c.relationshipToUser}.`
        )
        .join('\n');

      const meterBlock = meters
        .map((m) => `- ${m.id} (${m.label}): ${m.value}/${m.max}`)
        .join('\n');

      const memoryBlock =
        memories.length > 0
          ? memories.map((mem) => `- [Importance ${mem.importance}/10] ${mem.summary}`).join('\n')
          : 'No prior major memories yet.';

      const systemInstruction = [
        `You are the interactive multi-character story director for "LEADERS STORIES", crafting an immersive roleplay scene for "${story.title}".`,
        `Genre/Tags: ${(story.tags || []).join(', ')}. Setting: ${sanitizeText(story.setting, 400)}.`,
        `Story Premise: ${sanitizeText(story.about, 900)}`,
        `CAST OF CHARACTERS (maintain distinct voices, faces/identities, and let them react BOTH to the user AND to each other naturally):\n${characterBlock}`,
        `STORY RULES:\n1. Never act like a helpful AI assistant or break character.\n2. Never repeat the opening introduction.\n3. Produce 2 to 4 short, punchy beats per turn: mix atmospheric 'narration' beats (1-2 sentences of action/emotion) and 'dialogue' beats where different characters speak with their own speakerName.\n4. Characters can interrupt, tease, warn, defend, or whisper to each other as the user participates inside the scene.\n5. Keep every beat concise and mobile-readable (no walls of text).\n6. Adjust relationship meter deltas (-12 to +12) only when justified by the user's words/choices.\n7. Record a concise memory only if a genuinely significant revelation, promise, clash, or plot shift happened.\n8. Offer 2-3 optional branching choices in 'storyChoices' only at dramatic turning points (otherwise return empty array so free-form chat feels natural).\n9. Trigger 'endingTriggered' ONLY if the scene reaches a decisive narrative climax from: ${(story.possibleEndings || []).join(' | ')}.`,
        getLanguageInstruction(language),
      ].join('\n\n');

      const prompt = [
        `CURRENT SCENE (Turn ${sceneIndex + 1}): ${currentScene}`,
        `CURRENT RELATIONSHIP METERS:\n${meterBlock || 'None'}`,
        `RELEVANT STORY MEMORIES:\n${memoryBlock}`,
        `RECENT SCENE HISTORY:\n${historyBlock || '(Opening scene just occurred)'}`,
        `USER'S LATEST ACTION / MESSAGE:\n"${userMessage}"`,
        `Generate the next multi-character story response now.`,
      ].join('\n\n');

      const ai = getGeminiClient();
      const response = await withGeminiRetry(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: prompt,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                beats: {
                  type: Type.ARRAY,
                  description: 'Ordered sequence of narration and character dialogue beats for this turn.',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: {
                        type: Type.STRING,
                        description: "Either 'narration' or 'dialogue'",
                      },
                      speakerName: {
                        type: Type.STRING,
                        description: 'Required when type is dialogue; exact character name.',
                      },
                      text: {
                        type: Type.STRING,
                        description: 'Short, evocative narration line or spoken dialogue (without surrounding quotes).',
                      },
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
                newScene: {
                  type: Type.STRING,
                  description: 'Short updated current scene label/summary (max 120 chars).',
                },
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
                endingTriggered: {
                  type: Type.STRING,
                  description: 'Empty string unless a genuine dramatic story ending was reached.',
                },
              },
              required: ['beats', 'meterChanges', 'newScene', 'storyChoices', 'endingTriggered'],
            },
          },
        })
      );

      const rawText = (response.text || '{}').trim();
      const parsed = JSON.parse(rawText) as Record<string, unknown>;
      const safeBeats = Array.isArray(parsed.beats)
        ? parsed.beats
            .filter((b): b is { type?: string; speakerName?: string; text?: string } => Boolean(b && typeof b === 'object'))
            .map((b) => ({
              type: b.type === 'narration' ? 'narration' : 'dialogue',
              ...(b.speakerName ? { speakerName: sanitizeText(b.speakerName, 60) } : {}),
              text: sanitizeText(b.text, 800),
            }))
            .filter((b) => b.text.length > 0)
        : [];

      res.json({
        beats: safeBeats,
        meterChanges: Array.isArray(parsed.meterChanges) ? parsed.meterChanges : [],
        newScene: sanitizeText(parsed.newScene, 160) || currentScene,
        newMemory:
          parsed.newMemory && typeof parsed.newMemory === 'object'
            ? parsed.newMemory
            : { shouldSave: false },
        storyChoices: Array.isArray(parsed.storyChoices)
          ? parsed.storyChoices.filter((c): c is string => typeof c === 'string' && c.trim().length > 0).slice(0, 3)
          : [],
        endingTriggered: sanitizeText(parsed.endingTriggered, 180),
      });
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
      const currentScene = sanitizeText(body?.currentScene, 400);

      if (!story || !story.title) {
        res.status(400).json({ error: 'Story context is required.' });
        return;
      }

      const recentMessages = Array.isArray(body.recentMessages) ? body.recentMessages.slice(-5) : [];
      const historyBlock = recentMessages
        .map((m) => {
          if (m.role === 'user') return `USER: ${sanitizeText(m.userText, 300)}`;
          return (m.beats || [])
            .map((b) =>
              b.type === 'narration'
                ? `*${sanitizeText(b.text, 240)}*`
                : `${sanitizeText(b.speakerName, 40)}: "${sanitizeText(b.text, 240)}"`
            )
            .join('\n');
        })
        .join('\n');

      const meters = Array.isArray(body.relationshipMeters)
        ? body.relationshipMeters.map((m) => `${m.label}: ${m.value}/${m.max}`).join(', ')
        : '';

      const ai = getGeminiClient();
      const response = await withGeminiRetry(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `Story: ${story.title}\nScene: ${currentScene}\nMeters: ${meters}\nRecent dialogue:\n${historyBlock}\n\nGenerate 4 distinct, natural, in-character reply suggestions the user could say or do next (mix bold, empathetic, witty, or plot-advancing moves). Keep each under 110 characters.`,
          config: {
            systemInstruction: `You write short, compelling interactive roleplay reply options for the user. ${getLanguageInstruction(language)} Return strictly 3 to 4 strings.`,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
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
