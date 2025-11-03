import type { TooltipProps as HeroUITooltipProps } from '@heroui/tooltip';

export type ArrowDirection = 'top' | 'bottom' | 'left' | 'right';
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps extends Omit<HeroUITooltipProps, 'placement'> {
  /**
   * Where the tooltip should be positioned relative to the target
   * @default 'top'
   */
  placement?: TooltipPlacement;

  /**
   * Which direction the arrow should point
   * @default 'bottom'
   */
  arrowDirection?: ArrowDirection;
}
