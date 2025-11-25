import type { AudioTrackId } from '@/config/audio-config';

export type SpecialCardAnimationProps = {
  /** Controls visibility of the animation */
  show: boolean;
  /** Video source URL (WebM file) or lottie animation */
  animationSrc?: string | unknown;
  /** boolean set if animation is a lottie */
  isLottie?: unknown;
  /** Optional title/label to display */
  title?: string;
  /** Custom className for the overlay container */
  className?: string;
  /** Custom className for the animation wrapper */
  animationClassName?: string;
  /** Custom className for the video element */
  videoClassName?: string;
  /** Custom className for the title */
  titleClassName?: string;
  /** Whether to loop the animation (default: true) */
  loop?: boolean;
  /** Whether to show controls (default: false) */
  controls?: boolean;
  /** Remove bg blur */
  removeBlur?: boolean;
  /** Optional audio track to play (defaults to EVENT_TAKEOVER) */
  audioTrack?: AudioTrackId;
};
