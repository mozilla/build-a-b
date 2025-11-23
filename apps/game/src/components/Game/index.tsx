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
import { useTooltip } from '../../hooks/use-tooltip';
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

  const selectedBackground = useSelectedBackground();
  const selectedBillionaire = useSelectedBillionaire();
  const cpuBillionaire = useCpuBillionaire();
  const collecting = useGameStore((state) => state.collecting);
  const deckClickBlocked = useGameStore((state) => state.deckClickBlocked);
  const blockTransitions = useGameStore((state) => state.blockTransitions);
  
  const [ownerBadgeClicked, setOwnerBadgeClicked] = useState<PlayerType>();
  const [showTableauTooltipVisible, setShowTableauTooltipVisible] = useState(false);
  const [cardAnimationComplete, setCardAnimationComplete] = useState(true);
  const { playAudio } = useGameStore();
  const openEffectModal = useGameStore((state) => state.openEffectModal);
  const markTableauCardTypeSeen = useGameStore((state) => state.markTableauCardTypeSeen);
  const seenTableauCardTypes = useGameStore((state) => state.seenTableauCardTypes);

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

  // Helper to mark all currently visible card types as seen
  const markCurrentCardTypesAsSeen = () => {
    const currentCardTypes = getCurrentCardTypes();
    currentCardTypes.forEach((cardType) => {
      markTableauCardTypeSeen(cardType);
    });
  };

  const handlePlayAreaClick = (owner: PlayerType) => {
    // Don't open modal during collection animation
    if (collecting) return;

    // Only open modal if there are cards to display
    const hasCards = owner === 'player'
      ? player.playedCardsInHand.length > 0
      : cpu.playedCardsInHand.length > 0;

    if (hasCards) {
      // Mark all current card types as seen (user has interacted with tableau)
      markCurrentCardTypesAsSeen();
      
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
      // Mark all current card types as seen (user has interacted with tableau)
      markCurrentCardTypesAsSeen();
      
      setOwnerBadgeClicked('player');
      openEffectModal();
      playAudio(TRACKS.HAND_VIEWER);
    } else if (cpu.playedCardsInHand.length > 0) {
      // Mark all current card types as seen (user has interacted with tableau)
      markCurrentCardTypesAsSeen();
      
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
        // Call handleCompareTurn to queue animations and determine next step
        // If animations are queued, callback will handle the transition
        // Otherwise, state machine will auto-transition after 1500ms delay
        handleCompareTurn();
        break;
      case 'resolving':
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
    // Auto-advance when HT effect applies and player has HT
    // This handles both first HT and HT-as-face-up cases
    const shouldAutoAdvance =
      shouldAutoAdvanceHT &&
      (phase === 'data_war.reveal_face_down' || phase === 'data_war.reveal_face_up.ready');

    if (shouldAutoAdvance) {
      tapDeck();
    }
  }, [
    phase,
    shouldAutoAdvanceHT,
    tapDeck,
  ]);

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

  // Helper to get card types currently on the table
  const getCurrentCardTypes = (): Set<string> => {
    const allPlayedCards = [...player.playedCardsInHand, ...cpu.playedCardsInHand];
    const cardTypes = new Set<string>();
    
    allPlayedCards.forEach((playedCardState) => {
      const card = playedCardState.card;
      
      // Skip face-down cards
      if (playedCardState.isFaceDown) return;
      
      // Determine card type for tracking
      let cardType: string | undefined;
      if (card.specialType === 'tracker') {
        cardType = 'tracker';
      } else if (card.specialType === 'blocker') {
        cardType = 'blocker';
      } else if (card.specialType === 'launch_stack') {
        cardType = 'launch_stack';
      } else if (card.specialType === 'tracker_smacker' || card.specialType === 'open_what_you_want' || 
                 card.specialType === 'mandatory_recall') {
        cardType = 'firewall';
      } else if (card.specialType === 'hostile_takeover' || card.specialType === 'temper_tantrum' || 
                 card.specialType === 'patent_theft' || card.specialType === 'leveraged_buyout') {
        cardType = 'billionaire_move';
      } else if (!card.isSpecial) {
        cardType = 'common_data';
      }
      
      if (cardType) {
        cardTypes.add(cardType);
      }
    });
    
    return cardTypes;
  };

  // Track when card play animation completes
  useEffect(() => {
    if (phase === 'revealing') {
      // Card is being played, animation in progress
      setCardAnimationComplete(false);
    } else if (!cardAnimationComplete) {
      // Phase changed from revealing, wait for card landing animation to complete
      // CARD_PLAY_FROM_DECK is 800ms (not speed-adjusted)
      const timer = setTimeout(() => {
        setCardAnimationComplete(true);
      }, ANIMATION_DURATIONS.CARD_PLAY_FROM_DECK);
      
      return () => clearTimeout(timer);
    }
  }, [phase, cardAnimationComplete]);

  // Control tableau tooltip visibility based on animation states and unseen card types
  useEffect(() => {
    const hasCardsOnTable = player.playedCardsInHand.length > 0 || cpu.playedCardsInHand.length > 0;
    const isCardPlayPhase = phase === 'revealing';
    const isAnimating = collecting || deckClickBlocked || isCardPlayPhase || !cardAnimationComplete;
    
    // Check if any current card types haven't been seen yet
    const currentCardTypes = getCurrentCardTypes();
    const hasUnseenCardTypes = Array.from(currentCardTypes).some(
      (cardType) => !seenTableauCardTypes.has(cardType)
    );
    
    // Show tooltip only when cards are settled on table, not animating, and there are unseen card types
    const shouldShow = hasCardsOnTable && !isAnimating && hasUnseenCardTypes;
    
    setShowTableauTooltipVisible(shouldShow);
  }, [player.playedCardsInHand, cpu.playedCardsInHand, collecting, deckClickBlocked, phase, seenTableauCardTypes, cardAnimationComplete]);

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
                "flex items-center justify-center gap-6 col-2 self-end",
                cpu.playedCardsInHand.length > 0 && "cursor-pointer"
              )}
              onClick={() => handlePlayAreaClick('cpu')}
            >
              {/* CPU Cards */}
              <PlayedCards cards={cpu.playedCardsInHand} owner="cpu" onBadgeClicked={setOwnerBadgeClicked} />
            </div>

            {/* Tableau Tooltip - positioned 1rem from left of play area, centered vertically */}
            <AnimatePresence>
              {showTableauTooltipVisible && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer -mt-1 -ml-12"
                  onClick={handleTableauCenterClick}
                >
                  <Tooltip
                    isOpen={true}
                    content="Tap to View Cards"
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
                "flex items-center justify-center gap-6 col-2 self-start",
                player.playedCardsInHand.length > 0 && "cursor-pointer"
              )}
              onClick={() => handlePlayAreaClick('player')}
            >
              {/* Player Cards */}
              <PlayedCards cards={player.playedCardsInHand} owner="player" onBadgeClicked={setOwnerBadgeClicked} />
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
            tooltipContent={canClickPlayerDeck ? tooltipMessage : undefined}
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
