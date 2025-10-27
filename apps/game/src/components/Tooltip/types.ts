import type { TooltipProps as HeroUITooltipProps } from '@heroui/tooltip';

export interface TooltipProps extends Omit<HeroUITooltipProps, 'placement'> {
  /**
   * Arrow direction for the tooltip
   * @default 'bottom'
   */
  arrowDirection?: 'top' | 'bottom' | 'left' | 'right';
}
