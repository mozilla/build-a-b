import { cn } from '@/utils/cn';
import { type FC } from 'react';
import type { CarouselProps } from './types';

export const Carousel: FC<CarouselProps> = ({
  className,
  containerRef,
  children,
  scrollerAttributes,
  ...containerAttributes
}) => {
  const {
    className: scrollerClassName,
    style: scrollerStyle,
    ...scrollerProps
  } = scrollerAttributes || {};

  return (
    <div className={cn('relative w-full overflow-hidden', className)} {...containerAttributes}>
      <div
        ref={containerRef}
        className={cn(
          'hide-scrollbar flex items-center overflow-x-auto snap-x snap-mandatory py-8',
          scrollerClassName,
        )}
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          ...scrollerStyle,
        }}
        {...scrollerProps}
      >
        {children}
      </div>
    </div>
  );
};
