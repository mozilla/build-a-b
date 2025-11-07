import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import { cn } from '@/utils/cn';
import { getCardGlowType, getGlowClasses } from '@/utils/glow-effects';
import { useSelector } from '@xstate/react';
import { motion } from 'framer-motion';
import type { FC } from 'react';
import { CARD_BACK_IMAGE } from '../../config/game-config';
import { TOOLTIP_CONFIGS } from '../../config/tooltip-config';
import { GameMachineContext } from '../../providers/GameProvider';
import {
  useCurrentEffectNotification,
  useGameStore,
  usePendingEffectNotifications,
  useSetShowEffectNotificationModal,
  useShowEffectNotificationBadge,
} from '../../store';
import type { EffectNotification, PlayedCardState } from '../../types/game';
import { getGamePhase } from '../../utils/get-game-phase';
import { Card } from '../Card';
import { EffectNotificationBadge } from '../EffectNotificationBadge';
import { Tooltip } from '../Tooltip';
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
}) => {
  // Effect notification hooks
  const showEffectNotificationBadge = useShowEffectNotificationBadge();
  const pendingEffectNotifications = usePendingEffectNotifications();
  const currentEffectNotification = useCurrentEffectNotification();
  const setShowEffectNotificationModal = useSetShowEffectNotificationModal();
  const showEffectNotificationModal = useGameStore((state) => state.showEffectNotificationModal);
  const shouldShowTooltip = useGameStore((state) => state.shouldShowTooltip);
  const incrementTooltipCount = useGameStore((state) => state.incrementTooltipCount);

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

  const effectTooltipConfig = TOOLTIP_CONFIGS.EFFECT_NOTIFICATION;
  const shouldShowEffectTooltip =
    shouldShowTooltip(effectTooltipConfig.id, effectTooltipConfig.maxDisplayCount) &&
    !showEffectNotificationModal;

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

  // Check if this card should show the effect notification badge
  const shouldShowBadge =
    isTopCard &&
    showEffectNotificationBadge &&
    pendingEffectNotifications.some((notif) => notif.card.id === playedCardState.card.id);

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

  // Handle card click for effect notification
  const handleCardClick = () => {
    if (!shouldShowBadge) return;

    if (shouldShowEffectTooltip) {
      incrementTooltipCount(effectTooltipConfig.id);
    }

    const clickedNotification = pendingEffectNotifications.find(
      (notif) => notif.card.id === playedCardState.card.id,
    );

    if (clickedNotification && clickedNotification !== currentEffectNotification) {
      const reorderedNotifications = [
        clickedNotification,
        ...pendingEffectNotifications.filter((notif) => notif !== clickedNotification),
      ];
      useGameStore.setState({
        pendingEffectNotifications: reorderedNotifications,
        currentEffectNotification: clickedNotification,
      });
    }

    setShowEffectNotificationModal(true);
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

  const finalOpacity = shouldCollect ? [1, 1, 1] : 1;

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
        'absolute backface-hidden',
        rotationClass,
        shouldShowBadge && 'cursor-pointer',
        glowClasses,
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

      {shouldShowBadge && (
        <EffectNotificationBadgeWithTooltip
          playedCardState={playedCardState}
          pendingEffectNotifications={pendingEffectNotifications}
          shouldShowEffectTooltip={shouldShowEffectTooltip}
          effectTooltipConfig={effectTooltipConfig}
        />
      )}
    </motion.div>
  );
};

/**
 * Sub-component to handle effect notification badge with tooltip
 */
const EffectNotificationBadgeWithTooltip: FC<{
  playedCardState: PlayedCardState;
  pendingEffectNotifications: EffectNotification[];
  shouldShowEffectTooltip: boolean;
  effectTooltipConfig: { id: string; message: string };
}> = ({
  playedCardState,
  pendingEffectNotifications,
  shouldShowEffectTooltip,
  effectTooltipConfig,
}) => {
  const notification = pendingEffectNotifications.find(
    (notif) => notif.card.id === playedCardState.card.id,
  );

  if (!notification) return null;

  return (
    <div className="absolute top-1/2 -translate-y-[5rem] -right-29 z-10">
      <Tooltip
        content={effectTooltipConfig.message}
        placement="bottom"
        arrowDirection="left"
        isOpen={shouldShowEffectTooltip}
        classNames={{
          base: ['translate-x-1', 'translate-y-[-0.8rem]'],
          content: ['text-green-400', 'text-sm', 'p-1', 'max-w-[6rem]'],
        }}
      >
        <div>
          <EffectNotificationBadge
            effectName={
              notification.specialType === 'launch_stack' ? 'Launch Stack' : notification.effectName
            }
          />
        </div>
      </Tooltip>
    </div>
  );
};
