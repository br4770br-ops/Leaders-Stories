import React from 'react';
import { Heart, MessageSquare, Star } from 'lucide-react';
import type { StoryDefinition } from '../types/story';
import { StoryImage } from './StoryImage';

interface StoryCardProps {
  story: StoryDefinition;
  isFavorite: boolean;
  onSelect: (story: StoryDefinition) => void;
  onToggleFavorite: (story: StoryDefinition) => void;
  rankNumber?: number;
}

function splitPosterTitle(title: string): { lead: string; accent: string } {
  const words = title.trim().split(/\s+/);
  if (words.length <= 1) return { lead: title, accent: '' };
  if (words.length === 2) return { lead: words[0], accent: words[1] };
  return {
    lead: words.slice(0, -1).join(' '),
    accent: words[words.length - 1],
  };
}

export const StoryCard: React.FC<StoryCardProps> = React.memo(({
  story,
  isFavorite,
  onSelect,
  onToggleFavorite,
  rankNumber,
}) => {
  const { lead, accent } = splitPosterTitle(story.title);

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#101118] border border-zinc-200/80 dark:border-white/[0.10] group-hover:border-rose-400/45 shadow-md dark:shadow-[0_12px_28px_rgba(0,0,0,0.42)] transition-all duration-300">
        <button
          type="button"
          onClick={() => onSelect(story)}
          className="w-full h-full block text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5233D]"
          aria-label={`Open story ${story.title}`}
        >
          {/* Cinema Magazine Portrait Framing */}
          <StoryImage
            src={story.coverImage}
            alt={story.title}
            fallbackTitle={story.title}
            className="w-full h-full object-cover object-top contrast-[1.04] saturate-[1.06] brightness-[0.96] transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05060A] via-[#05060A]/35 to-black/25 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
        </button>

        {/* Top-left Optional Rank or Subtle New Marker */}
        {typeof rankNumber === 'number' ? (
          <div className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-black/75 backdrop-blur-md border border-white/20 flex items-center justify-center font-display text-sm font-bold text-white shadow-md pointer-events-none tabular-nums">
            {rankNumber}
          </div>
        ) : story.isNew ? (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#E5233D]/90 border border-white/15 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm pointer-events-none">
            New
          </div>
        ) : null}

        {/* Favourite button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(story);
          }}
          aria-label={isFavorite ? `Remove ${story.title} from favourites` : `Save ${story.title} to favourites`}
          className="absolute top-2 right-2 min-w-[38px] min-h-[38px] rounded-full bg-black/55 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition active:scale-95"
        >
          <Heart
            className={`w-4 h-4 transition ${
              isFavorite ? 'fill-[#E5233D] text-[#E5233D]' : 'text-white/90'
            }`}
          />
        </button>

        {/* Expressive Cinema Poster Title Overlaid Directly on Story Photo */}
        <button
          type="button"
          onClick={() => onSelect(story)}
          className="absolute inset-x-0 bottom-0 px-3 pt-9 pb-3 text-left focus:outline-none space-y-1.5"
        >
          <h3 className="leading-[1.08] tracking-tight line-clamp-2 drop-shadow-[0_3px_12px_rgba(0,0,0,0.95)] text-balance">
            <span className="font-editorial italic font-bold text-[17px] sm:text-[18.5px] text-white">
              {lead}
            </span>
            {accent && (
              <>
                {' '}
                <span className="font-display font-extrabold text-[15.5px] sm:text-[17px] text-[#FDA4AF]">
                  {accent}
                </span>
              </>
            )}
          </h3>

          <div className="flex items-center justify-between gap-2 text-[10.5px] font-medium text-zinc-200/90 tabular-nums pt-0.5 border-t border-white/10">
            <span className="truncate text-zinc-200">{story.primaryCategory}</span>
            <span className="inline-flex items-center gap-1 shrink-0 text-white">
              <MessageSquare className="w-3 h-3 text-rose-300" />
              {story.chatCountLabel}
            </span>
          </div>
        </button>
      </div>

      {/* Crisp Below-Card Metadata */}
      <button
        type="button"
        onClick={() => onSelect(story)}
        className="mt-2.5 text-left space-y-0.5 focus:outline-none px-0.5"
      >
        <div className="flex items-center gap-1.5 text-[11.5px] text-zinc-600 dark:text-zinc-400 truncate tabular-nums">
          <span className="inline-flex items-center gap-0.5 font-semibold text-amber-500 dark:text-amber-400">
            <Star className="w-3 h-3 fill-amber-400" />
            {story.rating.toFixed(1)}
          </span>
          <span aria-hidden="true">·</span>
          <span>{story.characters.length} Cast</span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 leading-relaxed">
          {story.tagline}
        </p>
      </button>
    </article>
  );
});
