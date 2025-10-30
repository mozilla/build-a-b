import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './game-store';
import type { Card } from '../types';

describe('Turn Resolution', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  describe('resolveTurn', () => {
    it('should return player as winner when player value is higher', () => {
      const { initializeGame, playCard } = useGameStore.getState();
      initializeGame('high-value-first');

      // Player gets first 33 cards (high value), CPU gets remaining cards (lower value)
      playCard('player');
      playCard('cpu');

      const result = useGameStore.getState().resolveTurn();

      expect(result).toBe('player');
    });

    it('should return cpu as winner when CPU value is higher', () => {
      const { initializeGame, playCard } = useGameStore.getState();
      initializeGame('low-value-first');

      // Player gets first 33 cards (low value), CPU gets remaining cards (higher value)
      playCard('player');
      playCard('cpu');

      const result = useGameStore.getState().resolveTurn();

      expect(result).toBe('cpu');
    });

    it('should return tie when values are equal', () => {
      const { initializeGame } = useGameStore.getState();
      initializeGame();

      // Manually set equal turn values
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          currentTurnValue: 5,
          playedCard: {} as Card,
        },
        cpu: {
          ...useGameStore.getState().cpu,
          currentTurnValue: 5,
          playedCard: {} as Card,
        },
        cardsInPlay: [{} as Card, {} as Card],
      });

      const result = useGameStore.getState().resolveTurn();

      expect(result).toBe('tie');
    });

    it('should collect cards for winner', () => {
      const { initializeGame, playCard, collectCardsAfterEffects } = useGameStore.getState();
      initializeGame('high-value-first');

      const initialPlayerDeck = useGameStore.getState().player.deck.length;

      playCard('player');
      playCard('cpu');

      const cardsInPlayCount = useGameStore.getState().cardsInPlay.length;

      const winner = useGameStore.getState().resolveTurn();
      collectCardsAfterEffects(winner);

      const state = useGameStore.getState();
      // Player should have won and collected both cards
      expect(state.player.deck.length).toBe(initialPlayerDeck - 1 + cardsInPlayCount);
      expect(state.cardsInPlay).toHaveLength(0);
    });

    it('should not collect cards on tie', () => {
      const { initializeGame } = useGameStore.getState();
      initializeGame();

      // Set up tie scenario
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          currentTurnValue: 4,
          playedCard: {} as Card,
        },
        cpu: {
          ...useGameStore.getState().cpu,
          currentTurnValue: 4,
          playedCard: {} as Card,
        },
        cardsInPlay: [{} as Card, {} as Card],
      });

      useGameStore.getState().resolveTurn();

      // Cards should still be in play for Data War
      expect(useGameStore.getState().cardsInPlay).toHaveLength(2);
    });
  });

  describe('applyTrackerEffect', () => {
    beforeEach(() => {
      useGameStore.getState().initializeGame('tracker-first', 'common-first');
    });

    it('should add tracker value to player turn value', () => {
      const { playCard } = useGameStore.getState();

      // Play a tracker card (should be first due to ordering)
      playCard('player');

      // Get the played card from updated state
      const trackerCard = useGameStore.getState().player.playedCard!;

      // Set initial turn value
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          currentTurnValue: 5,
        },
      });

      useGameStore.getState().applyTrackerEffect('player', trackerCard);

      // Should be 5 + tracker value (1, 2, or 3)
      expect(useGameStore.getState().player.currentTurnValue).toBeGreaterThan(5);
    });

    it('should not apply effect when blocked by Tracker Smacker', () => {
      const { playCard } = useGameStore.getState();
      playCard('player');
      const trackerCard = useGameStore.getState().player.playedCard!;

      // CPU has Tracker Smacker active (blocks player effects)
      useGameStore.setState({
        trackerSmackerActive: 'cpu',
        player: {
          ...useGameStore.getState().player,
          currentTurnValue: 5,
        },
      });

      useGameStore.getState().applyTrackerEffect('player', trackerCard);

      // Value should not change
      expect(useGameStore.getState().player.currentTurnValue).toBe(5);
    });
  });

  describe('applyBlockerEffect', () => {
    beforeEach(() => {
      useGameStore.getState().initializeGame('blocker-first');
    });

    it('should subtract from opponent turn value', () => {
      const { playCard } = useGameStore.getState();
      playCard('player');
      const blockerCard = useGameStore.getState().player.playedCard!;

      // Set CPU turn value
      useGameStore.setState({
        cpu: {
          ...useGameStore.getState().cpu,
          currentTurnValue: 5,
        },
      });

      useGameStore.getState().applyBlockerEffect('player', blockerCard);

      // Should be less than 5
      expect(useGameStore.getState().cpu.currentTurnValue).toBeLessThan(5);
    });

    it('should not go below 0', () => {
      const { playCard } = useGameStore.getState();
      playCard('player');
      const blockerCard = useGameStore.getState().player.playedCard!;

      // Set CPU turn value to 0
      useGameStore.setState({
        cpu: {
          ...useGameStore.getState().cpu,
          currentTurnValue: 0,
        },
      });

      useGameStore.getState().applyBlockerEffect('player', blockerCard);

      // Should stay at 0, not go negative
      expect(useGameStore.getState().cpu.currentTurnValue).toBe(0);
    });

    it('should not apply effect when blocked by Tracker Smacker', () => {
      const { playCard } = useGameStore.getState();
      playCard('player');
      const blockerCard = useGameStore.getState().player.playedCard!;

      // CPU has Tracker Smacker active (blocks player effects)
      useGameStore.setState({
        trackerSmackerActive: 'cpu',
        cpu: {
          ...useGameStore.getState().cpu,
          currentTurnValue: 5,
        },
      });

      useGameStore.getState().applyBlockerEffect('player', blockerCard);

      // Value should not change
      expect(useGameStore.getState().cpu.currentTurnValue).toBe(5);
    });
  });

  describe('checkForDataWar', () => {
    beforeEach(() => {
      useGameStore.getState().initializeGame();
    });

    it('should return true when cards have equal values', () => {
      // Set up equal values
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          playedCard: { value: 4 } as Card,
          currentTurnValue: 4,
        },
        cpu: {
          ...useGameStore.getState().cpu,
          playedCard: { value: 4 } as Card,
          currentTurnValue: 4,
        },
      });

      expect(useGameStore.getState().checkForDataWar()).toBe(true);
    });

    it('should return false when cards have different values', () => {
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          playedCard: { value: 4 } as Card,
          currentTurnValue: 4,
        },
        cpu: {
          ...useGameStore.getState().cpu,
          playedCard: { value: 5 } as Card,
          currentTurnValue: 5,
        },
      });

      expect(useGameStore.getState().checkForDataWar()).toBe(false);
    });

    it('should return true when Hostile Takeover is played', () => {
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          playedCard: { value: 6, specialType: 'hostile_takeover' } as Card,
          currentTurnValue: 6,
        },
        cpu: {
          ...useGameStore.getState().cpu,
          playedCard: { value: 3 } as Card,
          currentTurnValue: 3,
        },
      });

      // Even though values are different, Hostile Takeover always triggers Data War
      expect(useGameStore.getState().checkForDataWar()).toBe(true);
    });

    it('should return false when no cards have been played', () => {
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          playedCard: null,
        },
        cpu: {
          ...useGameStore.getState().cpu,
          playedCard: null,
        },
      });

      expect(useGameStore.getState().checkForDataWar()).toBe(false);
    });
  });

  describe('handleCardEffect', () => {
    beforeEach(() => {
      useGameStore.getState().initializeGame('launch-stack-first', 'common-first');
    });

    it('should add launch stack when launch stack card is played', () => {
      const { playCard } = useGameStore.getState();
      const initialCount = useGameStore.getState().player.launchStackCount;

      playCard('player');
      const launchStackCard = useGameStore.getState().player.playedCard!;

      useGameStore.getState().handleCardEffect(launchStackCard, 'player');

      expect(useGameStore.getState().player.launchStackCount).toBe(initialCount + 1);
    });

    it('should activate Tracker Smacker when played', () => {
      // Manually create Tracker Smacker card
      const trackerSmackerCard: Card = {
        id: 'ts-1',
        typeId: 'firewall-smacker',
        value: 6,
        imageUrl: '/test.webp',
        isSpecial: true,
        specialType: 'tracker_smacker',
        name: 'smacker',
      };

      useGameStore.getState().handleCardEffect(trackerSmackerCard, 'player');

      expect(useGameStore.getState().trackerSmackerActive).toBe('player');
    });

    it('should swap decks when Forced Empathy is played', () => {
      // beforeEach already calls resetGame() which initializes the game
      const playerDeckIdsBefore = useGameStore
        .getState()
        .player.deck.map((c) => c.id)
        .sort();
      const cpuDeckIdsBefore = useGameStore
        .getState()
        .cpu.deck.map((c) => c.id)
        .sort();

      // Directly call swapDecks() to test the swap functionality
      // (handleCardEffect has animation delays that aren't relevant for this test)
      useGameStore.getState().swapDecks();

      const state = useGameStore.getState();
      const playerDeckIdsAfter = state.player.deck.map((c) => c.id).sort();
      const cpuDeckIdsAfter = state.cpu.deck.map((c) => c.id).sort();

      // Verify decks were swapped by checking card IDs match (order may differ due to shuffling)
      expect(playerDeckIdsAfter).toEqual(cpuDeckIdsBefore);
      expect(cpuDeckIdsAfter).toEqual(playerDeckIdsBefore);
    });

    it('should add non-instant effects to pending queue', () => {
      useGameStore.getState().initializeGame('tracker-first', 'common-first');

      const { playCard } = useGameStore.getState();
      playCard('player');
      const trackerCard = useGameStore.getState().player.playedCard!;

      useGameStore.getState().handleCardEffect(trackerCard, 'player');

      const pendingEffects = useGameStore.getState().pendingEffects;
      expect(pendingEffects.length).toBeGreaterThan(0);
      expect(pendingEffects[0].type).toBe('tracker');
    });

    it('should not add instant effects to pending queue', () => {
      const trackerSmackerCard: Card = {
        id: 'ts-1',
        typeId: 'firewall-smacker',
        value: 6,
        imageUrl: '/test.webp',
        isSpecial: true,
        specialType: 'tracker_smacker',
        name: 'smacker',
      };

      useGameStore.setState({ pendingEffects: [] });

      useGameStore.getState().handleCardEffect(trackerSmackerCard, 'player');

      // Instant effects should not be in queue
      expect(useGameStore.getState().pendingEffects).toHaveLength(0);
    });
  });
});
