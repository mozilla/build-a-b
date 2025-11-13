/**
 * Video Preloader Hook
 *
 * Preloads video assets in the background to ensure smooth playback
 * when they're needed. Uses the browser's video preload mechanism.
 */

import { useEffect, useRef } from 'react';

interface PreloadedVideo {
  url: string;
  element: HTMLVideoElement;
  loaded: boolean;
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
  const preloadedVideosRef = useRef<Map<string, PreloadedVideo>>(new Map());
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!enabled || videoUrls.length === 0) {
      return;
    }

    // Filter out undefined URLs and already preloaded videos
    const urlsToPreload = videoUrls
      .filter((url): url is string => Boolean(url))
      .filter((url) => !preloadedVideosRef.current.has(url));

    if (urlsToPreload.length === 0) {
      return;
    }

    loadingRef.current = true;

    urlsToPreload.forEach((url) => {
      const video = document.createElement('video');
      video.src = url;
      video.preload = preloadStrategy;
      video.muted = true; // Required for autoplay policies
      video.playsInline = true;

      const preloadedVideo: PreloadedVideo = {
        url,
        element: video,
        loaded: false,
      };

      video.addEventListener('loadeddata', () => {
        preloadedVideo.loaded = true;
      });

      video.addEventListener('error', (e) => {
        console.error(`Failed to preload video: ${url.split('/').pop()}`, e);
      });

      preloadedVideosRef.current.set(url, preloadedVideo);
    });

    return () => {
      // Note: We intentionally keep preloaded videos in memory
      // They're lightweight references and will be garbage collected
      // when the component unmounts or URLs change
      loadingRef.current = false;
    };
  }, [videoUrls, enabled, preloadStrategy]);

  return {
    isLoading: loadingRef.current,
    preloadedCount: Array.from(preloadedVideosRef.current.values()).filter((v) => v.loaded).length,
    totalCount: preloadedVideosRef.current.size,
  };
}
