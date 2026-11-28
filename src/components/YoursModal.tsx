import React, { useMemo, useState } from 'react';
import { ArrowLeft, Expand, Heart, MessageCircle, Sparkles, Star } from 'lucide-react';
import type { StoryDefinition } from '../types/story';
import { PortraitLightboxModal, type PortraitLightboxItem } from './PortraitLightboxModal';
import { StoryImage } from './StoryImage';

interface YoursModalProps {
  companions: StoryDefinition[];
  favoriteIds: Set<string>;
  activeChatIds: Set<string>;
  onClose: () => void;
  onStartChat: (companion: StoryDefinition) => void;
  onToggleFavorite: (companion: StoryDefinition) => void;
}

export const YoursModal: React.FC<YoursModalProps> = ({
  companions,
  favoriteIds,
  activeChatIds,
  onClose,
  onStartChat,
  onToggleFavorite,
}) => {
  const [portraitIndex, setPortraitIndex] = useState<number | null>(null);

  const lightboxItems: PortraitLightboxItem[] = useMemo(
    () =>
      companions.map((girl) => {
        const primaryChar = girl.characters[0];
        const hasChat = activeChatIds.has(girl.id);
        return {
          character: primaryChar || {
            id: girl.id,
            name: girl.title,
            gender: 'Female',
            role: girl.companionMood || 'Private Companion',
            personality: girl.about,
            speakingStyle: 'Intimate Hinglish',
            relationshipToUser: girl.tagline,
            portrait: girl.coverImage,
            accentColor: '#38BDF8',
          },
          subtitle: girl.companionMood || girl.primaryCategory,
          ctaLabel: hasChat ? `Continue with ${girl.title.split(' ')[0]}` : `Chat 1-on-1 with ${girl.title.split(' ')[0]}`,
          onCtaClick: () => onStartChat(girl),
          gallery: girl.mediaGallery,
        };
      }),
    [companions, activeChatIds, onStartChat]
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#050812] text-white overflow-y-auto touch-scroll">
      {/* Subtle Classic Sapphire Backdrop */}
      <div
        className="pointer-events-none fixed inset-0 opacity-75"
        style={{
          background:
            'radial-gradient(circle at 20% 0%, rgba(29, 78, 216, 0.24), transparent 48%), radial-gradient(circle at 85% 20%, rgba(14, 165, 233, 0.12), transparent 46%)',
        }}
      />

      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-[#050812]/92 backdrop-blur-xl border-b border-sky-300/15 pt-safe">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Back to stories"
              className="relative z-10 min-w-[44px] min-h-[44px] rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-sky-300/30 flex items-center justify-center text-white cursor-pointer active:scale-95 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 fill-[#38BDF8] text-[#38BDF8]" />
                <h1 className="font-editorial italic text-2xl font-bold tracking-tight text-white">
                  Yours
                </h1>
              </div>
              <p className="text-xs text-sky-200/75">
                Private 1-on-1 companions — tap any photo to view fullscreen
              </p>
            </div>
          </div>

          <span className="text-xs font-medium text-sky-200/80 hidden sm:inline">
            1-on-1 Private Suite
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-6 pb-20 space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#0A1733]/95 via-[#0B1328]/95 to-[#090E1E]/95 border border-sky-300/20 p-5 flex items-start gap-3.5 shadow-[0_14px_34px_rgba(2,10,30,0.5)]">
          <div className="w-10 h-10 rounded-2xl bg-[#1D4ED8]/25 border border-sky-300/25 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-sky-300" />
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-base font-bold text-white">
              Exclusive 1-on-1 Conversations
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Just you and her — zero crowd, zero extra characters. Choose who you want to talk to tonight, view her portrait fullscreen, and enjoy a private sapphire chat with her.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {companions.map((girl, idx) => {
            const isFav = favoriteIds.has(girl.id);
            const hasChat = activeChatIds.has(girl.id);
            const primaryChar = girl.characters[0];

            return (
              <article
                key={girl.id}
                className="group rounded-3xl overflow-hidden bg-[#0A1020] border border-sky-300/20 hover:border-sky-300/45 shadow-[0_14px_34px_rgba(2,8,24,0.55)] transition flex flex-col"
              >
                {/* Full-bleed Portrait Header (Clickable to Fullscreen Lightbox) */}
                <div className="relative aspect-[3/4] w-full bg-[#070B16] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPortraitIndex(idx)}
                    aria-label={`View ${girl.title} portrait fullscreen`}
                    className="w-full h-full block text-left focus:outline-none"
                  >
                    <StoryImage
                      src={girl.coverImage}
                      alt={girl.title}
                      fallbackTitle={girl.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-top contrast-[1.04] saturate-[1.06] transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1020] via-[#0A1020]/30 to-black/25 pointer-events-none" />
                  </button>

                  <div className="absolute top-3 left-3 pointer-events-none px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-[10px] font-medium text-white/90 inline-flex items-center gap-1">
                    <Expand className="w-3 h-3 text-sky-300" />
                    Tap Photo{girl.mediaGallery.length > 1 ? ` · ${girl.mediaGallery.length} Photos` : ''}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(girl);
                    }}
                    aria-label={isFav ? `Remove ${girl.title} from favorites` : `Save ${girl.title} to favorites`}
                    className="absolute top-3 right-3 min-w-[42px] min-h-[42px] rounded-full bg-black/55 backdrop-blur-md border border-sky-300/25 flex items-center justify-center text-white hover:bg-black/80 transition"
                  >
                    <Heart className={`w-5 h-5 ${isFav ? 'fill-[#38BDF8] text-[#38BDF8]' : 'text-white'}`} />
                  </button>

                  <div className="absolute bottom-3.5 inset-x-4 space-y-1 pointer-events-none">
                    <div className="flex items-center justify-between gap-2 text-xs text-sky-300 font-medium">
                      <span className="truncate">{girl.companionMood || primaryChar?.role}</span>
                      <span className="inline-flex items-center gap-1 text-amber-300 tabular-nums shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {girl.rating.toFixed(1)} · {girl.chatCountLabel}
                      </span>
                    </div>
                    <h2 className="font-editorial italic text-2xl font-bold text-white tracking-tight drop-shadow">
                      {girl.title}
                      {primaryChar?.age && (
                        <span className="font-display not-italic text-sm font-semibold text-sky-200/85 ml-2">
                          {primaryChar.age}
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-zinc-200 line-clamp-2">{girl.tagline}</p>
                  </div>
                </div>

                {/* Personality Details & CTA */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed line-clamp-3">
                      {girl.about}
                    </p>

                    {girl.companionTraits && girl.companionTraits.length > 0 && (
                      <ul className="space-y-1.5 pt-0.5">
                        {girl.companionTraits.map((trait, tIdx) => (
                          <li
                            key={tIdx}
                            className="text-xs text-sky-100/85 flex items-center gap-2"
                          >
                            <span className="w-1 h-1 rounded-full bg-sky-400 shrink-0" />
                            <span className="line-clamp-1">{trait}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onStartChat(girl)}
                    className="w-full min-h-[46px] rounded-2xl bg-gradient-to-r from-[#1E40AF] to-[#0284C7] hover:brightness-110 border border-sky-300/25 text-white font-display text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/35 active:scale-[0.98] transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {hasChat ? `Continue 1-on-1 with ${girl.title.split(' ')[0]}` : `Chat With ${girl.title.split(' ')[0]}`}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <PortraitLightboxModal
        items={lightboxItems}
        activeIndex={portraitIndex}
        onClose={() => setPortraitIndex(null)}
        onChangeIndex={(idx) => setPortraitIndex(idx)}
      />
    </div>
  );
};
