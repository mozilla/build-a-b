/**
 * Game Logic Hook
 * Connects XState machine to Zustand store for complete game management
 */

import { useActorRef, useSelector } from '@xstate/react';
import { createBrowserInspector } from '@statelyai/inspect';
import { gameFlowMachine } from '../machines/game-flow-machine';
import { useGameStore } from '../stores/game-store';
import { useCpuPlayer } from './use-cpu-player';
import { shouldTriggerAnotherPlay, isEffectBlocked } from '../utils/card-comparison';
import { getGamePhase } from '../utils/get-game-phase';

// XState Inspector - only enabled in development
const inspector = import.meta.env.DEV
  ? createBrowserInspector({
      autoStart: true, // Auto-open inspector popup
    })
  : undefined;

/**
 * Main game logic hook that orchestrates the entire game
 * Combines state machine (flow) with Zustand store (data)
 *
 * - useActorRef: Creates and manages the actor lifecycle
 * - useSelector: Subscribes to specific state slices for optimal performance
 */
export function useGameLogic() {
  // Create actor ref with inspector
  const actorRef = useActorRef(gameFlowMachine, {
    inspect: inspector?.inspect,
  });

  // Subscribe to state value (phase) - more performant than subscribing to entire state
  const stateValue = useSelector(actorRef, (snapshot) => snapshot.value);
  const phase = getGamePhase(stateValue);
  const context = useSelector(actorRef, (snapshot) => snapshot.context);

  // Get Zustand store actions
  const {
    player,
    cpu,
    activePlayer,
    playCard,
    resolveTurn,
    checkForDataWar,
    checkWinCondition,
    handleCardEffect,
    setActivePlayer,
    setAnotherPlayMode,
  } = useGameStore();

  const checkIfBlocked = (playerId: 'player' | 'cpu') => {
    const trackerSmackerActive = useGameStore.getState().trackerSmackerActive;
    return isEffectBlocked(trackerSmackerActive, playerId);
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
      }
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
    }

    // Transition to comparing phase
    actorRef.send({ type: 'CARDS_REVEALED' });
  };

  /**
   * Handles turn comparison and resolution
   */
  const handleCompareTurn = () => {
    const store = useGameStore.getState();

    // IMPORTANT: Check if either card triggers "another play" FIRST
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
        resolveTurn();

        // Check if game is over
        const hasWon = checkWinCondition();
        if (hasWon) {
          actorRef.send({ type: 'CHECK_WIN_CONDITION' });
          return;
        }

        // Disable "another play" mode
        setAnotherPlayMode(false);

        // Alternate players for next normal turn
        setActivePlayer(activePlayer === 'player' ? 'cpu' : 'player');

        // Clear Tracker Smacker at the end of the turn
        setTrackerSmackerActive(null);

        // Move back to ready phase for next turn
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
      resolveTurn();

      // Check if game is over
      const hasWon = checkWinCondition();
      if (hasWon) {
        actorRef.send({ type: 'CHECK_WIN_CONDITION' });
        return;
      }

      // Disable "another play" mode
      setAnotherPlayMode(false);

      // Alternate players for next normal turn
      setActivePlayer(activePlayer === 'player' ? 'cpu' : 'player');

      // Clear Tracker Smacker at the end of the turn (not during "another play")
      setTrackerSmackerActive(null);

      // Move back to ready phase for next turn
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

    // Add 3 cards face-down from each player
    const playerCards = store.player.deck.slice(0, 3);
    const cpuCards = store.cpu.deck.slice(0, 3);

    // Update decks, playedCardsInHand (face-down), and cardsInPlay
    const updatedPlayerDeck = store.player.deck.slice(3);
    const updatedCpuDeck = store.cpu.deck.slice(3);

    useGameStore.setState({
      player: {
        ...store.player,
        deck: updatedPlayerDeck,
        playedCardsInHand: [
          ...store.player.playedCardsInHand,
          ...playerCards.map((card) => ({ card, isFaceDown: true })),
        ],
      },
      cpu: {
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
    // Play one card from each player (this will also add to cardsInPlay)
    playCard('player');
    playCard('cpu');

    const { player: p, cpu: c } = useGameStore.getState();

    // Handle special effects for the new cards
    if (p.playedCard) {
      handleCardEffect(p.playedCard, 'player');
    }
    if (c.playedCard) {
      handleCardEffect(c.playedCard, 'cpu');
    }
  };

  /**
   * Reset game
   */
  const resetGame = () => {
    useGameStore.getState().resetGame();
    actorRef.send({ type: 'RESET_GAME' });
  };

  // CPU automation - calls tapDeck when it's CPU's turn
  useCpuPlayer(phase, activePlayer, tapDeck);

  return {
    // State
    phase,
    context,
    player,
    cpu,
    activePlayer,

    // Actions
    startGame,
    selectBillionaire,
    selectBackground,
    skipGuide,
    tapDeck,
    handleRevealCards,
    handleCompareTurn,
    handleResolveTurn,
    resetGame,

    // Utilities (expose send for advanced use cases)
    send: actorRef.send,
  };
}
