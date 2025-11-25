/**
 * Video Preloader Component
 *
 * Silently preloads video assets in the background based on game state.
 * Triggers after billionaire selection when we know which videos will be needed.
 */

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

    const playerBillionaire = selectedBillionaire;
    const cpuBillionaireId = cpuBillionaire;

    return [
      getCharacterAnimation(playerBillionaire, cpuBillionaireId, 'vs'),
      getCharacterAnimation(playerBillionaire, cpuBillionaireId, 'datawar'),
    ];
  }, [selectedBillionaire, cpuBillionaire]);

  useVideoPreloader(videoUrls, {
    enabled,
    preloadStrategy: 'auto',
  });

  return null;
};
