import React, { useMemo } from 'react';
import { ChevronRight, LogIn, MessageCircle, Sparkles } from 'lucide-react';
import { toMillis } from '../lib/firestoreService';
import type { AppContentConfig } from '../types/appConfig';
import type { ConversationSummary, StoryDefinition, StoryProgressRecord } from '../types/story';
import { StoryImage } from './StoryImage';

interface ChatsViewProps {
  isSignedIn: boolean;
  stories: StoryDefinition[];
  conversations: ConversationSummary[];
  progressMap: Record<string, StoryProgressRecord>;
  appContent?: AppContentConfig;
  onOpenAuth: () => void;
  onResumeStory: (story: StoryDefinition) => void;
  onExploreHome: () => void;
}

function formatRelativeTime(ts: unknown, localFallback?: number): string {
  const ms = toMillis(ts) || localFallback || 0;
  if (!ms) return 'Recent';
  const diffMin = Math.floor((Date.now() - ms) / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

export const ChatsView: React.FC<ChatsViewProps> = ({
  isSignedIn,
  stories,
  conversations,
  progressMap,
  appContent,
  onOpenAuth,
  onResumeStory,
  onExploreHome,
}) => {
  const storyMap = useMemo(() => new Map(stories.map((s) => [s.id, s])), [stories]);

  return (
    <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)] pb-24">
      <header className="sticky top-0 z-30 bg-[var(--bg-canvas)]/95 backdrop-blur-xl border-b border-zinc-200 dark:border-white/[0.06] pt-safe px-4 h-14 flex items-center justify-between">
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">Your Story Chats</h1>
          {isSignedIn && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
              {conversations.length} active
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-5 space-y-4">
        {!isSignedIn ? (
          <div className="rounded-3xl bg-white dark:bg-[#141419] border border-zinc-200/85 dark:border-white/[0.09] p-7 text-center space-y-4 shadow-sm dark:shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border border-zinc-200 dark:border-white/10"
              style={{ backgroundColor: 'rgba(229, 35, 61, 0.12)', color: 'var(--app-accent)' }}
            >
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-display text-lg font-bold">
                {appContent?.guestPromptTitle || 'Sign In to Sync Conversations'}
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                {appContent?.guestPromptSubtitle ||
                  'Log in with your Email & Password to save chats, relationships, and memories permanently in the cloud.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--app-accent)] hover:opacity-90 px-6 py-3 text-sm font-semibold text-white transition"
            >
              <LogIn className="w-4 h-4" />
              Login / Create Account
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-[#141419] border border-zinc-200/85 dark:border-white/[0.09] p-7 text-center space-y-4 shadow-sm dark:shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-[var(--app-accent)] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-display text-lg font-bold">No Active Stories Yet</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
                Pick any story from Home and tap Chat now to start your first interactive scene.
              </p>
            </div>
            <button
              type="button"
              onClick={onExploreHome}
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-white dark:text-[#0A0A0D] px-6 py-2.5 text-sm font-bold transition"
            >
              Explore Stories
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {conversations.map((conv) => {
              const story = storyMap.get(conv.storyId);
              if (!story) return null;
              const sceneCount = progressMap[story.id]?.sceneIndex;

              return (
                <button
                  key={conv.conversationId}
                  type="button"
                  onClick={() => onResumeStory(story)}
                  className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-white dark:bg-[#141419] hover:bg-zinc-50 dark:hover:bg-[#1B1B22] border border-zinc-200/85 dark:border-white/[0.09] hover:border-zinc-300 dark:hover:border-white/25 text-left transition shadow-sm dark:shadow-none"
                >
                  <StoryImage
                    src={story.coverImage}
                    alt={story.title}
                    className="w-16 h-20 rounded-xl object-cover object-top shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-display text-base font-bold text-zinc-950 dark:text-white truncate">
                        {story.title}
                      </h2>
                      <span className="text-[11px] text-zinc-500 shrink-0 tabular-nums">
                        {formatRelativeTime(conv.updatedAt, conv.localUpdatedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium truncate" style={{ color: 'var(--app-accent)' }}>
                        {conv.lastSpeaker || story.characters[0]?.name}
                      </span>
                      <span aria-hidden="true" className="text-zinc-400 dark:text-zinc-600">·</span>
                      <span className="text-zinc-600 dark:text-zinc-400 tabular-nums">
                        {Math.max(conv.messageCount, sceneCount || 0)} turns
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">{conv.lastMessage}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
