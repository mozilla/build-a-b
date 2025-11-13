/**
 * DeckPile - Displays a deck of cards with card back and counter
 */

import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import { cn } from '@/utils/cn';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { type FC, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  deckSwapCount = 0,
  className,
  isRunningWinAnimation,
  layoutOwner,
}) => {
  // Use layoutOwner for positioning logic (accounts for deck swaps), fallback to owner
  const positionOwner = layoutOwner ?? owner;
  const isPlayer = positionOwner === 'player';
  const deckRef = useRef<HTMLDivElement>(null);
  const prevCardCountRef = useRef(cardCount);
  const prevDeckSwapCountRef = useRef(deckSwapCount);
  const [playingCard, setPlayingCard] = useState(false);
  const [cardsPlayedThisTurn, setCardsPlayedThisTurn] = useState(0);
  const swapProgress = useMotionValue(0);
  /**
   * Arcs the flight path of the decks throughout the course of the swap animation.
   * Uses sin(π * progress) which peaks at progress 0.5
   * The horizontal offset moves the deck sideways during the swap animation.
   */
  const horizontalOffset = useTransform(swapProgress, (progress) => {
    const maxOffset = 120;
    const swapDirection = isPlayer ? 1 : -1;
    return `${swapDirection * maxOffset * Math.sin(Math.PI * progress)}%`;
  });
  /**
   * Rotates the deck during the swap animation for visual polish.
   * The rotation follows the same arc pattern as the horizontal movement.
   */
  const swapRotation = useTransform(
    swapProgress,
    (progress) => `${-20 * Math.sin(Math.PI * progress)}deg`,
  );
  /**
   * Deck swapping animation
   * Triggers when deckSwapCount changes, animating the deck position swap.
   */
  useEffect(() => {
    if (deckSwapCount !== prevDeckSwapCountRef.current) {
      const controls = animate(swapProgress, 1, {
        duration: ANIMATION_DURATIONS.FORCED_EMPATHY_SWAP_DURATION / 1000,
        ease: [0.33, 0.0, 0.67, 1.0],
        onComplete: () => swapProgress.set(0),
      });

      prevDeckSwapCountRef.current = deckSwapCount;

      return () => {
        controls.stop();
      };
    }
  }, [deckSwapCount, swapProgress]);
  /**
   * Card play animations
   */
  useLayoutEffect(() => {
    const cardDiff = prevCardCountRef.current - cardCount;
    const playingCard = cardDiff > 0;

    if (playingCard) {
      // Track how many cards were just played
      setCardsPlayedThisTurn(cardDiff);

      // A card was played from this deck
      setPlayingCard(true);

      // Reset animation state after animation completes
      const timer = setTimeout(() => {
        setPlayingCard(false);
        setCardsPlayedThisTurn(0);
      }, ANIMATION_DURATIONS.CARD_PLAY_FROM_DECK);

      // Cleanup timeout if component unmounts
      return () => clearTimeout(timer);
    }
    prevCardCountRef.current = cardCount;
  }, [cardCount]);

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
      <motion.div
        layout
        className={cn('flex flex-col items-center gap-1 w-full', className)}
        data-deck-owner={owner}
        transition={{
          layout: {
            duration: ANIMATION_DURATIONS.FORCED_EMPATHY_SWAP_DURATION / 1000,
            ease: [0.33, 0.0, 0.67, 1.0],
          },
        }}
      >
        {/* horizontalOffset/swapRotation are applied separately from the layout
            animation to avoid any issues with conflicting transform values being
            applied at the same time.
        */}
        <motion.div
          ref={deckRef}
          className="relative p-2 w-full z-19"
          onClick={cardCount > 0 && !isRunningWinAnimation ? onClick : undefined}
          role={cardCount > 0 ? 'button' : undefined}
          tabIndex={cardCount > 0 ? 0 : undefined}
          initial={false}
          style={{
            x: horizontalOffset,
            rotateZ: swapRotation,
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
                    opacity: playingCard ? [0, 1] : 1,
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
                    x: playingCard ? [-8, -4] : -4,
                    y: playingCard ? [-8, -4] : -4,
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
                    x: playingCard ? [-4, 0] : 0,
                    y: playingCard ? [-4, 0] : 0,
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
                  opacity: playingCard
                    ? cardsPlayedThisTurn > 1
                      ? [1, 0.7, 0] // Multi-card: gradual fade
                      : [1, 0] // Single card: direct fade
                    : 0,
                  x: 0,
                  y: 0,
                }}
                transition={{
                  duration: playingCard
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
      </motion.div>
    </Tooltip>
  );
};
