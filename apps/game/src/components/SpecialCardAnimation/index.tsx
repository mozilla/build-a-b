import { TRACKS } from '@/config/audio-config';
import { useGameStore } from '@/store';
import { cn } from '@/utils/cn';
import { useEffect, useRef, useState } from 'react';
import type { SpecialCardAnimationProps } from './types';
import { getPreloadedVideo } from '@/hooks/use-video-preloader';

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
  const [isPreloaded, setIsPreloaded] = useState(false);
  const { playAudio } = useGameStore();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioPlayedRef = useRef(false);
  const videoClasses = cn('absolute inset-0 w-full h-full object-cover', videoClassName);
  const videoTitle = title ? `${title} animation` : 'Special card animation';

  // Check for preloaded video and use it if available
  useEffect(() => {
    const preloadedVideo = getPreloadedVideo(videoSrc);
    const container = videoContainerRef.current;

    if (!container) return;

    if (preloadedVideo) {
      preloadedVideo.className = videoClasses;
      preloadedVideo.setAttribute('aria-label', videoTitle);
      preloadedVideo.loop = loop;
      preloadedVideo.controls = controls;
      preloadedVideo.muted = true;

      if (preloadedVideo.parentNode !== container) {
        container.appendChild(preloadedVideo);
      }

      videoRef.current = preloadedVideo;

      setIsPreloaded(true);
    } else {
      setIsPreloaded(false);
      videoRef.current = null;
    }

    return () => {
      // remove preloaded video on unmount from container and reset classes
      if (preloadedVideo && preloadedVideo.parentNode === container) {
        container.removeChild(preloadedVideo);
        preloadedVideo.className = '';
      }
    };
  }, [controls, loop, videoClasses, videoSrc, videoTitle]);

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
        {isPreloaded ? (
          // Container used for attaching the preloaded video in the useEffect
          <div ref={videoContainerRef} className="absolute inset-0" />
        ) : (
          // No preloaded video, fallback to video element
          <video
            ref={videoRef}
            src={videoSrc}
            loop={loop}
            muted
            playsInline
            controls={controls}
            className={videoClasses}
            aria-label={videoTitle}
          />
        )}
      </div>
    </div>
  );
};
