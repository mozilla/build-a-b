/**
 * Asset Preloader Component
 *
 * Intelligently preloads all game assets with priority-based loading.
 * Critical assets (billionaire avatars for selection screen) load first,
 * followed by backgrounds, then card assets.
 *
 * Priority Strategy:
 * 1. CRITICAL: Assets needed for first interaction (welcome, billionaire selection)
 * 2. HIGH: Assets for intro/setup screens (all backgrounds, night sky)
 * 3. MEDIUM: Gameplay assets (all cards)
 * 4. LOW: Optional/rare assets
 */

import { BILLIONAIRES } from '@/config/billionaires';
import { CARD_BACK_IMAGE, DEFAULT_GAME_CONFIG } from '@/config/game-config';
import { useAssetPreloader, type AssetPreloadPriority } from '@/hooks/use-asset-preloader';
import { useMemo, type FC } from 'react';

// Import background images for preloading
import blueGridBg from '@/assets/backgrounds/color_blue.webp';
import chazBg from '@/assets/backgrounds/color_chaz.webp';
import chloeBg from '@/assets/backgrounds/color_chloe2.webp';
import feltBg from '@/assets/backgrounds/color_felt.webp';
import nebulaBg from '@/assets/backgrounds/color_nebula.webp';
import nightskyBg from '@/assets/backgrounds/color_nightsky.webp';
import poindexterBg from '@/assets/backgrounds/color_poindexter.webp';
import prudenceBg from '@/assets/backgrounds/color_prudence.webp';
import savannahBg from '@/assets/backgrounds/color_savannah.webp';
import walterBg from '@/assets/backgrounds/color_walter.webp';

interface AssetPreloaderProps {
  /**
   * Whether to enable preloading
   * @default true
   */
  enabled?: boolean;

  /**
   * Delay between loading each asset (ms)
   * Lower = faster but may overwhelm slow connections
   * Higher = slower but more reliable on slow connections
   * @default 50
   */
  batchDelay?: number;
}

export type { AssetPreloaderProps };

/**
 * AssetPreloader Component
 *
 * Automatically preloads all game assets in priority order.
 * This component renders nothing but triggers background asset preloading.
 *
 * @example
 * <AssetPreloader />
 */
export const AssetPreloader: FC<AssetPreloaderProps> = ({ enabled = true, batchDelay = 50 }) => {
  // Organize assets by priority based on user journey
  const assets: AssetPreloadPriority = useMemo(() => {
    // CRITICAL: Assets for first screens (welcome, select billionaire)
    // User sees these within seconds of loading the app
    const critical = [
      // All billionaire avatars (needed for selection screen)
      ...BILLIONAIRES.map((b) => b.imageSrc),
      // Night sky background (welcome screen)
      nightskyBg,
    ];

    // HIGH: Assets for intro/setup screens
    // User sees these after billionaire selection (intro, mission, vs animation)
    const high = [
      // All background options (for selection screen + gameplay)
      chazBg,
      chloeBg,
      feltBg,
      nebulaBg,
      poindexterBg,
      prudenceBg,
      savannahBg,
      walterBg,
      blueGridBg,
    ];

    // MEDIUM: Gameplay assets (cards)
    // User sees these during actual gameplay
    const medium = [
      // Card back (shown on deck pile and face-down cards)
      CARD_BACK_IMAGE,
      // All unique card images from deck composition
      ...DEFAULT_GAME_CONFIG.deckComposition.map((card) => card.imageUrl),
    ];

    // LOW: Optional/rare assets
    // Currently none, but placeholder for future assets
    const low: string[] = [];

    return { critical, high, medium, low };
  }, []);

  // Trigger preloading
  const { totalLoaded, totalAssets, stats, progress } = useAssetPreloader(assets, {
    enabled,
    batchDelay,
  });

  // Log preload status in development
  if (import.meta.env.DEV && totalLoaded > 0) {
    console.log(
      `🖼️  Asset preloader: ${totalLoaded}/${totalAssets} (${Math.round(progress)}%) | ` +
        `Critical: ${stats.critical.loaded}/${stats.critical.total} | ` +
        `High: ${stats.high.loaded}/${stats.high.total} | ` +
        `Medium: ${stats.medium.loaded}/${stats.medium.total}`,
    );
  }

  // This component renders nothing
  return null;
};
