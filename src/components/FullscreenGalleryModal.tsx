import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { StoryMediaFraming } from '../types/story';
import { StoryImage } from './StoryImage';

interface MediaItem {
  id: string;
  url: string;
  caption: string;
  framing?: StoryMediaFraming;
}

interface FullscreenGalleryModalProps {
  items: MediaItem[];
  activeIndex: number | null;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

export const FullscreenGalleryModal: React.FC<FullscreenGalleryModalProps> = ({
  items,
  activeIndex,
  onClose,
  onChangeIndex,
}) => {
  const isOpen = activeIndex !== null && items.length > 0;
  const safeIndex = activeIndex !== null ? Math.max(0, Math.min(activeIndex, items.length - 1)) : 0;

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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Story Media Viewer"
    >
      <div className="flex items-center justify-between px-4 py-3 pt-safe">
        <span className="text-xs font-medium text-zinc-400 tabular-nums">
          {safeIndex + 1} / {items.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close media viewer"
          className="min-w-[44px] min-h-[44px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative flex-1 flex items-center justify-center px-3 sm:px-12 overflow-hidden">
        {safeIndex > 0 && (
          <button
            type="button"
            onClick={() => onChangeIndex(safeIndex - 1)}
            aria-label="Previous image"
            className="absolute left-3 z-10 min-w-[44px] min-h-[44px] rounded-full bg-black/60 border border-white/15 flex items-center justify-center text-white hover:bg-black/80 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div className="max-w-3xl max-h-[78dvh] w-full flex items-center justify-center">
          {current.framing ? (
            <div className="aspect-[3/4] h-[72dvh] max-h-[76dvh] max-w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <StoryImage
                src={current.url}
                alt={current.caption}
                fallbackTitle={current.caption}
                loading="eager"
                framing={current.framing}
                className="w-full h-full"
              />
            </div>
          ) : (
            <StoryImage
              src={current.url}
              alt={current.caption}
              fallbackTitle={current.caption}
              loading="eager"
              className="max-h-[76dvh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
          )}
        </div>

        {safeIndex < items.length - 1 && (
          <button
            type="button"
            onClick={() => onChangeIndex(safeIndex + 1)}
            aria-label="Next image"
            className="absolute right-3 z-10 min-w-[44px] min-h-[44px] rounded-full bg-black/60 border border-white/15 flex items-center justify-center text-white hover:bg-black/80 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="px-6 py-4 pb-safe text-center space-y-3">
        <p className="text-sm text-zinc-200">{current.caption}</p>
        {items.length > 1 && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
            {items.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeIndex(idx)}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                  idx === safeIndex ? 'border-[#E5233D] scale-105' : 'border-transparent opacity-55 hover:opacity-90'
                }`}
              >
                <StoryImage
                  src={item.url}
                  alt={item.caption}
                  framing={item.framing}
                  className="w-full h-full object-cover object-top"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
