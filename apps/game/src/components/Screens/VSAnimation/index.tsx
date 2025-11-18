import { motion } from 'framer-motion';
import { type FC, useEffect, useMemo, useRef } from 'react';

import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';
import { BILLIONAIRES, DEFAULT_BILLIONAIRE_ID } from '@/config/billionaires';
import { getPreloadedVideo } from '@/hooks/use-video-preloader';
import { useCpuBillionaire, useGameStore } from '@/store';
import { getCharacterAnimation } from '@/utils/character-animations';
import { cn } from '@/utils/cn';

/**
 * VSAnimation Screen
 *
 * Displays a WebM video animation for the player vs CPU matchup.
 * Falls back to text-based display if no animation exists for the matchup.
 * Auto-transitions to gameplay when video ends.
 */
export const VSAnimation: FC<BaseScreenProps> = ({ send, className, ...props }) => {
  const { selectedBillionaire } = useGameStore();
  const cpuBillionaireId = useCpuBillionaire();
  const containerRef = useRef<HTMLDivElement>(null);

  const playerBillionaire = useMemo(
    () => BILLIONAIRES.find((b) => b.id === selectedBillionaire),
    [selectedBillionaire],
  );

  // CPU billionaire is randomly selected from remaining billionaires
  const cpuBillionaire = useMemo(
    () => BILLIONAIRES.find((b) => b.id === cpuBillionaireId),
    [cpuBillionaireId],
  );

  // Get the animation for this matchup
  const animationSrc = useMemo(
    () =>
      getCharacterAnimation(
        selectedBillionaire || DEFAULT_BILLIONAIRE_ID,
        cpuBillionaireId || DEFAULT_BILLIONAIRE_ID,
        'vs',
      ),
    [selectedBillionaire, cpuBillionaireId],
  );

  // Get preloaded video element or null
  const preloadedVideo = useMemo(
    () => (animationSrc ? getPreloadedVideo(animationSrc) : null),
    [animationSrc],
  );

  // Mount the preloaded video element into the container
  useEffect(() => {
    if (!containerRef.current || !preloadedVideo) {
      return;
    }

    const container = containerRef.current; // Copy ref for cleanup

    // Style the video for full coverage
    preloadedVideo.className = 'w-full h-full object-cover';
    preloadedVideo.setAttribute(
      'aria-label',
      `${playerBillionaire?.name} versus ${cpuBillionaire?.name} animation`,
    );

    // Call load() to ensure Safari re-processes the video
    preloadedVideo.load();

    // Listen for video end event to trigger state machine transition
    const handleVideoEnd = () => {
      send?.({ type: 'VS_ANIMATION_COMPLETE' });
    };

    preloadedVideo.addEventListener('ended', handleVideoEnd);

    // Append to container
    container.appendChild(preloadedVideo);

    // Play the video
    preloadedVideo.play().catch((error) => {
      console.error('Failed to play VS animation:', error);
    });

    return () => {
      preloadedVideo.removeEventListener('ended', handleVideoEnd);
      // Don't remove the video from DOM - keep it in global preload cache
      // Just remove from this specific container
      if (preloadedVideo.parentElement === container) {
        container.removeChild(preloadedVideo);
      }
    };
  }, [preloadedVideo, playerBillionaire?.name, cpuBillionaire?.name, send]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('relative flex flex-col items-center justify-center w-full h-full', className)}
      {...props}
    >
      {preloadedVideo ? (
        // Container for preloaded video element
        <div ref={containerRef} className="w-full h-full" />
      ) : animationSrc ? (
        // Fallback: Create new video element if preloaded one not found
        <video
          src={animationSrc}
          autoPlay
          muted
          playsInline
          onEnded={() => send?.({ type: 'VS_ANIMATION_COMPLETE' })}
          className="w-full h-full object-cover"
          aria-label={`${playerBillionaire?.name} versus ${cpuBillionaire?.name} animation`}
        />
      ) : (
        // Fallback: Text-based display with padding
        <div className="flex flex-col items-center justify-center gap-8 px-9">
          {/* Player Name */}
          <Text variant="title-2" align="center" className="text-common-ash">
            {playerBillionaire?.name || 'Player'}
          </Text>

          {/* VS Text */}
          <Text variant="title-1" className="text-common-ash">
            VS
          </Text>

          {/* CPU Name */}
          <Text variant="title-2" align="center" className="text-common-ash">
            {cpuBillionaire?.name || 'Computer'}
          </Text>
        </div>
      )}
    </motion.div>
  );
};
