/**
 * Video Preloader Component
 *
 * Silently preloads video assets in the background based on game state.
 * Triggers after billionaire selection when we know which videos will be needed.
 */

import { DEFAULT_BILLIONAIRE_ID } from '@/config/billionaires';
import { useVideoPreloader } from '@/hooks/use-video-preloader';
import { useCpuBillionaire, useGameStore } from '@/store';
import { getCharacterAnimation } from '@/utils/character-animations';
import { type FC, useMemo } from 'react';

interface VideoPreloaderProps {
  /**
   * Whether to enable preloading
   * @default true
   */
  enabled?: boolean;
}

export const VideoPreloader: FC<VideoPreloaderProps> = ({ enabled = true }) => {
  const { selectedBillionaire } = useGameStore();
  const cpuBillionaire = useCpuBillionaire();

  const videoUrls = useMemo(() => {
    if (!selectedBillionaire || !cpuBillionaire) return [];

    const playerBillionaire = selectedBillionaire || DEFAULT_BILLIONAIRE_ID;
    const cpuBillionaireId = cpuBillionaire || DEFAULT_BILLIONAIRE_ID;

    return [
      getCharacterAnimation(playerBillionaire, cpuBillionaireId, 'vs'),
      getCharacterAnimation(playerBillionaire, cpuBillionaireId, 'datawar'),
    ];
  }, [selectedBillionaire, cpuBillionaire]);

  const { preloadedCount, totalCount } = useVideoPreloader(videoUrls, {
    enabled,
    preloadStrategy: 'auto',
  });

  if (import.meta.env.DEV && preloadedCount > 0) {
    console.log(`📹 Video preloader: ${preloadedCount}/${totalCount} videos ready`);
  }

  return null;
};
