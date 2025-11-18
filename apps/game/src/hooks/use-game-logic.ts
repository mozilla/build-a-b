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

  // Get Zustand store actions and state
  const {
    player,
    cpu,
    activePlayer,
    effectAccumulationPaused,
    playCard,
    resolveTurn,
    collectCardsAfterEffects,
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
      setShowOpenWhatYouWantModal,
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
      // Player: Wait for previous turn's animations to complete before showing modal
      // This includes win confetti and card collection animations
      setTimeout(() => {
        setShowOpenWhatYouWantModal(true);
      }, ANIMATION_DURATIONS.WIN_EFFECT_DURATION);

      // Clear pre-reveal effects (animation already shown)
      clearPreRevealEffects();

      // Skip pre-reveal flow and go to ready
      actorRef.send({ type: 'PRE_REVEAL_COMPLETE' });
    }
  };

  /**
   * Handles revealing cards
   * - Normal turn: Both players play a card
   * - Another play mode: Only the active player plays a card
   */
  const handleRevealCards = () => {
    const store = useGameStore.getState();

    // Safety: Only clear BLOCKING states that prevent transitions
    // Do NOT clear effect notification states - those are managed by the effect system
    const currentState = useGameStore.getState();
    if (
      currentState.animationsPaused ||
      currentState.effectAccumulationPaused ||
      currentState.blockTransitions
    ) {
      useGameStore.setState({
        animationsPaused: false,
        effectAccumulationPaused: false,
        blockTransitions: false,
      });
    }

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

    // Wait for cards to settle on the board before triggering special card animations
    // This is especially important when there are multiple cards in the tableau
    setTimeout(() => {
      // Queue animations for special cards played by both players
      // This will play them sequentially (player first, then CPU) and pause the game
      // Set callback to continue comparison after animations complete
      store.setAnimationCompletionCallback(() => {
        handleCompareTurnContinued();
      });

      const hasAnimations = store.queueSpecialCardAnimations();

      // If animations were queued, return early - callback will continue the flow
      if (hasAnimations) {
        return;
      }

      // No animations, continue immediately
      handleCompareTurnContinued();
    }, ANIMATION_DURATIONS.CARD_SETTLE_DELAY);
  };

  const handleCompareTurnContinued = () => {
    // After animations complete, check for special game states and trigger transitions
    // NOTE: We use manual event sending here because automatic transitions fire at 1500ms,
    // but animations take 3000ms. By the time blockTransitions is cleared, the automatic
    // transition window has passed. However, we ALWAYS check guard conditions to preserve logic.
    const store = useGameStore.getState();

    // If game is blocked (animations or modals), don't send any events
    // Wait for blockTransitions to be cleared, then state machine's automatic guards will handle it
    if (store.blockTransitions) {
      return;
    }

    // PRIORITY 1: Data Grab ALWAYS interrupts (even during "another play")
    if (store.checkForDataGrab()) {
      actorRef.send({ type: 'DATA_GRAB' });
      return;
    }

    // PRIORITY 2: Hostile Takeover ALWAYS triggers Data War immediately
    // checkForDataWar() includes re-trigger prevention (checks if opponent already played)
    const playerPlayedHt = store.player.playedCard?.specialType === 'hostile_takeover';
    const cpuPlayedHt = store.cpu.playedCard?.specialType === 'hostile_takeover';
    if (playerPlayedHt || cpuPlayedHt) {
      if (store.checkForDataWar()) {
        // Trigger Data War immediately
        actorRef.send({ type: 'TIE' });

        // Special handling for Hostile Takeover: Show badge after Data War animation completes
        // This gives player time to view the HT effect without interrupting Data War flow
        setTimeout(() => {
          store.prepareEffectNotification();
        }, ANIMATION_DURATIONS.DATA_WAR_ANIMATION_DURATION);

        return;
      }
    }

    // PRIORITY 3: Normal Data War (tie)
    // Skip data war if:
    // 1. We're in another play mode and expecting more cards (one player playing), OR
    // 2. Both players will play again (both cards trigger another play)
    const playerTriggersAnother = store.player.playedCard?.triggersAnotherPlay ?? false;
    const cpuTriggersAnother = store.cpu.playedCard?.triggersAnotherPlay ?? false;
    const bothTriggerAnother = playerTriggersAnother && cpuTriggersAnother;

    const skipDataWarCheck =
      (store.anotherPlayMode && store.anotherPlayExpected) || // Single player playing again
      bothTriggerAnother; // Both players will play again

    if (!skipDataWarCheck && store.checkForDataWar()) {
      // Clear any existing badges when entering a new data war
      // Badges will be shown again after all data wars are resolved
      store.clearAccumulatedEffects();
      actorRef.send({ type: 'TIE' });
      return;
    }

    // No Data War or Data Grab - prepare effect notification badge (non-blocking)
    store.prepareEffectNotification();

    // Wait briefly to give user time to click badge, then trigger normal resolution
    const delay = ANIMATION_DURATIONS.CARD_COMPARISON;

    setTimeout(() => {
      const currentStore = useGameStore.getState();

      // If game is blocked (modal open), set flag and wait for modal to close
      if (currentStore.blockTransitions) {
        useGameStore.setState({ awaitingResolution: true });
        return;
      }

      // Handle normal resolution (no tie, no data grab)
      const shouldResolve = shouldResolveDirectly(currentStore);

      // Ensure flag is cleared
      useGameStore.setState({ awaitingResolution: false });

      if (shouldResolve) {
        actorRef.send({ type: 'RESOLVE_TURN' });
      } else if (currentStore.pendingEffects.length > 0) {
        actorRef.send({ type: 'SPECIAL_EFFECT' });
      } else {
        actorRef.send({ type: 'RESOLVE_TURN' });
      }
    }, delay);
  };

  // Helper function to check if we should resolve directly (skip data war/special effect checks)
  const shouldResolveDirectly = (store: ReturnType<typeof useGameStore.getState>) => {
    // Check if we're waiting for another play to complete
    if (store.anotherPlayExpected) {
      return true;
    }

    // Check if either card triggers "another play"
    // Tracker Smacker only blocks tracker/blocker effects, NOT Launch Stack
    const playerCard = store.player.playedCard;
    const playerTriggersAnother =
      playerCard &&
      shouldTriggerAnotherPlay(playerCard) &&
      (playerCard.specialType === 'launch_stack' || !isEffectBlocked(store.trackerSmackerActive, 'player'));

    const cpuCard = store.cpu.playedCard;
    const cpuTriggersAnother =
      cpuCard &&
      shouldTriggerAnotherPlay(cpuCard) &&
      (cpuCard.specialType === 'launch_stack' || !isEffectBlocked(store.trackerSmackerActive, 'cpu'));

    if (playerTriggersAnother || cpuTriggersAnother) {
      return true;
    }

    // Check if Hostile Takeover data war is complete
    const playerPlayedHt = store.player.playedCard?.specialType === 'hostile_takeover';
    const cpuPlayedHt = store.cpu.playedCard?.specialType === 'hostile_takeover';
    const hostileTakeoverPlayed = playerPlayedHt || cpuPlayedHt;

    if (hostileTakeoverPlayed) {
      const opponent = playerPlayedHt ? store.cpu : store.player;

      // If opponent has played their 4 data war cards (5 total), data war is complete
      if (opponent.playedCardsInHand.length >= 5) {
        return true;
      }

      // If both players have played HT and both have 5 cards, data war is complete
      if (
        playerPlayedHt &&
        cpuPlayedHt &&
        store.player.playedCardsInHand.length >= 5 &&
        store.cpu.playedCardsInHand.length >= 5
      ) {
        return true;
      }
    }

    return false;
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
      // Normal mode - check both players
      // Tracker Smacker only blocks tracker/blocker effects, NOT Launch Stack
      const playerTriggersAnother =
        p.playedCard &&
        shouldTriggerAnotherPlay(p.playedCard) &&
        (p.playedCard.specialType === 'launch_stack' || !checkIfBlocked('player'));

      const cpuTriggersAnother =
        c.playedCard &&
        shouldTriggerAnotherPlay(c.playedCard) &&
        (c.playedCard.specialType === 'launch_stack' || !checkIfBlocked('cpu'));

      // Handle "another play" logic:
      // - If BOTH trigger: Both play at the same time (stay in normal mode)
      // - If ONLY ONE triggers: That player plays alone (another play mode)
      const bothTriggered = playerTriggersAnother && cpuTriggersAnother;

      if (bothTriggered) {
        // Both triggered - check if both players have cards left
        if (p.deck.length > 0 && c.deck.length > 0) {
          // Both have cards - they'll play simultaneously (stay in normal mode)
          setAnotherPlayMode(false);
          setActivePlayer('player'); // Reset to default

          // Go back to ready phase for simultaneous play
          actorRef.send({ type: 'CHECK_WIN_CONDITION' });
          return;
        }
        // At least one player has no cards - continue to resolution below
        nextPlayer = null;
      } else if (playerTriggersAnother) {
        nextPlayer = 'player';
      } else if (cpuTriggersAnother) {
        nextPlayer = 'cpu';
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
    } else if (phase === 'data_war.reveal_face_up.ready') {
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

    // Only skip cards if this is the FIRST data war (both players have exactly 1 card)
    const isFirstDataWar =
      store.player.playedCardsInHand.length === 1 && store.cpu.playedCardsInHand.length === 1;

    // Add 3 cards face-down from each player ONLY if not hostile takeover is played
    const playerCards = store.player.deck.slice(0, 3);
    const cpuCards = store.cpu.deck.slice(0, 3);

    // Update decks, playedCardsInHand (face-down), and cardsInPlay
    const updatedPlayerDeck = store.player.deck.slice(3);
    const updatedCpuDeck = store.cpu.deck.slice(3);

    useGameStore.setState({
      player: playerHasHostileTakeover && isFirstDataWar
        ? store.player
        : {
            ...store.player,
            deck: updatedPlayerDeck,
            playedCardsInHand: [
              ...store.player.playedCardsInHand,
              ...playerCards.map((card) => ({ card, isFaceDown: true })),
            ],
          },
      cpu: cpuHasHostileTakeover && isFirstDataWar
        ? store.cpu
        : {
            ...store.cpu,
            deck: updatedCpuDeck,
            playedCardsInHand: [
              ...store.cpu.playedCardsInHand,
              ...cpuCards.map((card) => ({ card, isFaceDown: true })),
            ],
          },
      cardsInPlay: [
        ...store.cardsInPlay,
        ...(playerHasHostileTakeover && isFirstDataWar ? [] : playerCards),
        ...(cpuHasHostileTakeover && isFirstDataWar ? [] : cpuCards),
      ],
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

    // Detect first data war: either player has exactly 1 card (the HT player won't have face-down cards)
    // In first data war: HT player has 1 card, opponent has 4 cards (1 original + 3 face-down)
    // In second+ data war: both will have more cards
    const isFirstDataWar =
      player.playedCardsInHand.length === 1 || cpu.playedCardsInHand.length === 1;

    if (playerHasHostileTakeover && isFirstDataWar) {
      playCard('cpu');
    } else if (cpuHasHostileTakeover && isFirstDataWar) {
      playCard('player');
    } else {
      playCard('cpu');
      playCard('player');
    }

    // Get fresh state after playing cards to access the newly played cards
    const freshState = useGameStore.getState();

    // Handle special effects for the new cards
    if (!(playerHasHostileTakeover && isFirstDataWar) && freshState.player.playedCard) {
      handleCardEffect(freshState.player.playedCard, 'player');
    }

    if (!(cpuHasHostileTakeover && isFirstDataWar) && freshState.cpu.playedCard) {
      handleCardEffect(freshState.cpu.playedCard, 'cpu');
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

  // Effect notification is now prepared AFTER animations complete (in handleCompareTurnContinued)
  // This ensures badge only appears after all animations finish
  // Removed from here to prevent badge showing during animations

  // Reset pre-reveal guard when leaving pre_reveal phase
  useEffect(() => {
    if (!phase.startsWith('pre_reveal')) {
      const { preRevealProcessed, setPreRevealProcessed } = useGameStore.getState();
      if (preRevealProcessed) {
        setPreRevealProcessed(false);
      }
    }
  }, [phase]);

  // Continue game flow when modal closes if we were waiting for it
  useEffect(() => {
    const store = useGameStore.getState();

    // If modal just closed and we were waiting to resolve, continue now
    if (!effectAccumulationPaused && store.awaitingResolution) {
      // Clear the flag
      useGameStore.setState({ awaitingResolution: false });

      // Continue with resolution
      const shouldResolve = shouldResolveDirectly(store);

      if (shouldResolve) {
        actorRef.send({ type: 'RESOLVE_TURN' });
      } else if (store.pendingEffects.length > 0) {
        actorRef.send({ type: 'SPECIAL_EFFECT' });
      } else {
        actorRef.send({ type: 'RESOLVE_TURN' });
      }
    }
  }, [effectAccumulationPaused, actorRef]);

  // CPU automation - calls tapDeck when it's CPU's turn
  // Pass isPaused flag to prevent CPU from playing while effect modal is open
  useCpuPlayer(phase, activePlayer, tapDeck, { isPaused: effectAccumulationPaused });

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
