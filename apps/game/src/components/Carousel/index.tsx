import { type FC } from 'react';
import type { CarouselProps } from './types';

export const Carousel: FC<CarouselProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4">
        {children}
      </div>
    </div>
  );
};
