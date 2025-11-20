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
  playerCollectionOffset: { x: number; y: number };
  cpuCollectionOffset: { x: number; y: number };
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
  playerCollectionOffset,
  cpuCollectionOffset,
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
  const collectingState = useGameStore((state) => state.collecting);
  const deckSwapCount = useGameStore((state) => state.deckSwapCount);
  const showDataGrabResults = useGameStore((state) => state.showDataGrabResults);

  // Find this card's specific destination from the distribution system
  const cardDistribution = collectingState?.distributions?.find(
    (d) => d.card.id === playedCardState.card.id,
  );

  // Only collect this card if:
  // 1. shouldCollect is true (winner is set)
  // 2. collectingState exists (there's an active collection, not null)
  // 3. Either no specific distributions (collect all) OR this card is in distributions
  const hasDistributions = collectingState?.distributions && collectingState.distributions.length > 0;
  const cardShouldCollect = shouldCollect && collectingState !== null && (
    !hasDistributions || cardDistribution !== undefined
  );
  const cardDestination = cardDistribution?.destination || winner;
  const isSwappedNow = deckSwapCount % 2 === 1;
  const isTiedInComparing =
    phase === 'comparing' &&
    player.playedCard &&
    cpu.playedCard &&
    player.currentTurnValue === cpu.currentTurnValue &&
    !anotherPlayExpected;
  const shouldShowDataWarGlow = isTiedInComparing;

  // Use faster animation for Data Grab cards (restoring to tableau behind modal)
  const playDuration = showDataGrabResults
    ? ANIMATION_DURATIONS.DATA_GRAB_CARD_RESTORE
    : ANIMATION_DURATIONS.CARD_PLAY_FROM_DECK;

  // Calculate stagger delay for sequential play (600ms between cards)
  const CARD_STAGGER_DELAY = 600;
  const staggerDelay = isNewCard ? playIndex * CARD_STAGGER_DELAY : 0;

  // Get rotation class for visual variety
  const rotationClass = getRotationClass(
    isTopCard,
    playedCardState.card.id,
    index,
    ROTATION_CLASSES,
  );
  // Don't apply rotation delay to face-down cards (data war) for consistent sequential timing
  const rotationDelay = playedCardState.isFaceDown ? 0 : (isTopCard ? 0 : ANIMATION_DELAYS.CARD_ROTATION);

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

  // Determine which collection offset to use based on this card's destination
  const cardSpecificCollectionOffset = cardShouldCollect
    ? cardDestination === 'player'
      ? playerCollectionOffset
      : cpuCollectionOffset
    : { x: 0, y: 0 };

  // Animation endpoints
  const finalX = cardShouldCollect ? cardSpecificCollectionOffset.x : 0;
  const finalY = cardShouldCollect ? cardSpecificCollectionOffset.y : 0;
  const finalScale = cardShouldCollect ? SCALE.DECK : SCALE.TABLE;

  // Collection rotation based on visual position (use cardDestination instead of winner)
  const destinationIsVisuallyAtBottom = isSwappedNow
    ? cardDestination === 'cpu'
    : cardDestination === 'player';
  const collectionRotation = destinationIsVisuallyAtBottom
    ? COLLECTION_ROTATION.BOTTOM
    : COLLECTION_ROTATION.TOP;
  const finalRotate = cardShouldCollect ? collectionRotation : 0;

  // Fade out cards as they're collected into the deck
  const finalOpacity = cardShouldCollect ? [1, 1, 0.25] : 1;

  // Z-index calculation
  const startZ = isNewCard
    ? Z_INDEX_CONFIG.START_BASE - playIndex
    : Z_INDEX_CONFIG.START_BASE - index;
  const finalZ = isNewCard
    ? Z_INDEX_CONFIG.FINAL_BASE + playIndex
    : Z_INDEX_CONFIG.FINAL_BASE + index;

  // Check if this card is going to its owner's deck (winner) or opponent's deck (loser)
  const isWinnerCard = cardShouldCollect && owner === cardDestination;
  const collectionZIndex = cardShouldCollect
    ? isWinnerCard
      ? Z_INDEX_CONFIG.COLLECTION_WINNER_BASE + index
      : Z_INDEX_CONFIG.COLLECTION_LOSER_BASE + index
    : Z_INDEX_CONFIG.FALLBACK + index;

  const settledAssignedZ = settledZRef.current[landedKey];
  const appliedZ = cardShouldCollect
    ? collectionZIndex
    : isNewCard
    ? landed
      ? settledAssignedZ ?? finalZ
      : startZ
    : Z_INDEX_CONFIG.FALLBACK + index;

  // Detect when card lands and assign settled z-index
  const handleUpdate = (latest: { [k: string]: number }) => {
    if (!cardShouldCollect && isNewCard && !landed) {
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
    if (!cardShouldCollect && isNewCard) {
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
        duration: cardShouldCollect
          ? ANIMATION_DURATIONS.CARD_COLLECTION / 1000
          : playDuration / 1000,
        ease: [0.43, 0.13, 0.23, 0.96],
        delay: cardShouldCollect
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
          cardShouldCollect
            ? 'initial' // Collecting: always show back
            : playedCardState.isFaceDown
            ? 'initial' // Face-down cards stay as back (no flip)
            : 'flipped' // Face-up cards show front (flipped)
        }
        fullSize={!cardShouldCollect}
      />
    </motion.div>
  );
};
