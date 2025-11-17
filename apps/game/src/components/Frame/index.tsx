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
      className={cn(
        'framed-x:rounded-xl size-full framed-y:max-h-[calc(100vw_*_(844/390))] framed-x:w-[calc(.39*100dvh)] framed-x:max-h-[calc(.844*100dvh)] bg-cover bg-center bg-no-repeat relative overflow-hidden grid',
      )}
      style={{
        ...style,
        backgroundImage: backgroundSrc ? `url(${backgroundSrc})` : undefined,
      }}
    >
      <div
        className={cn(
          'size-full overscroll-none place-self-center min-w-0 min-h-0',
          variant === 'scrollable' && '', // 'overflow-auto',
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
