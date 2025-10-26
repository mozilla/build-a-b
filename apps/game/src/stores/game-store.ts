/**
 * Zustand Store - Game Data Management
 * Manages all game state data (cards, players, UI state)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Card, Player, SpecialEffect } from '../types';
import { initializeGameDeck, type DeckOrderStrategy } from '../utils/deck-builder';
import { DEFAULT_GAME_CONFIG } from '../config/game-config';
import {
  compareCards,
  applyTrackerModifier,
  applyBlockerModifier,
  isEffectBlocked,
  shouldTriggerDataWar,
} from '../utils/card-comparison';

interface GameStore {
  // Player State
  player: Player;
  cpu: Player;

  // Game State
  cardsInPlay: Card[];
  activePlayer: 'player' | 'cpu';
  anotherPlayMode: boolean; // True when only activePlayer should play (tracker/blocker/launch_stack)
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
  initializeGame: (playerStrategy?: DeckOrderStrategy, cpuStrategy?: DeckOrderStrategy) => void;
  playCard: (playerId: 'player' | 'cpu') => void;
  collectCards: (winnerId: 'player' | 'cpu', cards: Card[]) => void;
  addLaunchStack: (playerId: 'player' | 'cpu') => void;
  swapDecks: () => void;
  stealCards: (from: 'player' | 'cpu', to: 'player' | 'cpu', count: number) => void;
  checkWinCondition: () => boolean;
  setActivePlayer: (playerId: 'player' | 'cpu') => void;
  setAnotherPlayMode: (enabled: boolean) => void;

  // Actions - Turn Resolution
  resolveTurn: () => 'player' | 'cpu' | 'tie';
  applyTrackerEffect: (playerId: 'player' | 'cpu', trackerCard: Card) => void;
  applyBlockerEffect: (playerId: 'player' | 'cpu', blockerCard: Card) => void;
  checkForDataWar: () => boolean;
  handleCardEffect: (card: Card, playedBy: 'player' | 'cpu') => void;

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
  resetGame: (playerStrategy?: DeckOrderStrategy, cpuStrategy?: DeckOrderStrategy) => void;
}

const createInitialPlayer = (id: 'player' | 'cpu'): Player => ({
  id,
  name: id === 'player' ? 'Player' : 'CPU',
  deck: [],
  playedCard: null,
  playedCardsInHand: [],
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
      anotherPlayMode: false,
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
          cpuStrategy,
          false, // Random decks for normal gameplay
        );
        set({
          player: { ...createInitialPlayer('player'), deck: playerDeck },
          cpu: { ...createInitialPlayer('cpu'), deck: cpuDeck },
          cardsInPlay: [],
          winner: null,
          winCondition: null,
          activePlayer: 'player',
          anotherPlayMode: false,
          pendingEffects: [],
          trackerSmackerActive: null,
        });
      },

      playCard: (playerId) => {
        const playerState = get()[playerId];
        const [card, ...remainingDeck] = playerState.deck;

        if (!card) {
          // This shouldn't happen - win condition should have caught it before calling playCard
          if (import.meta.env.DEV) {
            console.error(
              `[BUG] playCard called for ${playerId} with empty deck - win condition should have prevented this`,
            );
          }
          return;
        }

        // In "another play" mode, ADD to existing value
        // In normal mode, SET the value
        const newTurnValue = get().anotherPlayMode
          ? playerState.currentTurnValue + card.value
          : card.value;

        set({
          [playerId]: {
            ...playerState,
            playedCard: card,
            playedCardsInHand: [...playerState.playedCardsInHand, { card, isFaceDown: false }], // Add face-up to stack
            deck: remainingDeck,
            currentTurnValue: newTurnValue,
          },
          cardsInPlay: [...get().cardsInPlay, card],
        });
      },

      collectCards: (winnerId, cards) => {
        const winner = get()[winnerId];
        set({
          [winnerId]: {
            ...winner,
            deck: [...winner.deck, ...(cards || [])], // Add to bottom of deck
            playedCard: null,
            playedCardsInHand: [], // Clear hand stack
            currentTurnValue: 0,
          },
          cardsInPlay: [],
        });

        // Also clear the loser's played card and hand stack
        const loserId = winnerId === 'player' ? 'cpu' : 'player';
        const loser = get()[loserId];
        set({
          [loserId]: {
            ...loser,
            playedCard: null,
            playedCardsInHand: [], // Clear hand stack
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

      setAnotherPlayMode: (enabled) => {
        set({ anotherPlayMode: enabled });
      },

      // Turn Resolution Actions
      resolveTurn: () => {
        const { player, cpu } = get();

        // Compare current turn values (already modified by trackers/blockers)
        const result = compareCards(player, cpu);

        if (result.isTie) {
          return 'tie';
        }

        // Winner collects all cards in play
        const { cardsInPlay } = get();
        if (result.winner !== 'tie') {
          get().collectCards(result.winner, cardsInPlay);
        }

        return result.winner;
      },

      applyTrackerEffect: (playerId, trackerCard) => {
        const player = get()[playerId];

        // Check if effect is blocked by Tracker Smacker
        if (isEffectBlocked(get().trackerSmackerActive, playerId)) {
          console.log(`Tracker effect blocked by Tracker Smacker`);
          return;
        }

        // Apply tracker modifier (add tracker value to turn total)
        const newValue = applyTrackerModifier(player.currentTurnValue, trackerCard);

        set({
          [playerId]: {
            ...player,
            currentTurnValue: newValue,
          },
        });
      },

      applyBlockerEffect: (playerId, blockerCard) => {
        // Blocker affects the opponent
        const opponentId = playerId === 'player' ? 'cpu' : 'player';
        const opponent = get()[opponentId];

        // Check if effect is blocked by Tracker Smacker
        if (isEffectBlocked(get().trackerSmackerActive, playerId)) {
          console.log(`Blocker effect blocked by Tracker Smacker`);
          return;
        }

        // Apply blocker modifier (subtract from opponent's turn value)
        const newValue = applyBlockerModifier(opponent.currentTurnValue, blockerCard);

        set({
          [opponentId]: {
            ...opponent,
            currentTurnValue: newValue,
          },
        });
      },

      checkForDataWar: () => {
        const { player, cpu } = get();

        if (!player.playedCard || !cpu.playedCard) {
          return false;
        }

        return shouldTriggerDataWar(
          player.playedCard,
          cpu.playedCard,
          player.currentTurnValue,
          cpu.currentTurnValue,
        );
      },

      handleCardEffect: (card, playedBy) => {
        // Handle special card effects
        if (!card.isSpecial || !card.specialType) {
          return;
        }

        // Create special effect
        const effect: SpecialEffect = {
          type: card.specialType,
          playedBy,
          card,
          isInstant: ['forced_empathy', 'tracker_smacker', 'hostile_takeover'].includes(
            card.specialType,
          ),
        };

        // If instant effect, we'll handle it immediately in the machine
        // Otherwise, add to pending effects queue
        if (!effect.isInstant) {
          get().addPendingEffect(effect);
        }

        // Handle specific effects
        switch (card.specialType) {
          case 'tracker':
            // Tracker value is already added by playCard
            // The "another play" trigger is handled in handleResolveTurn
            // Check if effect is blocked by Tracker Smacker
            if (!isEffectBlocked(get().trackerSmackerActive, playedBy)) {
              // Tracker effect is allowed (will trigger another play)
            }
            break;
          case 'blocker':
            get().applyBlockerEffect(playedBy, card);
            break;
          case 'launch_stack':
            get().addLaunchStack(playedBy);
            break;
          case 'tracker_smacker':
            get().setTrackerSmackerActive(playedBy);
            break;
          case 'forced_empathy':
            get().swapDecks();
            break;
          // Other effects will be handled when processing pending effects
        }
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
          cpuStrategy,
          false, // Normal random decks for reset
        );
        set({
          player: { ...createInitialPlayer('player'), deck: playerDeck },
          cpu: { ...createInitialPlayer('cpu'), deck: cpuDeck },
          cardsInPlay: [],
          activePlayer: 'player',
          anotherPlayMode: false,
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
    { name: 'DataWarGame' },
  ),
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
