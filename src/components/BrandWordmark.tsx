import React from 'react';

interface BrandWordmarkProps {
  appName?: string;
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'auto' | 'light';
}

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  appName = 'LEADERS STORIES',
  logoUrl,
  size = 'md',
  tone = 'auto',
}) => {
  const words = (appName || 'LEADERS STORIES').trim().split(/\s+/);
  const firstPart = words.length > 1 ? words.slice(0, -1).join(' ') : words[0] || 'LEADERS';
  const lastPart = words.length > 1 ? words[words.length - 1] : '';

  const textSizeClass =
    size === 'lg'
      ? 'text-3xl sm:text-4xl'
      : size === 'sm'
      ? 'text-lg sm:text-xl'
      : 'text-xl sm:text-2xl';

  const firstColorClass =
    tone === 'light' ? 'text-white' : 'text-zinc-950 dark:text-white';

  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      {logoUrl && (
        <img
          src={logoUrl}
          alt={appName}
          className="w-7 h-7 rounded-lg object-cover border border-white/15 shrink-0"
        />
      )}
      <span className={`inline-flex items-baseline gap-1.5 leading-none ${textSizeClass}`}>
        <span
          className={`font-editorial italic font-bold tracking-tight ${firstColorClass}`}
        >
          {firstPart}
        </span>
        {lastPart && (
          <span
            className="font-display font-extrabold uppercase tracking-[0.14em] text-[0.68em] bg-gradient-to-r from-[#FF3355] via-[#E5233D] to-[#FB7185] bg-clip-text text-transparent"
          >
            {lastPart}
          </span>
        )}
      </span>
    </span>
  );
};
