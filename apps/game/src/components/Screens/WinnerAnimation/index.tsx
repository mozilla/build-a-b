import { motion } from 'framer-motion';
import { type FC, memo, useEffect, useMemo, useRef } from 'react';

import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';
import { TRACKS } from '@/config/audio-config';
import { BILLIONAIRES, DEFAULT_BILLIONAIRE_ID } from '@/config/billionaires';
import { getPreloadedVideo } from '@/hooks/use-video-preloader';
import { useCpuBillionaire, useGameStore } from '@/store';
import { getCharacterAnimation } from '@/utils/character-animations';
import { cn } from '@/utils/cn';
import { gtagEvent } from '@/utils/gtag';

/**
 * WinnerAnimation Screen
 *
 * Displays a WebM video animation for the winning billionaire.
 * Triggers GameOver screen crossfade during the last 3 seconds of playback.
 * Auto-completes when video ends.
 */

const CROSS_FADE_DURATION = 0.25; // in seconds

export const WinnerAnimation: FC<BaseScreenProps> = memo(
  ({ className, onGameOverCrossfadeStart, onGameOverCrossfadeComplete, ...props }) => {
    const { selectedBillionaire, winner, playAudio } = useGameStore();
    const cpuBillionaireId = useCpuBillionaire();
    const containerRef = useRef<HTMLDivElement>(null);
    const crossfadeTriggeredRef = useRef(false);
    const audioPlayedRef = useRef(false);
    const eventTrackedRef = useRef(false);

    // Determine which billionaire's video to show and which winner type
    // If player wins: show "You win" video with player's billionaire
    // If CPU wins: show "[Billionaire] wins" video with CPU's billionaire
    const winnerBillionaireId = winner === 'player' ? selectedBillionaire : cpuBillionaireId;
    const winnerType = winner === 'player' ? 'player' : 'cpu';

    const winnerBillionaire = useMemo(
      () => BILLIONAIRES.find((b) => b.id === winnerBillionaireId),
      [winnerBillionaireId],
    );

    // Get the animation for the winner
    // For winner animations, first param is billionaire ID, second param is 'player' or 'cpu'
    const animationSrc = useMemo(
      () =>
        getCharacterAnimation(winnerBillionaireId || DEFAULT_BILLIONAIRE_ID, winnerType, 'winner'),
      [winnerBillionaireId, winnerType],
    );

    // Get preloaded video element or null
    const preloadedVideo = useMemo(
      () => (animationSrc ? getPreloadedVideo(animationSrc) : null),
      [animationSrc],
    );

    useEffect(() => {
      if (!winner) return;

      if (!eventTrackedRef.current) {
        eventTrackedRef.current = true;

        gtagEvent({
          action: 'game_complete',
          category: 'gameplay',
          label: winner === 'player' ? 'player_wins' : 'opponent_wins',
        });
      }
    }, [winner]);

    // Mount the preloaded video element into the container
    useEffect(() => {
      if (!containerRef.current || !preloadedVideo) {
        // If no video, immediately trigger callbacks for fallback rendering
        if (!preloadedVideo && !animationSrc) {
          onGameOverCrossfadeStart?.();
          // Delay complete callback to allow crossfade to happen
          const timer = setTimeout(() => {
            onGameOverCrossfadeComplete?.();
          }, CROSS_FADE_DURATION * 1000);
          return () => clearTimeout(timer);
        }
        return;
      }

      const container = containerRef.current; // Copy ref for cleanup
      crossfadeTriggeredRef.current = false; // Reset flag
      audioPlayedRef.current = false; // Reset audio flag

      // Style the video for full coverage
      preloadedVideo.className = 'w-full h-full object-cover';
      preloadedVideo.setAttribute('aria-label', `${winnerBillionaire?.name} wins animation`);

      // Listen for time updates to trigger crossfade
      const handleTimeUpdate = () => {
        const { currentTime, duration } = preloadedVideo;
        if (
          duration &&
          currentTime >= duration - CROSS_FADE_DURATION &&
          !crossfadeTriggeredRef.current &&
          onGameOverCrossfadeStart
        ) {
          crossfadeTriggeredRef.current = true;
          onGameOverCrossfadeStart();
        }
      };

      // Listen for video end event
      const handleVideoEnd = () => {
        onGameOverCrossfadeComplete?.();
      };

      preloadedVideo.addEventListener('timeupdate', handleTimeUpdate);
      preloadedVideo.addEventListener('ended', handleVideoEnd);

      // Append to container
      container.appendChild(preloadedVideo);

      preloadedVideo
        .play()
        .then(() => {
          if (!audioPlayedRef.current) {
            audioPlayedRef.current = true;
            playAudio(TRACKS.END_SEQUENCE);
          }
        })
        .catch((error) => {
          console.error('Failed to play winner animation:', error);
          // Fallback: trigger crossfade immediately if play fails
          onGameOverCrossfadeStart?.();
          setTimeout(() => onGameOverCrossfadeComplete?.(), CROSS_FADE_DURATION * 1000);
        });

      return () => {
        preloadedVideo.removeEventListener('timeupdate', handleTimeUpdate);
        preloadedVideo.removeEventListener('ended', handleVideoEnd);
        // Don't remove the video from DOM - keep it in global preload cache
        // Just remove from this specific container
        if (preloadedVideo.parentElement === container) {
          container.removeChild(preloadedVideo);
        }
      };
    }, [
      preloadedVideo,
      animationSrc,
      winnerBillionaire?.name,
      winnerType,
      playAudio,
      onGameOverCrossfadeStart,
      onGameOverCrossfadeComplete,
    ]);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'relative flex flex-col items-center justify-center w-full h-full',
          className,
        )}
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
            onEnded={() => onGameOverCrossfadeComplete?.()}
            onTimeUpdate={(e) => {
              const video = e.currentTarget;
              if (
                video.duration &&
                video.currentTime >= video.duration - 3 &&
                !crossfadeTriggeredRef.current
              ) {
                crossfadeTriggeredRef.current = true;
                onGameOverCrossfadeStart?.();
              }
            }}
            className="w-full h-full object-cover"
            aria-label={`${winnerBillionaire?.name} wins animation`}
          />
        ) : (
          // Fallback: Text-based display
          <div className="flex flex-col items-center justify-center gap-8 px-9">
            <Text variant="title-1" className="text-common-ash">
              {winner === 'player' ? 'You Win!' : 'CPU Wins!'}
            </Text>
            <Text variant="title-2" align="center" className="text-common-ash">
              {winnerBillionaire?.name || 'Unknown'}
            </Text>
          </div>
        )}
      </motion.div>
    );
  },
  // Custom comparison function to prevent re-renders when only style/className changes
  (prevProps, nextProps) => {
    // Only re-render if the critical callback props change
    return (
      prevProps.onGameOverCrossfadeStart === nextProps.onGameOverCrossfadeStart &&
      prevProps.onGameOverCrossfadeComplete === nextProps.onGameOverCrossfadeComplete &&
      prevProps.send === nextProps.send
    );
  },
);

WinnerAnimation.displayName = 'WinnerAnimation';
