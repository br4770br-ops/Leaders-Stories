import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { StoryMediaFraming } from '../types/story';

const FRAMING_CLASSES: Record<StoryMediaFraming, string> = {
  editorial: 'object-cover object-top contrast-[1.04] saturate-[1.06]',
  closeup: 'object-cover object-top scale-[1.24] origin-top contrast-[1.07] saturate-[1.08]',
  warm: 'object-cover object-[50%_12%] scale-[1.12] origin-top brightness-[1.04] contrast-[1.08] saturate-[1.18] sepia-[0.08]',
  sapphire: 'object-cover object-[50%_18%] scale-[1.16] origin-[50%_15%] brightness-[0.95] contrast-[1.12] saturate-[1.03] hue-rotate-[-6deg]',
};

interface StoryImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  loading?: 'lazy' | 'eager';
  framing?: StoryMediaFraming;
}

export const StoryImage: React.FC<StoryImageProps> = React.memo(({
  src,
  alt,
  className = '',
  fallbackTitle,
  loading = 'lazy',
  framing,
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#1C141A] via-[#121216] to-[#0A0A0D] text-zinc-400 p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <BookOpen className="w-7 h-7 text-[#E5233D]/70 mb-2 shrink-0" />
        {fallbackTitle && (
          <span className="font-display text-xs font-semibold text-zinc-200 line-clamp-2">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  const framingClass = framing ? FRAMING_CLASSES[framing] : '';

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${className} ${framingClass}`.trim()}
    />
  );
});
