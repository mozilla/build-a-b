import { TRACKS } from '@/config/audio-config';
import { DEFAULT_BILLIONAIRE_ID } from '@/config/billionaires';
import { getPreloadedVideo } from '@/hooks/use-video-preloader';
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
  const { selectedBillionaire, playAudio, showMenu } = useGameStore();
  const cpuBillionaire = useCpuBillionaire();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Hide animation when menu is open (gameplay is paused)
  const shouldShow = show && !showMenu;

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

  // Get preloaded video element or null
  const preloadedVideo = useMemo(
    () => (animationSrc && shouldShow ? getPreloadedVideo(animationSrc) : null),
    [animationSrc, shouldShow],
  );

  // play preloaded video when available
  useEffect(() => {
    if (!containerRef.current || !preloadedVideo) {
      return;
    }

    const container = containerRef.current; // Copy ref for cleanup

    // Style the video for full coverage
    preloadedVideo.className = 'w-full h-full object-cover';
    preloadedVideo.setAttribute('aria-label', `Data War animation`);

    // Call load() to ensure Safari re-processes the video
    preloadedVideo.load();

    // video end listener
    const handleVideoEnd = () => {
      useGameStore.setState({ dataWarVideoPlaying: false });
    };

    // attach listeners
    preloadedVideo.addEventListener('ended', handleVideoEnd);

    // Append to container
    container.appendChild(preloadedVideo);

    // play video
    preloadedVideo
      .play()
      .then(() => {
        playAudio(TRACKS.DATA_WAR);
        useGameStore.setState({ dataWarVideoPlaying: true });
      })
      .catch((error) => {
        console.error('Failed to play Data War animation:', error);
      });

    return () => {
      useGameStore.setState({ dataWarVideoPlaying: false });
      preloadedVideo.removeEventListener('ended', handleVideoEnd);
      // Don't remove the video from DOM - keep it in global preload cache
      // Just remove from this specific container
      if (preloadedVideo.parentElement === container) {
        container.removeChild(preloadedVideo);
      }
    };
  }, [playAudio, preloadedVideo]);

  // Auto-play fallback video when component mounts
  useEffect(() => {
    // skip fallback when using preloaded video
    if (preloadedVideo) {
      return;
    }

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
  }, [animationSrc, show, playAudio, preloadedVideo]);

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
        style={{ pointerEvents: shouldShow ? 'auto' : 'none' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: shouldShow ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 z-[var(--z-special-animation)] flex items-center justify-center bg-black"
      >
        {preloadedVideo ? (
          // Container for preloaded video element
          <div ref={containerRef} className="w-full h-full" />
        ) : (
          /* Board-constrained container matching game board dimensions */
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
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
