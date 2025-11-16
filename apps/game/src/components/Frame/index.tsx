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
  variant?: 'screen-renderer';
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
      className={cn(
        'h-[100dvh] w-[100vw] sm:max-w-[25rem] sm:max-h-[54rem] bg-cover bg-center bg-no-repeat relative portrait:min-frame-height:rounded-[12px] landscape-frame-height:rounded-xl overflow-hidden grid',
      )}
      style={{
        ...style,
        backgroundImage: backgroundSrc ? `url(${backgroundSrc})` : undefined,
      }}
    >
      <div
        className={cn(
          'size-full max-w-[25rem] max-h-[54rem] overscroll-none place-self-center',
          variant === 'screen-renderer' && 'overflow-auto',
        )}
      >
        <div className={cn('relative size-full', className)}>
          {overlay}
          {children}
        </div>
      </div>
    </div>
  );
};
