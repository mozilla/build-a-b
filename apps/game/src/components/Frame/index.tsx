/**
 * Frame - Centralized component for rendering frames with backgrounds
 */

import { cn } from '@/utils/cn';
import { type CSSProperties, type FC, type PropsWithChildren } from 'react';
import { useBlurredBackground } from '../BlurredBackground/useBlurredBackground';

export interface FrameProps {
  backgroundSrc?: string;
  className?: string;
  style?: CSSProperties;
  overlay?: React.ReactNode;
  blurZIndex?: number;
}

export const Frame: FC<PropsWithChildren<FrameProps>> = ({
  children,
  backgroundSrc,
  className,
  style,
  overlay,
}) => {
  useBlurredBackground(backgroundSrc);

  return (
    <div
      className={cn(
        'h-[100dvh] w-[100vw] max-w-[25rem] max-h-[54rem] bg-cover bg-center bg-no-repeat relative lg:rounded-xl overflow-hidden',
        className,
      )}
      style={{
        ...style,
        backgroundImage: backgroundSrc ? `url(${backgroundSrc})` : undefined,
      }}
    >
      {overlay}
      {children}
    </div>
  );
};
