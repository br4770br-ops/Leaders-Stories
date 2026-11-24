import React, { useMemo } from 'react';
import { ChevronRight, LogIn, MessageCircle, Sparkles } from 'lucide-react';
import { toMillis } from '../lib/firestoreService';
import type { ConversationSummary, StoryDefinition, StoryProgressRecord } from '../types/story';
import { StoryImage } from './StoryImage';

interface ChatsViewProps {
  isSignedIn: boolean;
  stories: StoryDefinition[];
  conversations: ConversationSummary[];
  progressMap: Record<string, StoryProgressRecord>;
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
  onOpenAuth,
  onResumeStory,
  onExploreHome,
}) => {
  const storyMap = useMemo(() => new Map(stories.map((s) => [s.id, s])), [stories]);

  return (
    <div className="min-h-dvh bg-[#0A0A0D] text-white pb-24">
      <header className="sticky top-0 z-30 bg-[#0A0A0D]/95 backdrop-blur-xl border-b border-white/[0.06] pt-safe px-4 h-14 flex items-center justify-between">
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">Your Story Chats</h1>
          {isSignedIn && (
            <span className="text-xs text-zinc-400 tabular-nums">
              {conversations.length} active
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-5 space-y-4">
        {!isSignedIn ? (
          <div className="rounded-3xl bg-[#141419] border border-white/10 p-7 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E5233D]/15 text-[#E5233D] flex items-center justify-center mx-auto">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-display text-lg font-bold">Sign In to Sync Conversations</h2>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Log in with your Email & Password to save chats, relationships, and memories permanently in the cloud—even if you uninstall and reinstall the app.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E5233D] hover:bg-[#cc1e35] px-6 py-3 text-sm font-semibold text-white transition"
            >
              <LogIn className="w-4 h-4" />
              Login / Create Account
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="rounded-3xl bg-[#141419] border border-white/10 p-7 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 text-[#E5233D] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-display text-lg font-bold">No Active Stories Yet</h2>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Pick any story from Home and tap Chat now to start your first interactive scene.
              </p>
            </div>
            <button
              type="button"
              onClick={onExploreHome}
              className="inline-flex items-center justify-center rounded-full bg-white text-[#0A0A0D] px-6 py-2.5 text-sm font-bold transition"
            >
              Explore Stories
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {conversations.map((conv) => {
              const story = storyMap.get(conv.storyId);
              if (!story) return null;
              const progress = progressMap[story.id];
              const isCompleted = progress?.status === 'completed';

              return (
                <button
                  key={conv.conversationId}
                  type="button"
                  onClick={() => onResumeStory(story)}
                  className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-[#141419] hover:bg-[#1B1B22] border border-white/[0.06] text-left transition"
                >
                  <StoryImage
                    src={story.coverImage}
                    alt={story.title}
                    className="w-16 h-20 rounded-xl object-cover object-top shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-display text-base font-bold text-white truncate">
                        {story.title}
                      </h2>
                      <span className="text-[11px] text-zinc-500 shrink-0 tabular-nums">
                        {formatRelativeTime(conv.updatedAt, conv.localUpdatedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#F43F5E] font-medium truncate">
                        {conv.lastSpeaker || story.characters[0]?.name}
                      </span>
                      <span aria-hidden="true" className="text-zinc-600">·</span>
                      <span className="text-zinc-400 tabular-nums">
                        {conv.messageCount} turns
                      </span>
                      {isCompleted && (
                        <>
                          <span aria-hidden="true" className="text-zinc-600">·</span>
                          <span className="text-emerald-400 font-medium">Completed</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-1">{conv.lastMessage}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
