import type { FC } from 'react';
import Lottie from 'lottie-react';

interface LottieAnimationProps {
  animationData: unknown;
  loop?: boolean;
  autoplay?: boolean;
  width?: number | string;
  height?: number | string;
  className?: string;
  speed?: number;
}

/**
 * Reusable Lottie animation wrapper component
 * Provides consistent configuration and easy usage across the app
 */
export const LottieAnimation: FC<LottieAnimationProps> = ({
  animationData,
  loop = true,
  autoplay = true,
  width = '100%',
  height = '100%',
  className = '',
}) => {
  return (
    <div className={className} style={{ width, height }}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
