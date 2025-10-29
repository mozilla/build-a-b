import { cn } from '@/utils/cn';
import { type FC } from 'react';
import type { CarouselProps } from './types';

export const Carousel: FC<CarouselProps> = ({ children, className = '' }) => {
  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4">{children}</div>
    </div>
  );
};
