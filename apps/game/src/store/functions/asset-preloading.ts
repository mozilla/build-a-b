/**
 * Asset Preloading Functions
 * Handles asset preloading progress tracking and loading screen state
 */

import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import type { SetState, GetState } from '@/types';

export function createAssetPreloadingActions(set: SetState, get: GetState) {
  return {
    /**
     * Updates asset preloading progress
     * Handles delayed transitions for loading screen animations
     */
    updatePreloadingProgress: (stats: {
      assetsLoaded: number;
      assetsTotal: number;
      essentialAssetsReady: boolean;
      highPriorityAssetsReady: boolean;
      criticalPriorityAssetsReady: boolean;
      vsVideoReady: boolean;
      criticalProgress: number;
      highPriorityProgress: number;
      essentialProgress: number;
    }) => {
      const shouldBeComplete = stats.essentialAssetsReady && stats.vsVideoReady;
      const shouldHighPriorityBeReady = stats.highPriorityAssetsReady;
      const shouldCriticalPriorityBeReady = stats.criticalPriorityAssetsReady;
      const currentState = get();
      const wasComplete = currentState.preloadingComplete;
      const wasHighPriorityReady = currentState.highPriorityAssetsReady;
      const wasCriticalPriorityReady = currentState.criticalPriorityAssetsReady;

      // Update progress immediately (except for delayed flags)
      set({
        assetsLoaded: stats.assetsLoaded,
        assetsTotal: stats.assetsTotal,
        essentialAssetsReady: stats.essentialAssetsReady,
        vsVideoReady: stats.vsVideoReady,
        highPriorityProgress: stats.highPriorityProgress,
        essentialProgress: stats.essentialProgress,
        criticalProgress: stats.criticalProgress,
      });

      if (shouldCriticalPriorityBeReady && !wasCriticalPriorityReady) {
        const hasShownCriticalLoadingScreen = currentState.hasShownCriticalLoadingScreen;
        const delay = hasShownCriticalLoadingScreen
          ? ANIMATION_DURATIONS.LOADING_SCREEN_COMPLETE_DELAY
          : 0;

        setTimeout(() => {
          set({ criticalPriorityAssetsReady: true });
        }, delay);
      }

      // Add delay before setting highPriorityAssetsReady to true
      // Only delay if user has seen the loading screen - otherwise allow immediate progression
      if (shouldHighPriorityBeReady && !wasHighPriorityReady) {
        const hasShownLoadingScreen = currentState.hasShownHighPriorityLoadingScreen;
        const delay = hasShownLoadingScreen ? ANIMATION_DURATIONS.LOADING_SCREEN_COMPLETE_DELAY : 0; // 800ms only if user saw loading screen

        setTimeout(() => {
          set({ highPriorityAssetsReady: true });
        }, delay);
      } else if (!shouldHighPriorityBeReady && wasHighPriorityReady) {
        // If assets become incomplete (e.g., new billionaire selected), update immediately
        set({ highPriorityAssetsReady: false });
      }

      // Add delay before setting preloadingComplete to true
      // Only delay if user has seen the loading screen - otherwise allow immediate progression
      if (shouldBeComplete && !wasComplete) {
        const hasShownLoadingScreen = currentState.hasShownEssentialLoadingScreen;
        const delay = hasShownLoadingScreen ? ANIMATION_DURATIONS.LOADING_SCREEN_COMPLETE_DELAY : 0; // 800ms only if user saw loading screen

        setTimeout(() => {
          set({ preloadingComplete: true });
        }, delay);
      } else if (!shouldBeComplete && wasComplete) {
        // If assets become incomplete (e.g., new billionaire selected), update immediately
        set({ preloadingComplete: false });
      }
    },

    /**
     * Sets whether the high priority loading screen has been shown
     */
    setHasShownHighPriorityLoadingScreen: (shown: boolean) => {
      set({ hasShownHighPriorityLoadingScreen: shown });
    },

    /**
     * Sets whether the essential loading screen has been shown
     */
    setHasShownEssentialLoadingScreen: (shown: boolean) => {
      set({ hasShownEssentialLoadingScreen: shown });
    },

    /**
     * Sets whether the critical loading screen has been shown
     */
    setHasShownCriticalLoadingScreen: (shown: boolean) => {
      set({ hasShownCriticalLoadingScreen: shown });
    },
  };
}
