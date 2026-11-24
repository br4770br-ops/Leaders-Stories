import React, { useMemo, useState } from 'react';
import { ChevronRight, Download, Play, Search, Star, User as UserIcon } from 'lucide-react';
import { STORY_CATEGORIES } from '../data/stories';
import type { ConversationSummary, StoryCategory, StoryDefinition } from '../types/story';
import { StoryCard } from './StoryCard';
import { StoryImage } from './StoryImage';

interface HomeViewProps {
  stories: StoryDefinition[];
  favoriteIds: Set<string>;
  conversations: ConversationSummary[];
  userDisplayName?: string;
  isSignedIn: boolean;
  isInstallable: boolean;
  onInstallApp: () => void;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  onSelectStory: (story: StoryDefinition) => void;
  onResumeConversation: (story: StoryDefinition) => void;
  onToggleFavorite: (story: StoryDefinition) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  stories,
  favoriteIds,
  conversations,
  userDisplayName,
  isSignedIn,
  isInstallable,
  onInstallApp,
  onOpenSearch,
  onOpenProfile,
  onSelectStory,
  onResumeConversation,
  onToggleFavorite,
}) => {
  const [activeCategory, setActiveCategory] = useState<StoryCategory>('For You');

  const featuredStory = useMemo(
    () => stories.find((s) => s.isFeatured) || stories[0],
    [stories]
  );

  const continueReadingItems = useMemo(() => {
    const storyMap = new Map(stories.map((s) => [s.id, s]));
    return conversations
      .map((conv) => ({ conv, story: storyMap.get(conv.storyId) }))
      .filter((item): item is { conv: ConversationSummary; story: StoryDefinition } => Boolean(item.story));
  }, [conversations, stories]);

  const filteredStories = useMemo(() => {
    if (activeCategory === 'For You') return stories;
    if (activeCategory === 'Top 50') {
      return [...stories].sort((a, b) => (a.rank || 99) - (b.rank || 99));
    }
    if (activeCategory === 'New') {
      return stories.filter((s) => s.isNew || s.categories.includes('New'));
    }
    if (activeCategory === 'By Fans') {
      return stories.filter((s) => s.isByFans || s.categories.includes('By Fans'));
    }
    return stories.filter(
      (s) => s.primaryCategory === activeCategory || s.categories.includes(activeCategory)
    );
  }, [stories, activeCategory]);

  const trendingStories = useMemo(
    () => stories.filter((s) => s.isTrending).slice(0, 6),
    [stories]
  );

  const popularStories = useMemo(
    () => [...stories].sort((a, b) => b.chatCountNumeric - a.chatCountNumeric).slice(0, 6),
    [stories]
  );

  const recentlyAdded = useMemo(
    () => stories.filter((s) => s.isNew).slice(0, 6),
    [stories]
  );

  const popularCharacters = useMemo(() => {
    return stories.slice(0, 8).map((story) => ({
      character: story.characters[0],
      story,
    })).filter((entry) => Boolean(entry.character));
  }, [stories]);

  return (
    <div className="min-h-dvh bg-[#0A0A0D] text-white pb-24">
      {/* Sticky Compact Top Bar */}
      <header className="sticky top-0 z-30 bg-[#0A0A0D]/90 backdrop-blur-xl border-b border-white/[0.06] pt-safe">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setActiveCategory('For You')}
            className="font-editorial text-xl sm:text-2xl font-bold tracking-tight whitespace-nowrap shrink-0"
          >
            LEADERS <span className="text-[#E5233D]">STORIES</span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            {isInstallable && (
              <button
                type="button"
                onClick={onInstallApp}
                className="min-h-[38px] px-3 rounded-full bg-[#E5233D] hover:bg-[#cc1e35] text-xs font-semibold text-white inline-flex items-center gap-1.5 transition whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install App</span>
                <span className="sm:hidden">Install</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Search stories and characters"
              className="min-w-[44px] min-h-[44px] rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-zinc-200 transition"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onOpenProfile}
              aria-label="Open profile and settings"
              className="min-w-[44px] min-h-[44px] rounded-full bg-gradient-to-br from-[#23232B] to-[#16161C] border border-white/15 flex items-center justify-center text-sm font-bold text-white hover:border-[#E5233D]/60 transition"
            >
              {isSignedIn && userDisplayName ? (
                <span>{userDisplayName.charAt(0).toUpperCase()}</span>
              ) : (
                <UserIcon className="w-5 h-5 text-zinc-300" />
              )}
            </button>
          </div>
        </div>

        {/* Horizontal Category Tabs */}
        <nav
          aria-label="Story categories"
          className="max-w-7xl mx-auto px-4 flex items-center gap-5 overflow-x-auto no-scrollbar"
        >
          {STORY_CATEGORIES.map((category) => {
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`relative py-2.5 text-[14px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {category}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full bg-[#E5233D]" />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-5 space-y-8">
        {activeCategory === 'For You' ? (
          <>
            {/* Featured Story Hero Banner */}
            {featuredStory && (
              <section aria-label="Featured Story">
                <div className="relative rounded-3xl overflow-hidden bg-[#141419] border border-white/[0.08] aspect-[16/10] sm:aspect-[21/9] max-h-[380px] w-full shadow-2xl">
                  <StoryImage
                    src={featuredStory.bannerImage || featuredStory.coverImage}
                    alt={featuredStory.title}
                    fallbackTitle={featuredStory.title}
                    loading="eager"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0D] via-[#0A0A0D]/45 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
                        <span className="text-[#F43F5E] font-semibold">Featured Interactive Story</span>
                        <span aria-hidden="true">·</span>
                        <span>{featuredStory.primaryCategory}</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {featuredStory.rating.toFixed(1)}
                        </span>
                      </div>
                      <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                        {featuredStory.title}
                      </h1>
                      <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2">
                        {featuredStory.tagline}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectStory(featuredStory)}
                      className="min-h-[44px] px-6 rounded-full bg-white text-[#0A0A0D] hover:bg-zinc-200 font-display text-sm font-bold inline-flex items-center justify-center gap-2 shrink-0 transition active:scale-[0.98]"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Play Story
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Continue Reading (shown when user has cloud conversations) */}
            {continueReadingItems.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-white">Continue Reading</h2>
                  <span className="text-xs text-zinc-400 tabular-nums">
                    {continueReadingItems.length} active
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {continueReadingItems.map(({ conv, story }) => (
                    <button
                      key={conv.conversationId}
                      type="button"
                      onClick={() => onResumeConversation(story)}
                      className="flex items-center gap-3 p-2.5 pr-4 rounded-2xl bg-[#141419] hover:bg-[#1B1B22] border border-white/[0.07] shrink-0 w-[290px] sm:w-[320px] text-left transition"
                    >
                      <StoryImage
                        src={story.coverImage}
                        alt={story.title}
                        className="w-14 h-16 rounded-xl object-cover object-top shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="font-display text-sm font-semibold text-white truncate">
                          {story.title}
                        </div>
                        <div className="text-[11px] text-[#F43F5E] font-medium truncate">
                          {conv.lastSpeaker || story.primaryCategory}
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1">{conv.lastMessage}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Recommended Stories */}
            <section className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                  Recommended Stories
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveCategory('Top 50')}
                  className="text-xs font-semibold text-[#F43F5E] hover:text-white inline-flex items-center gap-0.5 transition"
                >
                  Top 50 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {stories.slice(0, 10).map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    isFavorite={favoriteIds.has(story.id)}
                    onSelect={onSelectStory}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            </section>

            {/* Most Popular Characters */}
            <section className="space-y-3.5 cv-section">
              <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                Most Popular Characters
              </h2>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {popularCharacters.map(({ character, story }) => (
                  <button
                    key={`${story.id}-${character.id}`}
                    type="button"
                    onClick={() => onSelectStory(story)}
                    className="flex flex-col items-center w-24 shrink-0 text-center group space-y-2"
                  >
                    <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-[#E5233D] to-zinc-700 group-hover:scale-105 transition-transform">
                      <StoryImage
                        src={character.portrait}
                        alt={character.name}
                        className="w-full h-full rounded-full object-cover object-top bg-[#141419]"
                      />
                    </div>
                    <div className="w-full">
                      <div className="text-xs font-semibold text-white truncate">
                        {character.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate">{story.title}</div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Trending Stories */}
            <section className="space-y-3.5 cv-section">
              <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                Trending Stories
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {trendingStories.map((story) => (
                  <StoryCard
                    key={`trend-${story.id}`}
                    story={story}
                    isFavorite={favoriteIds.has(story.id)}
                    onSelect={onSelectStory}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            </section>

            {/* Popular Stories */}
            <section className="space-y-3.5 cv-section">
              <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                Popular Stories
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {popularStories.map((story) => (
                  <StoryCard
                    key={`pop-${story.id}`}
                    story={story}
                    isFavorite={favoriteIds.has(story.id)}
                    onSelect={onSelectStory}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            </section>

            {/* Recently Added */}
            <section className="space-y-3.5 cv-section">
              <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                Recently Added
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {recentlyAdded.map((story) => (
                  <StoryCard
                    key={`new-${story.id}`}
                    story={story}
                    isFavorite={favoriteIds.has(story.id)}
                    onSelect={onSelectStory}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-xl font-bold text-white">
                {activeCategory === 'Top 50' ? 'Top Stories' : activeCategory}
              </h1>
              <span className="text-xs text-zinc-400 tabular-nums">
                {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
              </span>
            </div>

            {filteredStories.length === 0 ? (
              <div className="rounded-2xl bg-[#141419] border border-white/[0.06] p-8 text-center space-y-3">
                <p className="text-sm text-zinc-300">
                  No stories in {activeCategory} yet. Explore all stories or try another category.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveCategory('For You')}
                  className="px-5 py-2.5 rounded-full bg-[#E5233D] text-xs font-semibold text-white"
                >
                  Back to For You
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredStories.map((story, idx) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    isFavorite={favoriteIds.has(story.id)}
                    onSelect={onSelectStory}
                    onToggleFavorite={onToggleFavorite}
                    rankNumber={activeCategory === 'Top 50' ? story.rank || idx + 1 : undefined}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};
