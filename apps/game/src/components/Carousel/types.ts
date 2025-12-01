import type { HTMLAttributes, RefObject } from 'react';

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  containerRef?: RefObject<HTMLDivElement | null>;
  scrollerAttributes?: HTMLAttributes<HTMLDivElement>;
}
