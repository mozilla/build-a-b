import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameStore } from './game-store';
import type { Card } from '../types';

describe('gameStore', () => {
  beforeEach(() => {
    // Clean up any existing timers
    vi.clearAllTimers();
    vi.useRealTimers();
    // Reset store before each test
    useGameStore.getState().resetGame();
    // Use fake timers for animation timeouts
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should have correct initial state', () => {
      const state = useGameStore.getState();

      expect(state.player.id).toBe('player');
      expect(state.cpu.id).toBe('cpu');
      expect(state.cardsInPlay).toEqual([]);
      expect(state.activePlayer).toBe('player');
      expect(state.winner).toBe(null);
      expect(state.winCondition).toBe(null);
    });

    it('should initialize game with correct deck sizes', () => {
      const { initializeGame } = useGameStore.getState();

      initializeGame();

      const state = useGameStore.getState();
      expect(state.player.deck).toHaveLength(33);
      expect(state.cpu.deck).toHaveLength(33);
    });

    it('should support custom deck ordering strategies', () => {
      const { initializeGame } = useGameStore.getState();

      initializeGame('tracker-first');

      const state = useGameStore.getState();
      // Player should have trackers first (since ordering happens before dealing)
      expect(state.player.deck[0].specialType).toBe('tracker');
    });
  });

  describe('playCard action', () => {
    beforeEach(() => {
      useGameStore.getState().initializeGame();
    });

    it('should play card from top of player deck', () => {
      const { playCard, player } = useGameStore.getState();
      const topCard = player.deck[0];
      const initialDeckSize = player.deck.length;

      playCard('player');

      const state = useGameStore.getState();
      expect(state.player.playedCard).toEqual(topCard);
      expect(state.player.deck).toHaveLength(initialDeckSize - 1);
      expect(state.cardsInPlay).toHaveLength(1);

      // Tracker cards have 0 value when first played (value applied to next card)
      const expectedValue = topCard.specialType === 'tracker' ? 0 : topCard.value;
      expect(state.player.currentTurnValue).toBe(expectedValue);

      // If tracker, verify bonus is stored for next card
      if (topCard.specialType === 'tracker') {
        expect(state.player.pendingTrackerBonus).toBe(topCard.value);
      }
    });

    it('should play card from top of CPU deck', () => {
      const { playCard, cpu } = useGameStore.getState();
      const topCard = cpu.deck[0];

      playCard('cpu');

      const state = useGameStore.getState();
      expect(state.cpu.playedCard).toEqual(topCard);

      // Tracker cards have 0 value when first played (value applied to next card)
      const expectedValue = topCard.specialType === 'tracker' ? 1 : topCard.value;
      expect(state.cpu.currentTurnValue).toBe(expectedValue);

      // If tracker, verify bonus is stored for next card
      if (topCard.specialType === 'tracker') {
        expect(state.cpu.pendingTrackerBonus).toBe(topCard.value);
      }
    });

    it('should add played card to cardsInPlay', () => {
      const { playCard } = useGameStore.getState();

      playCard('player');
      expect(useGameStore.getState().cardsInPlay).toHaveLength(1);

      playCard('cpu');
      expect(useGameStore.getState().cardsInPlay).toHaveLength(2);
    });

    it('should not crash when deck is empty', () => {
      // Empty the player deck
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          deck: [],
        },
      });

      const { playCard } = useGameStore.getState();
      expect(() => playCard('player')).not.toThrow();
    });
  });

  describe('collectCards action', () => {
    beforeEach(() => {
      useGameStore.getState().initializeGame();
    });

    it('should transfer all cards in play to winner', () => {
      const { playCard, collectCards } = useGameStore.getState();

      // Play two cards
      playCard('player');
      playCard('cpu');

      const initialPlayerDeck = useGameStore.getState().player.deck.length;
      const cardsInPlay = [...useGameStore.getState().cardsInPlay];

      collectCards('player', cardsInPlay);
      vi.runAllTimers(); // Advance timers to complete collection animation

      const state = useGameStore.getState();
      expect(state.player.deck).toHaveLength(initialPlayerDeck + 2);
      expect(state.cardsInPlay).toHaveLength(0);
    });

    it('should reset played cards for both players', () => {
      const { playCard, collectCards } = useGameStore.getState();

      playCard('player');
      playCard('cpu');

      expect(useGameStore.getState().player.playedCard).not.toBe(null);
      expect(useGameStore.getState().cpu.playedCard).not.toBe(null);

      collectCards('player', useGameStore.getState().cardsInPlay);
      vi.runAllTimers(); // Advance timers to complete collection animation

      const state = useGameStore.getState();
      expect(state.player.playedCard).toBe(null);
      expect(state.cpu.playedCard).toBe(null);
    });

    it('should reset current turn values', () => {
      const { playCard, collectCards } = useGameStore.getState();

      playCard('player');
      playCard('cpu');

      collectCards('player', useGameStore.getState().cardsInPlay);
      vi.runAllTimers(); // Advance timers to complete collection animation

      const state = useGameStore.getState();
      expect(state.player.currentTurnValue).toBe(0);
      expect(state.cpu.currentTurnValue).toBe(0);
    });
  });

  describe('addLaunchStack action', () => {
    beforeEach(() => {
      useGameStore.getState().resetGame();
    });

    it('should increment launch stack count', () => {
      const { addLaunchStack, player } = useGameStore.getState();

      expect(player.launchStackCount).toBe(0);

      // Set up a Launch Stack card being played
      const launchStackCard = { id: 'ls-1', value: 5, specialType: 'launch_stack' } as Card;
      useGameStore.setState({
        player: { ...player, playedCard: launchStackCard },
        cardsInPlay: [launchStackCard],
      });

      addLaunchStack('player', launchStackCard);
      expect(useGameStore.getState().player.launchStackCount).toBe(1);
      expect(useGameStore.getState().playerLaunchStacks).toHaveLength(1);
      expect(useGameStore.getState().cardsInPlay).toHaveLength(0); // Card removed from play

      // Set up second Launch Stack
      const launchStackCard2 = { id: 'ls-2', value: 5, specialType: 'launch_stack' } as Card;
      useGameStore.setState({
        player: { ...useGameStore.getState().player, playedCard: launchStackCard2 },
        cardsInPlay: [launchStackCard2],
      });

      addLaunchStack('player', launchStackCard2);
      expect(useGameStore.getState().player.launchStackCount).toBe(2);
      expect(useGameStore.getState().playerLaunchStacks).toHaveLength(2);
    });

    it('should set win condition when 3 launch stacks collected', () => {
      const { addLaunchStack, player } = useGameStore.getState();

      // Add first Launch Stack
      const launchStackCard1 = { id: 'ls-1', value: 5, specialType: 'launch_stack' } as Card;
      useGameStore.setState({
        player: { ...player, playedCard: launchStackCard1 },
        cardsInPlay: [launchStackCard1],
      });
      addLaunchStack('player', launchStackCard1);

      // Add second Launch Stack
      const launchStackCard2 = { id: 'ls-2', value: 5, specialType: 'launch_stack' } as Card;
      useGameStore.setState({
        player: { ...useGameStore.getState().player, playedCard: launchStackCard2 },
        cardsInPlay: [launchStackCard2],
      });
      addLaunchStack('player', launchStackCard2);

      expect(useGameStore.getState().winner).toBe(null);

      // Add third Launch Stack - should win
      const launchStackCard3 = { id: 'ls-3', value: 5, specialType: 'launch_stack' } as Card;
      useGameStore.setState({
        player: { ...useGameStore.getState().player, playedCard: launchStackCard3 },
        cardsInPlay: [launchStackCard3],
      });
      addLaunchStack('player', launchStackCard3);

      const state = useGameStore.getState();
      expect(state.winner).toBe('player');
      expect(state.winCondition).toBe('launch_stacks');
      expect(state.playerLaunchStacks).toHaveLength(3);
    });
  });

  describe('swapDecks action', () => {
    beforeEach(() => {
      useGameStore.getState().initializeGame('tracker-first', 'common-first');
    });

    it('should swap player and CPU decks', () => {
      const { swapDecks, player, cpu } = useGameStore.getState();
      const playerDeckBefore = [...player.deck];
      const cpuDeckBefore = [...cpu.deck];

      swapDecks();

      const state = useGameStore.getState();
      expect(state.player.deck).toEqual(cpuDeckBefore);
      expect(state.cpu.deck).toEqual(playerDeckBefore);
    });
  });

  describe('stealCards action', () => {
    beforeEach(() => {
      useGameStore.getState().initializeGame();
    });

    it('should transfer cards from one player to another', () => {
      const { stealCards, cpu } = useGameStore.getState();
      const initialCpuDeck = cpu.deck.length;
      const initialPlayerDeck = useGameStore.getState().player.deck.length;
      const stolenCards = [...cpu.deck.slice(0, 2)];

      stealCards('cpu', 'player', 2);

      const state = useGameStore.getState();
      expect(state.cpu.deck).toHaveLength(initialCpuDeck - 2);
      expect(state.player.deck).toHaveLength(initialPlayerDeck + 2);

      // Check that the stolen cards are at the end of player's deck
      const lastTwo = state.player.deck.slice(-2);
      expect(lastTwo).toEqual(stolenCards);
    });

    it('should handle stealing more cards than available', () => {
      // Set CPU to have only 1 card
      useGameStore.setState({
        cpu: {
          ...useGameStore.getState().cpu,
          deck: [useGameStore.getState().cpu.deck[0]],
        },
      });

      const { stealCards } = useGameStore.getState();

      stealCards('cpu', 'player', 5); // Try to steal 5 cards

      const state = useGameStore.getState();
      expect(state.cpu.deck).toHaveLength(0); // Should be empty, not negative
    });
  });

  describe('checkWinCondition action', () => {
    it('should return false when game is ongoing', () => {
      useGameStore.getState().initializeGame();
      const { checkWinCondition } = useGameStore.getState();

      const hasWon = checkWinCondition();
      expect(hasWon).toBe(false);
    });

    it('should detect player winning by collecting all cards', () => {
      useGameStore.getState().initializeGame();

      // Give player all cards
      const allCards = [
        ...useGameStore.getState().player.deck,
        ...useGameStore.getState().cpu.deck,
      ];

      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          deck: allCards,
        },
        cpu: {
          ...useGameStore.getState().cpu,
          deck: [],
          playedCard: null,
        },
      });

      const { checkWinCondition } = useGameStore.getState();
      const hasWon = checkWinCondition();

      expect(hasWon).toBe(true);
      expect(useGameStore.getState().winner).toBe('player');
      expect(useGameStore.getState().winCondition).toBe('all_cards');
    });

    it('should detect CPU winning by collecting all cards', () => {
      useGameStore.getState().initializeGame();

      // Give CPU all cards
      const allCards = [
        ...useGameStore.getState().player.deck,
        ...useGameStore.getState().cpu.deck,
      ];

      useGameStore.setState({
        cpu: {
          ...useGameStore.getState().cpu,
          deck: allCards,
        },
        player: {
          ...useGameStore.getState().player,
          deck: [],
          playedCard: null,
        },
      });

      const { checkWinCondition } = useGameStore.getState();
      const hasWon = checkWinCondition();

      expect(hasWon).toBe(true);
      expect(useGameStore.getState().winner).toBe('cpu');
      expect(useGameStore.getState().winCondition).toBe('all_cards');
    });

    it('should detect player winning with 3 launch stacks', () => {
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          launchStackCount: 3,
        },
      });

      const { checkWinCondition } = useGameStore.getState();
      const hasWon = checkWinCondition();

      expect(hasWon).toBe(true);
      expect(useGameStore.getState().winner).toBe('player');
      expect(useGameStore.getState().winCondition).toBe('launch_stacks');
    });

    it('should return true if already won', () => {
      useGameStore.setState({
        winner: 'player',
        winCondition: 'all_cards',
      });

      const { checkWinCondition } = useGameStore.getState();
      const hasWon = checkWinCondition();

      expect(hasWon).toBe(true);
    });
  });

  describe('UI state actions', () => {
    it('should toggle pause state', () => {
      const { togglePause } = useGameStore.getState();

      expect(useGameStore.getState().isPaused).toBe(false);

      togglePause();
      expect(useGameStore.getState().isPaused).toBe(true);

      togglePause();
      expect(useGameStore.getState().isPaused).toBe(false);
    });

    it('should toggle menu and pause together', () => {
      const { toggleMenu } = useGameStore.getState();

      expect(useGameStore.getState().showMenu).toBe(false);
      expect(useGameStore.getState().isPaused).toBe(false);

      toggleMenu();
      expect(useGameStore.getState().showMenu).toBe(true);
      expect(useGameStore.getState().isPaused).toBe(true);

      toggleMenu();
      expect(useGameStore.getState().showMenu).toBe(false);
      expect(useGameStore.getState().isPaused).toBe(false);
    });

    it('should toggle hand viewer', () => {
      const { toggleHandViewer } = useGameStore.getState();

      expect(useGameStore.getState().showHandViewer).toBe(false);

      toggleHandViewer('cpu');
      expect(useGameStore.getState().showHandViewer).toBe(true);
      expect(useGameStore.getState().handViewerPlayer).toBe('cpu');

      toggleHandViewer();
      expect(useGameStore.getState().showHandViewer).toBe(false);
    });

    it('should select billionaire', () => {
      const { selectBillionaire } = useGameStore.getState();

      selectBillionaire('elon');

      const state = useGameStore.getState();
      expect(state.selectedBillionaire).toBe('elon');
      expect(state.player.billionaireCharacter).toBe('elon');
    });

    it('should select background', () => {
      const { selectBackground } = useGameStore.getState();

      selectBackground('space');

      expect(useGameStore.getState().selectedBackground).toBe('space');
    });
  });

  describe('special effects', () => {
    it('should add pending effect to queue', () => {
      const { addPendingEffect } = useGameStore.getState();

      const effect = {
        type: 'tracker' as const,
        playedBy: 'player' as const,
        card: {} as Card,
        isInstant: false,
      };

      addPendingEffect(effect);

      const state = useGameStore.getState();
      expect(state.pendingEffects).toHaveLength(1);
      expect(state.pendingEffects[0]).toEqual(effect);
    });

    it('should clear pending effects', () => {
      const { addPendingEffect, clearPendingEffects } = useGameStore.getState();

      addPendingEffect({
        type: 'tracker',
        playedBy: 'player',
        card: {} as Card,
        isInstant: false,
      });

      expect(useGameStore.getState().pendingEffects).toHaveLength(1);

      clearPendingEffects();

      expect(useGameStore.getState().pendingEffects).toHaveLength(0);
    });

    it('should set tracker smacker active', () => {
      const { setTrackerSmackerActive } = useGameStore.getState();

      expect(useGameStore.getState().trackerSmackerActive).toBe(null);

      setTrackerSmackerActive('player');
      expect(useGameStore.getState().trackerSmackerActive).toBe('player');

      setTrackerSmackerActive(null);
      expect(useGameStore.getState().trackerSmackerActive).toBe(null);
    });
  });

  describe('resetGame action', () => {
    it('should reset all game state', () => {
      // Modify state
      useGameStore.setState({
        winner: 'player',
        winCondition: 'all_cards',
        isPaused: true,
        showMenu: true,
      });

      const { resetGame } = useGameStore.getState();
      resetGame();

      const state = useGameStore.getState();
      expect(state.winner).toBe(null);
      expect(state.winCondition).toBe(null);
      expect(state.isPaused).toBe(false);
      expect(state.showMenu).toBe(false);
      expect(state.player.deck).toHaveLength(33);
      expect(state.cpu.deck).toHaveLength(33);
    });
  });

  describe('setActivePlayer action', () => {
    it('should change the active player', () => {
      const { setActivePlayer } = useGameStore.getState();

      expect(useGameStore.getState().activePlayer).toBe('player');

      setActivePlayer('cpu');
      expect(useGameStore.getState().activePlayer).toBe('cpu');

      setActivePlayer('player');
      expect(useGameStore.getState().activePlayer).toBe('player');
    });
  });
});
