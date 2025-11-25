import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import { TRACKS } from '@/config/audio-config';
import { motion } from 'framer-motion';
import { type FC, useEffect, useRef } from 'react';
import { useGameStore } from '../../store';
import { EffectNotificationBadge } from '../EffectNotificationBadge';
import { AnimatedCard } from './AnimatedCard';
import { useBatchTracking, useDeckMeasurements } from './hooks';
import type { PlayedCardsProps } from './types';
import { calculateRenderOrder, generateLandedKey, getBatchCardIndices } from './utils';

export const PlayedCards: FC<PlayedCardsProps> = ({ cards = [], owner, onBadgeClicked }) => {
  const { playAudio } = useGameStore();
  const deckSwapCount = useGameStore((state) => state.deckSwapCount);
  const winner = useGameStore((state) => state.collecting?.primaryWinner ?? null);
  const audioPlayedRef = useRef(false);
  const player = useGameStore((state) => state.player);
  const cpu = useGameStore((state) => state.cpu);
  const cardFlipTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const prevPlayerCardsInHandLength = useRef(0);
  const prevCpuCardsInHandLength = useRef(0);

  // Effect notification badge state
  const showEffectNotificationBadge = useGameStore((state) => state.showEffectNotificationBadge);
  const accumulatedEffects = useGameStore((state) => state.accumulatedEffects);
  const openEffectModal = useGameStore((state) => state.openEffectModal);
  const isEffectTimerActive = useGameStore((state) => state.isEffectTimerActive);
  const stopEffectBadgeTimer = useGameStore((state) => state.stopEffectBadgeTimer);

  const showDataGrabResults = useGameStore((state) => state.showDataGrabResults);

  // Determine derived state
  const isCPU = owner === 'cpu';
  const isSwapped = deckSwapCount % 2 === 1;
  const shouldCollect = winner !== null;

  // Play card collection audio when collection animation starts
  // Only play once per collection cycle (use player component to avoid duplicate)
  useEffect(() => {
    if (shouldCollect && !audioPlayedRef.current && owner === 'player') {
      audioPlayedRef.current = true;
      playAudio(TRACKS.CARD_COLLECT);
    } else if (!shouldCollect) {
      audioPlayedRef.current = false;
    }
  }, [shouldCollect, owner, playAudio]);

  // Custom hooks for measurements and batch tracking
  const { playAreaRef, deckOffset, playerCollectionOffset, cpuCollectionOffset } =
    useDeckMeasurements(owner, isSwapped, cards.length, winner);

  const { batchIdRef, cardBatchMapRef, elementRefs, settledZRef, landedMap, setLandedMap } =
    useBatchTracking(cards);

  /**
   * Plays singular card flip audio for each card as it begins its flight to the table
   */
  useEffect(() => {
    /**
     * Clear out any existing timers to keep the sfx channels clear
     */
    cardFlipTimersRef.current.forEach((timer) => clearTimeout(timer));
    cardFlipTimersRef.current = [];

    // Get new cards from this batch (cards that were just added)
    const newCards = cards.filter((c) => {
      const cardBatchId = cardBatchMapRef.current[c.card.id];
      return cardBatchId === batchIdRef.current;
    });

    if (newCards.length === 0) return;
    /**
     * Detect simultaneous play to avoid overlapping sfx channels
     */
    const playerCardsInHandIncreased =
      player.playedCardsInHand.length > prevPlayerCardsInHandLength.current;
    const cpuCardsInHandIncreased = cpu.playedCardsInHand.length > prevCpuCardsInHandLength.current;
    const bothPlayingSimultaneously = playerCardsInHandIncreased && cpuCardsInHandIncreased;

    // Update refs for next render
    prevPlayerCardsInHandLength.current = player.playedCardsInHand.length;
    prevCpuCardsInHandLength.current = cpu.playedCardsInHand.length;

    const shouldPlayAudio = bothPlayingSimultaneously ? owner === 'player' : true;
    if (!shouldPlayAudio) return;

    /**
     * The collection method for data grab involves putting cards back into each
     * player's hand, which subsequently triggers this effect. Using the same store
     * property that displays the modal to gate audio playback.
     */
    if (showDataGrabResults) return;

    /**
     * Schedule card flip audio for each new card being played
     */
    newCards.forEach((_, index) => {
      const timer = setTimeout(() => {
        playAudio(TRACKS.CARD_FLIP);
      }, index * ANIMATION_DURATIONS.CARD_STAGGER_DELAY);
      cardFlipTimersRef.current.push(timer);
    });

    return () => {
      cardFlipTimersRef.current.forEach((timer) => clearTimeout(timer));
      cardFlipTimersRef.current = [];
    };
    /**
     * batchIdRef and cardBatchMapRef are stable refs from useBatchTracking.
     *
     * cpu.playedCardsInHand and player.playedCardsInHand are only read for detecting new cards
     * being played, so using their lengths as dependencies should be sufficient.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cards,
    owner,
    playAudio,
    player.playedCardsInHand.length,
    cpu.playedCardsInHand.length,
    showDataGrabResults,
  ]);

  // Handle card landing updates
  const handleLandedChange = (landedKey: string) => {
    setLandedMap((m) => ({ ...m, [landedKey]: true }));
  };

  // Check if badge should show (persists until modal shown or turn ends)
  // Only show badge on the side that has accumulated effects
  const ownerEffects = accumulatedEffects.filter((effect) => effect.playedBy === owner);
  const ownerLaunchStacksCards =
    owner === 'player'
      ? player.playedCardsInHand.filter((c) => c.card.specialType === 'launch_stack' && !c.isFaceDown)
      : cpu.playedCardsInHand.filter((c) => c.card.specialType === 'launch_stack' && !c.isFaceDown);
  const shouldShowBadge = showEffectNotificationBadge && ownerEffects.length > 0;

  // Handle badge click
  const handleBadgeClick = () => {
    if (!shouldShowBadge) return;

    // Stop timer if running
    if (isEffectTimerActive()) {
      stopEffectBadgeTimer();
    }

    // Open modal and pause game
    openEffectModal();
    playAudio(TRACKS.HAND_VIEWER);

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
          className="absolute top-1/2 -right-3 cursor-pointer z-[50]"
          onClick={handleBadgeClick}
        >
          <EffectNotificationBadge
            accumulatedEffects={ownerEffects}
            accumulatedLaunchStackCards={ownerLaunchStacksCards.length}
          />
        </motion.div>
      )}
    </div>
  );
};
