/**
 * DeckPile - Displays a deck of cards with card back and counter
 */

import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import { TRACKS } from '@/config/audio-config';
import { useGameStore } from '@/store/game-store';
import { cn } from '@/utils/cn';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { type FC, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CARD_BACK_IMAGE } from '../../config/game-config';
import { Card } from '../Card';
import type { DeckPileProps } from './types';

export const DeckPile: FC<DeckPileProps> = ({
  cardCount,
  owner,
  deckSwapCount = 0,
  className,
  layoutOwner,
  activeIndicator = false,
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
  const playAudio = useGameStore((state) => state.playAudio);
  const audioPlayedRef = useRef(false);
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
      // Play audio when swap animation starts (only from player deck to avoid duplicate)
      if (owner === 'player' && !audioPlayedRef.current) {
        playAudio(TRACKS.DECK_SWAP);
        audioPlayedRef.current = true;
      }

      const controls = animate(swapProgress, 1, {
        duration: ANIMATION_DURATIONS.FORCED_EMPATHY_SWAP_DURATION / 1000,
        ease: [0.33, 0.0, 0.67, 1.0],
        onComplete: () => {
          swapProgress.set(0);
          // Reset audio flag when animation completes
          audioPlayedRef.current = false;
        },
      });

      prevDeckSwapCountRef.current = deckSwapCount;

      return () => {
        controls.stop();
      };
    }
  }, [deckSwapCount, swapProgress, owner, playAudio]);
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
    <motion.div
      layout
      className={cn('flex flex-col items-center gap-1 w-full outline-0', className)}
      data-deck-owner={owner}
      data-deck={owner}
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
        className="relative size-full z-19 outline-0"
        initial={false}
        style={{
          x: horizontalOffset,
          rotateZ: swapRotation,
        }}
      >
        {/* Show stacked effect if cards > 0 */}
        {cardCount > 0 ? (
          <div className={cn('relative -translate-y-1', activeIndicator && 'animate-heartbeat')}>
            {/* Back cards for stacking effect */}

              {/* New card (only show if we have 4+ cards) - fades in from behind during animation */}
              {cardCount >= 4 && (
                <motion.div
                  data-new
                  className="absolute pointer-events-none size-full"
                  initial={false}
                  animate={{
                    opacity: playingCard ? [0, 1] : 1,
                    x: playingCard ? [-4, 0] : 0,
                    y: playingCard ? [-4, 0] : 0,
                  }}
                  transition={{
                    duration: shiftTransitionDuration,
                    ease: 'easeOut',
                  }}
                >
                  <Card cardFrontSrc={CARD_BACK_IMAGE} state="initial" variant="deck-pile" />
                </motion.div>
              )}

              {/* Bottom card */}
              {cardCount >= 3 && (
                <motion.div
                  data-bottom
                  className="absolute pointer-events-none size-full"
                  initial={false}
                  animate={{
                    x: playingCard ? [0, 4] : 0,
                    y: playingCard ? [0, 4] : 0,
                  }}
                  transition={{
                    duration: shiftTransitionDuration,
                    ease: 'easeOut',
                  }}
                >
                  <Card cardFrontSrc={CARD_BACK_IMAGE} state="initial" variant="deck-pile" />
                </motion.div>
              )}

              {/* Middle card */}
              {cardCount >= 2 && (
                <motion.div
                  data-mid
                  className="absolute pointer-events-none size-full"
                  initial={false}
                  animate={{
                    x: playingCard ? [4, 8] : 4,
                    y: playingCard ? [4, 8] : 4,
                  }}
                  transition={{
                    duration: shiftTransitionDuration,
                    ease: [0.43, 0.13, 0.23, 0.96],
                  }}
                >
                  <Card cardFrontSrc={CARD_BACK_IMAGE} state="initial" variant="deck-pile" />
                </motion.div>
              )}

              {/* Top card - animated when played */}
              <motion.div
                className="relative size-full"
                initial={false}
                animate={{
                  // For multi-card plays, stagger fade-outs
                  opacity: playingCard
                    ? cardsPlayedThisTurn > 1
                      ? [1, 0.7, 0] // Multi-card: gradual fade
                      : [1, 0] // Single card: direct fade
                    : 1, // ← Should be 1 when not playing
                  x: 8,
                  y: 8,
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
                <Card
                  data-measure-target={owner}
                  cardFrontSrc={CARD_BACK_IMAGE}
                  state="initial"
                  variant="deck-pile"
                />
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
  );
};
