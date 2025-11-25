/**
 * Audio Preloader Component
 *
 * Intelligently preloads audio assets with priority-based loading.
 * Critical audio (UI sounds, title music) loads first,
 * followed by gameplay sounds, then special effects.
 *
 * Priority Strategy:
 * 1. CRITICAL: UI sounds + title music (needed immediately)
 * 2. HIGH: Gameplay music + core SFX
 * 3. MEDIUM: Special effect sounds
 * 4. LOW: Rare/optional sounds
 */

import { getAudioByPriority } from '@/config/audio-config';
import { useAudioPreloader } from '@/hooks/use-audio-preloader';
import { useMemo, type FC } from 'react';

interface AudioPreloaderProps {
  /**
   * Whether to enable preloading
   * @default true
   */
  enabled?: boolean;

  /**
   * Delay between loading each audio file (ms)
   * @default 50
   */
  batchDelay?: number;
}

export type { AudioPreloaderProps };

/**
 * AudioPreloader Component
 *
 * Automatically preloads audio assets in priority order.
 * This component renders nothing but triggers background audio preloading.
 *
 * @example
 * <AudioPreloader />
 */
export const AudioPreloader: FC<AudioPreloaderProps> = ({ enabled = true, batchDelay = 50 }) => {
  // Get audio tracks organized by priority
  const criticalAudio = useMemo(() => getAudioByPriority('critical'), []);
  const highAudio = useMemo(() => getAudioByPriority('high'), []);
  const mediumAudio = useMemo(() => getAudioByPriority('medium'), []);
  const lowAudio = useMemo(() => getAudioByPriority('low'), []);

  // Preload critical audio
  const criticalPreload = useAudioPreloader(criticalAudio, {
    enabled,
    batchDelay,
    preloadStrategy: 'auto', // Download entire file
  });

  // Only start high priority after critical completes
  const highPreload = useAudioPreloader(highAudio, {
    enabled: enabled && criticalPreload.isReady,
    batchDelay,
    preloadStrategy: 'auto',
  });

  // Only start medium priority after high completes
  const mediumPreload = useAudioPreloader(mediumAudio, {
    enabled: enabled && highPreload.isReady,
    batchDelay,
    preloadStrategy: 'auto',
  });

  // Only start low priority after medium completes
  const lowPreload = useAudioPreloader(lowAudio, {
    enabled: enabled && mediumPreload.isReady,
    batchDelay,
    preloadStrategy: 'auto',
  });

  // Calculate total stats
  const totalLoaded =
    criticalPreload.loadedCount +
    highPreload.loadedCount +
    mediumPreload.loadedCount +
    lowPreload.loadedCount;

  const totalAssets =
    criticalPreload.totalCount +
    highPreload.totalCount +
    mediumPreload.totalCount +
    lowPreload.totalCount;

  const overallProgress = totalAssets > 0 ? (totalLoaded / totalAssets) * 100 : 0;

  // Log preload status in development
  if (import.meta.env.DEV && totalLoaded > 0) {
    console.log(
      `🔊 Audio preloader: ${totalLoaded}/${totalAssets} (${Math.round(overallProgress)}%) | ` +
        `Critical: ${criticalPreload.loadedCount}/${criticalPreload.totalCount} | ` +
        `High: ${highPreload.loadedCount}/${highPreload.totalCount} | ` +
        `Medium: ${mediumPreload.loadedCount}/${mediumPreload.totalCount} | ` +
        `Low: ${lowPreload.loadedCount}/${lowPreload.totalCount}`,
    );
  }

  // This component renders nothing
  return null;
};
