/**
 * DeckInteractionZone - Fixed clickable area for deck interactions
 * This component stays in a fixed position and handles all click events,
 * tooltips, and active indicators independent of visual deck animations.
 */

import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
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
  activeIndicator: _activeIndicator = false,
  className,
}) => {
  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        'absolute',
        'w-[7rem] h-[9rem]',
        'ml-[50%] left-[-3.3rem]',
        position === 'top' ? 'top-[1rem]' : 'bottom-[1rem]',
        isClickable && 'cursor-pointer',
        className,
      )}
      style={{ zIndex: 'var(--z-deck-interaction)' }}
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
      {/* Tooltip with fade animation */}
      <AnimatePresence>
        {tooltipContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ top: '0.5rem' }}
          >
            <Tooltip
              isOpen={true}
              content={tooltipContent}
              showArrow={false}
              classNames={{
                content: ['text-green-400', 'text-sm', 'whitespace-nowrap'],
              }}
            >
              <div />
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

