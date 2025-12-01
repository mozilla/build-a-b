/**
 * Howler Audio Preloader Hook
 *
 * Preloads audio assets using Howler.js with global caching
 * Provides better iOS mobile audio support through Web Audio API
 */

import { Howl } from 'howler';
import { useEffect, useRef, useState } from 'react';
import { getAudioUrl, type AudioTrackId, AUDIO_TRACKS } from '../config/audio-config';
import { useGameStore } from '../store';

/**
 * Global map of preloaded Howl instances to share across component instances
 * Prevents duplicate audio instances and provides better iOS compatibility
 */
const globalPreloadedHowls = new Map<string, PreloadedHowl>();

export interface PreloadedHowl {
  howl: Howl;
  format: 'mp3' | 'webm';
  ready: boolean;
  trackId: AudioTrackId;
}

interface UseHowlerPreloaderOptions {
  /**
   * Whether to enable preloading
   * @default true
   */
  enabled?: boolean;

  /**
   * How much of the audio to preload
   * - true: Preload entire file (recommended for game audio)
   * - false: Load on demand
   * @default true
   */
  preload?: boolean;

  /**
   * Force HTML5 Audio instead of Web Audio API
   * - false: Use Web Audio API (better for iOS, more features)
   * - true: Use HTML5 Audio element (fallback)
   * @default false
   */
  html5?: boolean;

  /**
   * Delay between preloading each audio file (ms)
   * Prevents network congestion
   * @default 50
   */
  batchDelay?: number;
}

/**
 * Get a preloaded Howl instance by track ID
 * Returns the Howl instance if available and ready, null otherwise
 *
 * Note: Howler handles multi-instance playback automatically.
 * You can call play() multiple times on the same Howl for overlapping SFX.
 */
export function getPreloadedHowl(trackId: AudioTrackId): Howl | null {
  const cached = globalPreloadedHowls.get(trackId);
  if (!cached?.ready) {
    return null;
  }
  return cached.howl;
}

/**
 * Check if Howl instance is preloaded and ready to play
 */
export function isHowlReady(trackId: AudioTrackId): boolean {
  const cached = globalPreloadedHowls.get(trackId);
  return cached?.ready ?? false;
}

/**
 * Clear all preloaded Howl instances (useful for testing/cleanup)
 * @internal
 */
export function clearPreloadedHowls(): void {
  globalPreloadedHowls.forEach((cached) => {
    cached.howl.unload();
  });
  globalPreloadedHowls.clear();
}

/**
 * Hook to preload audio assets using Howler.js in the background
 *
 * Advantages over HTMLAudioElement:
 * - Automatic iOS audio context unlocking
 * - True multi-instance playback (Web Audio API)
 * - Better buffering and preload verification
 * - Native fade support
 * - Works better in promise chains and async callbacks
 *
 * @param trackIds - Array of audio track IDs to preload
 * @param options - Configuration options
 * @returns Object with loading state and preloaded count
 */
export function useHowlerPreloader(
  trackIds: AudioTrackId[],
  options: UseHowlerPreloaderOptions = {},
) {
  const { enabled = true, preload = true, html5 = false, batchDelay = 50 } = options;
  const loadingRef = useRef(false);
  const [_updateCount, setUpdateCount] = useState(0);
  const { markAudioReady, markAudioFailed } = useGameStore();

  useEffect(() => {
    if (!enabled || trackIds.length === 0) return;

    // Filter out already preloaded tracks
    const tracksToPreload = trackIds.filter((id) => !globalPreloadedHowls.has(id));

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
        if (globalPreloadedHowls.has(trackId)) continue;

        const url = getAudioUrl(trackId);
        const trackConfig = AUDIO_TRACKS[trackId];

        // Create Howl instance with configuration
        const howl = new Howl({
          src: [url],
          preload,
          html5,
          loop: trackConfig.loop ?? false,
          volume: trackConfig.volume ?? 1.0,
          // Event handlers
          onload: () => {
            const cached = globalPreloadedHowls.get(trackId);
            if (cached) {
              cached.ready = true;
              markAudioReady(trackId); // Update store state for reactive components
              setUpdateCount((c) => c + 1); // Force re-render
              if (import.meta.env.DEV) {
                console.log(`[Howler] Loaded: ${trackId}`);
              }
            }
          },
          onloaderror: (_id, error) => {
            console.error(`[Howler] Failed to load: ${trackId}`, error);
            globalPreloadedHowls.delete(trackId);
            markAudioFailed(trackId);
            setUpdateCount((c) => c + 1);
          },
          onplayerror: (_id, error) => {
            console.error(`[Howler] Play error: ${trackId}`, error);
            // Attempt to unlock audio on next user interaction
            // Howler will automatically retry after unlock
            howl.once('unlock', () => {
              if (import.meta.env.DEV) {
                console.log(`[Howler] Audio unlocked, retrying: ${trackId}`);
              }
            });
          },
        });

        // Store as loading (ready: false until onload fires)
        const format = url.endsWith('.webm') ? 'webm' : 'mp3';
        globalPreloadedHowls.set(trackId, {
          howl,
          format,
          ready: false,
          trackId,
        });
      }

      loadingRef.current = false;
    };

    loadAudioSequentially();

    // Cleanup function
    return () => {
      loadingRef.current = false;
    };
  }, [trackIds, enabled, preload, html5, batchDelay, markAudioReady, markAudioFailed]);

  // Calculate stats
  const totalTracks = trackIds.length;
  const loadedTracks = trackIds.filter((id) => isHowlReady(id)).length;
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
