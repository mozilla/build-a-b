/**
 * Video Preloader Hook
 *
 * Preloads video assets in the background to ensure smooth playback
 * when they're needed. Uses the browser's video preload mechanism.
 */

import { useEffect, useRef, useState } from 'react';

/**
 * Global map of preloaded videos to share across component instances.
 * Prevents duplicate video elements and allows VSAnimation to use preloaded videos.
 */
const globalPreloadedVideos = new Map<string, PreloadedVideo>();

interface PreloadedVideo {
  url: string;
  element: HTMLVideoElement;
  loaded: boolean;
  canPlayThrough: boolean;
}

interface UseVideoPreloaderOptions {
  /**
   * Whether to enable preloading
   * @default true
   */
  enabled?: boolean;

  /**
   * How much of the video to preload
   * - 'auto': Browser decides (default)
   * - 'metadata': Only metadata
   * - 'none': Don't preload
   */
  preloadStrategy?: 'auto' | 'metadata' | 'none';
}

/**
 * Get a preloaded video element by URL
 * Returns the preloaded video element if available, null otherwise
 */
export function getPreloadedVideo(url: string): HTMLVideoElement | null {
  return globalPreloadedVideos.get(url)?.element ?? null;
}

/**
 * Clear all preloaded videos (useful for testing)
 * @internal
 */
export function clearPreloadedVideos(): void {
  globalPreloadedVideos.clear();
}

/**
 * Hook to preload video assets in the background
 *
 * @param videoUrls - Array of video URLs to preload
 * @param options - Configuration options
 * @returns Object with loading state and preloaded count
 */
export function useVideoPreloader(
  videoUrls: (string | undefined)[],
  options: UseVideoPreloaderOptions = {},
) {
  const { enabled = true, preloadStrategy = 'auto' } = options;
  const loadingRef = useRef(false);
  const [_updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    if (!enabled || videoUrls.length === 0) {
      return;
    }

    // Filter out undefined URLs and already preloaded videos
    const urlsToPreload = videoUrls
      .filter((url): url is string => Boolean(url))
      .filter((url) => !globalPreloadedVideos.has(url));

    if (urlsToPreload.length === 0) {
      if (import.meta.env.DEV && loadingRef.current === false) {
        console.log('Videos already preloaded (skipping duplicate preload)');
      }
      return;
    }

    loadingRef.current = true;

    urlsToPreload.forEach((url) => {
      const video = document.createElement('video');
      video.src = url;
      video.preload = preloadStrategy;
      video.muted = true; // Required for autoplay policies
      video.playsInline = true;
      video.loop = false; // Prevent video from looping

      const preloadedVideo: PreloadedVideo = {
        url,
        element: video,
        loaded: false,
        canPlayThrough: false,
      };

      video.addEventListener('loadeddata', () => {
        preloadedVideo.loaded = true;
        setUpdateCount((prev) => prev + 1); // Trigger re-render
        if (import.meta.env.DEV) {
          console.log(`📹 Video metadata loaded: ${url.split('/').pop()}`);
        }
      });

      video.addEventListener('canplaythrough', () => {
        preloadedVideo.canPlayThrough = true;
        setUpdateCount((prev) => prev + 1); // Trigger re-render
        if (import.meta.env.DEV) {
          console.log(`✓ Video ready to play: ${url.split('/').pop()}`);
        }
      });

      video.addEventListener('error', (e) => {
        console.error(`Failed to preload video: ${url.split('/').pop()}`, e);
      });

      globalPreloadedVideos.set(url, preloadedVideo);
    });

    return () => {
      loadingRef.current = false;
      // Keep preloaded videos in global map across remounts
    };
  }, [videoUrls, enabled, preloadStrategy]);

  return {
    isLoading: loadingRef.current,
    preloadedCount: Array.from(globalPreloadedVideos.values()).filter((v) => v.loaded).length,
    readyToPlayCount: Array.from(globalPreloadedVideos.values()).filter((v) => v.canPlayThrough)
      .length,
    totalCount: globalPreloadedVideos.size,
    allReady:
      globalPreloadedVideos.size > 0 &&
      Array.from(globalPreloadedVideos.values()).every((v) => v.canPlayThrough),
  };
}
