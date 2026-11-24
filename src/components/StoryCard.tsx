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

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  isFavorite,
  onSelect,
  onToggleFavorite,
  rankNumber,
}) => {
  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#15151A] shadow-lg">
        <button
          type="button"
          onClick={() => onSelect(story)}
          className="w-full h-full block text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5233D]"
          aria-label={`Open story ${story.title}`}
        >
          <StoryImage
            src={story.coverImage}
            alt={story.title}
            fallbackTitle={story.title}
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />
        </button>

        {/* Favourite button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(story);
          }}
          aria-label={isFavorite ? `Remove ${story.title} from favourites` : `Save ${story.title} to favourites`}
          className="absolute top-2 right-2 min-w-[40px] min-h-[40px] rounded-full bg-black/55 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/75 transition active:scale-95"
        >
          <Heart
            className={`w-4 h-4 transition ${
              isFavorite ? 'fill-[#E5233D] text-[#E5233D]' : 'text-white/90'
            }`}
          />
        </button>

        {/* Chat count bottom right */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-lg bg-black/65 backdrop-blur-sm text-[11px] font-medium text-zinc-100 flex items-center gap-1 pointer-events-none tabular-nums">
          <MessageSquare className="w-3 h-3 text-zinc-300" />
          <span>{story.chatCountLabel}</span>
        </div>

        {/* Optional Top 50 Rank */}
        {typeof rankNumber === 'number' && (
          <div className="absolute bottom-2 left-2.5 w-8 h-8 rounded-full bg-black/75 border border-[#E5233D]/60 flex items-center justify-center font-display text-sm font-extrabold text-[#E5233D] shadow-md pointer-events-none tabular-nums">
            {rankNumber}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onSelect(story)}
        className="mt-2.5 text-left space-y-1 focus:outline-none"
      >
        <h3 className="font-display text-[15px] font-semibold text-white leading-snug line-clamp-1 group-hover:text-[#F43F5E] transition-colors">
          {story.title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate">
          <span>Roleplay</span>
          <span aria-hidden="true">·</span>
          <span>{story.primaryCategory}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-0.5 text-amber-400 tabular-nums">
            <Star className="w-3 h-3 fill-amber-400" />
            {story.rating.toFixed(1)}
          </span>
        </div>
        <p className="text-xs text-zinc-500 line-clamp-1 leading-relaxed">{story.tagline}</p>
      </button>
    </article>
  );
};
