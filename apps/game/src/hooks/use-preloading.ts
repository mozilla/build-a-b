/**
 * usePreloading Hook
 *
 * Access preloading state from the game store
 */

import { useGameStore } from '@/store';

export interface PreloadingState {
  totalAssets: number;
  loadedAssets: number;
  progress: number;
  essentialAssetsReady: boolean;
  highPriorityAssetsReady: boolean;
  vsVideoReady: boolean;
  isReady: boolean;
  highPriorityProgress: number;
  essentialProgress: number;
}

export const usePreloading = (): PreloadingState => {
  const {
    assetsLoaded,
    assetsTotal,
    essentialAssetsReady,
    highPriorityAssetsReady,
    vsVideoReady,
    preloadingComplete,
    highPriorityProgress,
    essentialProgress,
  } = useGameStore();

  const progress = assetsTotal > 0 ? (assetsLoaded / assetsTotal) * 100 : 0;

  return {
    totalAssets: assetsTotal,
    loadedAssets: assetsLoaded,
    progress,
    essentialAssetsReady,
    highPriorityAssetsReady,
    vsVideoReady,
    isReady: preloadingComplete,
    highPriorityProgress,
    essentialProgress,
  };
};
