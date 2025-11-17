import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import { cn } from '@/utils/cn';
import { getCardGlowType, getGlowClasses } from '@/utils/glow-effects';
import { useSelector } from '@xstate/react';
import { motion } from 'framer-motion';
import type { FC } from 'react';
import { CARD_BACK_IMAGE } from '../../config/game-config';
import { GameMachineContext } from '../../providers/GameProvider';
import { useGameStore } from '../../store';
import type { PlayedCardState } from '../../types/game';
import { getGamePhase } from '../../utils/get-game-phase';
import { Card } from '../Card';
import {
  ANIMATION_DELAYS,
  COLLECTION_ROTATION,
  INITIAL_ROTATION,
  LANDING_EPSILON,
  ROTATION_CLASSES,
  SCALE,
  Z_INDEX_CONFIG,
} from './constants';
import { assignSettledZIndex, getRotationClass } from './utils';

interface AnimatedCardProps {
  playedCardState: PlayedCardState;
  index: number;
  isTopCard: boolean;

  // Batch tracking
  isNewCard: boolean;
  cardIndexInBatch: number;
  playIndex: number;

  // Animation state
  deckOffset: { x: number; y: number };
  shouldCollect: boolean;
  collectionOffset: { x: number; y: number };
  isSwapped: boolean;
  winner: 'player' | 'cpu' | null;
  isCPU: boolean;
  owner: 'player' | 'cpu';

  // Z-index tracking
  landedKey: string;
  landed: boolean;
  settledZRef: React.MutableRefObject<Record<string, number>>;
  elementRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  onLandedChange: (landedKey: string) => void;

  // Card interaction
  shouldShowBadge: boolean;
  onCardClick?: () => void;
}

/**
 * AnimatedCard - Renders a single card with play/collection animations
 * Handles z-index management, effect notifications, and interaction
 */
export const AnimatedCard: FC<AnimatedCardProps> = ({
  playedCardState,
  index,
  isTopCard,
  isNewCard,
  cardIndexInBatch,
  playIndex,
  deckOffset,
  shouldCollect,
  collectionOffset,
  isSwapped,
  winner,
  isCPU,
  owner,
  landedKey,
  landed,
  settledZRef,
  elementRefs,
  onLandedChange,
  shouldShowBadge,
  onCardClick,
}) => {
  // Get game phase to detect data war
  const actorRef = GameMachineContext.useActorRef();
  const stateValue = useSelector(actorRef, (snapshot) => snapshot.value);
  const phase = getGamePhase(stateValue);

  // Show glow for common cards during data war detection
  const player = useGameStore((state) => state.player);
  const cpu = useGameStore((state) => state.cpu);
  const dataWarVideoPlaying = useGameStore((state) => state.dataWarVideoPlaying);
  const anotherPlayExpected = useGameStore((state) => state.anotherPlayExpected);
  const isTiedInComparing =
    phase === 'comparing' &&
    player.playedCard &&
    cpu.playedCard &&
    player.currentTurnValue === cpu.currentTurnValue &&
    !anotherPlayExpected;
  const shouldShowDataWarGlow = isTiedInComparing;

  // Calculate stagger delay for sequential play
  const staggerDelay = isNewCard ? playIndex * ANIMATION_DURATIONS.CARD_PLAY_FROM_DECK : 0;

  // Get rotation class for visual variety
  const rotationClass = getRotationClass(
    isTopCard,
    playedCardState.card.id,
    index,
    ROTATION_CLASSES,
  );
  const rotationDelay = isTopCard ? 0 : ANIMATION_DELAYS.CARD_ROTATION;

  // Determine card image (back or front)
  const cardImage = playedCardState.isFaceDown ? CARD_BACK_IMAGE : playedCardState.card.imageUrl;

  // Determine if this card should glow
  const glowType =
    isTopCard && !playedCardState.isFaceDown
      ? getCardGlowType(
          playedCardState.card.specialType,
          playedCardState.card.isSpecial,
          shouldShowDataWarGlow || false,
        )
      : 'none';
  const glowClasses = getGlowClasses(glowType);

  // Handle card click - opens modal when badge is visible
  const handleCardClick = () => {
    if (isTopCard && shouldShowBadge && onCardClick) {
      onCardClick();
    }
  };

  // Calculate initial rotation with spread effect for multi-card batches
  const baseInitialRotation = isCPU ? INITIAL_ROTATION.CPU : INITIAL_ROTATION.PLAYER;
  const spreadRotation = isNewCard ? (cardIndexInBatch - 1) * 4 : 0;
  const initialRotate = baseInitialRotation + spreadRotation;

  // Animation endpoints
  const finalX = shouldCollect ? collectionOffset.x : 0;
  const finalY = shouldCollect ? collectionOffset.y : 0;
  const finalScale = shouldCollect ? SCALE.DECK : SCALE.TABLE;

  // Collection rotation based on visual position
  const winnerIsVisuallyAtBottom = isSwapped ? winner === 'cpu' : winner === 'player';
  const collectionRotation = winnerIsVisuallyAtBottom
    ? COLLECTION_ROTATION.BOTTOM
    : COLLECTION_ROTATION.TOP;
  const finalRotate = shouldCollect ? collectionRotation : 0;

  // Fade out cards as they're collected into the deck
  const finalOpacity = shouldCollect ? [1, 1, 0.25] : 1;

  // Z-index calculation
  const startZ = isNewCard
    ? Z_INDEX_CONFIG.START_BASE - playIndex
    : Z_INDEX_CONFIG.START_BASE - index;
  const finalZ = isNewCard
    ? Z_INDEX_CONFIG.FINAL_BASE + playIndex
    : Z_INDEX_CONFIG.FINAL_BASE + index;

  const isWinnerCard = shouldCollect && owner === winner;
  const collectionZIndex = shouldCollect
    ? isWinnerCard
      ? Z_INDEX_CONFIG.COLLECTION_WINNER_BASE + index
      : Z_INDEX_CONFIG.COLLECTION_LOSER_BASE + index
    : Z_INDEX_CONFIG.FALLBACK + index;

  const settledAssignedZ = settledZRef.current[landedKey];
  const appliedZ = shouldCollect
    ? collectionZIndex
    : isNewCard
    ? landed
      ? settledAssignedZ ?? finalZ
      : startZ
    : Z_INDEX_CONFIG.FALLBACK + index;

  // Detect when card lands and assign settled z-index
  const handleUpdate = (latest: { [k: string]: number }) => {
    if (!shouldCollect && isNewCard && !landed) {
      const currentY = typeof latest.y === 'number' ? latest.y : NaN;
      if (!Number.isNaN(currentY) && Math.abs(currentY - 0) < LANDING_EPSILON) {
        const el = elementRefs.current[landedKey];
        if (el) {
          const assigned = assignSettledZIndex(
            settledZRef.current,
            Z_INDEX_CONFIG.FINAL_BASE,
            Z_INDEX_CONFIG.CARD_MAX,
          );
          el.style.zIndex = String(assigned);
          settledZRef.current[landedKey] = assigned;
        }
        onLandedChange(landedKey);
      }
    }
  };

  // Fallback: ensure landed is set at animation complete if onUpdate missed it
  const handlePlayComplete = () => {
    if (!shouldCollect && isNewCard) {
      const el = elementRefs.current[landedKey];
      if (el && !(landedKey in settledZRef.current)) {
        const assigned = assignSettledZIndex(
          settledZRef.current,
          Z_INDEX_CONFIG.FINAL_BASE,
          Z_INDEX_CONFIG.CARD_MAX,
        );
        el.style.zIndex = String(assigned);
        settledZRef.current[landedKey] = assigned;
      }
      onLandedChange(landedKey);
    }
  };

  return (
    <motion.div
      ref={(el) => {
        elementRefs.current[landedKey] = el;
      }}
      key={landedKey}
      className={cn(
        'absolute backface-hidden size-full',
        rotationClass,
        glowClasses,
        isTopCard && shouldShowBadge && 'cursor-pointer',
      )}
      style={{
        zIndex: appliedZ,
        // Force animation and glow to stop when video is playing
        ...(dataWarVideoPlaying &&
          glowType === 'data-war' && {
            animation: 'none',
            filter: 'none',
          }),
      }}
      initial={{
        x: deckOffset.x,
        y: deckOffset.y,
        rotate: initialRotate,
        scale: SCALE.DECK,
      }}
      animate={{
        x: finalX,
        y: finalY,
        rotate: finalRotate,
        scale: finalScale,
        opacity: finalOpacity,
      }}
      transition={{
        duration: shouldCollect
          ? ANIMATION_DURATIONS.CARD_COLLECTION / 1000
          : ANIMATION_DURATIONS.CARD_PLAY_FROM_DECK / 1000,
        ease: [0.43, 0.13, 0.23, 0.96],
        delay: shouldCollect
          ? index * 0.05
          : (isTopCard ? 0 : rotationDelay / 1000) + staggerDelay / 1000,
      }}
      onUpdate={handleUpdate}
      onAnimationComplete={handlePlayComplete}
      onClick={handleCardClick}
    >
      <Card
        variant="animated-card"
        cardFrontSrc={cardImage}
        state={
          shouldCollect
            ? 'initial' // Collecting: always show back
            : playedCardState.isFaceDown
            ? 'initial' // Face-down cards stay as back (no flip)
            : 'flipped' // Face-up cards show front (flipped)
        }
        fullSize={!shouldCollect}
      />
    </motion.div>
  );
};
