import type { LottieComponentProps } from "lottie-react";

export type SpecialCardAnimationProps = {
  /** Controls visibility of the animation */
  show: boolean;
  /** Lottie animation data (JSON) */
  animationData: unknown;
  /** Optional title/label to display */
  title?: string;
  /** Custom width for animation (default: 300) */
  width?: number;
  /** Custom height for animation (default: 300) */
  height?: number;
  /** Custom className for the overlay container */
  className?: string;
  /** Custom className for the animation wrapper */
  animationClassName?: string;
  /** Custom className for the title */
  titleClassName?: string;
  /** Whether to loop the animation (default: true) */
  loop?: boolean;
  /** Additional Lottie options */
  lottieOptions?: Partial<LottieComponentProps>;
};
