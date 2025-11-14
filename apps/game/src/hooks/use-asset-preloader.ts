/**
 * Asset Preloader Hook
 *
 * Preloads images with priority-based loading strategy.
 * Critical assets (seen earliest in user journey) load first,
 * followed by gameplay assets in the background.
 */

import { useEffect, useRef } from 'react';
/**
 * Global map of preloaded images to prevent duplicate downloads.
 * Keeps track of loaded images across component remounts.
 */
const globalPreloadedImages = new Map<string, PreloadedImage>();
let globalContainer: HTMLDivElement | null = null;

export interface AssetPreloadPriority {
  /**
   * Critical assets - Load immediately (highest priority)
   * These are seen in the first screens (welcome, select billionaire)
   */
  critical: string[];

  /**
   * High priority assets - Load after critical
   * These are seen in intro/setup screens (backgrounds, avatars)
   */
  high: string[];

  /**
   * Medium priority assets - Load after high
   * These are seen during gameplay (cards, effects)
   */
  medium: string[];

  /**
   * Low priority assets - Load last
   * These may or may not be seen (optional content)
   */
  low: string[];
}

interface PreloadedImage {
  url: string;
  element: HTMLImageElement;
  loaded: boolean;
  priority: keyof AssetPreloadPriority;
}

interface UseAssetPreloaderOptions {
  /**
   * Whether to enable preloading
   * @default true
   */
  enabled?: boolean;

  /**
   * Delay between loading each asset (ms)
   * Helps avoid network congestion on slow connections
   * @default 50
   */
  batchDelay?: number;
}

/**
 * Hook to preload image assets with priority-based loading
 *
 * @param assets - Assets organized by priority level
 * @param options - Configuration options
 * @returns Object with loading state and preloaded count
 */
export function useAssetPreloader(
  assets: AssetPreloadPriority,
  options: UseAssetPreloaderOptions = {},
) {
  const { enabled = true, batchDelay = 50 } = options;
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    /**
     * Implements a visually hidden container to hold preloaded images.
     *
     * Desipte occurring within a useEffect, this block only runs once due to the
     * check for globalContainer. This prevents duplicate containers in StrictMode.
     */
    if (!globalContainer) {
      const container = document.createElement('div');
      container.style.cssText =
        'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;opacity:0;';
      container.setAttribute('aria-hidden', 'true');
      container.setAttribute('data-preload-container', 'true');
      document.body.appendChild(container);
      globalContainer = container;
    }

    // Build priority queue: critical -> high -> medium -> low
    const priorityQueue: Array<{ url: string; priority: keyof AssetPreloadPriority }> = [
      ...assets.critical.map((url) => ({ url, priority: 'critical' as const })),
      ...assets.high.map((url) => ({ url, priority: 'high' as const })),
      ...assets.medium.map((url) => ({ url, priority: 'medium' as const })),
      ...assets.low.map((url) => ({ url, priority: 'low' as const })),
    ];
    /**
     * Ignore assets that have already been preloaded globally.
     */
    const urlsToPreload = priorityQueue.filter(({ url }) => !globalPreloadedImages.has(url));

    if (urlsToPreload.length === 0) {
      if (import.meta.env.DEV && loadingRef.current === false) {
        console.log('Assets already preloaded (skipping duplicate preload)');
      }
      return;
    }

    loadingRef.current = true;
    let currentIndex = 0;

    // Preload images one at a time with small delays
    // This prevents overwhelming slow connections
    const preloadNext = () => {
      if (currentIndex >= urlsToPreload.length) {
        loadingRef.current = false;
        return;
      }

      const { url, priority } = urlsToPreload[currentIndex];
      const img = new Image();

      const preloadedImage: PreloadedImage = {
        url,
        element: img,
        loaded: false,
        priority,
      };

      img.onload = async () => {
        preloadedImage.loaded = true;
        /**
         * Force the browser to decode images into bitmap cache after loading.
         * This increases the likelihood of instant rendering when the image
         * is needed.
         */
        try {
          await img.decode();
          /**
           * Attach the hidden container to keep references to images alive.
           * This prevents garbage collection of the Image elements, ensuring
           * they remain in the browser cache.
           */
          if (globalContainer) {
            globalContainer.appendChild(img);
          }

          if (import.meta.env.DEV) {
            console.log(`✓ Preloaded & decoded [${priority}]: ${url.split('/').pop()}`);
          }
        } catch {
          if (import.meta.env.DEV) {
            console.warn(`Preloaded but decode failed [${priority}]: ${url.split('/').pop()}`);
          }
        }
      };

      img.onerror = () => {
        if (import.meta.env.DEV) {
          console.error(`✗ Failed to preload [${priority}]: ${url.split('/').pop()}`);
        }
      };

      img.src = url;
      globalPreloadedImages.set(url, preloadedImage);
      currentIndex++;
      setTimeout(preloadNext, batchDelay);
    };

    preloadNext();

    return () => {
      loadingRef.current = false;
      /**
       * globalContainer and globalPreloadedImages are kept alive
       * across remounts to prevent duplicate downloads.
       */
    };
  }, [assets.critical, assets.high, assets.medium, assets.low, enabled, batchDelay]);

  const stats = {
    critical: {
      total: assets.critical.length,
      loaded: assets.critical.filter((url) => globalPreloadedImages.get(url)?.loaded).length,
    },
    high: {
      total: assets.high.length,
      loaded: assets.high.filter((url) => globalPreloadedImages.get(url)?.loaded).length,
    },
    medium: {
      total: assets.medium.length,
      loaded: assets.medium.filter((url) => globalPreloadedImages.get(url)?.loaded).length,
    },
    low: {
      total: assets.low.length,
      loaded: assets.low.filter((url) => globalPreloadedImages.get(url)?.loaded).length,
    },
  };

  const totalAssets = Object.values(stats).reduce((sum, { total }) => sum + total, 0);
  const totalLoaded = Object.values(stats).reduce((sum, { loaded }) => sum + loaded, 0);

  return {
    isLoading: loadingRef.current,
    totalAssets,
    totalLoaded,
    stats,
    progress: totalAssets > 0 ? (totalLoaded / totalAssets) * 100 : 0,
  };
}
