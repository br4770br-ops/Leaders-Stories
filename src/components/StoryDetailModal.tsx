import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Heart, MessageSquare, Share2, Star, Trash2, UserPlus, Users } from 'lucide-react';
import type { StoryCharacter, StoryDefinition } from '../types/story';
import { AddCharacterModal } from './AddCharacterModal';
import { FullscreenGalleryModal } from './FullscreenGalleryModal';
import { PortraitLightboxModal, type PortraitLightboxItem } from './PortraitLightboxModal';
import { StoryImage } from './StoryImage';

interface StoryDetailModalProps {
  story: StoryDefinition;
  isFavorite: boolean;
  hasExistingChat: boolean;
  onBack: () => void;
  onToggleFavorite: (story: StoryDefinition) => void;
  onStartChat: (story: StoryDefinition) => void;
  onAddCharacter: (storyId: string, character: Omit<StoryCharacter, 'id' | 'isCustom'>) => void;
  onRemoveCharacter: (storyId: string, characterId: string) => void;
}

export const StoryDetailModal: React.FC<StoryDetailModalProps> = ({
  story,
  isFavorite,
  hasExistingChat,
  onBack,
  onToggleFavorite,
  onStartChat,
  onAddCharacter,
  onRemoveCharacter,
}) => {
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [portraitIndex, setPortraitIndex] = useState<number | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [addCharOpen, setAddCharOpen] = useState(false);

  const isYours = Boolean(story.isYoursCompanion);
  const displayCharacters = isYours ? story.characters.slice(0, 1) : story.characters;

  const mediaItems =
    story.mediaGallery.length > 0
      ? story.mediaGallery
      : [{ id: 'cover', url: story.coverImage, caption: story.title }];

  const portraitItems: PortraitLightboxItem[] = displayCharacters.map((char) => ({
    character: char,
    subtitle: story.title,
  }));

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
    <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)] pb-28">
      {/* Hero Cover */}
      <div
        className={`relative w-full h-[50dvh] sm:h-[58dvh] max-h-[540px] bg-[#101016] border-b ${
          isYours ? 'border-sky-400/20' : 'border-zinc-200/80 dark:border-white/[0.08]'
        }`}
      >
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
            className="w-full h-full object-cover object-top contrast-[1.06] saturate-[1.08]"
          />
        </button>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-canvas)] via-[#0A0A0D]/35 to-black/55 pointer-events-none" />

        {/* Stylized Title Overlaid on Cover Photo */}
        <div className="absolute bottom-8 inset-x-0 max-w-4xl mx-auto px-4 pointer-events-none">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FB7185] drop-shadow mb-1">
            {story.primaryCategory}
          </p>
          <h1 className="font-editorial italic text-3xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.9)] text-balance">
            {story.title}
          </h1>
        </div>

        {/* Floating Top Controls */}
        <div className="fixed top-0 inset-x-0 z-30 max-w-4xl mx-auto px-4 pt-3 pt-safe flex items-center justify-between pointer-events-none">
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="pointer-events-auto min-w-[44px] min-h-[44px] rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 pointer-events-auto">
            {shareFeedback && (
              <span className="px-3 py-1.5 rounded-full bg-black/80 border border-white/20 text-xs text-white">
                {shareFeedback}
              </span>
            )}
            <button
              type="button"
              onClick={() => onToggleFavorite(story)}
              aria-label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
              className="min-w-[44px] min-h-[44px] rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#E5233D] text-[#E5233D]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share story"
              className="min-w-[44px] min-h-[44px] rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Details Sheet */}
      <main className="max-w-4xl mx-auto px-4 -mt-4 relative z-10 space-y-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
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
        <div className="grid grid-cols-2 rounded-2xl bg-white dark:bg-[#15151A] border border-zinc-200/85 dark:border-white/[0.09] py-3.5 px-4 shadow-sm dark:shadow-[0_10px_28px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col items-center justify-center border-r border-zinc-200 dark:border-white/[0.08]">
            <div className="font-display text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-1.5 tabular-nums">
              <MessageSquare className={`w-4 h-4 ${isYours ? 'text-sky-400' : 'text-rose-500'}`} />
              {story.chatCountLabel}
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Chats</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="font-display text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-1.5 tabular-nums">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {story.rating.toFixed(1)}
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Rating</span>
          </div>
        </div>

        {/* About Section */}
        <section className="rounded-2xl bg-white dark:bg-[#15151A] border border-zinc-200/85 dark:border-white/[0.09] p-4 sm:p-5 space-y-2.5 shadow-sm dark:shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
          <h2 className="font-display text-base font-bold text-zinc-950 dark:text-white">About</h2>
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{story.tagline}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{story.about}</p>
          <p className="text-xs text-zinc-500 pt-1">
            Setting: <span className="text-zinc-700 dark:text-zinc-300">{story.setting}</span>
          </p>
        </section>

        {/* Characters Section */}
        <section className="rounded-2xl bg-white dark:bg-[#15151A] border border-zinc-200/85 dark:border-white/[0.09] p-4 sm:p-5 space-y-4 shadow-sm dark:shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <Users className={`w-4 h-4 ${isYours ? 'text-sky-400' : 'text-zinc-500 dark:text-zinc-300'}`} />
                {isYours ? 'Private 1-on-1 Companion' : `Characters (${displayCharacters.length})`}
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Tap portrait to view fullscreen & traits
              </p>
            </div>
            {!isYours && (
              <button
                type="button"
                onClick={() => setAddCharOpen(true)}
                className="min-h-[38px] px-3.5 rounded-xl bg-zinc-100 dark:bg-white/[0.06] border border-zinc-300 dark:border-white/[0.14] hover:border-rose-400/60 text-zinc-800 dark:text-zinc-200 text-xs font-semibold inline-flex items-center gap-1.5 transition shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5 text-rose-400" />
                Add Character
              </button>
            )}
          </div>
          <div className={`grid grid-cols-1 ${displayCharacters.length > 1 ? 'sm:grid-cols-2' : ''} gap-3.5`}>
            {displayCharacters.map((char, idx) => {
              const accent = isYours ? '#38BDF8' : char.accentColor || '#FDA4AF';
              return (
                <div
                  key={char.id}
                  className="relative rounded-xl bg-zinc-50 dark:bg-[#101118] border border-zinc-200/85 dark:border-white/[0.10] hover:border-zinc-300 dark:hover:border-white/25 transition shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setPortraitIndex(idx)}
                    aria-label={`View ${char.name} portrait fullscreen`}
                    className="w-full flex gap-3.5 p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-xl"
                  >
                    <StoryImage
                      src={char.portrait}
                      alt={char.name}
                      className="w-16 h-20 rounded-xl object-cover object-top shrink-0 border border-white/10"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-baseline gap-2 pr-6">
                        <h3 className="font-display text-sm font-bold text-zinc-950 dark:text-white truncate">
                          {char.name}
                        </h3>
                        {char.age && (
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0">
                            Age {char.age}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold truncate" style={{ color: accent }}>
                        {char.role}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                        {char.personality}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate">
                        With you: <span className="text-zinc-700 dark:text-zinc-300">{char.relationshipToUser}</span>
                      </p>
                    </div>
                  </button>
                  {!isYours && char.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveCharacter(story.id, char.id);
                      }}
                      aria-label={`Remove ${char.name}`}
                      title="Remove custom character"
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-red-500/15 border border-red-400/35 hover:bg-red-500/25 text-red-500 flex items-center justify-center transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Media Library Section */}
        <section className="rounded-2xl bg-white dark:bg-[#15151A] border border-zinc-200/85 dark:border-white/[0.09] p-4 sm:p-5 space-y-3 shadow-sm dark:shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-zinc-950 dark:text-white">
              Media Library ({mediaItems.length})
            </h2>
            <button
              type="button"
              onClick={() => setGalleryIndex(0)}
              className={`text-xs font-semibold hover:opacity-80 inline-flex items-center gap-1 ${
                isYours ? 'text-sky-500 dark:text-sky-300' : 'text-zinc-600 dark:text-zinc-300'
              }`}
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
                className="aspect-[3/4] rounded-xl overflow-hidden bg-zinc-100 dark:bg-[#101014] border border-zinc-200/80 dark:border-white/[0.10] hover:border-zinc-400 dark:hover:border-white/30 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)] transition"
              >
                <StoryImage
                  src={media.url}
                  alt={media.caption}
                  framing={media.framing}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-200"
                />
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Fixed Bottom Chat Now CTA */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-gradient-to-t from-[var(--bg-canvas)] via-[var(--bg-canvas)]/95 to-transparent pt-5 pb-4 pb-safe px-4">
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => onStartChat(story)}
            className={`w-full min-h-[52px] rounded-full hover:brightness-110 text-white font-display text-base font-bold border border-white/15 active:scale-[0.99] transition ${
              isYours
                ? 'bg-gradient-to-r from-[#1E40AF] to-[#0284C7] shadow-[0_12px_30px_rgba(30,64,175,0.38)]'
                : 'bg-gradient-to-r from-[#BE123C] to-[#E11D48] shadow-[0_12px_30px_rgba(190,18,60,0.32)]'
            }`}
          >
            {isYours
              ? hasExistingChat
                ? 'Continue 1-on-1 Chat'
                : 'Chat 1-on-1 Now'
              : hasExistingChat
                ? 'Continue Story'
                : 'Chat now'}
          </button>
        </div>
      </div>

      <FullscreenGalleryModal
        items={mediaItems}
        activeIndex={galleryIndex}
        onClose={() => setGalleryIndex(null)}
        onChangeIndex={(idx) => setGalleryIndex(idx)}
      />

      <PortraitLightboxModal
        items={portraitItems}
        activeIndex={portraitIndex}
        onClose={() => setPortraitIndex(null)}
        onChangeIndex={(idx) => setPortraitIndex(idx)}
      />

      {!isYours && addCharOpen && (
        <AddCharacterModal
          storyTitle={story.title}
          storySetting={story.setting}
          onClose={() => setAddCharOpen(false)}
          onAdd={(char) => onAddCharacter(story.id, char)}
        />
      )}
    </div>
  );
};
