/**
 * Audio Preloader Hook
 *
 * Preloads audio assets in the background with global caching
 * Handles WebM-first with MP3 fallback strategy
 */

import { useEffect, useRef, useState } from 'react';
import { getAudioUrl, type AudioTrackId } from '../config/audio-config';
import { useGameStore } from '../store';
import type { PreloadedAudio } from '../types/audio';

/**
 * Global map of preloaded audio to share across component instances
 * Prevents duplicate audio elements and AbortErrors on iOS Safari
 */
const globalPreloadedAudio = new Map<string, PreloadedAudio>();

interface UseAudioPreloaderOptions {
  /**
   * Whether to enable preloading
   * @default true
   */
  enabled?: boolean;

  /**
   * How much of the audio to preload
   * - 'auto': Browser decides (default - download entire file)
   * - 'metadata': Only metadata
   * - 'none': Don't preload
   */
  preloadStrategy?: 'auto' | 'metadata' | 'none';

  /**
   * Delay between preloading each audio file (ms)
   * Prevents network congestion
   * @default 50
   */
  batchDelay?: number;
}

/**
 * Get a preloaded audio element by track ID
 * Returns the preloaded audio element if available, null otherwise
 *
 * For multiple simultaneous plays (e.g., overlapping SFX), this creates
 * a NEW audio element with the same src, allowing independent playback.
 * For music, returns the SAME element to prevent multiple concurrent playback.
 */
export function getPreloadedAudio(
  trackId: AudioTrackId,
  isMusicTrack: boolean = false,
): HTMLAudioElement | null {
  const cached = globalPreloadedAudio.get(trackId);
  if (!cached?.ready) {
    return null;
  }

  // Music: Return the same shared element to prevent multiple instances
  if (isMusicTrack) {
    return cached.element;
  }

  // SFX: Create a new Audio element with the same src for independent playback
  // The browser will use the cached audio data, so no additional network request
  const newAudio = new Audio();
  newAudio.src = cached.element.src;
  newAudio.preload = 'auto';

  return newAudio;
}

/**
 * Check if audio track is preloaded and ready to play
 */
export function isAudioReady(trackId: AudioTrackId): boolean {
  const cached = globalPreloadedAudio.get(trackId);
  return cached?.ready ?? false;
}

/**
 * Clear all preloaded audio (useful for testing)
 * @internal
 */
export function clearPreloadedAudio(): void {
  globalPreloadedAudio.forEach((audio) => {
    audio.element.pause();
    audio.element.src = '';
  });
  globalPreloadedAudio.clear();
}

/**
 * Hook to preload audio assets in the background
 *
 * @param trackIds - Array of audio track IDs to preload
 * @param options - Configuration options
 * @returns Object with loading state and preloaded count
 */
export function useAudioPreloader(
  trackIds: AudioTrackId[],
  options: UseAudioPreloaderOptions = {},
) {
  const { enabled = true, preloadStrategy = 'auto', batchDelay = 50 } = options;
  const loadingRef = useRef(false);
  const [_updateCount, setUpdateCount] = useState(0);
  const { markAudioReady, markAudioFailed } = useGameStore();

  useEffect(() => {
    if (!enabled || trackIds.length === 0) return;

    // Filter out already preloaded tracks
    const tracksToPreload = trackIds.filter((id) => !globalPreloadedAudio.has(id));

    if (tracksToPreload.length === 0) return;

    // Prevent duplicate preloading attempts
    if (loadingRef.current) return;

    loadingRef.current = true;

    // Preload with delay between each to prevent network congestion
    const loadAudioSequentially = async () => {
      for (let i = 0; i < tracksToPreload.length; i++) {
        const trackId = tracksToPreload[i];

        // Add delay between requests (except first)
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, batchDelay));
        }

        // Skip if already loaded by another instance
        if (globalPreloadedAudio.has(trackId)) continue;

        const url = getAudioUrl(trackId);
        const audio = new Audio();

        // Safari-safe configuration
        audio.preload = preloadStrategy;
        audio.muted = true; // Required for autoplay policies initially

        // Store as loading
        const format = url.endsWith('.webm') ? 'webm' : 'mp3';
        globalPreloadedAudio.set(trackId, {
          element: audio,
          format,
          ready: false,
        });

        // Setup event listeners
        const handleCanPlayThrough = () => {
          const cached = globalPreloadedAudio.get(trackId);
          if (cached) {
            cached.ready = true;
            markAudioReady(trackId); // Update store state for reactive components
            setUpdateCount((c) => c + 1); // Force re-render
          }
        };

        const handleError = (error: ErrorEvent | Event) => {
          console.error(`Failed to preload audio: ${trackId}`, error);
          // Remove failed audio from cache
          globalPreloadedAudio.delete(trackId);
          markAudioFailed(trackId); // Update store state
          setUpdateCount((c) => c + 1);
        };

        audio.addEventListener('canplaythrough', handleCanPlayThrough, { once: true });
        audio.addEventListener('error', handleError, { once: true });

        // Start loading
        audio.src = url;
        audio.load();
      }

      loadingRef.current = false;
    };

    loadAudioSequentially();

    // Cleanup function
    return () => {
      loadingRef.current = false;
    };
  }, [trackIds, enabled, preloadStrategy, batchDelay, markAudioReady, markAudioFailed]);

  // Calculate stats
  const totalTracks = trackIds.length;
  const loadedTracks = trackIds.filter((id) => isAudioReady(id)).length;
  const isLoading = loadingRef.current || loadedTracks < totalTracks;
  const progress = totalTracks > 0 ? (loadedTracks / totalTracks) * 100 : 0;

  return {
    isLoading,
    loadedCount: loadedTracks,
    totalCount: totalTracks,
    progress,
    isReady: !isLoading && loadedTracks === totalTracks,
  };
}
