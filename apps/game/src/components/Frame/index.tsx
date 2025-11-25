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
  variant?: 'scrollable' | 'screen-renderer';
}

export const Frame: FC<PropsWithChildren<FrameProps>> = ({
  children,
  backgroundSrc,
  className,
  style,
  overlay,
  variant,
}) => {
  useBlurredBackground(backgroundSrc);

  return (
    <div
      id="frame"
      className={cn(
        'frame',
        'size-full bg-cover bg-center bg-no-repeat relative overflow-hidden grid',
      )}
      style={{
        ...style,
        // backgroundImage: backgroundSrc ? `url(${backgroundSrc})` : undefined,
      }}
      >
      <div
        className={cn(
          'overscroll-none place-self-center object-contain',
          'size-full bg-cover bg-center bg-no-repeat relative grid',
          'hide-scrollbar frame',
          // 'size-full overscroll-none place-self-center min-w-0 min-h-0',
          variant === 'scrollable' && 'overflow-auto',
        )}
        style={{
          ...style,
          backgroundImage: backgroundSrc ? `url(${backgroundSrc})` : undefined,
        }}
      >
        <div className={cn('relative size-full frame', className)}>
          {overlay}
          {children}
        </div>
      </div>
    </div>
  );
};
