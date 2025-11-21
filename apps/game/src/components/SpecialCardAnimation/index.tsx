import { TRACKS } from '@/config/audio-config';
import { useGameStore } from '@/store';
import { cn } from '@/utils/cn';
import { useEffect, useRef } from 'react';
import type { SpecialCardAnimationProps } from './types';

/**
 * Generic Special Card Animation Component
 * Displays a board-sized overlay with a WebM video animation
 * Matches the game board dimensions (max-w-[25rem] max-h-[54rem])
 * Reusable for any special card effect (OWYW, Forced Empathy, Data Grab, etc.)
 */
export const SpecialCardAnimation = ({
  show,
  videoSrc,
  title,
  className = '',
  videoClassName = '',
  loop = true,
  controls = false,
  removeBlur = true,
  audioTrack,
}: SpecialCardAnimationProps) => {
  const { playAudio } = useGameStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioPlayedRef = useRef(false);

  // Auto-play video when component becomes visible
  useEffect(() => {
    if (show && videoRef.current) {
      videoRef.current
        .play()
        .then(() => {
          if (!audioPlayedRef.current) {
            audioPlayedRef.current = true;
            playAudio(audioTrack || TRACKS.EVENT_TAKEOVER);
          }
        })
        .catch((error) => {
          console.error('Failed to play special card animation:', error);
        });
    }
  }, [show, playAudio, audioTrack]);

  if (!show) return null;

  return (
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center', className)}>
      {/* Board-constrained container matching game board dimensions */}
      <div
        className={`relative w-full h-full max-w-[25rem] max-h-[54rem] bg-black/20 ${
          removeBlur ? '' : 'backdrop-blur-sm'
        }`}
      >
        {/* Video fills full board */}
        <video
          ref={videoRef}
          src={videoSrc}
          loop={loop}
          muted
          playsInline
          controls={controls}
          className={`absolute inset-0 w-full h-full object-cover ${videoClassName}`}
          aria-label={title ? `${title} animation` : 'Special card animation'}
        />
      </div>
    </div>
  );
};
