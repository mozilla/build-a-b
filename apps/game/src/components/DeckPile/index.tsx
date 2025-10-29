/**
 * DeckPile - Displays a deck of cards with card back and counter
 */

import { type FC } from 'react';
import { motion } from 'framer-motion';
import { CARD_BACK_IMAGE } from '../../config/game-config';
import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import { Card } from '../Card';
import { Tooltip } from '../Tooltip';
import type { DeckPileProps } from './types';
import Text from '../Text';

export const DeckPile: FC<DeckPileProps> = ({
  cardCount,
  owner,
  onClick,
  showTooltip = false,
  tooltipContent,
  activeIndicator = false,
  forcedEmpathySwapping = false,
  decksVisuallySwapped = false,
}) => {
  const isPlayer = owner === 'player';

  // Animation variants for deck swapping
  const swapAnimation = forcedEmpathySwapping
    ? {
        // CPU deck moves down (to player position) with WIDE curve through right
        // Player deck moves up (to CPU position) with WIDE curve through left
        // Wider X values to avoid center cards
        y: owner === 'cpu' ? ['0vh', '35vh', '66vh'] : ['0vh', '-35vh', '-66vh'],
        x: owner === 'cpu' ? ['0vw', '25vw', '0vw'] : ['0vw', '-25vw', '0vw'],
        scale: [1, 1.15, 1],
        rotateY: owner === 'cpu' ? [0, 20, 0] : [0, -20, 0],
      }
    : decksVisuallySwapped
    ? {
        // Keep decks in swapped positions permanently
        y: owner === 'cpu' ? '66vh' : '-66vh',
        x: '0vw',
        scale: 1,
        rotateY: 0,
      }
    : {
        // Normal positions
        y: '0vh',
        x: '0vw',
        scale: 1,
        rotateY: 0,
      };

  return (
    <Tooltip
      content={
        <Text variant="body-small" color="text-accent" weight='medium'>
          {tooltipContent}
        </Text>
      }
      isOpen={showTooltip}
    >
      <div className="flex flex-col items-center gap-2">
        {/* Counter for CPU (top) - stays in place */}
        {!isPlayer && <div className="text-white text-sm font-medium">{cardCount} Cards left</div>}

        {/* Card stack - only this animates during swap */}
        <motion.div
          className="relative p-2"
          onClick={cardCount > 0 ? onClick : undefined}
          role={cardCount > 0 ? 'button' : undefined}
          tabIndex={cardCount > 0 ? 0 : undefined}
          animate={swapAnimation}
          transition={{
            duration: ANIMATION_DURATIONS.FORCED_EMPATHY_SWAP / 1000,
            ease: [0.43, 0.13, 0.23, 0.96], // Custom easing for smooth curve
            times: [0, 0.5, 1], // Keyframe timing
          }}
        >
          {/* Show stacked effect if cards > 0 */}
          {cardCount > 0 ? (
            <div className={`relative ${activeIndicator ? 'animate-heartbeat' : ''}`}>
              {/* Back cards for stacking effect - offset to top-left */}
              <div className="absolute -translate-x-2 -translate-y-2 pointer-events-none">
                <Card cardFrontSrc={CARD_BACK_IMAGE} state="initial" />
              </div>
              <div className="absolute -translate-x-1 -translate-y-1 pointer-events-none">
                <Card cardFrontSrc={CARD_BACK_IMAGE} state="initial" />
              </div>
              {/* Top card (main visible card) */}
              <Card cardFrontSrc={CARD_BACK_IMAGE} state="initial" />
            </div>
          ) : (
            /* Empty deck indicator */
            <div className="w-[7.5rem] h-[10.5rem] rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center">
              <span className="text-white/50 text-xs">Empty</span>
            </div>
          )}
        </motion.div>

        {/* Counter for Player (bottom) - stays in place */}
        {isPlayer && <div className="text-white text-sm font-medium">{cardCount} Cards left</div>}
      </div>
    </Tooltip>
  );
};
