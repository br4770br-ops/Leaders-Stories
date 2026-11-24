import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  ArrowDown,
  ArrowLeft,
  Brain,
  CheckCheck,
  Globe,
  Info,
  Lightbulb,
  Mic,
  MicOff,
  MoreVertical,
  RotateCcw,
  Send,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import {
  initializeStorySessionInCloud,
  loadConversationMessages,
  restartStoryInCloud,
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

interface StoryChatScreenProps {
  story: StoryDefinition;
  user: User;
  preferredLanguage: LanguageCode;
  existingProgress?: StoryProgressRecord;
  existingMeters?: RelationshipMeterValue[];
  existingMemories?: StoryMemoryRecord[];
  onBack: () => void;
  onOpenStoryInfo: (story: StoryDefinition) => void;
  onChangeLanguage: (lang: LanguageCode) => void;
  onDataUpdated: () => Promise<void>;
}

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  hinglish: 'Hinglish',
  hindi: 'Hindi (हिंदी)',
  english: 'English',
};

export const StoryChatScreen: React.FC<StoryChatScreenProps> = ({
  story,
  user,
  preferredLanguage,
  existingProgress,
  existingMeters,
  existingMemories = [],
  onBack,
  onOpenStoryInfo,
  onChangeLanguage,
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
  const [endingReached, setEndingReached] = useState<string>(existingProgress?.endingReached || '');
  const [activeChoices, setActiveChoices] = useState<string[]>(
    !existingProgress ? story.initialChoices[preferredLanguage] || story.initialChoices.hinglish : []
  );

  const [input, setInput] = useState('');
  const [loadingInit, setLoadingInit] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Lightbulb AI Suggested Replies
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Microphone speech-to-text
  const [isListening, setIsListening] = useState(false);
  const [micStatusMessage, setMicStatusMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Drawers & menus
  const [menuOpen, setMenuOpen] = useState(false);
  const [contextDrawerOpen, setContextDrawerOpen] = useState(false);
  const [restartConfirmOpen, setRestartConfirmOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    let active = true;
    async function bootSession() {
      setLoadingInit(true);
      setErrorBanner(null);
      try {
        const loaded = await loadConversationMessages(user.uid, story.id, 100);
        if (!active) return;

        if (loaded.length > 0) {
          setMessages(loaded);
          if (existingMeters && existingMeters.length > 0) {
            setMeters(existingMeters);
          }
        } else {
          const initialized = await initializeStorySessionInCloud(
            user.uid,
            story,
            preferredLanguage
          );
          if (!active) return;
          setMessages([initialized.initialMessage]);
          setMeters(initialized.meters);
          setCurrentScene(initialized.progress.currentScene);
          setSceneIndex(0);
          setActiveChoices(story.initialChoices[preferredLanguage] || story.initialChoices.hinglish);
          void onDataUpdated();
        }
      } catch (err) {
        if (!active) return;
        setErrorBanner(err instanceof Error ? err.message : 'Unable to load story conversation.');
      } finally {
        if (active) {
          setLoadingInit(false);
          setTimeout(() => scrollToBottom(false), 60);
        }
      }
    }
    void bootSession();
    return () => {
      active = false;
      recognitionRef.current?.stop();
    };
  }, [story.id, user.uid]);

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

  const handleSend = async (overrideText?: string, isChoiceSelection = false) => {
    const textToSend = (overrideText ?? input).trim();
    if (!textToSend || sending || loadingInit) return;

    setErrorBanner(null);
    setSuggestionsOpen(false);
    setSending(true);

    if (!overrideText) {
      setInput('');
    }

    const nextUserSeq = messages.length > 0 ? messages[messages.length - 1].sequence + 1 : 1;
    const optimisticUserMsg: ChatTurnMessage = {
      id: `temp_user_${Date.now()}`,
      uid: user.uid,
      conversationId: story.id,
      role: 'user',
      userText: textToSend,
      sequence: nextUserSeq,
      localTimestamp: Date.now(),
    };

    const nextHistory = [...messages, optimisticUserMsg];
    setMessages(nextHistory);
    setTimeout(() => scrollToBottom(true), 40);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/story/turn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
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
          recentMessages: messages.slice(-10).map((m) => ({
            role: m.role,
            userText: m.userText,
            beats: m.beats,
          })),
          memories: memories.slice(-6).map((m) => ({ summary: m.summary, importance: m.importance })),
          relationshipMeters: meters,
          userMessage: textToSend,
        }),
      });

      const data = (await response.json()) as {
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
      };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate next story scene.');
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

      const storyBeats: StoryBeat[] =
        Array.isArray(data.beats) && data.beats.length > 0
          ? data.beats
          : [{ type: 'narration', text: '...' }];

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

      const saved = await saveTurnToCloud({
        uid: user.uid,
        story,
        conversationExists: messages.length > 0,
        userText: textToSend,
        userSequence: nextUserSeq,
        storyBeats,
        newScene: nextSceneStr,
        sceneIndex: nextSceneIdx,
        updatedMeters,
        choicesMade: updatedChoicesMade,
        endingTriggered: data.endingTriggered?.trim() || undefined,
        newMemory: memoryToSave,
      });

      setMessages([...messages, saved.userMessage, saved.storyMessage]);
      setMeters(updatedMeters);
      setCurrentScene(nextSceneStr);
      setSceneIndex(nextSceneIdx);
      setChoicesMade(updatedChoicesMade);
      setActiveChoices(Array.isArray(data.storyChoices) ? data.storyChoices.slice(0, 3) : []);

      if (data.endingTriggered?.trim()) {
        setEndingReached(data.endingTriggered.trim());
      }
      if (memoryToSave) {
        setMemories((prev) => [
          ...prev,
          {
            id: `local_${Date.now()}`,
            uid: user.uid,
            storyId: story.id,
            summary: memoryToSave.summary,
            importance: memoryToSave.importance,
            charactersInvolved: memoryToSave.charactersInvolved,
          },
        ]);
      }

      void onDataUpdated();
      setTimeout(() => scrollToBottom(true), 60);
    } catch (err) {
      setMessages(messages);
      if (!overrideText) setInput(textToSend);
      setErrorBanner(
        err instanceof Error ? err.message : 'Network error. Your previous conversation is safe.'
      );
    } finally {
      setSending(false);
    }
  };

  const handleLightbulbClick = async () => {
    if (suggestionsOpen) {
      setSuggestionsOpen(false);
      return;
    }
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
          recentMessages: messages.slice(-5).map((m) => ({
            role: m.role,
            userText: m.userText,
            beats: m.beats,
          })),
        }),
      });
      const data = (await resp.json()) as { suggestions?: string[]; error?: string };
      if (!resp.ok) {
        throw new Error(data.error || 'Could not generate suggestions.');
      }
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setSuggestionsOpen(false);
      setErrorBanner(err instanceof Error ? err.message : 'Unable to fetch AI reply ideas.');
    } finally {
      setSuggestionsLoading(false);
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
    setRestartConfirmOpen(false);
    setLoadingInit(true);
    setErrorBanner(null);
    try {
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
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Unable to restart story.');
    } finally {
      setLoadingInit(false);
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
            )}
          </div>
        </div>
      </header>

      {/* Scrollable Chat Feed */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3.5 sm:px-4 pt-2 pb-4"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Scene Context Strip */}
          <div className="text-center py-1">
            <span className="text-[11px] font-medium text-zinc-500">
              {currentScene}
            </span>
          </div>

          {loadingInit ? (
            <div className="space-y-3 py-8">
              <div className="h-28 rounded-2xl bg-[#18181D] animate-pulse" />
              <div className="h-12 w-2/3 ml-auto rounded-2xl bg-[#18181D] animate-pulse" />
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isLatestStoryMsg =
                msg.role === 'story' &&
                idx ===
                  messages.reduce((lastIdx, m, i) => (m.role === 'story' ? i : lastIdx), -1);

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

              const metersToDisplay = isLatestStoryMsg
                ? meters
                : msg.metersSnapshot || [];

              return (
                <div key={msg.id} className="flex justify-start">
                  <div className="w-full max-w-[92%] sm:max-w-[85%] rounded-2xl rounded-bl-sm bg-[#1C1D22] border border-white/[0.06] px-4 py-3.5 space-y-3 shadow-lg">
                    {/* Story-specific Relationship Meters */}
                    {isLatestStoryMsg && metersToDisplay.length > 0 && (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pb-2 border-b border-white/[0.07] text-[13px] font-semibold tabular-nums">
                        {metersToDisplay.map((m) => (
                          <div key={m.id} className="flex items-center gap-1.5 text-zinc-100">
                            <span>{m.emoji}</span>
                            <span className="text-zinc-300">{m.label}:</span>
                            <span className="text-white">
                              {m.value}/{story.relationshipMeters.find((d) => d.id === m.id)?.max ?? 100}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Ordered Narration + Multi-Character Dialogue Beats */}
                    <div className="space-y-3">
                      {(msg.beats || []).map((beat, bIdx) => {
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
                        const speaker = beat.speakerName || story.characters[0]?.name || 'Character';
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
                              <span className="text-zinc-100">"{beat.text}"</span>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Ending Reached Banner */}
          {endingReached && (
            <div className="rounded-2xl bg-gradient-to-r from-[#231217] to-[#17171D] border border-[#E5233D]/40 p-4 text-center space-y-2">
              <div className="text-xs font-semibold text-[#F43F5E]">Story Ending Reached</div>
              <div className="font-display text-base font-bold text-white">{endingReached}</div>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setRestartConfirmOpen(true)}
                  className="px-4 py-2 rounded-full bg-[#E5233D] text-xs font-semibold text-white"
                >
                  Play Another Path
                </button>
              </div>
            </div>
          )}

          {/* Typing Indicator */}
          {sending && (
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
          )}

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
            <div className="rounded-xl bg-red-500/15 border border-red-500/30 px-3.5 py-2 text-xs text-red-200 flex items-center justify-between gap-2">
              <span>{errorBanner}</span>
              <button type="button" onClick={() => setErrorBanner(null)}>
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

          {/* Optional Story Choices at pivotal moments */}
          {activeChoices.length > 0 && !sending && !endingReached && (
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
          {suggestionsOpen && (
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
                <div className="py-3 text-xs text-zinc-400">Thinking of replies for this scene...</div>
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
            </div>

            {input.trim().length > 0 ? (
              <button
                type="submit"
                disabled={sending}
                aria-label="Send message"
                className="min-w-[48px] min-h-[48px] rounded-full bg-[#E5233D] hover:bg-[#cc1e35] disabled:opacity-50 flex items-center justify-center text-white shadow-lg shadow-[#E5233D]/30 transition shrink-0"
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
    </div>
  );
};
