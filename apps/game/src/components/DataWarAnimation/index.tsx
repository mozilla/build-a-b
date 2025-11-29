import { TRACKS } from '@/config/audio-config';
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
  const { selectedBillionaire, playAudio } = useGameStore();
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
      videoRef.current
        .play()
        .then(() => {
          playAudio(TRACKS.DATA_WAR);
        })
        .catch((error) => {
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
  }, [animationSrc, show, playAudio]);

  // Handle video play/end to control glow state
  const handleVideoPlay = () => {
    useGameStore.setState({ dataWarVideoPlaying: true });
  };

  const handleVideoEnded = () => {
    useGameStore.setState({ dataWarVideoPlaying: false });
  };

  // if (!show || !animationSrc) return null;

  return (
    <AnimatePresence>
      <motion.div
        style={{ pointerEvents: show ? 'auto' : 'none' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: show ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 z-[var(--z-special-animation)] flex items-center justify-center bg-black"
      >
        {/* Board-constrained container matching game board dimensions */}
        <div className="relative w-full h-full">
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
            crossOrigin="anonymous"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
