import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Flame,
  Megaphone,
  Play,
  Search,
  Shield,
  Star,
  User as UserIcon,
} from 'lucide-react';
import { STORY_CATEGORIES } from '../data/stories';
import type { AppContentConfig, AppSettingsConfig } from '../types/appConfig';
import type { ConversationSummary, StoryCategory, StoryDefinition } from '../types/story';
import { BrandWordmark } from './BrandWordmark';
import { PortraitLightboxModal, type PortraitLightboxItem } from './PortraitLightboxModal';
import { StoryCard } from './StoryCard';
import { StoryImage } from './StoryImage';

interface HomeViewProps {
  stories: StoryDefinition[];
  yoursCompanions: StoryDefinition[];
  favoriteIds: Set<string>;
  conversations: ConversationSummary[];
  userDisplayName?: string;
  isSignedIn: boolean;
  isAdmin?: boolean;
  appSettings: AppSettingsConfig;
  appContent: AppContentConfig;
  isInstallable: boolean;
  onInstallApp: () => void;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  onOpenAdminDashboard?: () => void;
  onSelectStory: (story: StoryDefinition) => void;
  onResumeConversation: (story: StoryDefinition) => void;
  onToggleFavorite: (story: StoryDefinition) => void;
}

const MOOD_SHORTCUTS: { label: string; category: StoryCategory; subtitle: string; accent: string }[] = [
  { label: 'Romance', category: 'Romance', subtitle: 'Slow-burn & dil ki baatein', accent: 'from-rose-500/[0.08] to-transparent' },
  { label: 'College', category: 'College', subtitle: 'Campus, coaching & crushes', accent: 'from-amber-500/[0.08] to-transparent' },
  { label: 'Mafia', category: 'Mafia', subtitle: 'Power, danger & loyalty', accent: 'from-red-500/[0.08] to-transparent' },
  { label: 'Anime', category: 'Anime', subtitle: 'Shadow vows & neon battles', accent: 'from-sky-500/[0.08] to-transparent' },
  { label: 'Horror', category: 'Horror', subtitle: 'Midnight chills & haunted wings', accent: 'from-purple-500/[0.08] to-transparent' },
  { label: 'Fantasy', category: 'Fantasy', subtitle: 'Dragons, ranks & magic', accent: 'from-indigo-500/[0.08] to-transparent' },
  { label: 'Historical', category: 'Historical', subtitle: 'Palaces & royal intrigue', accent: 'from-yellow-500/[0.08] to-transparent' },
  { label: 'Thriller', category: 'Thriller', subtitle: 'Mystery, twists & secrets', accent: 'from-emerald-500/[0.08] to-transparent' },
];

function splitTitleWords(title: string): { lead: string; accent: string } {
  const words = title.trim().split(/\s+/);
  if (words.length <= 1) return { lead: title, accent: '' };
  return {
    lead: words.slice(0, -1).join(' '),
    accent: words[words.length - 1],
  };
}

export const HomeView: React.FC<HomeViewProps> = ({
  stories,
  yoursCompanions,
  favoriteIds,
  conversations,
  userDisplayName,
  isSignedIn,
  isAdmin = false,
  appSettings,
  appContent,
  isInstallable,
  onInstallApp,
  onOpenSearch,
  onOpenProfile,
  onOpenAdminDashboard,
  onSelectStory,
  onResumeConversation,
  onToggleFavorite,
}) => {
  const [activeCategory, setActiveCategory] = useState<StoryCategory>('For You');
  const [heroIndex, setHeroIndex] = useState(0);
  const [showAllRecommended, setShowAllRecommended] = useState(false);
  const [spotlightIndex, setSpotlightIndex] = useState<number | null>(null);

  const heroPool = useMemo(() => {
    const picked = stories.filter((s) => s.isFeatured || s.isTrending).slice(0, 5);
    return picked.length > 0 ? picked : stories.slice(0, 4);
  }, [stories]);

  const activeHero = heroPool[heroIndex % Math.max(1, heroPool.length)] || stories[0];
  const heroTitleParts = activeHero ? splitTitleWords(activeHero.title) : { lead: '', accent: '' };

  const continueReadingItems = useMemo(() => {
    const storyMap = new Map([...stories, ...yoursCompanions].map((s) => [s.id, s]));
    return conversations
      .map((conv) => ({ conv, story: storyMap.get(conv.storyId) }))
      .filter((item): item is { conv: ConversationSummary; story: StoryDefinition } => Boolean(item.story));
  }, [conversations, stories, yoursCompanions]);

  const filteredStories = useMemo(() => {
    if (activeCategory === 'For You') return stories;
    if (activeCategory === 'Top 50') {
      return [...stories]
        .sort((a, b) => {
          const rankDiff =
            (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER);
          if (rankDiff !== 0) return rankDiff;
          return b.chatCountNumeric - a.chatCountNumeric;
        })
        .slice(0, 50);
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

  const topTenTrending = useMemo(
    () =>
      [...stories]
        .sort((a, b) => b.chatCountNumeric - a.chatCountNumeric)
        .slice(0, 10),
    [stories]
  );

  const recentlyAdded = useMemo(
    () => [...stories].filter((s) => s.isNew).reverse(),
    [stories]
  );

  const spotlightCharacters = useMemo(() => {
    const list: { character: StoryDefinition['characters'][0]; story: StoryDefinition }[] = [];
    const seenPortraits = new Set<string>();
    for (const story of stories) {
      const lead = story.characters[0];
      if (lead && !seenPortraits.has(lead.portrait)) {
        seenPortraits.add(lead.portrait);
        list.push({ character: lead, story });
      }
    }
    for (const story of stories) {
      if (list.length >= 26) break;
      const support = story.characters[2];
      if (support && !seenPortraits.has(support.portrait)) {
        seenPortraits.add(support.portrait);
        list.push({ character: support, story });
      }
    }
    return list.slice(0, 26);
  }, [stories]);

  const recommendedList = useMemo(
    () => (showAllRecommended ? stories : stories.slice(0, 15)),
    [stories, showAllRecommended]
  );

  const spotlightLightboxItems: PortraitLightboxItem[] = useMemo(
    () =>
      spotlightCharacters.map(({ character, story }) => ({
        character,
        subtitle: story.title,
        ctaLabel: `Play ${story.title}`,
        onCtaClick: () => onSelectStory(story),
      })),
    [spotlightCharacters, onSelectStory]
  );

  const announcementTone =
    appSettings.announcementType === 'warning'
      ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
      : appSettings.announcementType === 'success'
      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
      : 'bg-sky-500/10 border-sky-500/30 text-sky-800 dark:text-sky-200';

  return (
    <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)] pb-28">
      {/* Sleek Glassmorphic Top Header */}
      <header className="sticky top-0 z-30 bg-[var(--bg-canvas)]/90 backdrop-blur-2xl border-b border-zinc-200/80 dark:border-white/[0.06] pt-safe">
        <div className="max-w-7xl mx-auto px-4 h-15 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setActiveCategory('For You')}
            className="flex items-center whitespace-nowrap shrink-0 focus:outline-none"
          >
            <BrandWordmark
              appName={appSettings.appName}
              logoUrl={appSettings.logoUrl}
              size="md"
              tone="auto"
            />
          </button>

          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && onOpenAdminDashboard && (
              <button
                type="button"
                onClick={onOpenAdminDashboard}
                className="min-h-[40px] px-3.5 rounded-full bg-zinc-900 dark:bg-white/[0.08] hover:opacity-90 border border-zinc-700 dark:border-white/15 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition whitespace-nowrap"
              >
                <Shield className="w-3.5 h-3.5 text-[#F43F5E]" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
            {isInstallable && (
              <button
                type="button"
                onClick={onInstallApp}
                className="min-h-[40px] px-3.5 rounded-full bg-[var(--app-accent)] hover:opacity-90 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Search stories and characters"
              className="min-w-[44px] min-h-[44px] rounded-full bg-zinc-200/80 dark:bg-white/[0.07] hover:bg-zinc-300 dark:hover:bg-white/[0.14] border border-zinc-300/70 dark:border-white/[0.10] flex items-center justify-center text-zinc-700 dark:text-zinc-200 transition"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onOpenProfile}
              aria-label="Open profile and settings"
              className="min-w-[44px] min-h-[44px] rounded-full bg-zinc-900 dark:bg-[#191A22] border border-zinc-700/80 dark:border-white/[0.14] flex items-center justify-center text-sm font-bold text-white hover:border-rose-400/50 transition"
            >
              {isSignedIn && userDisplayName ? (
                <span>{userDisplayName.charAt(0).toUpperCase()}</span>
              ) : (
                <UserIcon className="w-5 h-5 text-zinc-200" />
              )}
            </button>
          </div>
        </div>

        {/* Horizontal Category Tabs */}
        <nav
          aria-label="Story categories"
          className="max-w-7xl mx-auto px-4 flex items-center gap-6 overflow-x-auto no-scrollbar"
        >
          {STORY_CATEGORIES.map((category) => {
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`relative py-2.5 text-[13.5px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'text-zinc-950 dark:text-white'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {category}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full"
                    style={{ backgroundColor: 'var(--app-accent)' }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-5 space-y-8">
        {/* Global Admin Announcement Banner */}
        {appSettings.announcementEnabled &&
          (appSettings.announcementTitle || appSettings.announcementMessage) && (
            <div className={`rounded-2xl border px-4 py-3 flex items-start gap-3 ${announcementTone}`}>
              {appSettings.announcementType === 'warning' ? (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              ) : appSettings.announcementType === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <Megaphone className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                {appSettings.announcementTitle && (
                  <div className="text-xs font-bold">{appSettings.announcementTitle}</div>
                )}
                {appSettings.announcementMessage && (
                  <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
                    {appSettings.announcementMessage}
                  </p>
                )}
              </div>
            </div>
          )}

        {activeCategory === 'For You' ? (
          <>
            {/* Editorial Welcome Strip */}
            <section className="flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                  {isSignedIn && userDisplayName
                    ? `Welcome back, ${userDisplayName}`
                    : appContent.welcomeHeading || 'Choose Your Story World'}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                  {stories.length} Interactive Worlds · Unlimited Choices & Living Memory
                </p>
              </div>
            </section>

            {/* Interactive Spotlight Hero Carousel */}
            {activeHero && (
              <section aria-label="Featured Spotlight" className="space-y-3">
                <div className="relative rounded-3xl overflow-hidden bg-[#121218] border border-zinc-200/60 dark:border-white/[0.10] aspect-[16/11] sm:aspect-[21/9] max-h-[410px] w-full shadow-[0_18px_42px_rgba(0,0,0,0.42)]">
                  <StoryImage
                    src={activeHero.bannerImage || activeHero.coverImage}
                    alt={activeHero.title}
                    fallbackTitle={activeHero.title}
                    loading="eager"
                    className="w-full h-full object-cover object-top contrast-[1.06] saturate-[1.08] transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07070B] via-[#07070B]/45 to-black/25" />

                  {/* Prev / Next Spotlight Controls */}
                  {heroPool.length > 1 && (
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10">
                      <button
                        type="button"
                        onClick={() =>
                          setHeroIndex((i) => (i - 1 + heroPool.length) % heroPool.length)
                        }
                        aria-label="Previous featured story"
                        className="w-10 h-10 rounded-full bg-black/55 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-black/80 transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeroIndex((i) => (i + 1) % heroPool.length)}
                        aria-label="Next featured story"
                        className="w-10 h-10 rounded-full bg-black/55 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-black/80 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
                        <span className="text-[#FB7185] font-bold">
                          {appContent.heroBadgeText || 'Spotlight Pick'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{activeHero.primaryCategory}</span>
                        <span aria-hidden="true">·</span>
                        <span>{activeHero.characters.length} Cast</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {activeHero.rating.toFixed(1)}
                        </span>
                      </div>
                      <h1 className="text-3xl sm:text-5xl leading-[1.04] tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] text-balance">
                        <span className="font-editorial italic font-bold text-white">
                          {heroTitleParts.lead}
                        </span>
                        {heroTitleParts.accent && (
                          <>
                            {' '}
                            <span className="font-display font-extrabold text-[#FDA4AF]">
                              {heroTitleParts.accent}
                            </span>
                          </>
                        )}
                      </h1>
                      <p className="text-xs sm:text-sm text-zinc-200 line-clamp-2">
                        {activeHero.tagline}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectStory(activeHero)}
                      className="min-h-[46px] px-7 rounded-full bg-white text-[#0A0A0D] hover:bg-zinc-200 font-display text-sm font-bold inline-flex items-center justify-center gap-2 shrink-0 shadow-xl transition active:scale-[0.98]"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Play Story
                    </button>
                  </div>
                </div>

                {heroPool.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5">
                    {heroPool.map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setHeroIndex(idx)}
                        aria-label={`Spotlight ${item.title}`}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === heroIndex % heroPool.length
                            ? 'w-6 bg-[var(--app-accent)]'
                            : 'w-1.5 bg-zinc-400/40 dark:bg-white/25'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Quick Moods / Vibe Discovery Cards */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-zinc-950 dark:text-white">
                  Explore by Vibe
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveCategory('New')}
                  className="text-xs font-semibold hover:opacity-80 inline-flex items-center gap-0.5"
                  style={{ color: 'var(--app-accent)' }}
                >
                  Fresh Releases <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {MOOD_SHORTCUTS.map((mood) => (
                  <button
                    key={mood.category}
                    type="button"
                    onClick={() => setActiveCategory(mood.category)}
                    className={`min-w-[148px] text-left rounded-2xl bg-gradient-to-br ${mood.accent} bg-white dark:bg-[#14141C] border border-zinc-200/80 dark:border-white/[0.09] hover:border-zinc-400/60 dark:hover:border-white/25 px-4 py-3.5 shrink-0 transition shadow-sm dark:shadow-none`}
                  >
                    <div className="font-display text-sm font-bold text-zinc-950 dark:text-white">
                      {mood.label}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {mood.subtitle}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Continue Reading */}
            {continueReadingItems.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-zinc-950 dark:text-white">
                    Continue Reading
                  </h2>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                    {continueReadingItems.length} active
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {continueReadingItems.map(({ conv, story }) => (
                    <button
                      key={conv.conversationId}
                      type="button"
                      onClick={() => onResumeConversation(story)}
                      className="flex items-center gap-3 p-2.5 pr-4 rounded-2xl bg-white dark:bg-[#14141C] hover:bg-zinc-50 dark:hover:bg-[#1B1B25] border border-zinc-200/85 dark:border-white/[0.09] hover:border-rose-400/40 shrink-0 w-[290px] sm:w-[320px] text-left transition shadow-sm dark:shadow-none"
                    >
                      <StoryImage
                        src={story.coverImage}
                        alt={story.title}
                        className="w-14 h-16 rounded-xl object-cover object-top shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="font-display text-sm font-semibold text-zinc-950 dark:text-white truncate">
                          {story.title}
                        </div>
                        <div className="text-[11px] font-medium truncate" style={{ color: 'var(--app-accent)' }}>
                          {conv.lastSpeaker || story.primaryCategory}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                          {conv.lastMessage}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Newly Added Stories */}
            {recentlyAdded.length > 0 && (
              <section className="space-y-3.5 cv-section">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#E5233D]" />
                    <h2 className="font-display text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
                      Fresh Releases
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveCategory('New')}
                    className="text-xs font-semibold hover:opacity-80 inline-flex items-center gap-0.5 transition"
                    style={{ color: 'var(--app-accent)' }}
                  >
                    See All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2">
                  {recentlyAdded.slice(0, 14).map((story) => (
                    <div key={`fresh-${story.id}`} className="w-[156px] sm:w-[178px] shrink-0">
                      <StoryCard
                        story={story}
                        isFavorite={favoriteIds.has(story.id)}
                        onSelect={onSelectStory}
                        onToggleFavorite={onToggleFavorite}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Spotlight Characters Carousel */}
            <section className="space-y-3.5 cv-section">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
                  Spotlight Characters
                </h2>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Tap portrait to view
                </span>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {spotlightCharacters.map(({ character, story }, idx) => (
                  <button
                    key={`${story.id}-${character.id}`}
                    type="button"
                    onClick={() => setSpotlightIndex(idx)}
                    className="flex flex-col items-center w-24 shrink-0 text-center group space-y-2"
                  >
                    <div className="w-20 h-20 rounded-full p-[1.5px] bg-gradient-to-br from-rose-400/50 via-white/25 to-white/10 group-hover:scale-105 transition-transform shadow-md">
                      <StoryImage
                        src={character.portrait}
                        alt={character.name}
                        className="w-full h-full rounded-full object-cover object-top bg-[#141419]"
                      />
                    </div>
                    <div className="w-full">
                      <div className="text-xs font-semibold text-zinc-950 dark:text-white truncate">
                        {character.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate">{story.title}</div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Top 10 Ranked Row */}
            <section className="space-y-3.5 cv-section">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
                  Top 10 Charts
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveCategory('Top 50')}
                  className="text-xs font-semibold hover:opacity-80 inline-flex items-center gap-0.5 transition"
                  style={{ color: 'var(--app-accent)' }}
                >
                  Top 50 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2">
                {topTenTrending.map((story, idx) => (
                  <div key={`top10-${story.id}`} className="w-[156px] sm:w-[178px] shrink-0">
                    <StoryCard
                      story={story}
                      isFavorite={favoriteIds.has(story.id)}
                      onSelect={onSelectStory}
                      onToggleFavorite={onToggleFavorite}
                      rankNumber={idx + 1}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Recommended / Complete Interactive Library Grid */}
            <section className="space-y-4 cv-section">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
                  {appContent.homeFeaturedTitle || 'All Interactive Stories'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAllRecommended((p) => !p)}
                  className="text-xs font-semibold hover:opacity-80 inline-flex items-center gap-0.5 transition"
                  style={{ color: 'var(--app-accent)' }}
                >
                  {showAllRecommended ? 'Show Less' : `View All (${stories.length})`}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {recommendedList.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    isFavorite={favoriteIds.has(story.id)}
                    onSelect={onSelectStory}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
              {!showAllRecommended && stories.length > 15 && (
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAllRecommended(true)}
                    className="min-h-[44px] px-7 rounded-full bg-zinc-900 dark:bg-white/[0.08] hover:opacity-90 border border-zinc-700 dark:border-white/[0.14] text-xs font-bold text-white transition"
                  >
                    Load All {stories.length} Stories
                  </button>
                </div>
              )}
            </section>

            {appContent.footerNote && (
              <footer className="pt-2 pb-4 text-center text-xs text-zinc-500">
                {appContent.footerNote}
              </footer>
            )}
          </>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-xl font-bold text-zinc-950 dark:text-white">
                {activeCategory === 'Top 50' ? 'Top 50 Stories' : activeCategory}
              </h1>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
              </span>
            </div>

            {filteredStories.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/[0.09] p-8 text-center space-y-3">
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  No stories in {activeCategory} yet. Explore all stories or try another category.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveCategory('For You')}
                  className="px-5 py-2.5 rounded-full bg-[var(--app-accent)] text-xs font-semibold text-white"
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
                    rankNumber={activeCategory === 'Top 50' ? idx + 1 : undefined}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <PortraitLightboxModal
        items={spotlightLightboxItems}
        activeIndex={spotlightIndex}
        onClose={() => setSpotlightIndex(null)}
        onChangeIndex={(idx) => setSpotlightIndex(idx)}
      />
    </div>
  );
};
