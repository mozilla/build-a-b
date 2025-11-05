/**
 * Game Logic Hook
 * Connects XState machine to Zustand store for complete game management
 */

import { useSelector } from '@xstate/react';
import { useEffect } from 'react';
import { ANIMATION_DURATIONS } from '../config/animation-timings';
import { GameMachineContext } from '../providers/GameProvider';
import { useGameStore } from '../store/game-store';
import { isEffectBlocked, shouldTriggerAnotherPlay } from '../utils/card-comparison';
import { getGamePhase } from '../utils/get-game-phase';
import { useCpuPlayer } from './use-cpu-player';

/**
 * Main game logic hook that orchestrates the entire game
 * Combines state machine (flow) with Zustand store (data)
 *
 * Uses shared machine instance from GameMachineContext
 */
export function useGameLogic() {
  // Get actor ref from shared context
  const actorRef = GameMachineContext.useActorRef();

  // Subscribe to state value (phase) - more performant than subscribing to entire state
  const stateValue = useSelector(actorRef, (snapshot) => snapshot.value);
  const phase = getGamePhase(stateValue);
  const context = useSelector(actorRef, (snapshot) => snapshot.context);
  const tooltipMessage = useSelector(actorRef, (snapshot) => snapshot.context.tooltipMessage);

  // Get Zustand store actions
  const {
    player,
    cpu,
    activePlayer,
    playCard,
    resolveTurn,
    collectCardsAfterEffects,
    checkForDataWar,
    checkWinCondition,
    handleCardEffect,
    setActivePlayer,
    setAnotherPlayMode,
    processPendingEffects,
  } = useGameStore();

  const checkIfBlocked = (playerId: 'player' | 'cpu') => {
    const trackerSmackerActive = useGameStore.getState().trackerSmackerActive;
    return isEffectBlocked(trackerSmackerActive, playerId);
  };

  /**
   * Handles pre-reveal phase - executes effects that need to happen before cards are revealed
   * Currently handles:
   * - OWYW (Open What You Want): Shows animation + modal for card selection
   *
   * Effects can be:
   * - Non-interactive: Execute immediately and transition to ready
   * - Interactive: Show animation, wait for user tap, then show selection UI
   */
  const handlePreReveal = () => {
    const { preRevealProcessed, setPreRevealProcessed, preRevealEffects } = useGameStore.getState();

    // Guard: Only process once per pre_reveal phase entry
    if (preRevealProcessed) {
      return;
    }

    setPreRevealProcessed(true);

    // If no effects, immediately transition to ready
    if (preRevealEffects.length === 0) {
      actorRef.send({ type: 'PRE_REVEAL_COMPLETE' });
      return;
    }

    // Process each effect
    for (const effect of preRevealEffects) {
      if (effect.type === 'owyw') {
        // Prepare OWYW state (cards, modal state, etc.)
        handleOWYWEffect(effect.playerId, effect.requiresInteraction);

        // Note: The state machine will automatically transition to 'animating' after 1200ms
        // This delay allows the win animation to complete before OWYW animation starts
      }
    }

    // Note: Effects are cleared when consumed:
    // - For CPU: in handleOWYWEffect after auto-select
    // - For Player: in modal after card selection
  };

  /**
   * Handles OWYW (Open What You Want) effect
   * - For CPU (non-interactive): Auto-selects random card and transitions immediately
   * - For Player (interactive): Shows animation → waits for tap → shows modal
   */
  const handleOWYWEffect = (playerId: 'player' | 'cpu', requiresInteraction: boolean) => {
    const {
      prepareOpenWhatYouWantCards,
      playSelectedCardFromOWYW,
      setShowOpenWhatYouWantAnimation,
      clearPreRevealEffects,
    } = useGameStore.getState();

    // Prepare the top 3 cards
    prepareOpenWhatYouWantCards(playerId);

    if (!requiresInteraction) {
      // CPU: Auto-select random card and move to ready immediately
      const topCards = useGameStore.getState().openWhatYouWantCards;
      if (topCards.length > 0) {
        const randomCard = topCards[Math.floor(Math.random() * topCards.length)];
        playSelectedCardFromOWYW(randomCard);
      }

      // Clear OWYW active state
      useGameStore.getState().setOpenWhatYouWantActive(null);

      // Clear pre-reveal effects (CPU flow is complete)
      clearPreRevealEffects();

      // Transition to ready (no animation/modal for CPU)
      actorRef.send({ type: 'PRE_REVEAL_COMPLETE' });
    } else {
      // Player: Just show animation, DON'T clear effects yet
      // Effects will be cleared when modal confirms
      setShowOpenWhatYouWantAnimation(true);
    }
  };

  /**
   * Handles revealing cards
   * - Normal turn: Both players play a card
   * - Another play mode: Only the active player plays a card
   */
  const handleRevealCards = () => {
    const store = useGameStore.getState();

    if (store.anotherPlayMode) {
      // "Another play" mode - only active player plays
      playCard(store.activePlayer);

      // Get the played card
      const activePlayerState = useGameStore.getState()[store.activePlayer];

      // Handle special effects for the active player's card
      if (activePlayerState.playedCard) {
        handleCardEffect(activePlayerState.playedCard, store.activePlayer);

        // Check if Forced Empathy was played - if so, delay transition for BOTH animations
        if (activePlayerState.playedCard.specialType === 'forced_empathy') {
          setTimeout(() => {
            actorRef.send({ type: 'CARDS_REVEALED' });
          }, ANIMATION_DURATIONS.CARD_SETTLE_DELAY + ANIMATION_DURATIONS.FORCED_EMPATHY_VIDEO_DURATION + ANIMATION_DURATIONS.FORCED_EMPATHY_SWAP_DURATION);
          return;
        }
      }

      // Transition to comparing phase (unless Forced Empathy delays it)
      actorRef.send({ type: 'CARDS_REVEALED' });
    } else {
      // Normal turn - both players play
      playCard('player');
      playCard('cpu');

      // Get the played cards
      const { player: p, cpu: c } = useGameStore.getState();

      // Handle special effects for both cards
      if (p.playedCard) {
        handleCardEffect(p.playedCard, 'player');
      }
      if (c.playedCard) {
        handleCardEffect(c.playedCard, 'cpu');
      }

      // Check if Forced Empathy was played - if so, delay transition
      const forcedEmpathyPlayed =
        p.playedCard?.specialType === 'forced_empathy' ||
        c.playedCard?.specialType === 'forced_empathy';

      if (forcedEmpathyPlayed) {
        // Wait for BOTH animations to finish: video + deck swap
        setTimeout(() => {
          actorRef.send({ type: 'CARDS_REVEALED' });
        }, ANIMATION_DURATIONS.CARD_SETTLE_DELAY + ANIMATION_DURATIONS.FORCED_EMPATHY_VIDEO_DURATION + ANIMATION_DURATIONS.FORCED_EMPATHY_SWAP_DURATION);
        return;
      }
    }

    // Transition to comparing phase (unless Forced Empathy delays it)
    actorRef.send({ type: 'CARDS_REVEALED' });
  };

  /**
   * Handles turn comparison and resolution
   */
  const handleCompareTurn = () => {
    const store = useGameStore.getState();

    // PRIORITY CHECK: Hostile Takeover ignores all trackers/blockers/ties
    // If Hostile Takeover is played, skip straight to Data War
    const hostileTakeoverPlayed =
      store.player.playedCard?.specialType === 'hostile_takeover' ||
      store.cpu.playedCard?.specialType === 'hostile_takeover';

    if (hostileTakeoverPlayed) {
      // Hostile Takeover always triggers Data War, ignoring all other effects
      actorRef.send({ type: 'TIE' });
      return;
    }

    // IMPORTANT: Defer comparison until "another play" sequence is complete
    // Check if we're waiting for another play to complete
    if (store.anotherPlayExpected) {
      // Still waiting for another play - skip tie/Data War check
      actorRef.send({ type: 'RESOLVE_TURN' });
      return;
    }

    // IMPORTANT: Check if either card triggers "another play"
    // This must happen before checking for ties/Data War
    const playerTriggersAnother =
      store.player.playedCard &&
      shouldTriggerAnotherPlay(store.player.playedCard) &&
      !isEffectBlocked(store.trackerSmackerActive, 'player');

    const cpuTriggersAnother =
      store.cpu.playedCard &&
      shouldTriggerAnotherPlay(store.cpu.playedCard) &&
      !isEffectBlocked(store.trackerSmackerActive, 'cpu');

    if (playerTriggersAnother || cpuTriggersAnother) {
      // Skip Data War check - go straight to resolving to set up "another play"
      actorRef.send({ type: 'RESOLVE_TURN' });
      return;
    }

    // Now check if this should trigger Data War (only if no "another play")
    const isDataWar = checkForDataWar();

    if (isDataWar) {
      actorRef.send({ type: 'TIE' });
      return;
    }

    // Check if there are special effects to show
    const { pendingEffects } = useGameStore.getState();
    if (pendingEffects.length > 0) {
      actorRef.send({ type: 'SPECIAL_EFFECT' });
      return;
    }

    // Otherwise, resolve the turn directly
    actorRef.send({ type: 'RESOLVE_TURN' });
  };

  /**
   * Handles the resolution phase
   */
  const handleResolveTurn = () => {
    const store = useGameStore.getState();

    // Check if either card triggers another play
    const { player: p, cpu: c, setTrackerSmackerActive } = useGameStore.getState();
    let nextPlayer: 'player' | 'cpu' | null = null;

    // In another play mode, only check the active player's card
    if (store.anotherPlayMode) {
      const activePlayerState = store.activePlayer === 'player' ? p : c;
      if (activePlayerState.playedCard && shouldTriggerAnotherPlay(activePlayerState.playedCard)) {
        // Check if Tracker Smacker is blocking this effect
        const isBlocked = checkIfBlocked(store.activePlayer);

        if (!isBlocked) {
          nextPlayer = store.activePlayer;
        }
      }
    } else {
      // Normal mode - check both players (prioritize player's card)
      if (p.playedCard && shouldTriggerAnotherPlay(p.playedCard)) {
        // Check if Tracker Smacker is blocking this effect
        const isBlocked = checkIfBlocked('player');

        if (!isBlocked) {
          nextPlayer = 'player';
        }
      } else if (c.playedCard && shouldTriggerAnotherPlay(c.playedCard)) {
        // Check if Tracker Smacker is blocking this effect
        const isBlocked = checkIfBlocked('cpu');

        if (!isBlocked) {
          nextPlayer = 'cpu';
        }
      }
    }

    if (nextPlayer) {
      // Check if the player who would play again actually has cards
      const nextPlayerState = useGameStore.getState()[nextPlayer];

      if (nextPlayerState.deck.length === 0) {
        // Player has no cards left - resolve the turn instead of triggering another play
        const winner = resolveTurn();

        // Process pending special effects now that we know the winner
        processPendingEffects(winner);

        // Collect remaining cards after effects have been processed
        collectCardsAfterEffects(winner);

        // Check if game is over
        const hasWon = checkWinCondition();
        if (hasWon) {
          actorRef.send({ type: 'CHECK_WIN_CONDITION' });
          return;
        }

        // Disable "another play" mode
        setAnotherPlayMode(false);

        // Reset active player to default (player always initiates in normal mode)
        setActivePlayer('player');

        // Clear Tracker Smacker at the end of the turn
        setTrackerSmackerActive(null);

        // Move to next turn (will go through pre_reveal if there are effects)
        actorRef.send({ type: 'CHECK_WIN_CONDITION' });
        return;
      }

      // Player has cards - enable "another play" mode and set the player who will play again
      setActivePlayer(nextPlayer);
      setAnotherPlayMode(true);

      // Go back to ready phase for the "another play"
      actorRef.send({ type: 'CHECK_WIN_CONDITION' });
    } else {
      // No more "another play" triggers - resolve the turn now
      const winner = resolveTurn();

      // Process pending special effects now that we know the winner
      processPendingEffects(winner);

      // Collect remaining cards after effects have been processed
      collectCardsAfterEffects(winner);

      // Check if game is over
      const hasWon = checkWinCondition();
      if (hasWon) {
        actorRef.send({ type: 'CHECK_WIN_CONDITION' });
        return;
      }

      // Disable "another play" mode
      setAnotherPlayMode(false);

      // Reset active player to default (player always initiates in normal mode)
      setActivePlayer('player');

      // Clear Tracker Smacker at the end of the turn (not during "another play")
      setTrackerSmackerActive(null);

      // Move to next turn (will go through pre_reveal if there are effects)
      actorRef.send({ type: 'CHECK_WIN_CONDITION' });
    }
  };

  /**
   * Start game setup flow
   */
  const startGame = () => {
    actorRef.send({ type: 'START_GAME' });
  };

  /**
   * Select billionaire character
   */
  const selectBillionaire = (billionaire: string) => {
    useGameStore.getState().selectBillionaire(billionaire);
    actorRef.send({ type: 'SELECT_BILLIONAIRE', billionaire });
  };

  /**
   * Select background
   */
  const selectBackground = (background: string) => {
    useGameStore.getState().selectBackground(background);
    actorRef.send({ type: 'SELECT_BACKGROUND', background });
  };

  /**
   * Skip quick start guide
   */
  const skipGuide = () => {
    actorRef.send({ type: 'SKIP_GUIDE' });
  };

  /**
   * Player taps deck to reveal cards
   */
  const tapDeck = () => {
    if (phase === 'ready') {
      actorRef.send({ type: 'REVEAL_CARDS' });
    } else if (phase === 'pre_reveal.awaiting_interaction') {
      // Player taps to see OWYW modal
      actorRef.send({ type: 'TAP_DECK' });
    } else if (phase === 'data_war.reveal_face_down') {
      // Add 3 face-down cards from each player to cardsInPlay
      handleDataWarFaceDown();
      actorRef.send({ type: 'TAP_DECK' });
    } else if (phase === 'data_war.reveal_face_up') {
      // Add 1 face-up card from each player and compare
      handleDataWarFaceUp();
      actorRef.send({ type: 'TAP_DECK' });
    }
  };

  /**
   * Handles Data War face-down cards (add 3 cards from each player)
   */
  const handleDataWarFaceDown = () => {
    const store = useGameStore.getState();
    const playerHasHostileTakeover = store.player.playedCard?.specialType === 'hostile_takeover';
    const cpuHasHostileTakeover = store.cpu.playedCard?.specialType === 'hostile_takeover';

    // Add 3 cards face-down from each player ONLY if not hostile takeover is played
    const playerCards = store.player.deck.slice(0, 3);
    const cpuCards = store.cpu.deck.slice(0, 3);

    // Update decks, playedCardsInHand (face-down), and cardsInPlay
    const updatedPlayerDeck = store.player.deck.slice(3);
    const updatedCpuDeck = store.cpu.deck.slice(3);

    useGameStore.setState({
      player: playerHasHostileTakeover
        ? store.player
        : {
            ...store.player,
            deck: updatedPlayerDeck,
            playedCardsInHand: [
              ...store.player.playedCardsInHand,
              ...playerCards.map((card) => ({ card, isFaceDown: true })),
            ],
          },
      cpu: cpuHasHostileTakeover
        ? store.cpu
        : {
            ...store.cpu,
            deck: updatedCpuDeck,
            playedCardsInHand: [
              ...store.cpu.playedCardsInHand,
              ...cpuCards.map((card) => ({ card, isFaceDown: true })),
            ],
          },
      cardsInPlay: [...store.cardsInPlay, ...playerCards, ...cpuCards],
    });
  };

  /**
   * Handles Data War face-up cards (add 1 card from each player and resolve)
   */
  const handleDataWarFaceUp = () => {
    // Play one card from each player that does not have hostile_takeover in hand.
    const { player, cpu } = useGameStore.getState();
    const playerHasHostileTakeover = player.playedCard?.specialType === 'hostile_takeover';
    const cpuHasHostileTakeover = cpu.playedCard?.specialType === 'hostile_takeover';

    if (playerHasHostileTakeover) {
      playCard('cpu');
    } else if (cpuHasHostileTakeover) {
      playCard('player');
    } else {
      playCard('cpu');
      playCard('player');
    }

    // Handle special effects for the new cards
    if (!playerHasHostileTakeover && player.playedCard) {
      handleCardEffect(player.playedCard, 'player');
    }

    if (!cpuHasHostileTakeover && cpu.playedCard) {
      handleCardEffect(cpu.playedCard, 'cpu');
    }
  };

  /**
   * Reset game
   */
  const resetGame = () => {
    useGameStore.getState().resetGame();
    actorRef.send({ type: 'RESET_GAME' });
  };

  const restartGame = () => {
    useGameStore.getState().resetGame();
    actorRef.send({ type: 'RESTART_GAME' });
  };

  const quitGame = () => {
    const { resetGame, selectBackground, selectBillionaire } = useGameStore.getState();
    resetGame();
    selectBackground('');
    selectBillionaire('');
    actorRef.send({ type: 'QUIT_GAME' });
  };

  // Prepare effect notification when entering showing substate
  useEffect(() => {
    if (phase === 'effect_notification.showing') {
      const { prepareEffectNotification } = useGameStore.getState();
      prepareEffectNotification();
    }
  }, [phase]);

  // Handle modal dismiss to trigger state transition
  useEffect(() => {
    if (phase === 'effect_notification.showing') {
      let prevShowModal = useGameStore.getState().showEffectNotificationModal;

      // Listen for modal close
      const unsubscribe = useGameStore.subscribe((state) => {
        const showModal = state.showEffectNotificationModal;
        if (prevShowModal && !showModal) {
          // Check if there are still pending notifications
          const { pendingEffectNotifications } = useGameStore.getState();

          if (pendingEffectNotifications.length === 0) {
            // All notifications processed, transition to comparing
            actorRef.send({ type: 'EFFECT_NOTIFICATION_DISMISSED' });
          }
          // If there are still pending notifications, stay in showing state
          // User will click the next card to open its modal
        }
        prevShowModal = showModal;
      });

      return unsubscribe;
    }
  }, [phase, actorRef]);

  // Reset pre-reveal guard when leaving pre_reveal phase
  useEffect(() => {
    if (!phase.startsWith('pre_reveal')) {
      const { preRevealProcessed, setPreRevealProcessed } = useGameStore.getState();
      if (preRevealProcessed) {
        setPreRevealProcessed(false);
      }
    }
  }, [phase]);

  // CPU automation - calls tapDeck when it's CPU's turn
  useCpuPlayer(phase, activePlayer, tapDeck);

  return {
    // State
    phase,
    context,
    player,
    cpu,
    activePlayer,
    tooltipMessage,

    // Actions
    startGame,
    selectBillionaire,
    selectBackground,
    skipGuide,
    tapDeck,
    handlePreReveal,
    handleRevealCards,
    handleCompareTurn,
    handleResolveTurn,
    resetGame,
    restartGame,
    quitGame,

    // Utilities (expose send for advanced use cases)
    send: actorRef.send,
  };
}
