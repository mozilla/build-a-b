/**
 * DeckPile - Displays a deck of cards with card back and counter
 */

import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import { motion } from 'framer-motion';
import { type FC, useLayoutEffect, useRef, useState } from 'react';
import { CARD_BACK_IMAGE } from '../../config/game-config';
import { Card } from '../Card';
import Text from '../Text';
import { Tooltip } from '../Tooltip';
import type { DeckPileProps } from './types';

export const DeckPile: FC<DeckPileProps> = ({
  cardCount,
  owner,
  onClick,
  showTooltip = false,
  tooltipContent,
  activeIndicator = false,
  forcedEmpathySwapping = false,
  deckSwapCount = 0,
}) => {
  const isPlayer = owner === 'player';
  const deckRef = useRef<HTMLDivElement>(null);
  const [swapDistance, setSwapDistance] = useState<{ y: number; x: number } | null>(null);

  // Determine if decks are currently in swapped positions (odd swap count)
  const isSwapped = deckSwapCount % 2 === 1;

  // Measure the distance between decks when component mounts or window resizes
  useLayoutEffect(() => {
    const measureDistance = () => {
      if (!deckRef.current) return;

      const board = deckRef.current.closest('section'); // Find the Board component

      if (!board) return;

      const boardRect = board.getBoundingClientRect();

      // Calculate the vertical distance as the height of the board minus some padding
      // We want the decks to swap positions, so each travels approximately the board height
      // Subtract deck heights and padding to stay within bounds
      const verticalDistance = boardRect.height * 0.65; // 65% of board height for safer bounds

      // Horizontal curve - use 20% of board width to avoid center cards
      const horizontalCurve = boardRect.width * 0.2;

      setSwapDistance({
        y: verticalDistance,
        x: horizontalCurve,
      });
    };

    measureDistance();

    // Remeasure on window resize
    window.addEventListener('resize', measureDistance);
    return () => window.removeEventListener('resize', measureDistance);
  }, []);

  // Animation variants for deck swapping using measured distances
  // When swapCount is odd, decks stay in swapped positions
  // When swapCount is even, decks return to normal positions
  const swapAnimation =
    forcedEmpathySwapping && swapDistance
      ? {
          // During animation: CPU deck moves down, Player deck moves up
          y:
            owner === 'cpu'
              ? [0, swapDistance.y * 0.5, swapDistance.y]
              : [0, -swapDistance.y * 0.5, -swapDistance.y],
          x: owner === 'cpu' ? [0, swapDistance.x, 0] : [0, -swapDistance.x, 0],
          scale: [1, 1.15, 1],
          rotateY: owner === 'cpu' ? [0, 20, 0] : [0, -20, 0],
        }
      : isSwapped && swapDistance
      ? {
          // After swap: keep decks in swapped positions (no animation)
          y: owner === 'cpu' ? swapDistance.y : -swapDistance.y,
          x: 0,
          scale: 1,
          rotateY: 0,
        }
      : {
          // Normal positions
          y: 0,
          x: 0,
          scale: 1,
          rotateY: 0,
        };

  return (
    <Tooltip
      content={
        <Text className="leading-[1.2]" variant="body-small" color="text-accent" weight="semibold">
          {tooltipContent}
        </Text>
      }
      isOpen={showTooltip}
    >
      <div className="flex flex-col items-center gap-1 w-full">
        {/* Counter for CPU (top) - stays in place */}
        {!isPlayer && (
          <Text
            className="tracking-[0.08em]"
            color="text-common-ash"
            variant="badge-xs"
            transform="uppercase"
          >
            {cardCount} Cards left
          </Text>
        )}

        {/* Card stack - only this animates during swap */}
        <motion.div
          ref={deckRef}
          className="relative p-2 w-full"
          onClick={cardCount > 0 ? onClick : undefined}
          role={cardCount > 0 ? 'button' : undefined}
          tabIndex={cardCount > 0 ? 0 : undefined}
          animate={swapAnimation}
          transition={{
            duration: ANIMATION_DURATIONS.FORCED_EMPATHY_SWAP_DURATION / 1000,
            delay:
              forcedEmpathySwapping && swapDistance
                ? ANIMATION_DURATIONS.FORCED_EMPATHY_SWAP_DELAY / 1000
                : 0, // Wait 800ms before animation starts
            ease: [0.43, 0.13, 0.23, 0.96], // Custom easing for smooth curve
            times: [0, 0.5, 1], // Keyframe timing
          }}
        >
          {/* Show stacked effect if cards > 0 */}
          {cardCount > 0 ? (
            <div className={`translate-x-4 relative ${activeIndicator ? 'animate-heartbeat' : ''}`}>
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
        {isPlayer && (
          <Text
            className="tracking-[0.08em]"
            color="text-common-ash"
            variant="badge-xs"
            transform="uppercase"
          >
            {cardCount} Cards left
          </Text>
        )}
      </div>
    </Tooltip>
  );
};
