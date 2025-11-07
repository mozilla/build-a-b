/**
 * Tooltip Hook
 * Provides tooltip message and handles display count tracking
 */

import { useEffect, useMemo } from 'react';
import { getTooltipConfig, type TooltipKey } from '../config/tooltip-config';
import { useGameStore } from '../store/game-store';

/**
 * Hook to get tooltip message and handle display count
 *
 * @param tooltipKey - The tooltip key from state machine context
 * @returns The tooltip message to display (empty string if shouldn't show)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const tooltipMessage = useGameStore((state) => state.context.tooltipMessage);
 *   const tooltip = useTooltip(tooltipMessage);
 *
 *   return tooltip ? <div>{tooltip}</div> : null;
 * }
 * ```
 */
export function useTooltip(tooltipKey: TooltipKey): string {
  const getTooltipDisplayCount = useGameStore((state) => state.getTooltipDisplayCount);
  const incrementTooltipCount = useGameStore((state) => state.incrementTooltipCount);
  const shouldShowTooltip = useGameStore((state) => state.shouldShowTooltip);

  // Get the tooltip configuration
  const config = useMemo(() => getTooltipConfig(tooltipKey), [tooltipKey]);

  // Get current display count
  const currentCount = useMemo(
    () => (config ? getTooltipDisplayCount(config.id) : 0),
    [config, getTooltipDisplayCount]
  );

  // Determine if we should show this tooltip
  const shouldShow = useMemo(
    () => (config ? shouldShowTooltip(config.id, config.maxDisplayCount) : false),
    [config, shouldShowTooltip, currentCount]
  );

  // Increment display count when tooltip is shown
  useEffect(() => {
    if (config && shouldShow && config.message !== '') {
      incrementTooltipCount(config.id);
    }
  }, [config, shouldShow, incrementTooltipCount]);

  // Return the message if should show, otherwise empty string
  if (!config || !shouldShow) {
    return '';
  }

  return config.message;
}

/**
 * Hook to get tooltip message without incrementing count
 * Useful for preview/display purposes where you don't want to affect the count
 *
 * @param tooltipKey - The tooltip key from state machine context
 * @returns The tooltip message (always returns message, ignores display count)
 */
export function useTooltipPreview(tooltipKey: TooltipKey): string {
  const config = useMemo(() => getTooltipConfig(tooltipKey), [tooltipKey]);
  return config?.message || '';
}

/**
 * Hook to check if a tooltip should be shown (without getting the message)
 * Useful for conditional rendering logic
 *
 * @param tooltipKey - The tooltip key from state machine context
 * @returns True if tooltip should be shown, false otherwise
 */
export function useShouldShowTooltip(tooltipKey: TooltipKey): boolean {
  const shouldShowTooltip = useGameStore((state) => state.shouldShowTooltip);

  const config = useMemo(() => getTooltipConfig(tooltipKey), [tooltipKey]);

  return useMemo(
    () => (config ? shouldShowTooltip(config.id, config.maxDisplayCount) : false),
    [config, shouldShowTooltip]
  );
}
