import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react';
import type { StoryCharacter, StoryMediaItem } from '../types/story';
import { StoryImage } from './StoryImage';

export interface PortraitLightboxItem {
  character: StoryCharacter;
  subtitle?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  gallery?: StoryMediaItem[];
}

interface PortraitLightboxModalProps {
  items: PortraitLightboxItem[];
  activeIndex: number | null;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

export const PortraitLightboxModal: React.FC<PortraitLightboxModalProps> = ({
  items,
  activeIndex,
  onClose,
  onChangeIndex,
}) => {
  const isOpen = activeIndex !== null && items.length > 0;
  const safeIndex =
    activeIndex !== null ? Math.max(0, Math.min(activeIndex, items.length - 1)) : 0;
  const [lookIndex, setLookIndex] = useState(0);

  useEffect(() => {
    setLookIndex(0);
  }, [safeIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && safeIndex < items.length - 1) onChangeIndex(safeIndex + 1);
      if (e.key === 'ArrowLeft' && safeIndex > 0) onChangeIndex(safeIndex - 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, safeIndex, items.length, onClose, onChangeIndex]);

  if (!isOpen) return null;

  const current = items[safeIndex];
  const char = current.character;
  const accent = char.accentColor || '#FB7185';
  const gallery = current.gallery && current.gallery.length > 0 ? current.gallery : null;
  const activeLook = gallery ? gallery[Math.min(lookIndex, gallery.length - 1)] : null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/92 backdrop-blur-xl flex flex-col justify-between select-none overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`${char.name} Portrait Viewer`}
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 pt-safe bg-gradient-to-b from-black/80 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}` }}
          />
          <span className="text-xs font-semibold text-zinc-200 tabular-nums">
            {items.length > 1 ? `Companion ${safeIndex + 1} / ${items.length}` : 'Character Portrait'}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close character portrait"
          className="min-w-[44px] min-h-[44px] rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Centered Portrait + Details Card */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-4 pb-6 max-w-xl w-full mx-auto space-y-3.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full flex items-center justify-center">
          {safeIndex > 0 && (
            <button
              type="button"
              onClick={() => onChangeIndex(safeIndex - 1)}
              aria-label="Previous character"
              className="absolute left-0 sm:-left-4 z-10 min-w-[42px] min-h-[42px] rounded-full bg-black/75 border border-white/20 flex items-center justify-center text-white hover:bg-black transition shadow-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div
            className="rounded-3xl p-[2.5px] shadow-2xl overflow-hidden max-w-sm w-full"
            style={{
              background: `linear-gradient(135deg, ${accent}, #38BDF8, #FB7185)`,
              boxShadow: `0 20px 55px ${accent}38`,
            }}
          >
            <div className="rounded-[22px] overflow-hidden bg-[#0D0E14]">
              <StoryImage
                src={activeLook?.url || char.portrait}
                alt={activeLook?.caption || char.name}
                fallbackTitle={char.name}
                loading="eager"
                framing={activeLook?.framing}
                className="w-full max-h-[50dvh] aspect-[3/4] object-cover object-top transition-all duration-300"
              />
            </div>
          </div>

          {safeIndex < items.length - 1 && (
            <button
              type="button"
              onClick={() => onChangeIndex(safeIndex + 1)}
              aria-label="Next character"
              className="absolute right-0 sm:-right-4 z-10 min-w-[42px] min-h-[42px] rounded-full bg-black/75 border border-white/20 flex items-center justify-center text-white hover:bg-black transition shadow-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Same-Face Multi-Look Switcher Strip */}
        {gallery && gallery.length > 1 && (
          <div className="w-full flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-2">
              {gallery.map((g, gIdx) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setLookIndex(gIdx)}
                  className={`w-12 h-14 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    gIdx === lookIndex
                      ? 'border-sky-400 scale-105 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                      : 'border-white/15 opacity-60 hover:opacity-95'
                  }`}
                >
                  <StoryImage
                    src={g.url}
                    alt={g.caption}
                    framing={g.framing}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
            {activeLook?.caption && (
              <p className="text-[11.5px] text-sky-200/90 text-center max-w-sm leading-snug">
                {activeLook.caption}
              </p>
            )}
          </div>
        )}

        {/* Character Dossier Card with Colored Border */}
        <div
          className="w-full rounded-2xl bg-[#12131A]/95 p-4 sm:p-5 space-y-2.5 border-[1.5px] shadow-2xl"
          style={{ borderColor: `${accent}80` }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="font-editorial italic text-2xl font-bold text-white leading-tight">
                {char.name}
              </h2>
              <p className="text-xs font-semibold mt-0.5" style={{ color: accent }}>
                {char.role}
                {current.subtitle ? ` · ${current.subtitle}` : ''}
              </p>
            </div>
            {(char.age || char.gender) && (
              <div className="text-xs font-semibold text-zinc-300 tabular-nums shrink-0">
                {[char.gender, char.age ? `Age ${char.age}` : ''].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>

          {char.personality && (
            <p className="text-xs sm:text-[13px] text-zinc-200 leading-relaxed">
              <span className="font-semibold text-zinc-400">Personality: </span>
              {char.personality}
            </p>
          )}

          {char.speakingStyle && (
            <p className="text-xs text-zinc-300 leading-relaxed">
              <span className="font-semibold text-zinc-400">Speaking Style: </span>
              {char.speakingStyle}
            </p>
          )}

          {char.relationshipToUser && (
            <p className="text-xs text-sky-200/95 leading-relaxed">
              <span className="font-semibold text-sky-400">With You: </span>
              {char.relationshipToUser}
            </p>
          )}

          {current.onCtaClick && (
            <button
              type="button"
              onClick={() => {
                const action = current.onCtaClick;
                onClose();
                action?.();
              }}
              className="w-full min-h-[44px] mt-1 rounded-xl bg-gradient-to-r from-[#E5233D] to-[#2563EB] hover:brightness-110 text-white font-display text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-lg transition"
            >
              <Sparkles className="w-4 h-4" />
              {current.ctaLabel || 'Open Story'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
