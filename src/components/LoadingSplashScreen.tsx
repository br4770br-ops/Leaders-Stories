import React, { useState } from 'react';
import { BrandWordmark } from './BrandWordmark';
import { StoryImage } from './StoryImage';

interface SplashBackdropItem {
  url: string;
  caption: string;
}

const SPLASH_BACKDROPS: SplashBackdropItem[] = [
  { url: '/src/assets/images/yours_lavanya_oberoi_1795804146486.jpg', caption: 'Yours · Lavanya on Penthouse Balcony' },
  { url: '/src/assets/images/yours_alina_mirza_1795804206662.jpg', caption: 'Yours · Alina at Candlelit Bistro' },
  { url: '/src/assets/images/yours_shruti_menon_1795804224191.jpg', caption: 'Yours · Shruti on Kerala Backwaters' },
  { url: '/src/assets/images/yours_neha_kapoor_1795804147456.jpg', caption: 'Yours · Neha Beside Rainy Window' },
  { url: '/src/assets/images/yours_tania_sen_1795804147514.jpg', caption: 'Yours · Tania at Mumbai Sunset Lounge' },
  { url: '/src/assets/images/yours_misha_arora_1795804148017.jpg', caption: 'Yours · Misha by Goa Infinity Pool' },
  { url: '/src/assets/images/yours_samaira_chauhan_1795804225638.jpg', caption: 'Yours · Samaira After Midnight Gala' },
  { url: '/src/assets/images/yours_nandini_sharma_1795804226372.jpg', caption: 'Yours · Nandini Above Shimla Mist' },
  { url: '/src/assets/images/yours_curvy_tara_1795802889083.jpg', caption: 'Yours · Tara on Mumbai Penthouse' },
  { url: '/src/assets/images/yours_curvy_sana_1795802889136.jpg', caption: 'Yours · Sana at Midnight Lounge' },
  { url: '/src/assets/images/yours_curvy_diya_1795802889660.jpg', caption: 'Yours · Diya at Sunset Terrace' },
  { url: '/src/assets/images/yours_curvy_nisha_1795802891112.jpg', caption: 'Yours · Nisha in Candlelit Gallery' },
  { url: '/src/assets/images/yours_curvy_roshni_1795802891879.jpg', caption: 'Yours · Roshni on Marine Drive' },
  { url: '/src/assets/images/cover_coaching_wala_pyar_1795616638635.jpg', caption: 'Coaching Wala Pyar · Lucknow' },
  { url: '/src/assets/images/cover_train_to_shimla_1795801726836.jpg', caption: 'Train To Shimla · Snowfall Express' },
  { url: '/src/assets/images/yours_ananya_glam_1795804144027.jpg', caption: 'Yours · Ananya at Hazratganj Cafe' },
  { url: '/src/assets/images/yours_zoya_glam_1795804144673.jpg', caption: 'Yours · Zoya After Midnight Rain' },
  { url: '/src/assets/images/yours_kavya_glam_1795804144876.jpg', caption: 'Yours · Kavya in Courtyard Drizzle' },
  { url: '/src/assets/images/yours_rhea_glam_1795804144988.jpg', caption: 'Yours · Rhea Late-Night Stream' },
  { url: '/src/assets/images/yours_meera_glam_1795804145974.jpg', caption: 'Yours · Meera Under Jaipur Stars' },
  { url: '/src/assets/images/scene_campus_corridor_1795460773005.jpg', caption: "She Hates Me · St. Xavier's Campus" },
  { url: '/src/assets/images/cover_rajkumari_bodyguard_1795801727419.jpg', caption: 'Rajkumari Ka Bodyguard · Udaipur' },
  { url: '/src/assets/images/zoya_drift_portrait_1795516300100.jpg', caption: 'Neon Ronin · Neo-Tokyo 2099' },
  { url: '/src/assets/images/cover_navratri_raat_1795801729947.jpg', caption: 'Navratri Ki Woh Raat · Ahmedabad' },
  { url: '/src/assets/images/cover_billionaire_fiancee_1795801728106.jpg', caption: "Billionaire's Fake Fiancée · Mumbai" },
  { url: '/src/assets/images/cover_don_ki_beti_1795801748577.jpg', caption: 'Don Ki Beti Se Ishq · Goa Harbor' },
  { url: '/src/assets/images/cover_monsoon_coffee_1795801807207.jpg', caption: 'Monsoon Coffee House · Marine Drive' },
  { url: '/src/assets/images/alina_vampire_portrait_1795516147518.jpg', caption: 'Astral Academy · Dragon Bond' },
  { url: '/src/assets/images/cover_manali_trip_1795801806845.jpg', caption: 'Manali School Trip · Bonfire Night' },
  { url: '/src/assets/images/cover_mughal_darbar_1795801806603.jpg', caption: 'Mughal Darbar · Taj Ki Sazish' },
  { url: '/src/assets/images/cover_arranged_marriage_1795801806341.jpg', caption: 'Arranged Marriage · Jaipur Terrace' },
  { url: '/src/assets/images/cover_seoul_spotlight_1795801806662.jpg', caption: 'Seoul Spotlight · Backstage Heart' },
  { url: '/src/assets/images/cover_rooftop_afterparty_1795801806425.jpg', caption: 'Rooftop Afterparty 3AM · Pune' },
  { url: '/src/assets/images/cover_mahabharat_traveler_1795460761928.jpg', caption: 'Time Traveller in Mahabharat' },
  { url: '/src/assets/images/cover_mafia_queen_1795460848370.jpg', caption: 'Mafia Queen · Mumbai Velvet' },
  { url: '/src/assets/images/cover_shadow_vow_live_1795804228837.jpg', caption: 'Shadow Vow · Crimson Eclipse' },
];

const LAST_SPLASH_KEY = 'leaders_last_splash_idx';

function pickDifferentBackdrop(): SplashBackdropItem {
  try {
    const prevRaw = sessionStorage.getItem(LAST_SPLASH_KEY) || localStorage.getItem(LAST_SPLASH_KEY);
    const prevIdx = prevRaw !== null ? Number(prevRaw) : -1;
    let nextIdx = Math.floor(Math.random() * SPLASH_BACKDROPS.length);
    if (SPLASH_BACKDROPS.length > 1 && nextIdx === prevIdx) {
      nextIdx = (nextIdx + 1 + Math.floor(Math.random() * (SPLASH_BACKDROPS.length - 1))) % SPLASH_BACKDROPS.length;
    }
    sessionStorage.setItem(LAST_SPLASH_KEY, String(nextIdx));
    localStorage.setItem(LAST_SPLASH_KEY, String(nextIdx));
    return SPLASH_BACKDROPS[nextIdx];
  } catch {
    return SPLASH_BACKDROPS[Math.floor(Math.random() * SPLASH_BACKDROPS.length)];
  }
}

interface LoadingSplashScreenProps {
  appName?: string;
  logoUrl?: string;
  statusMessage?: string;
}

export const LoadingSplashScreen: React.FC<LoadingSplashScreenProps> = ({
  appName = 'LEADERS STORIES',
  logoUrl,
  statusMessage = 'Restoring your chats & stories...',
}) => {
  const [backdrop] = useState<SplashBackdropItem>(() => pickDifferentBackdrop());

  return (
    <div className="fixed inset-0 z-50 bg-[#07070A] text-white overflow-hidden select-none flex flex-col justify-between">
      {/* Full-bleed randomized artwork backdrop */}
      <div className="absolute inset-0 overflow-hidden">
        <StoryImage
          src={backdrop.url}
          alt={backdrop.caption}
          loading="eager"
          className="w-full h-full object-cover object-top contrast-[1.06] saturate-[1.08] animate-splash-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/30 to-[#07070A]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#07070A] via-[#07070A]/90 to-transparent" />
      </div>

      {/* Top Header: LEADERS STORIES + Loading Status */}
      <header className="relative z-10 pt-safe px-6 pt-10 sm:pt-12 flex flex-col items-center text-center space-y-3">
        <BrandWordmark appName={appName} logoUrl={logoUrl} size="lg" tone="light" />
        <div className="inline-flex items-center gap-2 text-xs font-medium text-zinc-200/90 tracking-wide">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-[#E5233D] border-t-transparent animate-spin" />
          <span>{statusMessage}</span>
        </div>
      </header>

      {/* Bottom Sleek Progress Bar & Scene Caption */}
      <footer className="relative z-10 pb-safe px-6 pb-10 sm:pb-12 max-w-md w-full mx-auto space-y-3 text-center">
        <p className="font-display text-sm font-semibold text-white/95 tracking-tight">
          {backdrop.caption}
        </p>
        <div className="h-1 w-full rounded-full bg-white/15 overflow-hidden">
          <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-[#E5233D] via-[#FB7185] to-[#2563EB] animate-splash-bar" />
        </div>
        <p className="text-[11px] font-medium text-zinc-400 tracking-wider uppercase">
          Interactive AI Roleplay · Unlimited Stories
        </p>
      </footer>
    </div>
  );
};
