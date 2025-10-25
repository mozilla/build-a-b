/**
 * Game Logic Hook
 * Connects XState machine to Zustand store for complete game management
 */

import { useActorRef, useSelector } from '@xstate/react';
import { createBrowserInspector } from '@statelyai/inspect';
import { gameFlowMachine } from '../machines/game-flow-machine';
import { useGameStore } from '../stores/game-store';
import { useCPUPlayer } from './use-cpu-player';
import { shouldTriggerAnotherPlay } from '../utils/card-comparison';
import { getGamePhase } from '../utils/get-game-phase';

// XState Inspector - only enabled in development
const inspector =
  import.meta.env.DEV
    ? createBrowserInspector({
        autoStart: true, // Auto-open inspector popup
      })
    : undefined;

/**
 * Main game logic hook that orchestrates the entire game
 * Combines state machine (flow) with Zustand store (data)
 *
 * Uses modern XState v5 API:
 * - useActorRef: Creates and manages the actor lifecycle
 * - useSelector: Subscribes to specific state slices for optimal performance
 */
export function useGameLogic() {
  // Create actor ref with inspector (modern XState v5 pattern)
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
  } = useGameStore();

  /**
   * Handles revealing cards for both players
   */
  const handleRevealCards = () => {
    // Play cards from top of both decks
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

    // Transition to comparing phase
    actorRef.send({ type: 'CARDS_REVEALED' });
  };

  /**
   * Handles turn comparison and resolution
   */
  const handleCompareTurn = () => {
    // Check if this should trigger Data War
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
    // Resolve turn and determine winner
    resolveTurn();

    // Check if game is over
    const hasWon = checkWinCondition();
    if (hasWon) {
      actorRef.send({ type: 'CHECK_WIN_CONDITION' });
      return;
    }

    // Check if either card triggers another play
    const { player: p, cpu: c, setTrackerSmackerActive } = useGameStore.getState();
    let nextPlayer: 'player' | 'cpu' | null = null;

    if (p.playedCard && shouldTriggerAnotherPlay(p.playedCard)) {
      nextPlayer = 'player';
    } else if (c.playedCard && shouldTriggerAnotherPlay(c.playedCard)) {
      nextPlayer = 'cpu';
    }

    if (nextPlayer) {
      // Same player goes again
      setActivePlayer(nextPlayer);
    } else {
      // Alternate players (simple for now - could be based on winner)
      setActivePlayer(activePlayer === 'player' ? 'cpu' : 'player');

      // Clear Tracker Smacker at the end of the turn (not during "another play")
      setTrackerSmackerActive(null);
    }

    // Move back to ready phase for next turn
    actorRef.send({ type: 'CHECK_WIN_CONDITION' });
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
          ...playerCards.map(card => ({ card, isFaceDown: true })),
        ],
      },
      cpu: {
        ...store.cpu,
        deck: updatedCpuDeck,
        playedCardsInHand: [
          ...store.cpu.playedCardsInHand,
          ...cpuCards.map(card => ({ card, isFaceDown: true })),
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
  useCPUPlayer(phase, activePlayer, tapDeck);

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
