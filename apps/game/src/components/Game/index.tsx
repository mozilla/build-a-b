/**
 * Game Component - Main game container
 */

import { DEFAULT_BOARD_BACKGROUND } from '@/components/Screens/SelectBackground/backgrounds';
import { ANIMATION_DURATIONS, getGameSpeedAdjustedDuration } from '@/config/animation-timings';
import { usePreloading } from '@/hooks/use-preloading';
import {
  useCpuBillionaire,
  useDeckSwapCount,
  useSelectedBackground,
  useSelectedBillionaire,
} from '@/store';
import { cn } from '@/utils/cn';
import { getBackgroundImage } from '@/utils/selectors';
import { useEffect } from 'react';
import { useGameLogic } from '../../hooks/use-game-logic';
import { useTooltip } from '../../hooks/use-tooltip';
import { useGameStore } from '../../store/game-store';
import { Board } from '../Board';
import { DataGrabMiniGame } from '../DataGrabMiniGame';
import { DataGrabResultsModal } from '../DataGrabResultsModal';
import { DataWarAnimation } from '../DataWarAnimation';
import { DebugUI } from '../DebugUI';
import { EffectNotificationModal } from '../EffectNotificationModal';
import { OpenWhatYouWantModal } from '../OpenWhatYouWantModal';
import { PlayedCards } from '../PlayedCards';
import { PlayerDeck } from '../PlayerDeck';
import { EffectAnimationOrchestrator } from '../SpecialCardAnimation/EffectAnimationOrchestrator';
import { TemperTantrumModal } from '../TemperTantrumModal';

/**
 * Game Component - Main game container
 */
export function Game() {
  const {
    phase,
    player,
    cpu,
    activePlayer,
    tooltipMessage: tooltipKey, // This is now a key, not the actual message
    tapDeck,
    handlePreReveal,
    handleRevealCards,
    handleCompareTurn,
    handleResolveTurn,
    send,
  } = useGameLogic();
  const { essentialAssetsReady } = usePreloading();

  // Convert tooltip key to actual message (with display count tracking)
  const tooltipMessage = useTooltip(tooltipKey);

  const deckSwapCount = useDeckSwapCount();
  const selectedBackground = useSelectedBackground();
  const selectedBillionaire = useSelectedBillionaire();
  const cpuBillionaire = useCpuBillionaire();
  const collecting = useGameStore((state) => state.collecting);

  // Deck counter shows only the main deck
  // Launch Stacks are tracked separately with rocket indicators
  const playerTotalCards = player.deck.length;
  const cpuTotalCards = cpu.deck.length;

  // Check if decks are visually swapped (they stay in swapped positions after animation)
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
  // Check if this is the first HT data war (should auto-advance, so not clickable)
  const playerPlayedHT = player.playedCard?.specialType === 'hostile_takeover';
  const cpuPlayedHT = cpu.playedCard?.specialType === 'hostile_takeover';
  const isFirstHTDataWar =
    (playerPlayedHT && player.playedCardsInHand.length === 1 && cpu.playedCardsInHand.length < 5) ||
    (cpuPlayedHT && cpu.playedCardsInHand.length === 1 && player.playedCardsInHand.length < 5);

  const canClickPlayerDeck =
    !collecting &&
    ((phase === 'ready' && activePlayer === 'player') ||
      phase === 'pre_reveal.awaiting_interaction' ||
      // Data war is clickable if NOT first HT data war (which auto-advances)
      (isClickableDataWarPhase && !isFirstHTDataWar));

  const handleDeckClick = () => {
    tapDeck();
  };

  // After swap animation, decks stay in swapped visual positions (isSwapped tracks this)
  // When swapped: owner="cpu" is visually at bottom, owner="player" is visually at top
  // IMPORTANT: Only player's deck is clickable (CPU is automated)
  // When NOT swapped: player's deck is at bottom (normal position)
  // When swapped: player's deck is at top (swapped position)
  const topDeckCanClick = isSwapped ? canClickPlayerDeck : false;
  const bottomDeckCanClick = isSwapped ? false : canClickPlayerDeck;

  // Tooltip ALWAYS shows on the player's deck (which moves based on swap state)
  const topDeckTooltip = isSwapped && canClickPlayerDeck ? tooltipMessage : '';
  const bottomDeckTooltip = !isSwapped && canClickPlayerDeck ? tooltipMessage : '';

  // Active indicator (glow) only shows for player's deck (when clickable)
  // CPU deck never glows
  // When NOT swapped: player at bottom, CPU at top
  // When swapped: player at top, CPU at bottom
  const topDeckActiveIndicator = isSwapped ? canClickPlayerDeck : false;
  const bottomDeckActiveIndicator = !isSwapped ? canClickPlayerDeck : false;

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
      case 'pre_reveal.animating':
        // Animation plays automatically via state machine 'after' transition
        break;
      case 'pre_reveal.awaiting_interaction':
        // Hide animation, show tooltip (handled by state machine entry action)
        useGameStore.getState().setShowOpenWhatYouWantAnimation(false);
        break;
      case 'pre_reveal.selecting':
        // Show modal for card selection
        useGameStore.getState().setShowOpenWhatYouWantModal(true);
        break;
      case 'revealing':
        handleRevealCards();
        break;
      case 'comparing':
        console.log(`[TIMING] ${performance.now().toFixed(0)}ms - PHASE: comparing`);
        // Call handleCompareTurn to queue animations and determine next step
        // If animations are queued, callback will handle the transition
        // Otherwise, state machine will auto-transition after 1500ms delay
        handleCompareTurn();
        break;
      case 'resolving':
        console.log(`[TIMING] ${performance.now().toFixed(0)}ms - PHASE: resolving`);
        handleResolveTurn();
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    // Handle special effect phase - auto-dismiss after a brief delay
    if (phase === 'special_effect.showing') {
      const adjustedDelay = getGameSpeedAdjustedDuration(ANIMATION_DURATIONS.SPECIAL_EFFECT_DISPLAY);
      const timer = setTimeout(() => {
        send({ type: 'DISMISS_EFFECT' });
      }, adjustedDelay);
      return () => clearTimeout(timer);
    }
  }, [phase, send]);

  useEffect(() => {
    // Auto-advance ONLY for the FIRST Hostile Takeover data war
    // Only auto-click in phases that require user interaction
    const shouldAutoAdvance =
      isFirstHTDataWar &&
      (phase === 'data_war.reveal_face_down' || phase === 'data_war.reveal_face_up.ready');

    if (shouldAutoAdvance) {
      tapDeck();
    }
  }, [
    phase,
    isFirstHTDataWar,
    canClickPlayerDeck,
    playerPlayedHT,
    cpuPlayedHT,
    player.playedCardsInHand.length,
    cpu.playedCardsInHand.length,
    tapDeck,
  ]);

  return (
    <div
      className={cn(
        'h-[100dvh] w-[100vw] bg-black flex items-center justify-center',
        essentialAssetsReady ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
    >
      <Board bgSrc={backgroundImage}>
        <div className="w-full mx-auto grid grid-rows-[min-content_min-content_auto_min-content_min-content] auto-rows-min grid-cols-[30.4%_1fr_26.6%] gap-x-[1.5rem] framed:gap-x-6 h-full items-center">
          <PlayerDeck
            deckLength={cpuTotalCards}
            handleDeckClick={topDeckCanClick ? handleDeckClick : undefined}
            turnValue={cpu.currentTurnValue}
            turnValueActiveEffects={cpu.activeEffects}
            owner="cpu"
            billionaireId={cpuBillionaire}
            tooltipContent={topDeckTooltip}
            activeIndicator={topDeckActiveIndicator}
          />

          {/* Play Area - Center of board */}
          <div className="framed:px-0 size-full grid grid-cols-[30.4%_1fr_26.6%] gap-x-[1.125rem] framed:gap-x-3 items-center justify-around relative row-3 col-span-full gap-4 w-full mx-auto">
            {/* CPU Played Card Area */}
            <div className="flex items-center justify-center gap-6 col-2 self-end">
              {/* CPU Cards */}
              <PlayedCards cards={cpu.playedCardsInHand} owner="cpu" />
            </div>

            {/* Player Played Card Area */}
            <div className="flex items-center justify-center gap-6 col-2 self-start">
              {/* Player Cards */}
              <PlayedCards cards={player.playedCardsInHand} owner="player" />
            </div>
          </div>
          <PlayerDeck
            deckLength={playerTotalCards}
            handleDeckClick={bottomDeckCanClick ? handleDeckClick : undefined}
            turnValue={player.currentTurnValue}
            turnValueActiveEffects={player.activeEffects}
            owner="player"
            billionaireId={selectedBillionaire}
            tooltipContent={bottomDeckTooltip}
            activeIndicator={bottomDeckActiveIndicator}
          />
        </div>

        {/* Data War Animation */}
        <DataWarAnimation show={phase === 'data_war.animating'} />

        {/* Special Effect Animations */}
        <EffectAnimationOrchestrator />

        {/* Open What You Want Modal */}
        <OpenWhatYouWantModal />

        {/* Effect Notification Modal */}
        <EffectNotificationModal />

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
