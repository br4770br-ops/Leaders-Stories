import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  ArrowDown,
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCheck,
  Copy,
  FastForward,
  Globe,
  Info,
  Lightbulb,
  Mic,
  MicOff,
  MoreHorizontal,
  MoreVertical,
  RefreshCw,
  RotateCcw,
  Send,
  Sparkles,
  Undo2,
  Users,
  X,
} from 'lucide-react';
import {
  buildInitialStorySessionData,
  initializeStorySessionInCloud,
  loadConversationMessages,
  loadConversationMessagesFromCache,
  replaceLatestStoryMessageInCloud,
  restartStoryInCloud,
  resumeStoryEndingInCloud,
  rewindLastTurnInCloud,
  saveStoryContinueToCloud,
  saveTurnToCloud,
} from '../lib/firestoreService';
import type {
  ChatTurnMessage,
  LanguageCode,
  RelationshipMeterValue,
  StoryBeat,
  StoryDefinition,
  StoryMemoryRecord,
  StoryProgressRecord,
} from '../types/story';
import { FullscreenGalleryModal } from './FullscreenGalleryModal';
import { StoryImage } from './StoryImage';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface StoryTurnApiResponse {
  error?: string;
  beats?: StoryBeat[];
  meterChanges?: { id: string; delta: number; reason?: string }[];
  newScene?: string;
  newMemory?: {
    shouldSave?: boolean;
    summary?: string;
    importance?: number;
    charactersInvolved?: string[];
  };
  storyChoices?: string[];
  endingTriggered?: string;
}

interface StoryChatScreenProps {
  story: StoryDefinition;
  user: User;
  preferredLanguage: LanguageCode;
  existingProgress?: StoryProgressRecord;
  existingMeters?: RelationshipMeterValue[];
  existingMemories?: StoryMemoryRecord[];
  enableVoiceInput?: boolean;
  enableAiSuggestions?: boolean;
  onBack: () => void;
  onOpenStoryInfo: (story: StoryDefinition) => void;
  onChangeLanguage: (lang: LanguageCode) => void;
  onLocalTurnSync?: (payload: {
    story: StoryDefinition;
    lastMessage: string;
    lastSpeaker: string;
    messageCount: number;
    currentScene: string;
    sceneIndex: number;
    meters: RelationshipMeterValue[];
    choicesMade?: string[];
    endingReached?: string;
    newMemory?: StoryMemoryRecord;
  }) => void;
  onDataUpdated: () => Promise<void>;
}

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  hinglish: 'Hinglish',
  hindi: 'Hindi (हिंदी)',
  english: 'English',
};

function isTransientStoryErrorText(text: string): boolean {
  const lower = (text || '').toLowerCase();
  return (
    lower.includes('busy') ||
    lower.includes('503') ||
    lower.includes('unavailable') ||
    lower.includes('high demand') ||
    lower.includes('overloaded') ||
    lower.includes('429') ||
    lower.includes('too many requests') ||
    lower.includes('resource_exhausted')
  );
}

function isPlaceholderStoryMessage(msg: ChatTurnMessage): boolean {
  if (msg.role !== 'story') return false;
  if (!Array.isArray(msg.beats) || msg.beats.length === 0) return true;
  return msg.beats.every((b) => {
    const t = (b?.text || '').trim();
    return !t || t === '...';
  });
}

function escapeBeatRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function resolveCastSpeakerName(
  rawSpeaker: string | undefined,
  cast: StoryDefinition['characters']
): string | undefined {
  const cleaned = (rawSpeaker || '').trim();
  if (!cleaned) return undefined;
  const lower = cleaned.toLowerCase();
  if (lower === 'narrator' || lower === 'story' || lower === 'user' || lower === 'you') {
    return undefined;
  }

  const exact = cast.find((c) => c.name.toLowerCase() === lower);
  if (exact) return exact.name;

  const firstToken = lower.split(/\s+/)[0];
  if (firstToken && firstToken.length >= 2) {
    const partial = cast.find((c) => {
      const cLower = c.name.toLowerCase();
      return cLower === firstToken || cLower.startsWith(`${firstToken} `) || cLower.includes(lower);
    });
    if (partial) return partial.name;
  }
  return cleaned;
}

function detectSpeakerFromPrefix(
  text: string,
  cast: StoryDefinition['characters']
): { speaker?: string; strippedText: string } {
  const trimmed = (text || '').trim();
  const unquoted = trimmed.replace(/^["“']\s*/, '');
  for (const ch of cast) {
    const fullName = ch.name.trim();
    const firstName = fullName.split(/\s+/)[0] || '';
    const candidates =
      firstName && firstName.toLowerCase() !== fullName.toLowerCase()
        ? [fullName, firstName]
        : [fullName];
    for (const candidate of candidates) {
      const match = new RegExp(`^${escapeBeatRegex(candidate)}\\s*:\\s*([\\s\\S]+)$`, 'i').exec(unquoted);
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

function cleanDialogueBeatText(
  text: string,
  speakerName?: string,
  cast: StoryDefinition['characters'] = []
): string {
  let cleaned = (text || '').trim();
  const namesToStrip = Array.from(
    new Set([...(speakerName ? [speakerName] : []), ...cast.map((c) => c.name)])
  );
  for (const name of namesToStrip) {
    const firstName = name.split(/\s+/)[0] || '';
    const prefixRegex = firstName
      ? new RegExp(`^(?:${escapeBeatRegex(name)}|${escapeBeatRegex(firstName)})\\s*:\\s*`, 'i')
      : new RegExp(`^${escapeBeatRegex(name)}\\s*:\\s*`, 'i');
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

function groupBeatsIntoCharacterCards(
  rawBeats: StoryBeat[],
  cast: StoryDefinition['characters']
): StoryBeat[][] {
  const cards: StoryBeat[][] = [];
  const seenSpeakers = new Set<string>();
  let pendingNarrations: StoryBeat[] = [];

  for (const raw of rawBeats) {
    if (!raw || typeof raw !== 'object') continue;
    const rawText = (raw.text || '').trim();
    if (!rawText || rawText === '...') continue;

    if (raw.type === 'narration') {
      pendingNarrations.push({ type: 'narration', text: rawText });
      continue;
    }

    let resolvedSpeaker = resolveCastSpeakerName(raw.speakerName, cast);
    const detected = detectSpeakerFromPrefix(rawText, cast);
    if (detected.speaker) {
      resolvedSpeaker = detected.speaker;
    }
    const cleanSpeech = cleanDialogueBeatText(
      detected.speaker ? detected.strippedText : rawText,
      resolvedSpeaker,
      cast
    );
    if (!cleanSpeech || cleanSpeech === '...') continue;

    if (!resolvedSpeaker) {
      resolvedSpeaker =
        cast.find((c) => !seenSpeakers.has(c.name.toLowerCase()))?.name ||
        cast[0]?.name ||
        'Character';
    }

    const speakerKey = resolvedSpeaker.toLowerCase();
    // Never let the same character speak twice inside the same turn/message
    if (seenSpeakers.has(speakerKey)) {
      pendingNarrations = [];
      continue;
    }

    seenSpeakers.add(speakerKey);
    const dialogueBeat: StoryBeat = {
      type: 'dialogue',
      speakerName: resolvedSpeaker,
      text: cleanSpeech,
    };
    cards.push([...pendingNarrations, dialogueBeat]);
    pendingNarrations = [];
  }

  if (cards.length === 0 && pendingNarrations.length > 0) {
    cards.push(pendingNarrations);
  } else if (pendingNarrations.length > 0 && cards.length > 0) {
    cards[cards.length - 1] = [...cards[cards.length - 1], ...pendingNarrations];
  }

  return cards;
}

function extractValidStoryBeats(
  rawBeats: unknown,
  cast: StoryDefinition['characters'] = []
): StoryBeat[] {
  if (!Array.isArray(rawBeats)) return [];
  const initialBeats: StoryBeat[] = rawBeats
    .map((b) => {
      if (!b || typeof b !== 'object') return null;
      const item = b as { type?: unknown; speakerName?: unknown; text?: unknown };
      const type: StoryBeat['type'] = item.type === 'narration' ? 'narration' : 'dialogue';
      const rawText = typeof item.text === 'string' ? item.text.trim() : '';
      if (!rawText || rawText === '...') return null;

      if (type === 'narration') {
        return { type: 'narration' as const, text: rawText };
      }

      let resolvedSpeaker = resolveCastSpeakerName(
        typeof item.speakerName === 'string' ? item.speakerName : '',
        cast
      );
      const detected = detectSpeakerFromPrefix(rawText, cast);
      if (detected.speaker) {
        resolvedSpeaker = detected.speaker;
      }
      const text = cleanDialogueBeatText(
        detected.speaker ? detected.strippedText : rawText,
        resolvedSpeaker,
        cast
      );
      if (!text || text === '...') return null;

      return {
        type: 'dialogue' as const,
        ...(resolvedSpeaker ? { speakerName: resolvedSpeaker } : {}),
        text,
      };
    })
    .filter((b): b is StoryBeat => Boolean(b));

  if (cast.length === 0) return initialBeats;
  return groupBeatsIntoCharacterCards(initialBeats, cast).flat();
}

function formatReadableError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  let msg = err instanceof Error ? err.message : typeof err === 'string' ? err : fallback;
  for (let depth = 0; depth < 4; depth++) {
    const trimmed = (msg || '').trim();
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
  const clean = (msg || '').trim();
  const lower = clean.toLowerCase();
  if (
    lower.includes('503') ||
    lower.includes('unavailable') ||
    lower.includes('service unavailable') ||
    lower.includes('high demand') ||
    lower.includes('overloaded')
  ) {
    return 'Story AI servers are busy right now. Please tap Retry in a second.';
  }
  if (lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('quota')) {
    return 'Too many requests right now. Please wait a couple seconds and tap Retry.';
  }
  if (lower.includes('offline') || lower.includes('failed to get document')) {
    return 'Connection interrupted. Your local story progress is safe.';
  }
  if (lower.includes('no document to update') || lower.includes('not-found')) {
    return 'Syncing story session in the background. Please try again.';
  }
  return clean.slice(0, 220) || fallback;
}

interface ChatMessageListProps {
  messages: ChatTurnMessage[];
  meters: RelationshipMeterValue[];
  story: StoryDefinition;
  characterPortraitMap: Map<string, string>;
  sending: boolean;
  endingReached: string;
  msgMenuOpen: boolean;
  playGuideVisible: boolean;
  copiedToast: boolean;
  onToggleMsgMenu: () => void;
  onCloseMsgMenu: () => void;
  onContinueScene: () => void;
  onRegenerateLatest: () => void;
  onUndoLastTurn: () => void;
  onCopyLatest: (msg: ChatTurnMessage) => void;
  onTogglePlayGuide: () => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = React.memo(
  ({
    messages,
    meters,
    story,
    characterPortraitMap,
    sending,
    endingReached,
    msgMenuOpen,
    playGuideVisible,
    copiedToast,
    onToggleMsgMenu,
    onCloseMsgMenu,
    onContinueScene,
    onRegenerateLatest,
    onUndoLastTurn,
    onCopyLatest,
    onTogglePlayGuide,
  }) => {
    const latestStoryIdx = useMemo(
      () => messages.reduce((lastIdx, m, i) => (m.role === 'story' ? i : lastIdx), -1),
      [messages]
    );

    return (
      <>
        {messages.map((msg, idx) => {
          const isLatestStoryMsg = msg.role === 'story' && idx === latestStoryIdx;

          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[84%] sm:max-w-[75%] rounded-2xl rounded-br-sm bg-gradient-to-br from-[#A61C31] to-[#841425] px-4 py-3 text-[15px] leading-relaxed text-white shadow-md">
                  <p className="whitespace-pre-wrap break-words">{msg.userText}</p>
                  <div className="flex justify-end mt-1">
                    <CheckCheck className="w-3.5 h-3.5 text-white/75" />
                  </div>
                </div>
              </div>
            );
          }

          const metersToDisplay = isLatestStoryMsg ? meters : msg.metersSnapshot || [];
          const characterCards = groupBeatsIntoCharacterCards(msg.beats || [], story.characters);

          return (
            <div key={msg.id} className="flex flex-col items-start space-y-2.5">
              {characterCards.map((cardBeats, cardIdx) => (
                <div
                  key={`${msg.id}_card_${cardIdx}`}
                  className="w-full max-w-[92%] sm:max-w-[85%] rounded-2xl rounded-bl-sm bg-[#1C1D22] border border-white/[0.06] px-4 py-3.5 space-y-3 shadow-lg"
                >
                  {isLatestStoryMsg && cardIdx === 0 && metersToDisplay.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pb-2 border-b border-white/[0.07] text-[13px] font-semibold tabular-nums">
                      {metersToDisplay.map((m) => (
                        <div key={m.id} className="flex items-center gap-1.5 text-zinc-100">
                          <span>{m.emoji}</span>
                          <span className="text-zinc-300">{m.label}:</span>
                          <span className="text-white">
                            {m.value}/
                            {story.relationshipMeters.find((d) => d.id === m.id)?.max ?? 100}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3">
                    {cardBeats.map((beat, bIdx) => {
                      if (beat.type === 'narration') {
                        return (
                          <p
                            key={bIdx}
                            className="text-[14.5px] italic text-[#A1A3AD] leading-relaxed"
                          >
                            *{beat.text}*
                          </p>
                        );
                      }
                      const speaker =
                        beat.speakerName || story.characters[0]?.name || 'Character';
                      const cleanSpeech = cleanDialogueBeatText(
                        beat.text,
                        speaker,
                        story.characters
                      );
                      const portrait =
                        characterPortraitMap.get(speaker.toLowerCase()) ||
                        characterPortraitMap.get(speaker.split(' ')[0]?.toLowerCase() || '');

                      return (
                        <div key={bIdx} className="flex items-start gap-2.5">
                          {portrait && (
                            <StoryImage
                              src={portrait}
                              alt={speaker}
                              className="w-6 h-6 rounded-full object-cover object-top mt-0.5 shrink-0 ring-1 ring-white/15"
                            />
                          )}
                          <p className="text-[15px] text-white leading-relaxed">
                            <span className="font-semibold text-zinc-100">{speaker}: </span>
                            <span className="text-zinc-100">"{cleanSpeech}"</span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Kavana-style Fast-Forward (>>) and More (...) actions below latest story message */}
              {isLatestStoryMsg && !sending && !endingReached && (
                <div className="relative flex items-center gap-2.5 mt-2.5 pl-0.5">
                  <button
                    type="button"
                    onClick={onContinueScene}
                    aria-label="Continue scene"
                    title="Auto-advance scene (>>)"
                    className="w-10 h-10 rounded-full bg-[#24252C] hover:bg-[#31323B] border border-white/[0.08] flex items-center justify-center text-white shadow-md transition active:scale-95"
                  >
                    <FastForward className="w-4 h-4 fill-white text-white" />
                  </button>

                  <button
                    type="button"
                    onClick={onToggleMsgMenu}
                    aria-label="More message options"
                    title="Message options"
                    className="w-10 h-10 rounded-full bg-[#24252C] hover:bg-[#31323B] border border-white/[0.08] flex items-center justify-center text-white shadow-md transition active:scale-95"
                  >
                    <MoreHorizontal className="w-4 h-4 text-white" />
                  </button>

                  {copiedToast && (
                    <span className="text-xs font-medium text-emerald-400 pl-1">
                      Copied!
                    </span>
                  )}

                  {msgMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={onCloseMsgMenu}
                        aria-hidden="true"
                      />
                      <div className="absolute left-0 bottom-12 w-56 rounded-2xl bg-[#191922] border border-white/10 shadow-2xl p-1.5 z-40 space-y-0.5">
                        <button
                          type="button"
                          onClick={onRegenerateLatest}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-100 hover:bg-white/5 flex items-center gap-2.5 transition"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-[#E5233D]" />
                          <span>Regenerate response</span>
                        </button>

                        <button
                          type="button"
                          onClick={onUndoLastTurn}
                          disabled={messages.length <= 1}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-100 hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2.5 transition"
                        >
                          <Undo2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Undo last turn</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onCopyLatest(msg)}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-100 hover:bg-white/5 flex items-center gap-2.5 transition"
                        >
                          <Copy className="w-3.5 h-3.5 text-zinc-300" />
                          <span>Copy scene text</span>
                        </button>

                        <div className="border-t border-white/10 my-1" />

                        <button
                          type="button"
                          onClick={onTogglePlayGuide}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-200 hover:bg-white/5 flex items-center gap-2.5 transition"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#EA8C44]" />
                          <span>{playGuideVisible ? 'Hide Play Guide' : 'Show Play Guide'}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  }
);

export const StoryChatScreen: React.FC<StoryChatScreenProps> = ({
  story,
  user,
  preferredLanguage,
  existingProgress,
  existingMeters,
  existingMemories = [],
  enableVoiceInput = true,
  enableAiSuggestions = true,
  onBack,
  onOpenStoryInfo,
  onChangeLanguage,
  onLocalTurnSync,
  onDataUpdated,
}) => {
  const [messages, setMessages] = useState<ChatTurnMessage[]>([]);
  const [meters, setMeters] = useState<RelationshipMeterValue[]>(
    existingMeters && existingMeters.length > 0
      ? existingMeters
      : story.relationshipMeters.map((m) => ({ ...m, value: m.initialValue }))
  );
  const [memories, setMemories] = useState<StoryMemoryRecord[]>(existingMemories);
  const [currentScene, setCurrentScene] = useState<string>(
    existingProgress?.currentScene || story.openingScene
  );
  const [sceneIndex, setSceneIndex] = useState<number>(existingProgress?.sceneIndex || 0);
  const [choicesMade, setChoicesMade] = useState<string[]>(existingProgress?.choicesMade || []);
  const [endingReached, setEndingReached] = useState<string>('');
  const [activeChoices, setActiveChoices] = useState<string[]>(
    !existingProgress ? story.initialChoices[preferredLanguage] || story.initialChoices.hinglish : []
  );

  const [input, setInput] = useState('');
  const [loadingInit, setLoadingInit] = useState(true);
  const [sending, setSending] = useState(false);
  const [streamingBeats, setStreamingBeats] = useState<StoryBeat[]>([]);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [retryAction, setRetryAction] = useState<
    | { type: 'send'; text: string; isChoice: boolean }
    | { type: 'continue' }
    | { type: 'regenerate' }
    | null
  >(null);

  // Lightbulb AI Suggested Replies + turn-keyed instant cache
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const suggestionsCacheRef = useRef<Map<string, string[]>>(new Map());
  const suggestionsAbortRef = useRef<AbortController | null>(null);

  // Concurrency guards, active stream controller & serialized cloud write queue
  const inFlightRef = useRef(false);
  const streamAbortRef = useRef<AbortController | null>(null);
  const cloudWriteQueueRef = useRef<Promise<void>>(Promise.resolve());
  const maxSequenceRef = useRef<number>(0);
  const mountedRef = useRef(true);

  const enqueueCloudWrite = (task: () => Promise<void>) => {
    cloudWriteQueueRef.current = cloudWriteQueueRef.current
      .then(task)
      .catch((err) => {
        console.error('Background cloud save failed:', err);
        if (mountedRef.current) {
          setErrorBanner(`Sync warning: ${formatReadableError(err, 'Unable to sync turn to cloud.')}`);
        }
      });
  };

  // Microphone speech-to-text
  const [isListening, setIsListening] = useState(false);
  const [micStatusMessage, setMicStatusMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Drawers, menus & Play Guide
  const [menuOpen, setMenuOpen] = useState(false);
  const [msgMenuOpen, setMsgMenuOpen] = useState(false);
  const [playGuideVisible, setPlayGuideVisible] = useState(true);
  const [playGuideChoicesOpen, setPlayGuideChoicesOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [contextDrawerOpen, setContextDrawerOpen] = useState(false);
  const [restartConfirmOpen, setRestartConfirmOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Showcase Carousel & Fullscreen Gallery
  const showcaseSlides = useMemo(() => {
    const items = [...(story.mediaGallery || [])];
    const seenUrls = new Set(items.map((item) => item.url));
    story.characters.forEach((char) => {
      if (char.portrait && !seenUrls.has(char.portrait)) {
        seenUrls.add(char.portrait);
        items.push({
          id: `char_${char.id}`,
          url: char.portrait,
          caption: `${char.name} — ${char.relationshipToUser}`,
        });
      }
    });
    if (items.length === 0) {
      items.push({ id: 'cover', url: story.coverImage, caption: story.tagline });
    }
    return items;
  }, [story]);

  const initialSlideIndex = showcaseSlides.length >= 3 ? 1 : 0;
  const [activeSlide, setActiveSlide] = useState<number>(initialSlideIndex);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const carouselRafRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToSlide = (idx: number, smooth = true) => {
    const track = carouselRef.current;
    const card = slideRefs.current[idx];
    if (!track || !card) return;
    const targetLeft = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
    track.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: smooth ? 'smooth' : 'auto',
    });
    setActiveSlide(idx);
  };

  const handleCarouselScroll = () => {
    if (carouselRafRef.current !== null) return;
    carouselRafRef.current = requestAnimationFrame(() => {
      carouselRafRef.current = null;
      const track = carouselRef.current;
      if (!track) return;
      const center = track.scrollLeft + track.clientWidth / 2;
      let closestIdx = 0;
      let minDist = Number.POSITIVE_INFINITY;
      slideRefs.current.forEach((el, idx) => {
        if (!el) return;
        const cardCenter = el.offsetLeft + el.offsetWidth / 2;
        const dist = Math.abs(center - cardCenter);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = idx;
        }
      });
      setActiveSlide((prev) => (prev === closestIdx ? prev : closestIdx));
    });
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      streamAbortRef.current?.abort();
      suggestionsAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    setActiveSlide(initialSlideIndex);
    setMsgMenuOpen(false);
    setPlayGuideVisible(true);
    setPlayGuideChoicesOpen(false);
    const timer = setTimeout(() => {
      scrollToSlide(initialSlideIndex, false);
    }, 20);
    return () => {
      clearTimeout(timer);
      if (carouselRafRef.current !== null) {
        cancelAnimationFrame(carouselRafRef.current);
      }
    };
  }, [story.id, initialSlideIndex]);

  const scrollToBottom = (smooth = true) => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    });
  };

  // Sync Turn-0 opening beats & starter choices cleanly if language is switched before user replies
  useEffect(() => {
    if (loadingInit) return;
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].sequence === 0 && prev[0].role === 'story') {
        const localizedBeats = story.openingBeats[preferredLanguage] || story.openingBeats.hinglish;
        setActiveChoices(story.initialChoices[preferredLanguage] || story.initialChoices.hinglish);
        return [{ ...prev[0], beats: localizedBeats }];
      }
      return prev;
    });
  }, [preferredLanguage, loadingInit, story]);

  useEffect(() => {
    let active = true;

    const syncDerivedSessionState = (msgs: ChatTurnMessage[]) => {
      const lastStoryMsg = [...msgs].reverse().find((m) => m.role === 'story');
      if (lastStoryMsg?.sceneSummary && !existingProgress?.currentScene) {
        setCurrentScene(lastStoryMsg.sceneSummary);
      }
      const inferredSceneIdx = Math.max(
        existingProgress?.sceneIndex || 0,
        Math.floor(Math.max(0, msgs.length - 1) / 2)
      );
      setSceneIndex((prev) => Math.max(prev, inferredSceneIdx));
      if (existingProgress?.endingReached || existingProgress?.status === 'completed') {
        setEndingReached('');
        enqueueCloudWrite(async () => {
          await resumeStoryEndingInCloud(user.uid, story.id);
        });
      }
      if (existingMeters && existingMeters.length > 0) {
        setMeters(existingMeters);
      } else if (lastStoryMsg?.metersSnapshot && lastStoryMsg.metersSnapshot.length > 0) {
        setMeters((prev) =>
          prev.map((m) => {
            const snap = lastStoryMsg.metersSnapshot?.find((s) => s.id === m.id);
            return snap ? { ...m, value: snap.value } : m;
          })
        );
      }
      if (msgs.length <= 1) {
        setActiveChoices(story.initialChoices[preferredLanguage] || story.initialChoices.hinglish);
      }
    };

    const applySanitizedMessages = (rawMsgs: ChatTurnMessage[]) => {
      const maxSeq = rawMsgs.reduce((acc, m) => Math.max(acc, m.sequence || 0), 0);
      maxSequenceRef.current = Math.max(maxSequenceRef.current, maxSeq);
      const cleanMsgs = rawMsgs.filter((m) => !isPlaceholderStoryMessage(m));
      const finalMsgs = cleanMsgs.length > 0 ? cleanMsgs : rawMsgs.slice(0, 1);
      setMessages(finalMsgs);
      syncDerivedSessionState(finalMsgs);
      return finalMsgs;
    };

    async function bootSession() {
      setLoadingInit(true);
      setErrorBanner(null);
      setStreamingBeats([]);
      maxSequenceRef.current = 0;
      try {
        // 1. Instant cache-first hydration (renders in <10ms for resumed chats)
        const cached = await loadConversationMessagesFromCache(user.uid, story.id, 100);
        if (!active) return;

        if (cached.length > 0) {
          const cleanCached = applySanitizedMessages(cached);
          setLoadingInit(false);
          setTimeout(() => {
            if (cleanCached.length > 1) {
              scrollToBottom(false);
            } else {
              scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
            }
          }, 25);

          // Silent server reconciliation in background
          void loadConversationMessages(user.uid, story.id, 100)
            .then((fresh) => {
              if (!active || inFlightRef.current || fresh.length === 0) return;
              const cleanFresh = fresh.filter((m) => !isPlaceholderStoryMessage(m));
              const lastFresh = cleanFresh[cleanFresh.length - 1];
              const lastCached = cleanCached[cleanCached.length - 1];
              if (
                cleanFresh.length !== cleanCached.length ||
                lastFresh?.id !== lastCached?.id ||
                lastFresh?.sequence !== lastCached?.sequence
              ) {
                const applied = applySanitizedMessages(fresh);
                if (applied.length > 1) {
                  setTimeout(() => scrollToBottom(false), 30);
                }
              }
            })
            .catch(() => {});
          return;
        }

        // 2. Cache empty: check server (maybe returning on a new device/install)
        const loaded = await loadConversationMessages(user.uid, story.id, 100);
        if (!active) return;

        if (loaded.length > 0) {
          const cleanLoaded = applySanitizedMessages(loaded);
          setLoadingInit(false);
          setTimeout(() => {
            if (cleanLoaded.length > 1) {
              scrollToBottom(false);
            } else {
              scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
            }
          }, 30);
        } else {
          // 3. Brand new story: render opening scene immediately & commit to Firestore in background
          const msgId = `msg_0_${Date.now()}`;
          const built = buildInitialStorySessionData(user.uid, story, preferredLanguage, msgId);
          setMessages([built.initialMessage]);
          setMeters(built.meters);
          setCurrentScene(built.progress.currentScene);
          setSceneIndex(0);
          setActiveChoices(story.initialChoices[preferredLanguage] || story.initialChoices.hinglish);
          setLoadingInit(false);
          onLocalTurnSync?.({
            story,
            lastMessage: built.conversation.lastMessage,
            lastSpeaker: built.conversation.lastSpeaker || story.characters[0]?.name || 'Narrator',
            messageCount: 1,
            currentScene: built.progress.currentScene,
            sceneIndex: 0,
            meters: built.meters,
          });
          setTimeout(() => {
            scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
          }, 25);

          enqueueCloudWrite(async () => {
            await initializeStorySessionInCloud(user.uid, story, preferredLanguage, msgId);
          });
        }
      } catch (err) {
        if (!active) return;
        setLoadingInit(false);
        setErrorBanner(formatReadableError(err, 'Unable to load story conversation.'));
      }
    }
    void bootSession();
    return () => {
      active = false;
      recognitionRef.current?.stop();
    };
  }, [story.id, user.uid]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  }, [input]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBottom(distanceFromBottom > 180);
  };

  const characterPortraitMap = useMemo(() => {
    const map = new Map<string, string>();
    story.characters.forEach((c) => {
      map.set(c.name.toLowerCase(), c.portrait);
      const firstName = c.name.split(' ')[0]?.toLowerCase();
      if (firstName) map.set(firstName, c.portrait);
    });
    return map;
  }, [story.characters]);

  // Streams story beats live via SSE with automatic JSON endpoint fallback
  const requestStoryTurnStream = async (
    idToken: string,
    payloadBody: Record<string, unknown>,
    onBeat: (beat: StoryBeat) => void
  ): Promise<StoryTurnApiResponse> => {
    streamAbortRef.current?.abort();
    const controller = new AbortController();
    streamAbortRef.current = controller;

    const requestJsonFallback = async (): Promise<StoryTurnApiResponse> => {
      let lastFallbackErr: Error = new Error('Failed to generate next story scene.');
      for (let attempt = 0; attempt < 2; attempt++) {
        if (controller.signal.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 1200));
          if (controller.signal.aborted) {
            throw new DOMException('Aborted', 'AbortError');
          }
        }
        const fallbackResp = await fetch('/api/story/turn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(payloadBody),
          signal: controller.signal,
        });
        const fallbackData = (await fallbackResp.json().catch(() => ({}))) as StoryTurnApiResponse;
        const validBeats = extractValidStoryBeats(fallbackData.beats);
        if (fallbackResp.ok && validBeats.length > 0) {
          return { ...fallbackData, beats: validBeats };
        }
        const rawErr = fallbackData.error || (fallbackResp.ok ? 'Empty story response' : 'Failed to generate next story scene.');
        lastFallbackErr = new Error(formatReadableError(rawErr, 'Failed to generate next story scene.'));
        if (!isTransientStoryErrorText(rawErr) && !rawErr.toLowerCase().includes('empty')) {
          throw lastFallbackErr;
        }
      }
      throw lastFallbackErr;
    };

    const response = await fetch('/api/story/turn-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payloadBody),
      signal: controller.signal,
    });

    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('text/event-stream') || !response.body) {
      // Clean fallback if SSE isn't active or non-stream JSON error was returned
      if (!response.ok && !contentType.includes('text/event-stream')) {
        const errJson = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(formatReadableError(errJson.error, 'Failed to generate next story scene.'));
      }
      return requestJsonFallback();
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalPayload: StoryTurnApiResponse | null = null;
    let streamError: string | null = null;
    let receivedBeats: StoryBeat[] = [];

    const processEventBlock = (block: string) => {
      if (!block.trim()) return;
      let eventName = 'message';
      const dataLines: string[] = [];
      for (const line of block.split(/\r?\n/)) {
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trim());
        }
      }
      if (dataLines.length === 0) return;
      const rawData = dataLines.join('\n');
      try {
        const parsed = JSON.parse(rawData) as unknown;
        if (eventName === 'beat' && parsed && typeof parsed === 'object') {
          const beat = parsed as StoryBeat;
          receivedBeats = [...receivedBeats, beat];
          onBeat(beat);
        } else if (eventName === 'done' && parsed && typeof parsed === 'object') {
          finalPayload = parsed as StoryTurnApiResponse;
        } else if (eventName === 'error' && parsed && typeof parsed === 'object') {
          streamError = (parsed as { error?: string }).error || 'Story generation failed.';
        }
      } catch {
        // Ignore partial non-JSON lines
      }
    };

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let separatorIdx = buffer.indexOf('\n\n');
        while (separatorIdx !== -1) {
          const block = buffer.slice(0, separatorIdx);
          buffer = buffer.slice(separatorIdx + 2);
          processEventBlock(block);
          separatorIdx = buffer.indexOf('\n\n');
        }
      }
      if (buffer.trim()) {
        processEventBlock(buffer);
      }
    } catch (readErr) {
      if ((readErr as { name?: string })?.name === 'AbortError') {
        throw readErr;
      }
      if (receivedBeats.length > 0) {
        return { beats: receivedBeats };
      }
      return requestJsonFallback();
    }

    if (finalPayload) {
      const resolved = finalPayload as StoryTurnApiResponse;
      return {
        ...resolved,
        beats: resolved.beats && resolved.beats.length > 0 ? resolved.beats : receivedBeats,
      };
    }
    if (streamError) {
      if (receivedBeats.length > 0) {
        return { beats: receivedBeats };
      }
      if (isTransientStoryErrorText(streamError) && !controller.signal.aborted) {
        await new Promise((r) => setTimeout(r, 1100));
        if (!controller.signal.aborted) {
          return requestJsonFallback();
        }
      }
      throw new Error(formatReadableError(streamError, 'Unable to continue story right now.'));
    }
    if (receivedBeats.length > 0) {
      return { beats: receivedBeats };
    }
    return requestJsonFallback();
  };

  const handleSend = async (overrideText?: string, isChoiceSelection = false) => {
    const textToSend = (overrideText ?? input).trim();
    if (!textToSend || inFlightRef.current || loadingInit) return;

    inFlightRef.current = true;
    suggestionsAbortRef.current?.abort();
    setErrorBanner(null);
    setRetryAction(null);
    setSuggestionsOpen(false);
    setSending(true);
    setStreamingBeats([]);

    if (!overrideText) {
      setInput('');
    }

    const baseMessages = [...messages];
    const baseMaxSeq = baseMessages.reduce((acc, m) => Math.max(acc, m.sequence || 0), maxSequenceRef.current);
    const nextUserSeq = baseMaxSeq + 1;
    const now = Date.now();
    const userMsgId = `msg_${nextUserSeq}_${now}`;
    const storySeq = nextUserSeq + 1;
    const storyMsgId = `msg_${storySeq}_${now + 1}`;
    maxSequenceRef.current = storySeq;

    const optimisticUserMsg: ChatTurnMessage = {
      id: userMsgId,
      uid: user.uid,
      conversationId: story.id,
      role: 'user',
      userText: textToSend,
      sequence: nextUserSeq,
      localTimestamp: now,
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);
    setTimeout(() => scrollToBottom(true), 25);

    try {
      const idToken = await user.getIdToken();
      const data = await requestStoryTurnStream(
        idToken,
        {
          story: {
            id: story.id,
            title: story.title,
            tagline: story.tagline,
            about: story.about,
            setting: story.setting,
            tags: story.tags,
            characters: story.characters,
            possibleEndings: story.possibleEndings,
          },
          language: preferredLanguage,
          currentScene,
          sceneIndex,
          recentMessages: baseMessages.filter((m) => !isPlaceholderStoryMessage(m)).slice(-7).map((m) => ({
            role: m.role,
            userText: m.userText,
            beats: m.beats,
          })),
          memories: memories.slice(-5).map((m) => ({ summary: m.summary, importance: m.importance })),
          relationshipMeters: meters,
          userMessage: textToSend,
        },
        (beat) => {
          setStreamingBeats((prev) => [...prev, beat]);
          scrollToBottom(true);
        }
      );

      const storyBeats = extractValidStoryBeats(data.beats, story.characters);
      if (storyBeats.length === 0) {
        throw new Error('Characters are taking a moment to respond. Please tap Retry.');
      }

      const deltaMap = new Map<string, number>();
      (data.meterChanges || []).forEach((mc) => {
        const clamped = Math.max(-15, Math.min(15, Math.round(mc.delta || 0)));
        deltaMap.set(mc.id, clamped);
      });

      const updatedMeters = meters.map((m) => {
        const delta = deltaMap.get(m.id) || 0;
        const nextVal = Math.max(m.min, Math.min(m.max, m.value + delta));
        return { ...m, value: nextVal };
      });

      const nextSceneStr = (data.newScene || currentScene).slice(0, 500);
      const nextSceneIdx = sceneIndex + 1;
      const updatedChoicesMade = isChoiceSelection
        ? [...choicesMade, textToSend].slice(-50)
        : choicesMade;

      const memoryToSave =
        data.newMemory?.shouldSave && data.newMemory.summary
          ? {
              summary: data.newMemory.summary,
              importance: data.newMemory.importance || 6,
              charactersInvolved: data.newMemory.charactersInvolved || [],
            }
          : null;

      const finalStoryMsg: ChatTurnMessage = {
        id: storyMsgId,
        uid: user.uid,
        conversationId: story.id,
        role: 'story',
        sceneSummary: nextSceneStr,
        beats: storyBeats.slice(0, 12),
        metersSnapshot: updatedMeters.map((m) => ({
          id: m.id,
          label: m.label,
          emoji: m.emoji,
          value: m.value,
        })),
        sequence: storySeq,
        localTimestamp: now + 1,
      };

      // Update UI immediately without waiting on Firestore batch.commit()
      setStreamingBeats([]);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== userMsgId),
        optimisticUserMsg,
        finalStoryMsg,
      ]);
      setMeters(updatedMeters);
      setCurrentScene(nextSceneStr);
      setSceneIndex(nextSceneIdx);
      setChoicesMade(updatedChoicesMade);
      setActiveChoices(Array.isArray(data.storyChoices) ? data.storyChoices.slice(0, 3) : []);

      if (endingReached) {
        setEndingReached('');
      }

      const newMemRecord: StoryMemoryRecord | undefined = memoryToSave
        ? {
            id: `local_${now}`,
            uid: user.uid,
            storyId: story.id,
            summary: memoryToSave.summary,
            importance: memoryToSave.importance,
            charactersInvolved: memoryToSave.charactersInvolved,
          }
        : undefined;

      if (newMemRecord) {
        setMemories((prev) => [...prev, newMemRecord]);
      }

      const lastBeat = storyBeats[storyBeats.length - 1];
      onLocalTurnSync?.({
        story,
        lastMessage: (lastBeat?.text || nextSceneStr).slice(0, 1000),
        lastSpeaker: lastBeat?.speakerName || story.characters[0]?.name || 'Story',
        messageCount: storySeq + 1,
        currentScene: nextSceneStr,
        sceneIndex: nextSceneIdx,
        meters: updatedMeters,
        choicesMade: updatedChoicesMade,
        endingReached: data.endingTriggered?.trim() || undefined,
        newMemory: newMemRecord,
      });

      setTimeout(() => scrollToBottom(true), 30);

      // Persist asynchronously in ordered queue
      enqueueCloudWrite(async () => {
        await saveTurnToCloud({
          uid: user.uid,
          story,
          conversationExists: baseMessages.length > 0,
          userText: textToSend,
          userSequence: nextUserSeq,
          userMessageId: userMsgId,
          storyMessageId: storyMsgId,
          storyBeats,
          newScene: nextSceneStr,
          sceneIndex: nextSceneIdx,
          updatedMeters,
          choicesMade: updatedChoicesMade,
          endingTriggered: data.endingTriggered?.trim() || undefined,
          newMemory: memoryToSave,
        });
      });
    } catch (err) {
      if ((err as { name?: string })?.name !== 'AbortError') {
        setMessages((prev) => prev.filter((m) => m.id !== userMsgId));
        if (!overrideText) setInput(textToSend);
        setRetryAction({ type: 'send', text: textToSend, isChoice: isChoiceSelection });
        setErrorBanner(
          formatReadableError(err, 'Network error. Your previous conversation is safe.')
        );
      }
    } finally {
      if (mountedRef.current) {
        setStreamingBeats([]);
        setSending(false);
      }
      inFlightRef.current = false;
    }
  };

  // Fast-Forward (>>) auto-advance scene without user input
  const handleContinueScene = async () => {
    if (inFlightRef.current || loadingInit || endingReached) return;
    inFlightRef.current = true;
    suggestionsAbortRef.current?.abort();
    setMsgMenuOpen(false);
    setPlayGuideChoicesOpen(false);
    setSuggestionsOpen(false);
    setErrorBanner(null);
    setRetryAction(null);
    setSending(true);
    setStreamingBeats([]);
    setTimeout(() => scrollToBottom(true), 25);

    const baseMessages = [...messages];
    const baseMaxSeq = baseMessages.reduce((acc, m) => Math.max(acc, m.sequence || 0), maxSequenceRef.current);
    const nextSeq = baseMaxSeq + 1;
    const now = Date.now();
    const storyMsgId = `msg_${nextSeq}_${now}`;
    maxSequenceRef.current = nextSeq;

    try {
      const idToken = await user.getIdToken();
      const data = await requestStoryTurnStream(
        idToken,
        {
          story: {
            id: story.id,
            title: story.title,
            tagline: story.tagline,
            about: story.about,
            setting: story.setting,
            tags: story.tags,
            characters: story.characters,
            possibleEndings: story.possibleEndings,
          },
          mode: 'continue',
          language: preferredLanguage,
          currentScene,
          sceneIndex,
          recentMessages: baseMessages.filter((m) => !isPlaceholderStoryMessage(m)).slice(-7).map((m) => ({
            role: m.role,
            userText: m.userText,
            beats: m.beats,
          })),
          memories: memories.slice(-5).map((m) => ({ summary: m.summary, importance: m.importance })),
          relationshipMeters: meters,
        },
        (beat) => {
          setStreamingBeats((prev) => [...prev, beat]);
          scrollToBottom(true);
        }
      );

      const storyBeats = extractValidStoryBeats(data.beats, story.characters);
      if (storyBeats.length === 0) {
        throw new Error('Characters are taking a moment to respond. Please tap Retry.');
      }

      const deltaMap = new Map<string, number>();
      (data.meterChanges || []).forEach((mc) => {
        const clamped = Math.max(-15, Math.min(15, Math.round(mc.delta || 0)));
        deltaMap.set(mc.id, clamped);
      });

      const updatedMeters = meters.map((m) => {
        const delta = deltaMap.get(m.id) || 0;
        const nextVal = Math.max(m.min, Math.min(m.max, m.value + delta));
        return { ...m, value: nextVal };
      });

      const nextSceneStr = (data.newScene || currentScene).slice(0, 500);
      const nextSceneIdx = sceneIndex + 1;

      const memoryToSave =
        data.newMemory?.shouldSave && data.newMemory.summary
          ? {
              summary: data.newMemory.summary,
              importance: data.newMemory.importance || 6,
              charactersInvolved: data.newMemory.charactersInvolved || [],
            }
          : null;

      const finalStoryMsg: ChatTurnMessage = {
        id: storyMsgId,
        uid: user.uid,
        conversationId: story.id,
        role: 'story',
        sceneSummary: nextSceneStr,
        beats: storyBeats.slice(0, 12),
        metersSnapshot: updatedMeters.map((m) => ({
          id: m.id,
          label: m.label,
          emoji: m.emoji,
          value: m.value,
        })),
        sequence: nextSeq,
        localTimestamp: now,
      };

      setStreamingBeats([]);
      setMessages((prev) => [...prev, finalStoryMsg]);
      setMeters(updatedMeters);
      setCurrentScene(nextSceneStr);
      setSceneIndex(nextSceneIdx);
      setActiveChoices(Array.isArray(data.storyChoices) ? data.storyChoices.slice(0, 3) : []);

      if (endingReached) {
        setEndingReached('');
      }

      const newMemRecord: StoryMemoryRecord | undefined = memoryToSave
        ? {
            id: `local_${now}`,
            uid: user.uid,
            storyId: story.id,
            summary: memoryToSave.summary,
            importance: memoryToSave.importance,
            charactersInvolved: memoryToSave.charactersInvolved,
          }
        : undefined;

      if (newMemRecord) {
        setMemories((prev) => [...prev, newMemRecord]);
      }

      const lastBeat = storyBeats[storyBeats.length - 1];
      onLocalTurnSync?.({
        story,
        lastMessage: (lastBeat?.text || nextSceneStr).slice(0, 1000),
        lastSpeaker: lastBeat?.speakerName || story.characters[0]?.name || 'Story',
        messageCount: baseMessages.length + 1,
        currentScene: nextSceneStr,
        sceneIndex: nextSceneIdx,
        meters: updatedMeters,
        endingReached: data.endingTriggered?.trim() || undefined,
        newMemory: newMemRecord,
      });

      setTimeout(() => scrollToBottom(true), 30);

      enqueueCloudWrite(async () => {
        await saveStoryContinueToCloud({
          uid: user.uid,
          story,
          storyBeats,
          storySequence: nextSeq,
          storyMessageId: storyMsgId,
          totalMessageCount: baseMessages.length + 1,
          newScene: nextSceneStr,
          sceneIndex: nextSceneIdx,
          updatedMeters,
          endingTriggered: data.endingTriggered?.trim() || undefined,
          newMemory: memoryToSave,
        });
      });
    } catch (err) {
      if ((err as { name?: string })?.name !== 'AbortError') {
        setRetryAction({ type: 'continue' });
        setErrorBanner(
          formatReadableError(err, 'Unable to advance story right now.')
        );
      }
    } finally {
      if (mountedRef.current) {
        setStreamingBeats([]);
        setSending(false);
      }
      inFlightRef.current = false;
    }
  };

  // Regenerate the latest AI story response (...)
  const handleRegenerateLatest = async () => {
    if (inFlightRef.current || loadingInit || messages.length === 0) return;
    setMsgMenuOpen(false);
    setErrorBanner(null);
    setRetryAction(null);

    const baseMessages = [...messages];
    const lastStoryIdx = baseMessages.reduce((acc, m, i) => (m.role === 'story' ? i : acc), -1);
    if (lastStoryIdx < 0) return;

    inFlightRef.current = true;
    suggestionsAbortRef.current?.abort();

    const targetStoryMsg = baseMessages[lastStoryIdx];
    const priorMessages = baseMessages.slice(0, lastStoryIdx);
    const prevUserMsg =
      priorMessages.length > 0 && priorMessages[priorMessages.length - 1].role === 'user'
        ? priorMessages[priorMessages.length - 1].userText
        : '';

    let baseMeters = meters;
    if (priorMessages.length > 0) {
      const prevStory = [...priorMessages].reverse().find((m) => m.role === 'story');
      if (prevStory?.metersSnapshot && prevStory.metersSnapshot.length > 0) {
        baseMeters = meters.map((m) => {
          const snap = prevStory.metersSnapshot?.find((s) => s.id === m.id);
          return snap ? { ...m, value: snap.value } : m;
        });
      }
    } else {
      baseMeters = story.relationshipMeters.map((m) => ({ ...m, value: m.initialValue }));
    }

    setSending(true);
    setStreamingBeats([]);
    setTimeout(() => scrollToBottom(true), 25);

    const now = Date.now();
    const newMsgId = `msg_${targetStoryMsg.sequence}_${now}`;

    try {
      const idToken = await user.getIdToken();
      const data = await requestStoryTurnStream(
        idToken,
        {
          story: {
            id: story.id,
            title: story.title,
            tagline: story.tagline,
            about: story.about,
            setting: story.setting,
            tags: story.tags,
            characters: story.characters,
            possibleEndings: story.possibleEndings,
          },
          mode: 'regenerate',
          language: preferredLanguage,
          currentScene,
          sceneIndex: Math.max(0, sceneIndex - 1),
          recentMessages: priorMessages
            .filter((m) => !isPlaceholderStoryMessage(m))
            .slice(-7)
            .map((m) => ({
              role: m.role,
              userText: m.userText,
              beats: m.beats,
            })),
          memories: memories.slice(-5).map((m) => ({ summary: m.summary, importance: m.importance })),
          relationshipMeters: baseMeters,
          userMessage: prevUserMsg || undefined,
        },
        (beat) => {
          setStreamingBeats((prev) => [...prev, beat]);
          scrollToBottom(true);
        }
      );

      const storyBeats = extractValidStoryBeats(data.beats, story.characters);
      if (storyBeats.length === 0) {
        throw new Error('Characters are taking a moment to respond. Please tap Retry.');
      }

      const deltaMap = new Map<string, number>();
      (data.meterChanges || []).forEach((mc) => {
        const clamped = Math.max(-15, Math.min(15, Math.round(mc.delta || 0)));
        deltaMap.set(mc.id, clamped);
      });

      const updatedMeters = baseMeters.map((m) => {
        const delta = deltaMap.get(m.id) || 0;
        const nextVal = Math.max(m.min, Math.min(m.max, m.value + delta));
        return { ...m, value: nextVal };
      });

      const nextSceneStr = (data.newScene || currentScene).slice(0, 500);
      const replacedMsg: ChatTurnMessage = {
        id: newMsgId,
        uid: user.uid,
        conversationId: story.id,
        role: 'story',
        sceneSummary: nextSceneStr,
        beats: storyBeats.slice(0, 12),
        metersSnapshot: updatedMeters.map((m) => ({
          id: m.id,
          label: m.label,
          emoji: m.emoji,
          value: m.value,
        })),
        sequence: targetStoryMsg.sequence,
        localTimestamp: now,
      };

      setStreamingBeats([]);
      setMessages((prev) =>
        prev.map((m) => (m.id === targetStoryMsg.id ? replacedMsg : m))
      );
      setMeters(updatedMeters);
      setCurrentScene(nextSceneStr);
      if (Array.isArray(data.storyChoices)) {
        setActiveChoices(data.storyChoices.slice(0, 3));
      }
      if (endingReached) {
        setEndingReached('');
      }

      const lastBeat = storyBeats[storyBeats.length - 1];
      onLocalTurnSync?.({
        story,
        lastMessage: (lastBeat?.text || nextSceneStr).slice(0, 1000),
        lastSpeaker: lastBeat?.speakerName || story.characters[0]?.name || 'Story',
        messageCount: baseMessages.length,
        currentScene: nextSceneStr,
        sceneIndex,
        meters: updatedMeters,
        endingReached: data.endingTriggered?.trim() || undefined,
      });

      setTimeout(() => scrollToBottom(true), 30);

      enqueueCloudWrite(async () => {
        await replaceLatestStoryMessageInCloud({
          uid: user.uid,
          story,
          oldMessageId: targetStoryMsg.id,
          storyMessageId: newMsgId,
          storySequence: targetStoryMsg.sequence,
          totalMessageCount: baseMessages.length,
          storyBeats,
          newScene: nextSceneStr,
          sceneIndex,
          updatedMeters,
          endingTriggered: data.endingTriggered?.trim() || undefined,
        });
      });
    } catch (err) {
      if ((err as { name?: string })?.name !== 'AbortError') {
        setRetryAction({ type: 'regenerate' });
        setErrorBanner(
          formatReadableError(err, 'Unable to regenerate response right now.')
        );
      }
    } finally {
      if (mountedRef.current) {
        setStreamingBeats([]);
        setSending(false);
      }
      inFlightRef.current = false;
    }
  };

  // Undo / rewind last turn (...)
  const handleUndoLastTurn = async () => {
    if (inFlightRef.current || loadingInit || messages.length <= 1) return;
    inFlightRef.current = true;
    setMsgMenuOpen(false);
    setErrorBanner(null);

    const snapshotMessages = [...messages];
    const lastMsg = snapshotMessages[snapshotMessages.length - 1];
    const deleteIds: string[] = [lastMsg.id];
    let sliceEnd = snapshotMessages.length - 1;

    if (
      lastMsg.role === 'story' &&
      sliceEnd > 1 &&
      snapshotMessages[sliceEnd - 1]?.role === 'user'
    ) {
      deleteIds.push(snapshotMessages[sliceEnd - 1].id);
      sliceEnd -= 1;
    }

    const remaining = snapshotMessages.slice(0, sliceEnd);
    if (remaining.length === 0) {
      inFlightRef.current = false;
      return;
    }

    const prevLast = remaining[remaining.length - 1];
    const prevStory = [...remaining].reverse().find((m) => m.role === 'story');
    const restoredScene = prevStory?.sceneSummary || story.openingScene;
    const restoredSceneIdx = Math.max(0, sceneIndex - 1);
    const restoredMeters =
      prevStory?.metersSnapshot && prevStory.metersSnapshot.length > 0
        ? meters.map((m) => {
            const snap = prevStory.metersSnapshot?.find((s) => s.id === m.id);
            return snap ? { ...m, value: snap.value } : m;
          })
        : story.relationshipMeters.map((m) => ({ ...m, value: m.initialValue }));

    // Instant UI rewind
    setMessages(remaining);
    setCurrentScene(restoredScene);
    setSceneIndex(restoredSceneIdx);
    setMeters(restoredMeters);
    setEndingReached('');
    if (remaining.length === 1) {
      setActiveChoices(story.initialChoices[preferredLanguage] || story.initialChoices.hinglish);
    }

    const lastBeat = prevLast.beats?.[prevLast.beats.length - 1];
    onLocalTurnSync?.({
      story,
      lastMessage: (prevLast.userText || lastBeat?.text || restoredScene).slice(0, 1000),
      lastSpeaker:
        prevLast.role === 'user'
          ? 'You'
          : lastBeat?.speakerName || story.characters[0]?.name || 'Story',
      messageCount: remaining.length,
      currentScene: restoredScene,
      sceneIndex: restoredSceneIdx,
      meters: restoredMeters,
    });

    inFlightRef.current = false;

    enqueueCloudWrite(async () => {
      await rewindLastTurnInCloud({
        uid: user.uid,
        story,
        deleteMessageIds: deleteIds,
        remainingLastMessage: prevLast,
        remainingCount: remaining.length,
        restoredScene,
        restoredSceneIndex: restoredSceneIdx,
        restoredMeters,
      });
    });
  };

  // Copy latest story message text cleanly (...)
  const handleCopyLatest = async (msg: ChatTurnMessage) => {
    setMsgMenuOpen(false);
    const formatted = groupBeatsIntoCharacterCards(msg.beats || [], story.characters)
      .flat()
      .map((b) => {
        if (b.type === 'narration') return `*${b.text}*`;
        const speaker = b.speakerName || story.characters[0]?.name || 'Character';
        return `${speaker}: "${cleanDialogueBeatText(b.text, speaker, story.characters)}"`;
      })
      .join('\n\n');
    try {
      if (navigator.clipboard && formatted) {
        await navigator.clipboard.writeText(formatted);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 1800);
      }
    } catch {
      // ignore clipboard restrictions
    }
  };

  const handleLightbulbClick = async () => {
    if (suggestionsOpen) {
      suggestionsAbortRef.current?.abort();
      setSuggestionsOpen(false);
      return;
    }

    const lastMsgId = messages[messages.length - 1]?.id || 'init';
    const cacheKey = `${story.id}:${preferredLanguage}:${sceneIndex}:${lastMsgId}`;
    const cached = suggestionsCacheRef.current.get(cacheKey);
    if (cached && cached.length > 0) {
      setSuggestions(cached);
      setSuggestionsLoading(false);
      setSuggestionsOpen(true);
      return;
    }

    suggestionsAbortRef.current?.abort();
    const controller = new AbortController();
    suggestionsAbortRef.current = controller;

    setSuggestionsOpen(true);
    setSuggestionsLoading(true);
    setErrorBanner(null);

    try {
      const idToken = await user.getIdToken();
      const resp = await fetch('/api/story/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          story: { id: story.id, title: story.title },
          language: preferredLanguage,
          currentScene,
          relationshipMeters: meters,
          recentMessages: messages
            .filter((m) => !isPlaceholderStoryMessage(m))
            .slice(-4)
            .map((m) => ({
              role: m.role,
              userText: m.userText,
              beats: m.beats,
            })),
        }),
        signal: controller.signal,
      });
      const data = (await resp.json()) as { suggestions?: string[]; error?: string };
      if (!resp.ok) {
        throw new Error(data.error || 'Could not generate suggestions.');
      }
      const list = Array.isArray(data.suggestions) ? data.suggestions : [];
      if (list.length > 0) {
        if (suggestionsCacheRef.current.size > 40) {
          suggestionsCacheRef.current.clear();
        }
        suggestionsCacheRef.current.set(cacheKey, list);
      }
      setSuggestions(list);
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      setSuggestionsOpen(false);
      setErrorBanner(formatReadableError(err, 'Unable to fetch AI reply ideas.'));
    } finally {
      if (mountedRef.current && suggestionsAbortRef.current === controller) {
        setSuggestionsLoading(false);
      }
    }
  };

  const handleSelectSuggestion = (text: string) => {
    // Strictly insert into composer for editing; user must manually press Send
    setInput(text);
    setSuggestionsOpen(false);
    setTimeout(() => inputRef.current?.focus(), 40);
  };

  const handleToggleMic = async () => {
    setMicStatusMessage(null);
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setMicStatusMessage(
        'Voice-to-text is not supported in this browser. Please use Chrome on Android/Desktop or type your reply.'
      );
      return;
    }

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch {
      setMicStatusMessage(
        'Microphone permission was denied. Please allow microphone access in your browser settings.'
      );
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = preferredLanguage === 'english' ? 'en-IN' : 'hi-IN';
      recognition.interimResults = true;
      recognition.continuous = false;
      const baseInput = input.trim();

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        const merged = baseInput ? `${baseInput} ${transcript.trim()}` : transcript.trim();
        setInput(merged);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicStatusMessage('Microphone access denied. Enable mic permission to use voice input.');
        } else if (event.error !== 'aborted') {
          setMicStatusMessage(`Voice recognition stopped (${event.error || 'unavailable'}).`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
      setMicStatusMessage('Unable to start microphone speech recognition.');
    }
  };

  const handleConfirmRestart = async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setRestartConfirmOpen(false);
    setLoadingInit(true);
    setErrorBanner(null);
    suggestionsCacheRef.current.clear();
    try {
      await cloudWriteQueueRef.current;
      const fresh = await restartStoryInCloud(user.uid, story, preferredLanguage);
      setMessages([fresh.initialMessage]);
      setMeters(fresh.meters);
      setCurrentScene(fresh.progress.currentScene);
      setSceneIndex(0);
      setChoicesMade([]);
      setEndingReached('');
      setMemories([]);
      setActiveChoices(story.initialChoices[preferredLanguage] || story.initialChoices.hinglish);
      await onDataUpdated();
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        scrollToSlide(initialSlideIndex, true);
      }, 40);
    } catch (err) {
      setErrorBanner(formatReadableError(err, 'Unable to restart story.'));
    } finally {
      setLoadingInit(false);
      inFlightRef.current = false;
    }
  };

  return (
    <div className="h-dvh bg-[#09090C] text-white flex flex-col overflow-hidden relative">
      {/* Top Floating Kavana-style Story Header */}
      <header className="sticky top-0 z-30 px-3 pt-2.5 pb-2 pt-safe bg-gradient-to-b from-[#09090C] via-[#09090C]/95 to-transparent">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="min-w-[44px] min-h-[44px] rounded-full bg-[#1C1C22] border border-white/10 flex items-center justify-center text-white hover:bg-[#26262E] transition shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onOpenStoryInfo(story)}
            className="flex-1 min-w-0 flex items-center gap-2.5 px-2.5 py-1.5 rounded-full bg-[#19191F]/95 border border-white/10 hover:border-white/20 transition text-left"
          >
            <StoryImage
              src={story.coverImage}
              alt={story.title}
              className="w-9 h-9 rounded-full object-cover object-top shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-bold text-white truncate">
                {story.title}
              </div>
              <div className="text-[11px] text-zinc-400 truncate">
                Roleplay · {story.primaryCategory} · {LANGUAGE_LABELS[preferredLanguage]}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setContextDrawerOpen(true)}
            aria-label="Characters, relationships and story memories"
            className="min-w-[44px] min-h-[44px] rounded-full bg-[#1C1C22] border border-white/10 flex items-center justify-center text-white hover:bg-[#26262E] transition shrink-0"
          >
            <Users className="w-4 h-4" />
          </button>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((p) => !p)}
              aria-label="Story menu"
              className="min-w-[44px] min-h-[44px] rounded-full bg-[#1C1C22] border border-white/10 flex items-center justify-center text-white hover:bg-[#26262E] transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#191920] border border-white/10 shadow-2xl p-1.5 z-40 space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Language
                  </div>
                  {(['hinglish', 'hindi', 'english'] as LanguageCode[]).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        onChangeLanguage(lang);
                        setMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                        preferredLanguage === lang
                          ? 'bg-[#E5233D]/20 text-white'
                          : 'text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{LANGUAGE_LABELS[lang]}</span>
                      {preferredLanguage === lang && <span className="text-[#E5233D]">Active</span>}
                    </button>
                  ))}
                  <div className="border-t border-white/10 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenStoryInfo(story);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-zinc-200 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Info className="w-3.5 h-3.5" /> Story Details & Media
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setRestartConfirmOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restart Story
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Scrollable Chat Feed */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto touch-scroll px-3.5 sm:px-4 pt-2 pb-4"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Swipeable Scene & Character Showcase Carousel */}
          <div className="-mx-3.5 sm:-mx-4 pt-1 pb-1">
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="flex items-center gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory px-[calc(50%-122px)] sm:px-[calc(50%-136px)] py-1.5"
            >
              {showcaseSlides.map((slide, idx) => {
                const isActive = idx === activeSlide;
                return (
                  <button
                    key={slide.id}
                    ref={(el) => {
                      slideRefs.current[idx] = el;
                    }}
                    type="button"
                    onClick={() => {
                      if (isActive) {
                        setGalleryIndex(idx);
                      } else {
                        scrollToSlide(idx, true);
                      }
                    }}
                    aria-label={slide.caption}
                    className={`w-[244px] sm:w-[272px] aspect-[3/4] shrink-0 snap-center rounded-[24px] overflow-hidden relative bg-[#15151A] transition-all duration-300 ease-out focus:outline-none ${
                      isActive
                        ? 'scale-100 opacity-100 shadow-[0_18px_45px_rgba(0,0,0,0.65)] ring-1 ring-white/15'
                        : 'scale-[0.91] opacity-55 hover:opacity-80'
                    }`}
                  >
                    <StoryImage
                      src={slide.url}
                      alt={slide.caption}
                      fallbackTitle={story.title}
                      loading={idx <= 2 ? 'eager' : 'lazy'}
                      className="w-full h-full object-cover object-top"
                    />
                  </button>
                );
              })}
            </div>

            {/* Centered Story Hook Caption beneath active card */}
            <div className="px-5 pt-2.5 pb-1 text-center space-y-2.5">
              <p className="text-[16px] sm:text-[18px] font-bold text-white leading-snug tracking-tight max-w-[360px] sm:max-w-[440px] mx-auto">
                {showcaseSlides[activeSlide]?.caption || story.tagline}
              </p>

              {showcaseSlides.length > 1 && (
                <div className="flex items-center justify-center gap-1.5">
                  {showcaseSlides.map((slide, idx) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => scrollToSlide(idx, true)}
                      aria-label={`View slide ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-200 ${
                        idx === activeSlide
                          ? 'w-5 bg-white'
                          : 'w-1.5 bg-white/25 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Scene Context Strip */}
          <div className="text-center pt-0.5 pb-1">
            <span className="text-[11px] font-medium text-zinc-500">
              {currentScene}
            </span>
          </div>

          {loadingInit ? (
            <div className="space-y-3 py-6">
              <div className="h-28 rounded-2xl bg-[#18181D] animate-pulse" />
              <div className="h-12 w-2/3 ml-auto rounded-2xl bg-[#18181D] animate-pulse" />
            </div>
          ) : (
            <ChatMessageList
              messages={messages}
              meters={meters}
              story={story}
              characterPortraitMap={characterPortraitMap}
              sending={sending}
              endingReached={endingReached}
              msgMenuOpen={msgMenuOpen}
              playGuideVisible={playGuideVisible}
              copiedToast={copiedToast}
              onToggleMsgMenu={() => setMsgMenuOpen((prev) => !prev)}
              onCloseMsgMenu={() => setMsgMenuOpen(false)}
              onContinueScene={() => void handleContinueScene()}
              onRegenerateLatest={() => void handleRegenerateLatest()}
              onUndoLastTurn={() => void handleUndoLastTurn()}
              onCopyLatest={(m) => void handleCopyLatest(m)}
              onTogglePlayGuide={() => {
                setPlayGuideVisible((p) => !p);
                setMsgMenuOpen(false);
              }}
            />
          )}

          {/* Ending Reached Banner */}
          {endingReached && (
            <div className="rounded-2xl bg-gradient-to-r from-[#231217] to-[#17171D] border border-[#E5233D]/40 p-4 text-center space-y-2.5">
              <div className="text-xs font-semibold text-[#F43F5E]">Story Ending Reached</div>
              <div className="font-display text-base font-bold text-white">{endingReached}</div>
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEndingReached('');
                    const lastMsg = messages[messages.length - 1];
                    const lastBeat = lastMsg?.beats?.[lastMsg.beats.length - 1];
                    onLocalTurnSync?.({
                      story,
                      lastMessage: (lastMsg?.userText || lastBeat?.text || currentScene).slice(0, 1000),
                      lastSpeaker:
                        lastMsg?.role === 'user'
                          ? 'You'
                          : lastBeat?.speakerName || story.characters[0]?.name || 'Story',
                      messageCount: messages.length,
                      currentScene,
                      sceneIndex,
                      meters,
                      endingReached: undefined,
                    });
                    enqueueCloudWrite(async () => {
                      await resumeStoryEndingInCloud(user.uid, story.id);
                    });
                  }}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition"
                >
                  Continue Story
                </button>
                <button
                  type="button"
                  onClick={() => setRestartConfirmOpen(true)}
                  className="px-4 py-2 rounded-full bg-[#E5233D] hover:bg-[#cc1e35] text-xs font-semibold text-white transition"
                >
                  Play Another Path
                </button>
              </div>
            </div>
          )}

          {/* Live Streaming Story Bubble or Snappy Typing Indicator */}
          {sending && streamingBeats.length > 0 ? (
            <div className="flex flex-col items-start space-y-2.5">
              {groupBeatsIntoCharacterCards(streamingBeats, story.characters).map(
                (cardBeats, cardIdx, allCards) => (
                  <div
                    key={`stream_card_${cardIdx}`}
                    className="w-full max-w-[92%] sm:max-w-[85%] rounded-2xl rounded-bl-sm bg-[#1C1D22] border border-white/[0.08] px-4 py-3.5 space-y-3 shadow-lg"
                  >
                    <div className="space-y-3">
                      {cardBeats.map((beat, bIdx) => {
                        if (beat.type === 'narration') {
                          return (
                            <p
                              key={bIdx}
                              className="text-[14.5px] italic text-[#A1A3AD] leading-relaxed"
                            >
                              *{beat.text}*
                            </p>
                          );
                        }
                        const speaker =
                          beat.speakerName || story.characters[0]?.name || 'Character';
                        const cleanSpeech = cleanDialogueBeatText(
                          beat.text,
                          speaker,
                          story.characters
                        );
                        const portrait =
                          characterPortraitMap.get(speaker.toLowerCase()) ||
                          characterPortraitMap.get(speaker.split(' ')[0]?.toLowerCase() || '');
                        return (
                          <div key={bIdx} className="flex items-start gap-2.5">
                            {portrait && (
                              <StoryImage
                                src={portrait}
                                alt={speaker}
                                className="w-6 h-6 rounded-full object-cover object-top mt-0.5 shrink-0 ring-1 ring-white/15"
                              />
                            )}
                            <p className="text-[15px] text-white leading-relaxed">
                              <span className="font-semibold text-zinc-100">{speaker}: </span>
                              <span className="text-zinc-100">"{cleanSpeech}"</span>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    {cardIdx === allCards.length - 1 && (
                      <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E5233D] animate-pulse" />
                        <span>Scene unfolding...</span>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          ) : sending ? (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-[#1C1D22] border border-white/[0.06] px-4 py-3 flex items-center gap-2 text-xs text-zinc-400">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5233D] animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5233D] animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5233D] animate-bounce [animation-delay:300ms]" />
                </span>
                <span>Characters are reacting...</span>
              </div>
            </div>
          ) : null}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll-to-bottom button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          aria-label="Scroll to latest message"
          className="fixed right-4 bottom-24 z-20 w-10 h-10 rounded-full bg-[#24252B] border border-white/15 shadow-xl flex items-center justify-center text-white hover:bg-[#32333B] transition"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Bottom Interactive Region with Crimson Ambient Glow */}
      <div className="relative z-20 bg-gradient-to-t from-[#09090C] via-[#1A090E]/95 to-transparent pt-3 pb-3 pb-safe px-3">
        <div className="max-w-3xl mx-auto space-y-2.5">
          {errorBanner && (
            <div className="rounded-xl bg-red-500/15 border border-red-500/30 px-3.5 py-2.5 text-xs text-red-200 flex items-center justify-between gap-2.5">
              <span className="flex-1 leading-snug">{errorBanner}</span>
              {retryAction && !sending && (
                <button
                  type="button"
                  onClick={() => {
                    const pending = retryAction;
                    setRetryAction(null);
                    setErrorBanner(null);
                    if (pending.type === 'send') {
                      void handleSend(pending.text, pending.isChoice);
                    } else if (pending.type === 'continue') {
                      void handleContinueScene();
                    } else if (pending.type === 'regenerate') {
                      void handleRegenerateLatest();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#E5233D] hover:bg-[#cc1e35] text-white font-semibold flex items-center gap-1 shrink-0 transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              )}
              <button
                type="button"
                aria-label="Dismiss error"
                onClick={() => {
                  setErrorBanner(null);
                  setRetryAction(null);
                }}
                className="p-0.5 text-red-200/80 hover:text-white shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {micStatusMessage && (
            <div className="rounded-xl bg-amber-500/15 border border-amber-500/30 px-3.5 py-2 text-xs text-amber-200 flex items-center justify-between gap-2">
              <span>{micStatusMessage}</span>
              <button type="button" onClick={() => setMicStatusMessage(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Kavana-style Play Guide Dashed Amber Card */}
          {playGuideVisible && !endingReached && (
            <div
              onClick={() => {
                if (activeChoices.length > 0) {
                  setPlayGuideChoicesOpen((prev) => !prev);
                }
              }}
              className={`rounded-2xl bg-[#0C0C10]/95 border-[1.5px] border-dashed border-[#853F18] px-4 py-3 shadow-lg transition-colors ${
                activeChoices.length > 0 ? 'cursor-pointer hover:border-[#B85923]' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[#EA8C44]">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span className="text-[13.5px] font-bold tracking-tight">Play Guide</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlayGuideVisible(false);
                  }}
                  aria-label="Hide Play Guide"
                  className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded-md transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[15px] sm:text-[15.5px] font-medium text-white leading-snug mt-1.5">
                {story.playGuide?.[preferredLanguage] ||
                  story.playGuide?.hinglish ||
                  story.tagline}
              </p>

              {playGuideChoicesOpen && activeChoices.length > 0 && !sending && (
                <div
                  className="mt-2.5 pt-2.5 border-t border-white/[0.08] flex gap-2 overflow-x-auto no-scrollbar pb-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {activeChoices.map((choice, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPlayGuideChoicesOpen(false);
                        void handleSend(choice, true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#1F1519] hover:bg-[#2E1A22] border border-[#E5233D]/35 text-xs font-medium text-zinc-100 whitespace-nowrap shrink-0 transition"
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Optional Story Choices when Play Guide is hidden */}
          {!playGuideVisible && activeChoices.length > 0 && !sending && !endingReached && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
              {activeChoices.map((choice, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => void handleSend(choice, true)}
                  className="px-3.5 py-2 rounded-xl bg-[#1F1519] hover:bg-[#2E1A22] border border-[#E5233D]/35 text-xs font-medium text-zinc-100 whitespace-nowrap shrink-0 transition"
                >
                  {choice}
                </button>
              ))}
            </div>
          )}

          {/* AI Suggested Replies Panel (Lightbulb) */}
          {enableAiSuggestions && suggestionsOpen && (
            <div className="rounded-2xl bg-[#16171D] border border-white/10 p-3 space-y-2 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F43F5E]" />
                  Suggested Replies (tap to edit before sending)
                </span>
                <button
                  type="button"
                  onClick={() => setSuggestionsOpen(false)}
                  className="text-zinc-400 hover:text-white p-1"
                  aria-label="Close suggestions"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {suggestionsLoading ? (
                <div className="grid grid-cols-1 gap-1.5 py-0.5">
                  <div className="h-9 rounded-xl bg-white/[0.05] animate-pulse" />
                  <div className="h-9 rounded-xl bg-white/[0.05] animate-pulse" />
                  <div className="h-9 w-5/6 rounded-xl bg-white/[0.05] animate-pulse" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1.5">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="text-left px-3 py-2.5 rounded-xl bg-[#1E1F27] hover:bg-[#282934] border border-white/[0.06] text-xs text-zinc-100 transition"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Message Composer Row */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 flex items-end rounded-full bg-[#1C1D22] border border-white/10 focus-within:border-[#E5233D]/60 pl-4 pr-1.5 py-1.5 shadow-lg">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                rows={1}
                placeholder={isListening ? 'Listening... speak now' : 'Type your message'}
                className="flex-1 bg-transparent text-[15px] text-white placeholder:text-zinc-500 resize-none max-h-28 py-2 focus:outline-none"
              />
              {enableAiSuggestions && (
                <button
                  type="button"
                  onClick={handleLightbulbClick}
                  aria-label="AI suggested replies"
                  title="AI suggested replies"
                  className={`min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center transition ${
                    suggestionsOpen
                      ? 'bg-[#E5233D]/20 text-[#F43F5E]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Lightbulb className="w-5 h-5" />
                </button>
              )}
            </div>

            {input.trim().length > 0 || !enableVoiceInput ? (
              <button
                type="submit"
                disabled={sending || input.trim().length === 0}
                aria-label="Send message"
                className="min-w-[48px] min-h-[48px] rounded-full bg-[#E5233D] hover:bg-[#cc1e35] disabled:opacity-40 flex items-center justify-center text-white shadow-lg shadow-[#E5233D]/30 transition shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleToggleMic}
                aria-label={isListening ? 'Stop voice input' : 'Voice input'}
                title={isListening ? 'Stop voice input' : 'Speak message'}
                className={`min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center transition shrink-0 border ${
                  isListening
                    ? 'bg-[#E5233D] border-[#E5233D] text-white animate-pulse'
                    : 'bg-[#1C1D22] border-white/10 text-zinc-300 hover:text-white hover:bg-[#25262E]'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Story Context Drawer (Characters, Relationships, Saved Memories) */}
      {contextDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#121217] border-l border-white/10 h-full overflow-y-auto p-5 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Story State & Memory</h2>
              <button
                type="button"
                onClick={() => setContextDrawerOpen(false)}
                className="min-w-[40px] min-h-[40px] rounded-full bg-white/5 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold text-zinc-400">Relationship Meters</h3>
              {meters.map((m) => (
                <div key={m.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>
                      {m.emoji} {m.label}
                    </span>
                    <span className="tabular-nums text-zinc-300">
                      {m.value} / {m.max}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#E5233D] transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, (m.value / m.max) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-[#E5233D]" /> Active Story Memories ({memories.length})
              </h3>
              {memories.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  Important choices, confessions, and turning points will be remembered here automatically.
                </p>
              ) : (
                <div className="space-y-2">
                  {memories.map((mem) => (
                    <div
                      key={mem.id}
                      className="rounded-xl bg-[#1A1A22] border border-white/[0.06] p-3 text-xs text-zinc-200"
                    >
                      {mem.summary}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold text-zinc-400">Cast</h3>
              {story.characters.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl bg-[#1A1A22] p-2.5 border border-white/[0.05]"
                >
                  <StoryImage
                    src={c.portrait}
                    alt={c.name}
                    className="w-12 h-12 rounded-xl object-cover object-top shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{c.name}</div>
                    <div className="text-xs text-[#F43F5E] truncate">{c.role}</div>
                    <div className="text-[11px] text-zinc-400 line-clamp-1">{c.relationshipToUser}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Restart Story Confirmation Modal */}
      {restartConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#16161C] border border-white/10 p-6 space-y-4">
            <h3 className="font-display text-lg font-bold">Restart "{story.title}"?</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This will clear your current messages, relationship progress, and memories for this story so you can play a fresh path.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setRestartConfirmOpen(false)}
                className="flex-1 min-h-[44px] rounded-xl bg-white/10 text-xs font-semibold text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestart}
                className="flex-1 min-h-[44px] rounded-xl bg-[#E5233D] text-xs font-semibold text-white"
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      )}

      <FullscreenGalleryModal
        items={showcaseSlides}
        activeIndex={galleryIndex}
        onClose={() => setGalleryIndex(null)}
        onChangeIndex={(idx) => setGalleryIndex(idx)}
      />
    </div>
  );
};
