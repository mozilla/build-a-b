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
  isRunningWinAnimation
}) => {
  const isPlayer = owner === 'player';
  const deckRef = useRef<HTMLDivElement>(null);
  const [swapDistance, setSwapDistance] = useState<{ y: number; x: number } | null>(null);
  const prevCardCountRef = useRef(cardCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [cardsPlayedThisTurn, setCardsPlayedThisTurn] = useState(0);

  // Self-trigger corresponding animation when this deck's card count changes
  useLayoutEffect(() => {
    const cardDiff = prevCardCountRef.current - cardCount;
    const playingCard = cardDiff > 0;
    const receivingCards = cardCount > prevCardCountRef.current && prevCardCountRef.current > 0;

    if (playingCard) {
      // Track how many cards were just played
      setCardsPlayedThisTurn(cardDiff);

      // A card was played from this deck
      setIsAnimating(true);

      // Reset animation state after animation completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setCardsPlayedThisTurn(0);
      }, ANIMATION_DURATIONS.CARD_PLAY_FROM_DECK);

      // Cleanup timeout if component unmounts
      return () => clearTimeout(timer);
    }

    if (receivingCards) {
      // Cards were added to this deck (collection)
      setIsReceiving(true);

      // Reset animation state after animation completes
      const timer = setTimeout(() => {
        setIsReceiving(false);
      }, ANIMATION_DURATIONS.CARD_COLLECTION);

      // Cleanup timeout if component unmounts
      return () => clearTimeout(timer);
    }
    prevCardCountRef.current = cardCount;
  }, [cardCount]);

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
      const verticalDistance = boardRect.height * 0.68; // 65% of board height for safer bounds

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
          scale: isReceiving ? [1, 1.03, 1] : 1, // Subtle pulse when receiving cards
          rotateY: 0,
        }
      : {
          // Normal positions
          y: 0,
          x: 0,
          scale: isReceiving ? [1, 1.03, 1] : 1, // Subtle pulse when receiving cards
          rotateY: 0,
        };

  const shiftTransitionDuration = ANIMATION_DURATIONS.CARD_PLAY_FROM_DECK / 1000;

  return (
    <Tooltip
      content={
        <Text className="leading-[1.2]" variant="body-small" color="text-accent" weight="semibold">
          {tooltipContent}
        </Text>
      }
      isOpen={showTooltip}
      classNames={{
        base: [isPlayer ? 'translate-y-6' : '-translate-y-6'],
      }}
    >
      <div className="flex flex-col items-center gap-1 w-full" data-deck-owner={owner}>
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
          className="relative p-2 w-full z-19"
          onClick={cardCount > 0 && !isRunningWinAnimation ? onClick : undefined}
          role={cardCount > 0 ? 'button' : undefined}
          tabIndex={cardCount > 0 ? 0 : undefined}
          animate={swapAnimation}
          transition={{
            duration: ANIMATION_DURATIONS.FORCED_EMPATHY_SWAP_DURATION / 1000,
            delay: 0, // No delay - starts immediately when forcedEmpathySwapping = true
            ease: [0.43, 0.13, 0.23, 0.96], // Custom easing for smooth curve
            times: [0, 0.5, 1], // Keyframe timing
          }}
        >
          {/* Show stacked effect if cards > 0 */}
          {cardCount > 0 ? (
            <div className={`translate-x-4 relative ${activeIndicator ? 'animate-heartbeat' : ''}`}>
              {/* Back cards for stacking effect */}

              {/* New card (only show if we have 4+ cards) - fades in from behind during animation */}
              {cardCount >= 4 && (
                <motion.div
                  data-new
                  className="absolute pointer-events-none"
                  initial={false}
                  animate={{
                    opacity: isAnimating ? [0, 1] : 1,
                    x: -8,
                    y: -8,
                  }}
                  transition={{
                    duration: shiftTransitionDuration,
                    ease: 'easeOut',
                  }}
                >
                  <Card cardFrontSrc={CARD_BACK_IMAGE} state="initial" />
                </motion.div>
              )}

              {/* Bottom card */}
              {cardCount >= 3 && (
                <motion.div
                  data-bottom
                  className="absolute pointer-events-none"
                  initial={false}
                  animate={{
                    x: isAnimating ? [-8, -4] : -4,
                    y: isAnimating ? [-8, -4] : -4,
                  }}
                  transition={{
                    duration: shiftTransitionDuration,
                    ease: 'easeOut',
                  }}
                >
                  <Card cardFrontSrc={CARD_BACK_IMAGE} state="initial" />
                </motion.div>
              )}

              {/* Middle card */}
              {cardCount >= 2 && (
                <motion.div
                  data-mid
                  className="absolute pointer-events-none"
                  initial={false}
                  animate={{
                    x: isAnimating ? [-4, 0] : 0,
                    y: isAnimating ? [-4, 0] : 0,
                  }}
                  transition={{
                    duration: shiftTransitionDuration,
                    ease: [0.43, 0.13, 0.23, 0.96],
                  }}
                >
                  <Card cardFrontSrc={CARD_BACK_IMAGE} state="initial" />
                </motion.div>
              )}

              {/* Top card - animated when played */}
              <motion.div
                className="relative"
                initial={false}
                animate={{
                  // For multi-card plays, stagger fade-outs
                  opacity: isAnimating
                    ? cardsPlayedThisTurn > 1
                      ? [1, 0.7, 0] // Multi-card: gradual fade
                      : [1, 0] // Single card: direct fade
                    : 0,
                  x: 0,
                  y: 0,
                }}
                transition={{
                  duration: isAnimating
                    ? cardsPlayedThisTurn > 1
                      ? shiftTransitionDuration * 1.2 // Extend duration for multi-card
                      : shiftTransitionDuration * 0.5
                    : shiftTransitionDuration,
                  ease: [0.43, 0.13, 0.23, 0.96],
                }}
              >
                <Card data-measure-target={owner} cardFrontSrc={CARD_BACK_IMAGE} state="initial" />
              </motion.div>
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
