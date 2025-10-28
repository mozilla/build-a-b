import type { TooltipProps as HeroUITooltipProps } from '@heroui/tooltip';

export type ArrowDirection = 'top' | 'bottom' | 'left' | 'right';
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps extends Omit<HeroUITooltipProps, 'placement'> {
  /**
   * Arrow direction for the tooltip
   * @default 'bottom'
   */
  arrowDirection?: ArrowDirection;
}
