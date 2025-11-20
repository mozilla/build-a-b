/**
 * DeckInteractionZone - Fixed clickable area for deck interactions
 * This component stays in a fixed position and handles all click events,
 * tooltips, and active indicators independent of visual deck animations.
 */

import { cn } from '@/utils/cn';
import type { FC } from 'react';
import { Tooltip } from '../Tooltip';

export interface DeckInteractionZoneProps {
  /** Fixed position - 'top' for CPU area, 'bottom' for player area */
  position: 'top' | 'bottom';
  /** Click handler - undefined means not clickable */
  onClick?: () => void;
  /** Tooltip message to display */
  tooltipContent?: string;
  /** Show active glow indicator */
  activeIndicator?: boolean;
  /** Additional className */
  className?: string;
}

export const DeckInteractionZone: FC<DeckInteractionZoneProps> = ({
  position,
  onClick,
  tooltipContent,
  activeIndicator = false,
  className,
}) => {
  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        'absolute z-20',
        'w-[7rem] h-[9rem]',
        'ml-[50%] left-[-3.3rem]',
        position === 'top' ? 'top-[1rem]' : 'bottom-[1rem]',
        isClickable && 'cursor-pointer',
        className,
      )}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {/* Tooltip */}
      {tooltipContent && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Tooltip isOpen={true} content={tooltipContent}>
            <div />
          </Tooltip>
        </div>
      )}
    </div>
  );
};

