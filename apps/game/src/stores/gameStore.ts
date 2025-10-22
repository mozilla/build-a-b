/**
 * Zustand Store - Game Data Management
 * Manages all game state data (cards, players, UI state)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Card, Player, SpecialEffect } from '../types';
import { initializeGameDeck, type DeckOrderStrategy } from '../utils/deckBuilder';
import { DEFAULT_GAME_CONFIG } from '../config/gameConfig';

interface GameStore {
  // Player State
  player: Player;
  cpu: Player;

  // Game State
  cardsInPlay: Card[];
  activePlayer: 'player' | 'cpu';
  pendingEffects: SpecialEffect[];
  trackerSmackerActive: 'player' | 'cpu' | null;
  winner: 'player' | 'cpu' | null;
  winCondition: 'all_cards' | 'launch_stacks' | null;

  // UI State
  selectedBillionaire: string;
  selectedBackground: string;
  isPaused: boolean;
  showMenu: boolean;
  showHandViewer: boolean;
  handViewerPlayer: 'player' | 'cpu';
  showInstructions: boolean;
  audioEnabled: boolean;
  showTooltip: boolean;

  // Actions - Game Logic
  initializeGame: (
    playerStrategy?: DeckOrderStrategy,
    cpuStrategy?: DeckOrderStrategy
  ) => void;
  playCard: (playerId: 'player' | 'cpu') => void;
  collectCards: (winnerId: 'player' | 'cpu', cards: Card[]) => void;
  addLaunchStack: (playerId: 'player' | 'cpu') => void;
  swapDecks: () => void;
  stealCards: (
    from: 'player' | 'cpu',
    to: 'player' | 'cpu',
    count: number
  ) => void;
  checkWinCondition: () => boolean;
  setActivePlayer: (playerId: 'player' | 'cpu') => void;

  // Actions - Special Effects
  addPendingEffect: (effect: SpecialEffect) => void;
  clearPendingEffects: () => void;
  setTrackerSmackerActive: (playerId: 'player' | 'cpu' | null) => void;

  // Actions - UI
  selectBillionaire: (billionaire: string) => void;
  selectBackground: (background: string) => void;
  togglePause: () => void;
  toggleMenu: () => void;
  toggleHandViewer: (player?: 'player' | 'cpu') => void;
  toggleAudio: () => void;
  toggleInstructions: () => void;
  setShowTooltip: (show: boolean) => void;
  resetGame: (
    playerStrategy?: DeckOrderStrategy,
    cpuStrategy?: DeckOrderStrategy
  ) => void;
}

const createInitialPlayer = (id: 'player' | 'cpu'): Player => ({
  id,
  name: id === 'player' ? 'Player' : 'CPU',
  deck: [],
  playedCard: null,
  currentTurnValue: 0,
  launchStackCount: 0,
});

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      player: createInitialPlayer('player'),
      cpu: createInitialPlayer('cpu'),
      cardsInPlay: [],
      activePlayer: 'player',
      pendingEffects: [],
      trackerSmackerActive: null,
      winner: null,
      winCondition: null,
      selectedBillionaire: '',
      selectedBackground: '',
      isPaused: false,
      showMenu: false,
      showHandViewer: false,
      handViewerPlayer: 'player',
      showInstructions: false,
      audioEnabled: true,
      showTooltip: false,

      // Game Logic Actions
      initializeGame: (playerStrategy = 'random', cpuStrategy = 'random') => {
        const { playerDeck, cpuDeck } = initializeGameDeck(
          DEFAULT_GAME_CONFIG,
          playerStrategy,
          cpuStrategy
        );
        set({
          player: { ...createInitialPlayer('player'), deck: playerDeck },
          cpu: { ...createInitialPlayer('cpu'), deck: cpuDeck },
          cardsInPlay: [],
          winner: null,
          winCondition: null,
          activePlayer: 'player',
          pendingEffects: [],
          trackerSmackerActive: null,
        });
      },

      playCard: (playerId) => {
        const playerState = get()[playerId];
        const [card, ...remainingDeck] = playerState.deck;

        if (!card) return; // No cards left

        set({
          [playerId]: {
            ...playerState,
            playedCard: card,
            deck: remainingDeck,
            currentTurnValue: card.value,
          },
          cardsInPlay: [...get().cardsInPlay, card],
        });
      },

      collectCards: (winnerId, cards) => {
        const winner = get()[winnerId];
        set({
          [winnerId]: {
            ...winner,
            deck: [...winner.deck, ...cards], // Add to bottom of deck
            playedCard: null,
            currentTurnValue: 0,
          },
          cardsInPlay: [],
        });

        // Also clear the loser's played card
        const loserId = winnerId === 'player' ? 'cpu' : 'player';
        const loser = get()[loserId];
        set({
          [loserId]: {
            ...loser,
            playedCard: null,
            currentTurnValue: 0,
          },
        });
      },

      addLaunchStack: (playerId) => {
        const player = get()[playerId];
        const newCount = player.launchStackCount + 1;

        set({
          [playerId]: {
            ...player,
            launchStackCount: newCount,
          },
        });

        // Check win condition
        if (newCount >= DEFAULT_GAME_CONFIG.launchStacksToWin) {
          set({ winner: playerId, winCondition: 'launch_stacks' });
        }
      },

      swapDecks: () => {
        const { player, cpu } = get();
        set({
          player: { ...player, deck: cpu.deck },
          cpu: { ...cpu, deck: player.deck },
        });
      },

      stealCards: (from, to, count) => {
        const fromPlayer = get()[from];
        const toPlayer = get()[to];
        const stolenCards = fromPlayer.deck.slice(0, count);
        const remainingCards = fromPlayer.deck.slice(count);

        set({
          [from]: { ...fromPlayer, deck: remainingCards },
          [to]: { ...toPlayer, deck: [...toPlayer.deck, ...stolenCards] },
        });
      },

      checkWinCondition: () => {
        const { player, cpu, winner, winCondition } = get();

        // If already won, return true
        if (winner !== null && winCondition !== null) {
          return true;
        }

        // Check if player has all cards
        if (cpu.deck.length === 0 && cpu.playedCard === null) {
          set({ winner: 'player', winCondition: 'all_cards' });
          return true;
        }

        // Check if CPU has all cards
        if (player.deck.length === 0 && player.playedCard === null) {
          set({ winner: 'cpu', winCondition: 'all_cards' });
          return true;
        }

        // Check launch stacks (already handled in addLaunchStack)
        if (player.launchStackCount >= DEFAULT_GAME_CONFIG.launchStacksToWin) {
          set({ winner: 'player', winCondition: 'launch_stacks' });
          return true;
        }

        if (cpu.launchStackCount >= DEFAULT_GAME_CONFIG.launchStacksToWin) {
          set({ winner: 'cpu', winCondition: 'launch_stacks' });
          return true;
        }

        return false;
      },

      setActivePlayer: (playerId) => {
        set({ activePlayer: playerId });
      },

      // Special Effects Actions
      addPendingEffect: (effect) => {
        set({ pendingEffects: [...get().pendingEffects, effect] });
      },

      clearPendingEffects: () => {
        set({ pendingEffects: [] });
      },

      setTrackerSmackerActive: (playerId) => {
        set({ trackerSmackerActive: playerId });
      },

      // UI Actions
      selectBillionaire: (billionaire) => {
        set({
          selectedBillionaire: billionaire,
          player: {
            ...get().player,
            billionaireCharacter: billionaire,
          },
        });
      },

      selectBackground: (background) => {
        set({ selectedBackground: background });
      },

      togglePause: () => {
        set({ isPaused: !get().isPaused });
      },

      toggleMenu: () => {
        const currentShowMenu = get().showMenu;
        set({
          showMenu: !currentShowMenu,
          isPaused: !currentShowMenu, // Pause when opening menu
        });
      },

      toggleHandViewer: (player) => {
        set({
          showHandViewer: !get().showHandViewer,
          handViewerPlayer: player || get().handViewerPlayer,
        });
      },

      toggleAudio: () => {
        set({ audioEnabled: !get().audioEnabled });
      },

      toggleInstructions: () => {
        set({ showInstructions: !get().showInstructions });
      },

      setShowTooltip: (show) => {
        set({ showTooltip: show });
      },

      resetGame: (playerStrategy = 'random', cpuStrategy = 'random') => {
        const { playerDeck, cpuDeck } = initializeGameDeck(
          DEFAULT_GAME_CONFIG,
          playerStrategy,
          cpuStrategy
        );
        set({
          player: { ...createInitialPlayer('player'), deck: playerDeck },
          cpu: { ...createInitialPlayer('cpu'), deck: cpuDeck },
          cardsInPlay: [],
          activePlayer: 'player',
          pendingEffects: [],
          trackerSmackerActive: null,
          winner: null,
          winCondition: null,
          isPaused: false,
          showMenu: false,
          showHandViewer: false,
          showTooltip: false,
        });
      },
    }),
    { name: 'DataWarGame' }
  )
);

// Selector hooks for better performance
export const usePlayer = () => useGameStore((state) => state.player);
export const useCPU = () => useGameStore((state) => state.cpu);
export const useCardsInPlay = () => useGameStore((state) => state.cardsInPlay);
export const useWinner = () => useGameStore((state) => state.winner);
export const useUIState = () =>
  useGameStore((state) => ({
    isPaused: state.isPaused,
    showMenu: state.showMenu,
    showHandViewer: state.showHandViewer,
    showInstructions: state.showInstructions,
    audioEnabled: state.audioEnabled,
    showTooltip: state.showTooltip,
  }));
