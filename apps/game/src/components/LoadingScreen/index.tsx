/**
 * LoadingScreen Component
 *
 * Displays asset preloading progress to the user.
 * Shows a simple progress indicator with current/total file count.
 * Blocks user interaction until all critical, high, and medium priority assets are loaded.
 */

import { loadingMicrocopy } from '@/components/LoadingScreen/microcopy';
import { Text } from '@/components/Text';
import { motion } from 'framer-motion';
import type { FC } from 'react';

export type LoadingScreenPhase = 'critical' | 'backgrounds' | 'essential';

export interface LoadingScreenProps {
  /**
   * Text displayed prior to phase completion
   */
  phase: LoadingScreenPhase;
  /**
   * Number of assets currently loaded
   */
  loadedCount: number;

  /**
   * Total number of assets to load
   */
  totalCount: number;

  /**
   * Whether essential image assets are ready
   */
  essentialAssetsReady?: boolean;

  /**
   * Whether VS video is ready
   */
  vsVideoReady?: boolean;

  /**
   * Progress percentage for the current loading phase (0-100)
   * If provided, overrides the calculated progress from loadedCount/totalCount
   */
  progress?: number;
}

export const LoadingScreen: FC<LoadingScreenProps> = ({
  phase,
  loadedCount,
  totalCount,
  progress: providedProgress,
}) => {
  // Use provided progress if available, otherwise calculate from counts
  const calculatedProgress = totalCount > 0 ? (loadedCount / totalCount) * 100 : 0;
  const progress = providedProgress !== undefined ? providedProgress : calculatedProgress;
  const isComplete = progress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
    >
      <div className="flex flex-col items-center gap-6 px-8 text-center">
        {/* Loading message */}
        <Text variant="title-2" className="text-common-ash">
          {isComplete ? loadingMicrocopy.complete : loadingMicrocopy[phase] || 'Loading'}
        </Text>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full w-full bg-accent origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
        </div>

        {/* File count */}
        <Text variant="body-large-semibold" className="text-common-ash">
          {progress.toFixed(0)}%
        </Text>
      </div>
    </motion.div>
  );
};
