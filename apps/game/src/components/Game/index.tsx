/**
 * Game Component - Main game container
 */

import { DEFAULT_BOARD_BACKGROUND } from '@/components/Screens/SelectBackground/backgrounds';
import { ANIMATION_DURATIONS, getGameSpeedAdjustedDuration } from '@/config/animation-timings';
import { TRACKS } from '@/config/audio-config';
import { usePreloading } from '@/hooks/use-preloading';
import {
  useCpuBillionaire,
  useDeckSwapCount,
  useSelectedBackground,
  useSelectedBillionaire,
} from '@/store';
import { cn } from '@/utils/cn';
import { getBackgroundImage } from '@/utils/selectors';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useGameLogic } from '../../hooks/use-game-logic';
import { useTooltipPreview } from '../../hooks/use-tooltip';
import { useGameStore } from '../../store/game-store';
import { Board } from '../Board';
import { DataGrabMiniGame } from '../DataGrabMiniGame';
import { DataGrabResultsModal } from '../DataGrabResultsModal';
import { DataWarAnimation } from '../DataWarAnimation';
import { DebugUI } from '../DebugUI';
import { DeckInteractionZone } from '../DeckInteractionZone';
import { EffectNotificationModal } from '../EffectNotificationModal';
import { OpenWhatYouWantModal } from '../OpenWhatYouWantModal';
import { PlayedCards } from '../PlayedCards';
import { PlayerDeck } from '../PlayerDeck';
import { EffectAnimationOrchestrator } from '../SpecialCardAnimation/EffectAnimationOrchestrator';
import { TemperTantrumModal } from '../TemperTantrumModal';
import { Tooltip } from '../Tooltip';
import type { PlayerType } from '@/types/game';

/**
 * Game Component - Main game container
 */
export function Game() {
  const {
    phase,
    player,
    cpu,
    activePlayer,
    tooltipMessage: tooltipKey,
    tapDeck,
    handlePreReveal,
    handleRevealCards,
    handleCompareTurn,
    handleResolveTurn,
    send,
  } = useGameLogic();
  const { essentialAssetsReady } = usePreloading();

  // Get tooltip message without incrementing count (always show)
  const deckTooltipMessage = useTooltipPreview(tooltipKey);

  const selectedBackground = useSelectedBackground();
  const selectedBillionaire = useSelectedBillionaire();
  const cpuBillionaire = useCpuBillionaire();
  const collecting = useGameStore((state) => state.collecting);
  const deckClickBlocked = useGameStore((state) => state.deckClickBlocked);
  const blockTransitions = useGameStore((state) => state.blockTransitions);

  const [ownerBadgeClicked, setOwnerBadgeClicked] = useState<PlayerType>();
  const [showTableauTooltipVisible, setShowTableauTooltipVisible] = useState(false);
  const { playAudio } = useGameStore();
  const openEffectModal = useGameStore((state) => state.openEffectModal);

  // Deck counter shows only the main deck
  // Launch Stacks are tracked separately with rocket indicators
  const playerTotalCards = player.deck.length;
  const cpuTotalCards = cpu.deck.length;

  // Check if decks are visually swapped (for determining which deck gets heartbeat)
  const deckSwapCount = useDeckSwapCount();
  const isSwapped = deckSwapCount % 2 === 1;

  const backgroundImage =
    getBackgroundImage(selectedBackground) ||
    getBackgroundImage(selectedBillionaire) ||
    DEFAULT_BOARD_BACKGROUND;

  const shouldSkipIntro = new URLSearchParams(window.location.search).get('skip-intro') === 'true';

  // Data War phases where deck is clickable (exclude settling phase)
  const isClickableDataWarPhase =
    phase === 'data_war.reveal_face_down' || phase === 'data_war.reveal_face_up.ready';

  // During ready phase, only active player can tap
  // During data war, only player deck is clickable (one click reveals both)
  // During pre_reveal.awaiting_interaction, player can tap to see modal
  // Disable clicking during card collection animation and during settling
  // IMPORTANT: Only the PLAYER's deck is ever clickable - CPU plays are automated

  // Player always clicks during data war, even HT data war
  // CPU auto-plays as usual
  const shouldAutoAdvanceHT = false;

  // Never clickable during comparison/resolution phases or win effects
  const isComparisonPhase = phase === 'comparing' || phase === 'resolving';
  const showingWinEffect = useGameStore((state) => state.showingWinEffect);

  const canClickPlayerDeck =
    !collecting &&
    !deckClickBlocked &&
    !blockTransitions &&
    !isComparisonPhase &&
    !showingWinEffect &&
    ((phase === 'ready' && activePlayer === 'player') ||
      phase === 'pre_reveal.awaiting_interaction' ||
      // Data war is clickable if NOT auto-advancing for HT
      (isClickableDataWarPhase && !shouldAutoAdvanceHT));

  const handleDeckClick = () => {
    tapDeck();
  };

  const handlePlayAreaClick = (owner: PlayerType) => {
    // Don't open modal during collection animation
    if (collecting) return;

    // Only open modal if there are cards to display
    const hasCards =
      owner === 'player' ? player.playedCardsInHand.length > 0 : cpu.playedCardsInHand.length > 0;

    if (hasCards) {
      setOwnerBadgeClicked(owner);
      openEffectModal();
      playAudio(TRACKS.HAND_VIEWER);
    }
  };

  const handleTableauCenterClick = () => {
    // Don't open modal during collection animation
    if (collecting) return;

    // Open modal with whichever player has cards (prefer player if both have cards)
    if (player.playedCardsInHand.length > 0) {
      setOwnerBadgeClicked('player');
      openEffectModal();
      playAudio(TRACKS.HAND_VIEWER);
    } else if (cpu.playedCardsInHand.length > 0) {
      setOwnerBadgeClicked('cpu');
      openEffectModal();
      playAudio(TRACKS.HAND_VIEWER);
    }
  };

  // SIMPLIFIED INTERACTION LOGIC
  // Player interaction zone is ALWAYS at bottom (never moves)
  // CPU has no interaction zone (automated)
  // Visual deck positions can swap, but interaction stays fixed

  // HEARTBEAT ANIMATION LOGIC
  // Heartbeat should appear on whichever deck is visually at the bottom (player's side)
  // When NOT swapped: player deck at bottom → player deck gets heartbeat
  // When SWAPPED: cpu deck at bottom → cpu deck gets heartbeat
  const topDeckActiveIndicator = isSwapped && canClickPlayerDeck;
  const bottomDeckActiveIndicator = !isSwapped && canClickPlayerDeck;

  useEffect(() => {
    switch (phase) {
      case 'intro':
        // Usage: http://localhost:5173?skip-intro=true
        if (shouldSkipIntro) {
          send({ type: 'SKIP_TO_GAME' });
        }
        break;
      case 'pre_reveal.processing':
        handlePreReveal();
        break;
      case 'pre_reveal.awaiting_interaction':
        break;
      case 'pre_reveal.selecting':
        // Show modal for card selection
        useGameStore.getState().setShowOpenWhatYouWantModal(true);
        break;
      case 'revealing':
        handleRevealCards();
        break;
      case 'comparing':
        // Call handleCompareTurn to queue animations and determine next step
        // If animations are queued, callback will handle the transition
        // Otherwise, state machine will auto-transition after 1500ms delay
        handleCompareTurn();
        break;
      case 'resolving':
        handleResolveTurn();
        break;
      case 'data_war.reveal_face_up.owyw_selecting': {
        // Determine who plays the face-up card and prepare their cards
        const store = useGameStore.getState();
        const { player, hostileTakeoverDataWar } = store;

        // With Hostile Takeover, the player who played HT doesn't play face-up
        const playerHasHT = player.playedCard?.specialType === 'hostile_takeover';
        const playerPlaysFaceUp = !(playerHasHT && hostileTakeoverDataWar);

        const faceUpPlayer = playerPlaysFaceUp ? 'player' : 'cpu';

        // Set OWYW active for the face-up player (required for modal to work)
        store.setOpenWhatYouWantActive(faceUpPlayer);

        // Prepare top 3 cards for OWYW selection
        store.prepareOpenWhatYouWantCards(faceUpPlayer);

        // Show OWYW modal (only for player, CPU would auto-select)
        if (faceUpPlayer === 'player') {
          store.setShowOpenWhatYouWantModal(true);
        } else {
          // CPU auto-selects and continues
          const topCards = store.openWhatYouWantCards;
          if (topCards.length > 0) {
            const randomCard = topCards[Math.floor(Math.random() * topCards.length)];
            store.playSelectedCardFromOWYW(randomCard);
            // Transition to comparing to play the face-up card
            send({ type: 'CARD_SELECTED' });
          }
        }
        break;
      }
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    // Handle special effect phase - auto-dismiss after a brief delay
    if (phase === 'special_effect.showing') {
      const adjustedDelay = getGameSpeedAdjustedDuration(
        ANIMATION_DURATIONS.SPECIAL_EFFECT_DISPLAY,
      );
      const timer = setTimeout(() => {
        send({ type: 'DISMISS_EFFECT' });
      }, adjustedDelay);
      return () => clearTimeout(timer);
    }
  }, [phase, send]);

  useEffect(() => {
    // Auto-advance when HT effect applies and player has HT
    // This handles both first HT and HT-as-face-up cases
    const shouldAutoAdvance =
      shouldAutoAdvanceHT &&
      (phase === 'data_war.reveal_face_down' || phase === 'data_war.reveal_face_up.ready');

    if (shouldAutoAdvance) {
      tapDeck();
    }
  }, [phase, shouldAutoAdvanceHT, tapDeck]);

  // Auto-transition to win screen after animations complete
  const shouldTransitionToWin = useGameStore((state) => state.shouldTransitionToWin);
  useEffect(() => {
    if (shouldTransitionToWin) {
      // Clear the flag first
      useGameStore.setState({ shouldTransitionToWin: false });
      // Send event to transition to game_over
      send({ type: 'CHECK_WIN_CONDITION' });
    }
  }, [shouldTransitionToWin, send]);

  // Control tableau tooltip visibility
  // Show once cards are on table (after first card animation), remain visible during card plays
  // Only hide when collection animation starts or cards are removed (e.g., Data Grab)
  useEffect(() => {
    const hasCardsOnTable = player.playedCardsInHand.length > 0 || cpu.playedCardsInHand.length > 0;

    // Hide during card collection animation
    const isCollecting = collecting !== null;

    // If cards just appeared on table and we're not already showing the tooltip
    if (hasCardsOnTable && !isCollecting && !showTableauTooltipVisible) {
      // Delay showing tooltip until first card animation completes (CARD_PLAY_FROM_DECK = 800ms)
      const timer = setTimeout(() => {
        setShowTableauTooltipVisible(true);
      }, ANIMATION_DURATIONS.CARD_PLAY_FROM_DECK);

      return () => clearTimeout(timer);
    }

    // If collection starts or cards are removed, hide immediately
    if (isCollecting || !hasCardsOnTable) {
      setShowTableauTooltipVisible(false);
    }
  }, [player.playedCardsInHand, cpu.playedCardsInHand, collecting, showTableauTooltipVisible]);

  return (
    <div
      className={cn(
        'h-[100dvh] w-[100vw] bg-black flex items-center justify-center',
        essentialAssetsReady ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
    >
      <Board bgSrc={backgroundImage}>
        <div className="w-full mx-auto grid grid-rows-[min-content_min-content_auto_min-content_min-content] auto-rows-min grid-cols-[30.4%_1fr_26.6%] gap-x-[1.5rem] framed:gap-x-6 h-full items-center relative">
          {/* CPU Deck - Visual only, no interaction */}
          <PlayerDeck
            deckLength={cpuTotalCards}
            turnValue={cpu.currentTurnValue}
            turnValueActiveEffects={cpu.activeEffects}
            owner="cpu"
            billionaireId={cpuBillionaire}
            activeIndicator={topDeckActiveIndicator}
          />

          {/* Play Area - Center of board */}
          <div className="framed:px-0 size-full grid grid-cols-[30.4%_1fr_26.6%] gap-x-[1.125rem] framed:gap-x-3 items-center justify-around relative row-3 col-span-full gap-4 w-full mx-auto">
            {/* CPU Played Card Area */}
            <div
              className={cn(
                'flex items-center justify-center gap-6 col-2 self-end',
                cpu.playedCardsInHand.length > 0 && 'cursor-pointer',
              )}
              onClick={() => handlePlayAreaClick('cpu')}
            >
              {/* CPU Cards */}
              <PlayedCards
                cards={cpu.playedCardsInHand}
                owner="cpu"
                onBadgeClicked={setOwnerBadgeClicked}
              />
            </div>

            {/* Tableau Tooltip - positioned 1rem from left of play area, centered vertically */}
            <AnimatePresence mode="wait">
              {showTableauTooltipVisible && (
                <motion.div
                  key="tableau-tooltip"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer -mt-1 -ml-12"
                  onClick={handleTableauCenterClick}
                >
                  <Tooltip
                    isOpen={true}
                    content="Tap to view details"
                    placement="right"
                    showArrow={false}
                    classNames={{
                      content: ['text-green-400', 'text-xs', 'w-[7rem]'],
                    }}
                  >
                    <div className="w-4 h-4" />
                  </Tooltip>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Player Played Card Area */}
            <div
              className={cn(
                'flex items-center justify-center gap-6 col-2 self-start',
                player.playedCardsInHand.length > 0 && 'cursor-pointer',
              )}
              onClick={() => handlePlayAreaClick('player')}
            >
              {/* Player Cards */}
              <PlayedCards
                cards={player.playedCardsInHand}
                owner="player"
                onBadgeClicked={setOwnerBadgeClicked}
              />
            </div>
          </div>

          {/* Player Deck - Visual only, no interaction */}
          <PlayerDeck
            deckLength={playerTotalCards}
            turnValue={player.currentTurnValue}
            turnValueActiveEffects={player.activeEffects}
            owner="player"
            billionaireId={selectedBillionaire}
            activeIndicator={bottomDeckActiveIndicator}
          />

          {/* Fixed Player Interaction Zone - Always at bottom */}
          <DeckInteractionZone
            position="bottom"
            onClick={canClickPlayerDeck ? handleDeckClick : undefined}
            tooltipContent={canClickPlayerDeck ? deckTooltipMessage : undefined}
            activeIndicator={canClickPlayerDeck}
          />
        </div>

        {/* Data War Animation */}
        <DataWarAnimation show={phase === 'data_war.animating'} />

        {/* Special Effect Animations */}
        <EffectAnimationOrchestrator />

        {/* Open What You Want Modal */}
        <OpenWhatYouWantModal />

        {/* Effect Notification Modal */}
        <EffectNotificationModal ownerBadgeClicked={ownerBadgeClicked} />

        {/* Data Grab Mini-Game */}
        <DataGrabMiniGame />

        {/* Data Grab Results Modal */}
        <DataGrabResultsModal />

        {/* Temper Tantrum Card Selection Modal */}
        <TemperTantrumModal />

        {/* Debug UI */}
        <DebugUI />
      </Board>
    </div>
  );
}
