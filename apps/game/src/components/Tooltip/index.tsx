/**
 * Tooltip - Custom styled tooltip component
 * Wraps HeroUI Tooltip with custom default styling
 */

import { Tooltip as HeroUITooltip } from '@heroui/react';
import { type FC } from 'react';
import type { TooltipProps } from './types';

export const Tooltip: FC<TooltipProps> = ({
  placement = 'top',
  arrowDirection = 'bottom',
  classNames,
  showArrow = true,
  children,
  ...props
}) => {
  // Now placement and arrowDirection are independent
  // placement: where the tooltip appears relative to target
  // arrowDirection: which way the arrow points

  // Map arrow direction to rotation and positioning
  const arrowStylesMap = {
    top: [
      'before:rotate-0',
      'before:top-0',
      'before:left-1/2',
      'before:-translate-x-1/2',
      'before:-translate-y-full',
    ],
    bottom: [
      'before:rotate-180',
      'before:bottom-0',
      'before:left-1/2',
      'before:-translate-x-1/2',
      'before:translate-y-full',
    ],
    left: [
      'before:-rotate-90',
      'before:left-0',
      'before:top-1/2',
      'before:-translate-y-1/2',
      'before:-translate-x-full',
    ],
    right: [
      'before:rotate-90',
      'before:right-0',
      'before:top-1/2',
      'before:-translate-y-1/2',
      'before:translate-x-full',
    ],
  };
  const arrowStyles = arrowStylesMap[arrowDirection];

  // Default classNames with custom styling
  const defaultClassNames = {
    base: [
      // Arrow styling: width: 1.03125rem, height: 0.65625rem, fill: zinc-400
      'before:w-[1.03125rem]',
      'before:h-[0.65625rem]',
      'before:bg-zinc-400',
      'flex',
      'before:absolute',
      // Create triangle shape - pointing up by default
      'before:[clip-path:polygon(50%_0%,0%_100%,100%_100%)]',
      // Apply rotation and positioning based on arrow direction
      ...arrowStyles,
      // High z-index for tooltips, but below modals (modals use z-50+)
      'z-[45]',
    ],
    content: [
      'flex',
      'min-w-[5rem]',
      'px-4 py-2',
      'justify-center',
      'items-center',
      'gap-2',
      'rounded-[0.625rem]',
      'border-2 border-zinc-400',
      'bg-zinc-600/30',
      'backdrop-blur-[0.125rem]',
    ],
  };

  // Merge custom classNames with defaults
  const mergedClassNames = {
    base: [...defaultClassNames.base, ...(classNames?.base || [])],
    content: [...defaultClassNames.content, ...(classNames?.content || [])],
  };

  return (
    <HeroUITooltip
      style={{
        zIndex: props.style?.zIndex ?? 100,
        ...props.style,
      }}
      placement={placement}
      showArrow={showArrow}
      classNames={mergedClassNames}
      offset={15}
      {...props}
    >
      {children}
    </HeroUITooltip>
  );
};
