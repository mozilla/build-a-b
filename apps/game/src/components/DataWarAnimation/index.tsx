import { DEFAULT_BILLIONAIRE_ID } from '@/config/billionaires';
import { useCpuBillionaire, useGameStore } from '@/store';
import { getCharacterAnimation } from '@/utils/character-animations';
import { AnimatePresence, motion } from 'framer-motion';
import { type FC, useEffect, useMemo, useRef } from 'react';

interface DataWarAnimationProps {
  show: boolean;
}

/**
 * Data War Animation Component
 *
 * Displays a character-based animation when players tie and enter data war.
 * Rendered as a full-board overlay during the data_war.animating phase.
 * Similar to VS animation but for gameplay phase.
 */
export const DataWarAnimation: FC<DataWarAnimationProps> = ({ show }) => {
  const { selectedBillionaire } = useGameStore();
  const cpuBillionaire = useCpuBillionaire();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get the animation for this matchup
  const animationSrc = useMemo(
    () =>
      getCharacterAnimation(
        selectedBillionaire || DEFAULT_BILLIONAIRE_ID,
        cpuBillionaire || DEFAULT_BILLIONAIRE_ID,
        'datawar',
      ),
    [selectedBillionaire, cpuBillionaire],
  );

  // Auto-play video when component mounts
  useEffect(() => {
    if (videoRef.current && animationSrc && show) {
      videoRef.current.play().catch((error) => {
        console.error('Failed to play Data War animation:', error);
      });
    }

    // Reset video playing state when animation is hidden
    if (!show) {
      useGameStore.setState({ dataWarVideoPlaying: false });
    }

    // Cleanup on unmount
    return () => {
      useGameStore.setState({ dataWarVideoPlaying: false });
    };
  }, [animationSrc, show]);

  // Handle video play/end to control glow state
  const handleVideoPlay = () => {
    useGameStore.setState({ dataWarVideoPlaying: true });
  };

  const handleVideoEnded = () => {
    useGameStore.setState({ dataWarVideoPlaying: false });
  };

  if (!show || !animationSrc) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      >
        {/* Board-constrained container matching game board dimensions */}
        <div className="relative w-full h-full max-w-[25rem] max-h-[54rem]">
          {/* Video fills full board - no blur, no overlay */}
          <video
            ref={videoRef}
            src={animationSrc}
            muted
            playsInline
            className="w-full h-full object-cover"
            aria-label="Data War animation"
            onPlay={handleVideoPlay}
            onEnded={handleVideoEnded}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
