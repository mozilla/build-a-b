import type { FC } from 'react';
import { useGameStore } from '../../store';
import { AnimatedCard } from './AnimatedCard';
import { useBatchTracking, useDeckMeasurements } from './hooks';
import type { PlayedCardsProps } from './types';
import { calculateRenderOrder, generateLandedKey, getBatchCardIndices } from './utils';

export const PlayedCards: FC<PlayedCardsProps> = ({ cards = [], owner }) => {
  const deckSwapCount = useGameStore((state) => state.deckSwapCount);
  const winner = useGameStore((state) => state.collecting?.winner ?? null);

  // Determine derived state
  const isCPU = owner === 'cpu';
  const isSwapped = deckSwapCount % 2 === 1;
  const shouldCollect = winner !== null;

  // Custom hooks for measurements and batch tracking
  const { playAreaRef, deckOffset, collectionOffset } = useDeckMeasurements(
    owner,
    isSwapped,
    cards.length,
    winner,
  );

  const { batchIdRef, cardBatchMapRef, elementRefs, settledZRef, landedMap, setLandedMap } =
    useBatchTracking(cards);

  // Handle card landing updates
  const handleLandedChange = (landedKey: string) => {
    setLandedMap((m) => ({ ...m, [landedKey]: true }));
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
          collectionOffset={collectionOffset}
          isSwapped={isSwapped}
          winner={winner}
          isCPU={isCPU}
          owner={owner}
          landedKey={landedKey}
          landed={landed}
          settledZRef={settledZRef}
          elementRefs={elementRefs}
          onLandedChange={handleLandedChange}
        />
      );
    });
  })();

  return (
    <div
      ref={playAreaRef}
      className="h-[10.9375rem] w-[8.125rem] max-w-[125px] max-h-[175px] flex items-center justify-center relative"
    >
      {renderedCards}
    </div>
  );
};
