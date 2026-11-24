import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Heart, MessageSquare, Share2, Star, Users } from 'lucide-react';
import type { StoryDefinition } from '../types/story';
import { FullscreenGalleryModal } from './FullscreenGalleryModal';
import { StoryImage } from './StoryImage';

interface StoryDetailModalProps {
  story: StoryDefinition;
  isFavorite: boolean;
  hasExistingChat: boolean;
  onBack: () => void;
  onToggleFavorite: (story: StoryDefinition) => void;
  onStartChat: (story: StoryDefinition) => void;
}

export const StoryDetailModal: React.FC<StoryDetailModalProps> = ({
  story,
  isFavorite,
  hasExistingChat,
  onBack,
  onToggleFavorite,
  onStartChat,
}) => {
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const mediaItems =
    story.mediaGallery.length > 0
      ? story.mediaGallery
      : [{ id: 'cover', url: story.coverImage, caption: story.title }];

  const handleShare = async () => {
    const shareText = `${story.title} — ${story.tagline}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: story.title, text: shareText, url: window.location.href });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
        setShareFeedback('Link copied');
        setTimeout(() => setShareFeedback(null), 2000);
      }
    } catch {
      // ignore cancelled share sheet
    }
  };

  return (
    <div className="min-h-dvh bg-[#0A0A0D] text-white pb-28">
      {/* Hero Cover */}
      <div className="relative w-full h-[46dvh] sm:h-[54dvh] max-h-[520px] bg-[#141419]">
        <button
          type="button"
          onClick={() => setGalleryIndex(0)}
          className="w-full h-full block focus:outline-none"
          aria-label="View cover image fullscreen"
        >
          <StoryImage
            src={story.coverImage}
            alt={story.title}
            fallbackTitle={story.title}
            loading="eager"
            className="w-full h-full object-cover object-top"
          />
        </button>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0D] via-[#0A0A0D]/20 to-black/55 pointer-events-none" />

        {/* Floating Top Controls */}
        <div className="fixed top-0 inset-x-0 z-30 max-w-4xl mx-auto px-4 pt-3 pt-safe flex items-center justify-between pointer-events-none">
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="pointer-events-auto min-w-[44px] min-h-[44px] rounded-full bg-black/55 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/75 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 pointer-events-auto">
            {shareFeedback && (
              <span className="px-3 py-1.5 rounded-full bg-black/80 text-xs text-white">
                {shareFeedback}
              </span>
            )}
            <button
              type="button"
              onClick={() => onToggleFavorite(story)}
              aria-label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
              className="min-w-[44px] min-h-[44px] rounded-full bg-black/55 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/75 transition"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#E5233D] text-[#E5233D]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share story"
              className="min-w-[44px] min-h-[44px] rounded-full bg-black/55 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/75 transition"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Details Sheet */}
      <main className="max-w-4xl mx-auto px-4 -mt-8 relative z-10 space-y-5">
        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {story.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-400">
            {story.tags.map((tag, idx) => (
              <React.Fragment key={tag}>
                {idx > 0 && <span aria-hidden="true">·</span>}
                <span>{tag}</span>
              </React.Fragment>
            ))}
            <span aria-hidden="true">·</span>
            <span className="text-zinc-500">{story.visualStyle}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 rounded-2xl bg-[#15151A] border border-white/[0.06] py-3.5 px-4">
          <div className="flex flex-col items-center justify-center border-r border-white/[0.08]">
            <div className="font-display text-lg font-bold text-white flex items-center gap-1.5 tabular-nums">
              <MessageSquare className="w-4 h-4 text-zinc-400" />
              {story.chatCountLabel}
            </div>
            <span className="text-xs text-zinc-400">Chats</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="font-display text-lg font-bold text-white flex items-center gap-1.5 tabular-nums">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {story.rating.toFixed(1)}
            </div>
            <span className="text-xs text-zinc-400">Rating</span>
          </div>
        </div>

        {/* About Section */}
        <section className="rounded-2xl bg-[#15151A] border border-white/[0.06] p-4 sm:p-5 space-y-2.5">
          <h2 className="font-display text-base font-bold text-white">About</h2>
          <p className="text-sm font-medium text-zinc-200">{story.tagline}</p>
          <p className="text-sm text-zinc-400 leading-relaxed">{story.about}</p>
          <p className="text-xs text-zinc-500 pt-1">
            Setting: <span className="text-zinc-300">{story.setting}</span>
          </p>
        </section>

        {/* Characters Section */}
        <section className="rounded-2xl bg-[#15151A] border border-white/[0.06] p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#E5233D]" />
              Characters ({story.characters.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {story.characters.map((char) => (
              <div
                key={char.id}
                className="flex gap-3.5 p-3 rounded-xl bg-[#101014] border border-white/[0.05]"
              >
                <StoryImage
                  src={char.portrait}
                  alt={char.name}
                  className="w-16 h-20 rounded-xl object-cover object-top shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-display text-sm font-bold text-white truncate">
                      {char.name}
                    </h3>
                    {char.age && (
                      <span className="text-[11px] text-zinc-400 shrink-0">Age {char.age}</span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-[#F43F5E]">{char.role}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {char.personality}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    With you: <span className="text-zinc-300">{char.relationshipToUser}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Media Library Section */}
        <section className="rounded-2xl bg-[#15151A] border border-white/[0.06] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-white">
              Media Library ({mediaItems.length})
            </h2>
            <button
              type="button"
              onClick={() => setGalleryIndex(0)}
              className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1"
            >
              Fullscreen <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {mediaItems.map((media, idx) => (
              <button
                key={media.id}
                type="button"
                onClick={() => setGalleryIndex(idx)}
                className="aspect-[3/4] rounded-xl overflow-hidden bg-[#101014] group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5233D]"
              >
                <StoryImage
                  src={media.url}
                  alt={media.caption}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-200"
                />
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Fixed Bottom Chat Now CTA */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-gradient-to-t from-[#0A0A0D] via-[#0A0A0D]/95 to-transparent pt-5 pb-4 pb-safe px-4">
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => onStartChat(story)}
            className="w-full min-h-[52px] rounded-full bg-white hover:bg-zinc-100 text-[#0A0A0D] font-display text-base font-bold shadow-xl active:scale-[0.99] transition"
          >
            {hasExistingChat ? 'Continue Story' : 'Chat now'}
          </button>
        </div>
      </div>

      <FullscreenGalleryModal
        items={mediaItems}
        activeIndex={galleryIndex}
        onClose={() => setGalleryIndex(null)}
        onChangeIndex={(idx) => setGalleryIndex(idx)}
      />
    </div>
  );
};
