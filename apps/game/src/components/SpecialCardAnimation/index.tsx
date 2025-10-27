import Lottie from 'lottie-react';
import type { SpecialCardAnimationProps } from './types';

/**
 * Generic Special Card Animation Component
 * Displays a full-screen overlay with a Lottie animation
 * Reusable for any special card effect (OWYW, Data Grab, etc.)
 */
export const SpecialCardAnimation = ({
  show,
  animationData,
  title,
  width = 300,
  height = 300,
  className = '',
  animationClassName = '',
  titleClassName = '',
  loop = true,
  lottieOptions = {},
}: SpecialCardAnimationProps) => {
  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${className}`}
    >
      <div className={`flex flex-col items-center gap-4 ${animationClassName}`}>
        <Lottie
          animationData={animationData}
          loop={loop}
          autoplay={true}
          style={{ width, height }}
          {...lottieOptions}
        />
        {title && <p className={`text-xl font-bold text-white ${titleClassName}`}>{title}</p>}
      </div>
    </div>
  );
};
