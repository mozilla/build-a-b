import { motion } from 'framer-motion';
import type { FC } from 'react';
import { TOOLTIP_CONFIGS } from '../../config/tooltip-config';
import { useGameStore } from '../../store';
import { EffectNotificationBadge } from '../EffectNotificationBadge';
import { Tooltip } from '../Tooltip';
import { AnimatedCard } from './AnimatedCard';
import { useBatchTracking, useDeckMeasurements } from './hooks';
import type { PlayedCardsProps } from './types';
import { calculateRenderOrder, generateLandedKey, getBatchCardIndices } from './utils';

export const PlayedCards: FC<PlayedCardsProps> = ({ cards = [], owner, onBadgeClicked }) => {
  const deckSwapCount = useGameStore((state) => state.deckSwapCount);
  const winner = useGameStore((state) => state.collecting?.primaryWinner ?? null);

  // Effect notification badge state
  const showEffectNotificationBadge = useGameStore((state) => state.showEffectNotificationBadge);
  const accumulatedEffects = useGameStore((state) => state.accumulatedEffects);
  const showEffectNotificationModal = useGameStore((state) => state.showEffectNotificationModal);
  const shouldShowTooltip = useGameStore((state) => state.shouldShowTooltip);
  const incrementTooltipCount = useGameStore((state) => state.incrementTooltipCount);
  const openEffectModal = useGameStore((state) => state.openEffectModal);
  const isEffectTimerActive = useGameStore((state) => state.isEffectTimerActive);
  const stopEffectBadgeTimer = useGameStore((state) => state.stopEffectBadgeTimer);

  // Determine derived state
  const isCPU = owner === 'cpu';
  const isSwapped = deckSwapCount % 2 === 1;
  const shouldCollect = winner !== null;

  // Custom hooks for measurements and batch tracking
  const { playAreaRef, deckOffset, playerCollectionOffset, cpuCollectionOffset } =
    useDeckMeasurements(owner, isSwapped, cards.length, winner);

  const { batchIdRef, cardBatchMapRef, elementRefs, settledZRef, landedMap, setLandedMap } =
    useBatchTracking(cards);

  // Handle card landing updates
  const handleLandedChange = (landedKey: string) => {
    setLandedMap((m) => ({ ...m, [landedKey]: true }));
  };

  // Check if badge should show (persists until modal shown or turn ends)
  // Only show badge on the side that has accumulated effects
  const ownerEffects = accumulatedEffects.filter((effect) => effect.playedBy === owner);
  const shouldShowBadge = showEffectNotificationBadge && ownerEffects.length > 0;

  // Tooltip configuration
  const effectTooltipConfig = TOOLTIP_CONFIGS.EFFECT_NOTIFICATION;
  const shouldShowEffectTooltip =
    shouldShowBadge &&
    shouldShowTooltip(effectTooltipConfig.id, effectTooltipConfig.maxDisplayCount) &&
    !showEffectNotificationModal;

  // Handle badge click
  const handleBadgeClick = () => {
    if (!shouldShowBadge) return;

    // Increment tooltip display count if showing
    if (shouldShowEffectTooltip) {
      incrementTooltipCount(effectTooltipConfig.id);
    }

    // Stop timer if running
    if (isEffectTimerActive()) {
      stopEffectBadgeTimer();
    }

    // Open modal and pause game
    openEffectModal();

    // Notify parent component that badge was clicked
    if (onBadgeClicked) {
      onBadgeClicked(owner);
    }
  };

  // Compute rendered cards
  const renderedCards = (() => {
    if (!deckOffset) return null;

    const cardIds = cards.map((c) => c.card.id);
    const currentBatchId = batchIdRef.current;
    const renderOrder = calculateRenderOrder(
      cards.length,
      currentBatchId,
      cardBatchMapRef.current,
      cardIds,
    );

    return renderOrder.map((originalIndex) => {
      const playedCardState = cards[originalIndex];
      const index = originalIndex;
      const isTopCard = index === cards.length - 1;

      // Determine batch information for this card
      const cardBatchId = cardBatchMapRef.current[playedCardState.card.id] ?? batchIdRef.current;
      const landedKey = generateLandedKey(playedCardState.card.id, cardBatchId);

      // Get all cards in this batch
      const batchCardIndices = getBatchCardIndices(cards, cardBatchId, cardBatchMapRef.current);
      const cardIndexInBatch = batchCardIndices.indexOf(index);
      const isNewCard = cardIndexInBatch !== -1;

      // Calculate play index (top-first: 0 = top-most)
      const playIndex = isNewCard ? batchCardIndices.length - 1 - cardIndexInBatch : -1;

      const landed = !!landedMap[landedKey];

      return (
        <AnimatedCard
          key={landedKey}
          playedCardState={playedCardState}
          index={index}
          isTopCard={isTopCard}
          isNewCard={isNewCard}
          cardIndexInBatch={cardIndexInBatch}
          playIndex={playIndex}
          deckOffset={deckOffset}
          shouldCollect={shouldCollect}
          playerCollectionOffset={playerCollectionOffset}
          cpuCollectionOffset={cpuCollectionOffset}
          winner={winner}
          isCPU={isCPU}
          owner={owner}
          landedKey={landedKey}
          landed={landed}
          settledZRef={settledZRef}
          elementRefs={elementRefs}
          onLandedChange={handleLandedChange}
          shouldShowBadge={shouldShowBadge}
          onCardClick={handleBadgeClick}
        />
      );
    });
  })();

  return (
    <div
      ref={playAreaRef}
      className="w-full aspect-130/175 flex items-center justify-center relative"
    >
      {renderedCards}

      {/* Effect notification badge - positioned over top card (always on the right side) */}
      {shouldShowBadge && (
        <motion.div
          initial={{ scale: 0, opacity: 0, x: '100%', y: '-66%' }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute top-1/2 -right-3 cursor-pointer z-[50] "
          onClick={handleBadgeClick}
        >
          <Tooltip
            content={effectTooltipConfig.message}
            placement="bottom"
            arrowDirection="left"
            isOpen={!showEffectNotificationModal && shouldShowEffectTooltip ? true : undefined}
            classNames={{
              base: ['translate-x-1'],
              content: ['text-green-400', 'text-sm', 'p-1', 'max-w-[6rem]'],
            }}
          >
            <div className="cursor-pointer" onClick={handleBadgeClick}>
              <EffectNotificationBadge accumulatedEffects={ownerEffects} showProgressBar={false} />
            </div>
          </Tooltip>
        </motion.div>
      )}
    </div>
  );
};
