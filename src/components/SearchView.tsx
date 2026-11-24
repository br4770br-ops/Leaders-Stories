import React, { useMemo, useState } from 'react';
import { ArrowUpDown, Search as SearchIcon, X } from 'lucide-react';
import { STORY_CATEGORIES } from '../data/stories';
import type { StoryCategory, StoryDefinition } from '../types/story';
import { StoryCard } from './StoryCard';

interface SearchViewProps {
  stories: StoryDefinition[];
  favoriteIds: Set<string>;
  onSelectStory: (story: StoryDefinition) => void;
  onToggleFavorite: (story: StoryDefinition) => void;
}

type SortMode = 'popular' | 'rating' | 'newest';

export const SearchView: React.FC<SearchViewProps> = ({
  stories,
  favoriteIds,
  onSelectStory,
  onToggleFavorite,
}) => {
  const [queryText, setQueryText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortMode>('popular');

  const results = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    const filtered = stories.filter((story) => {
      const catMatch =
        selectedCategory === 'All' ||
        story.primaryCategory === selectedCategory ||
        story.categories.includes(selectedCategory);

      if (!catMatch) return false;
      if (!q) return true;

      const haystack = [
        story.title,
        story.tagline,
        story.about,
        story.primaryCategory,
        ...story.tags,
        ...story.characters.map((c) => `${c.name} ${c.role}`),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return b.chatCountNumeric - a.chatCountNumeric;
    });
  }, [stories, queryText, selectedCategory, sortBy]);

  return (
    <div className="min-h-dvh bg-[#0A0A0D] text-white pb-24">
      <header className="sticky top-0 z-30 bg-[#0A0A0D]/95 backdrop-blur-xl border-b border-white/[0.06] pt-safe px-4 py-3 space-y-3">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Search titles, characters (Isha, Tara...), genres..."
                className="w-full min-h-[46px] rounded-2xl bg-[#16161C] border border-white/10 pl-10 pr-10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#E5233D]"
              />
              {queryText && (
                <button
                  type="button"
                  onClick={() => setQueryText('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortMode)}
                aria-label="Sort stories"
                className="min-h-[46px] rounded-2xl bg-[#16161C] border border-white/10 pl-3 pr-8 text-xs font-medium text-zinc-200 focus:outline-none focus:border-[#E5233D] appearance-none"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {(['All', ...STORY_CATEGORIES.filter((c) => c !== 'For You')] as (StoryCategory | 'All')[]).map(
              (cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition ${
                      active
                        ? 'bg-[#E5233D] text-white'
                        : 'bg-[#16161C] text-zinc-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-base font-bold text-white">
            {queryText ? `Results for "${queryText}"` : 'Browse All Stories'}
          </h1>
          <span className="text-xs text-zinc-400 tabular-nums">{results.length} found</span>
        </div>

        {results.length === 0 ? (
          <div className="rounded-2xl bg-[#141419] border border-white/[0.06] p-8 text-center space-y-3">
            <p className="text-sm text-zinc-300">No stories matched your filter.</p>
            <button
              type="button"
              onClick={() => {
                setQueryText('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-xl bg-[#E5233D] text-xs font-semibold text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                isFavorite={favoriteIds.has(story.id)}
                onSelect={onSelectStory}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
