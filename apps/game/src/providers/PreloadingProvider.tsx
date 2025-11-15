/**
 * Preloading Provider
 *
 * Manages asset and video preloading, updating the game store with progress.
 * No React Context needed - uses Zustand store directly.
 */

import { BILLIONAIRES } from '@/config/billionaires';
import { CARD_BACK_IMAGE, DEFAULT_GAME_CONFIG } from '@/config/game-config';
import { useAssetPreloader, type AssetPreloadPriority } from '@/hooks/use-asset-preloader';
import { useVideoPreloader } from '@/hooks/use-video-preloader';
import { useCpuBillionaire, useGameStore } from '@/store';
import { getCharacterAnimation } from '@/utils/character-animations';
import { useEffect, useMemo, type FC, type PropsWithChildren } from 'react';

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

export const PreloadingProvider: FC<PropsWithChildren> = ({ children }) => {
  const { selectedBillionaire, updatePreloadingProgress } = useGameStore();
  const cpuBillionaire = useCpuBillionaire();

  // Organize assets by priority based on user journey
  const assets: AssetPreloadPriority = useMemo(() => {
    const critical = [...BILLIONAIRES.map((b) => b.imageSrc), nightskyBg];

    const high = [
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

    const medium = [
      CARD_BACK_IMAGE,
      ...DEFAULT_GAME_CONFIG.deckComposition.map((card) => card.imageUrl),
    ];

    const low: string[] = [];

    return { critical, high, medium, low };
  }, []);

  // Preload image assets
  const imagePreloadState = useAssetPreloader(assets, {
    enabled: true,
    batchDelay: 50,
  });

  // Preload video assets
  const videoUrls = useMemo(() => {
    if (!selectedBillionaire || !cpuBillionaire) return [];

    return [
      getCharacterAnimation(selectedBillionaire, cpuBillionaire, 'vs'),
      getCharacterAnimation(selectedBillionaire, cpuBillionaire, 'datawar'),
    ];
  }, [selectedBillionaire, cpuBillionaire]);

  const videoPreloadState = useVideoPreloader(videoUrls, {
    enabled: true,
    preloadStrategy: 'auto',
  });

  // Update game store with combined preloading state
  useEffect(() => {
    const assetsTotal = imagePreloadState.totalAssets + videoPreloadState.totalCount;
    const assetsLoaded = imagePreloadState.totalLoaded + videoPreloadState.readyToPlayCount;
    const essentialAssetsReady = imagePreloadState.essentialReady;
    const highPriorityAssetsReady = imagePreloadState.highPriorityReady;
    const criticalPriorityAssetsReady =
      imagePreloadState.stats.critical.loaded === imagePreloadState.stats.critical.total &&
      imagePreloadState.stats.critical.total > 0;
    const vsVideoReady = videoPreloadState.readyToPlayCount > 0;
    const criticalProgress =
      imagePreloadState.stats.critical.total > 0
        ? (imagePreloadState.stats.critical.loaded / imagePreloadState.stats.critical.total) * 100
        : 0;
    const highPriorityProgress = imagePreloadState.highPriorityProgress;
    const essentialProgress = imagePreloadState.essentialProgress;

    updatePreloadingProgress({
      assetsLoaded,
      assetsTotal,
      essentialAssetsReady,
      highPriorityAssetsReady,
      criticalPriorityAssetsReady,
      vsVideoReady,
      criticalProgress,
      highPriorityProgress,
      essentialProgress,
    });

    // Log status in development
    if (import.meta.env.DEV) {
      const preloadingComplete = Boolean(
        essentialAssetsReady && (videoUrls.length === 0 || vsVideoReady),
      );
      console.log(
        `📦 Preloading: ${assetsLoaded}/${assetsTotal} (${Math.round(
          assetsTotal > 0 ? (assetsLoaded / assetsTotal) * 100 : 0,
        )}%) | ` +
          `Critical: ${criticalPriorityAssetsReady ? '✓' : '⏳'} | ` +
          `High Priority: ${highPriorityAssetsReady ? '✓' : '⏳'} | ` +
          `Essential: ${essentialAssetsReady ? '✓' : '⏳'} | ` +
          `VS Video: ${vsVideoReady ? '✓' : '⏳'} | ` +
          `Ready: ${preloadingComplete ? '✓' : '⏳'}`,
      );
    }
  }, [
    imagePreloadState.totalAssets,
    imagePreloadState.totalLoaded,
    imagePreloadState.essentialReady,
    imagePreloadState.highPriorityReady,
    imagePreloadState.highPriorityProgress,
    imagePreloadState.essentialProgress,
    imagePreloadState.stats.critical.loaded,
    imagePreloadState.stats.critical.total,
    videoPreloadState.totalCount,
    videoPreloadState.readyToPlayCount,
    videoUrls.length,
    updatePreloadingProgress,
  ]);

  return <>{children}</>;
};
