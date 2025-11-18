import { describe, it, expect, beforeEach } from 'vitest';
import {
  createDeck,
  shuffleDeck,
  dealCards,
  initializeGameDeck,
  resetCardIdCounter,
  orderDeck,
} from './deck-builder';
import { DEFAULT_GAME_CONFIG, type CardTypeId } from '../config/game-config';

describe('deckBuilder', () => {
  beforeEach(() => {
    resetCardIdCounter();
  });

  describe('createDeck', () => {
    it('should create exactly 64 cards', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      expect(deck).toHaveLength(64);
    });

    it('should create correct number of common cards (40 total)', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const commonCards = deck.filter((card) => !card.isSpecial);
      expect(commonCards).toHaveLength(40);
    });

    it('should create 8 copies of each common card value', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const commonCards = deck.filter((card) => !card.isSpecial);

      const value1 = commonCards.filter((c) => c.value === 1);
      const value2 = commonCards.filter((c) => c.value === 2);
      const value3 = commonCards.filter((c) => c.value === 3);
      const value4 = commonCards.filter((c) => c.value === 4);
      const value5 = commonCards.filter((c) => c.value === 5);

      expect(value1).toHaveLength(8);
      expect(value2).toHaveLength(8);
      expect(value3).toHaveLength(8);
      expect(value4).toHaveLength(8);
      expect(value5).toHaveLength(8);
    });

    it('should create exactly 5 Launch Stack cards', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const launchStacks = deck.filter((card) => card.specialType === 'launch_stack');
      expect(launchStacks).toHaveLength(5);
    });

    it('should create Launch Stack cards with value 0 and triggersAnotherPlay', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const launchStacks = deck.filter((card) => card.specialType === 'launch_stack');

      launchStacks.forEach((card) => {
        expect(card.value).toBe(0);
        expect(card.triggersAnotherPlay).toBe(true);
      });
    });

    it('should create exactly 6 Tracker cards (2 of each type)', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const trackers = deck.filter((card) => card.specialType === 'tracker');
      expect(trackers).toHaveLength(6);

      const tracker1 = trackers.filter((c) => c.value === 1);
      const tracker2 = trackers.filter((c) => c.value === 2);
      const tracker3 = trackers.filter((c) => c.value === 3);

      expect(tracker1).toHaveLength(2);
      expect(tracker2).toHaveLength(2);
      expect(tracker3).toHaveLength(2);
    });

    it('should create Tracker cards with correct values and triggersAnotherPlay', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const trackers = deck.filter((card) => card.specialType === 'tracker');

      trackers.forEach((card) => {
        expect(card.triggersAnotherPlay).toBe(true);
        expect([1, 2, 3]).toContain(card.value);
      });
    });

    it('should create exactly 4 Blocker cards (2 of each type)', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const blockers = deck.filter((card) => card.specialType === 'blocker');
      expect(blockers).toHaveLength(4);
    });

    it('should create Blocker cards with value 0 and triggersAnotherPlay', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const blockers = deck.filter((card) => card.specialType === 'blocker');

      blockers.forEach((card) => {
        expect(card.value).toBe(0);
        expect(card.triggersAnotherPlay).toBe(true);
      });
    });

    it('should create exactly 4 Firewall cards', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const firewalls = deck.filter((card) =>
        ['forced_empathy', 'open_what_you_want', 'mandatory_recall'].includes(
          card.specialType || '',
        ),
      );
      expect(firewalls).toHaveLength(3);
    });

    it('should create Firewall cards with value 6', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const firewalls = deck.filter((card) =>
        ['forced_empathy', 'tracker_smacker', 'open_what_you_want', 'mandatory_recall'].includes(
          card.specialType || '',
        ),
      );

      firewalls.forEach((card) => {
        expect(card.value).toBe(6);
      });
    });

    it('should create exactly 4 Billionaire Move cards', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const moves = deck.filter((card) =>
        ['hostile_takeover', 'temper_tantrum', 'patent_theft', 'leveraged_buyout'].includes(
          card.specialType || '',
        ),
      );
      expect(moves).toHaveLength(4);
    });

    it('should create Billionaire Move cards with value 6', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const moves = deck.filter((card) =>
        ['hostile_takeover', 'temper_tantrum', 'patent_theft', 'leveraged_buyout'].includes(
          card.specialType || '',
        ),
      );

      moves.forEach((card) => {
        expect(card.value).toBe(6);
      });
    });

    it('should create exactly 2 Data Grab cards', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const dataGrabs = deck.filter((card) => card.specialType === 'data_grab');
      expect(dataGrabs).toHaveLength(2);
    });

    it('should have exactly 15 cards that trigger another play', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const triggersAnotherPlay = deck.filter((card) => card.triggersAnotherPlay);
      expect(triggersAnotherPlay).toHaveLength(15);
      // 6 Trackers + 4 Blockers + 5 Launch Stacks = 15
    });

    it('should assign unique IDs to each card', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const ids = deck.map((card) => card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(64);
    });

    it('should have correct card value distribution (0-6)', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);

      const value0Cards = deck.filter((c) => c.value === 0);
      const value1Cards = deck.filter((c) => c.value === 1);
      const value2Cards = deck.filter((c) => c.value === 2);
      const value3Cards = deck.filter((c) => c.value === 3);
      const value4Cards = deck.filter((c) => c.value === 4);
      const value5Cards = deck.filter((c) => c.value === 5);
      const value6Cards = deck.filter((c) => c.value === 6);

      console.log(value6Cards.map((c) => c.name));

      // Value 0: 4 Blockers + 5 Launch Stacks + 2 Data Grabs = 11
      expect(value0Cards).toHaveLength(11);
      // Value 1: 8 common + 2 tracker-1 = 10
      expect(value1Cards).toHaveLength(10);
      // Value 2: 8 common + 2 tracker-2 = 10
      expect(value2Cards).toHaveLength(10);
      // Value 3: 8 common + 2 tracker-3 = 10
      expect(value3Cards).toHaveLength(10);
      // Value 4: 8 common = 8
      expect(value4Cards).toHaveLength(8);
      // Value 5: 8 common = 8
      expect(value5Cards).toHaveLength(8);
      // Value 6: 3 Firewalls + 4 Moves = 7
      expect(value6Cards).toHaveLength(7);
    });
  });

  describe('shuffleDeck', () => {
    it('should return a new array with the same length', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const shuffled = shuffleDeck(deck);
      expect(shuffled).toHaveLength(deck.length);
      expect(shuffled).not.toBe(deck); // Different array reference
    });

    it('should contain all the same cards', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const shuffled = shuffleDeck(deck);

      const originalIds = deck.map((c) => c.id).sort();
      const shuffledIds = shuffled.map((c) => c.id).sort();

      expect(shuffledIds).toEqual(originalIds);
    });

    it('should produce different orders on multiple shuffles', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const shuffle1 = shuffleDeck(deck);
      const shuffle2 = shuffleDeck(deck);

      // Very unlikely to be the same order
      const ids1 = shuffle1.map((c) => c.id).join(',');
      const ids2 = shuffle2.map((c) => c.id).join(',');

      expect(ids1).not.toBe(ids2);
    });
  });

  describe('dealCards', () => {
    it('should split deck into two equal halves', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const { playerDeck, cpuDeck } = dealCards(deck, 32);

      expect(playerDeck).toHaveLength(32);
      expect(cpuDeck).toHaveLength(32);
    });

    it('should not duplicate or lose cards', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const shuffled = shuffleDeck(deck);
      const { playerDeck, cpuDeck } = dealCards(shuffled, 33);

      const allDealtIds = [...playerDeck, ...cpuDeck].map((c) => c.id).sort();
      const originalIds = shuffled.map((c) => c.id).sort();

      expect(allDealtIds).toEqual(originalIds);
    });
  });

  describe('initializeGameDeck', () => {
    it('should create, shuffle, and deal a complete game', () => {
      const { playerDeck, cpuDeck } = initializeGameDeck(DEFAULT_GAME_CONFIG);

      expect(playerDeck).toHaveLength(32);
      expect(cpuDeck).toHaveLength(32);
    });

    it('should respect ordering strategies', () => {
      const { playerDeck } = initializeGameDeck(DEFAULT_GAME_CONFIG, 'tracker-first');

      // First few cards should be trackers
      const firstCard = playerDeck[0];
      expect(firstCard.specialType).toBe('tracker');
    });
  });

  describe('orderDeck', () => {
    it('should order tracker cards first with tracker-first strategy', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const ordered = orderDeck(deck, 'tracker-first');

      const firstSix = ordered.slice(0, 6);
      firstSix.forEach((card) => {
        expect(card.specialType).toBe('tracker');
      });
    });

    it('should order high value cards first with high-value-first strategy', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const ordered = orderDeck(deck, 'high-value-first');

      // First card should be value 6
      expect(ordered[0].value).toBe(6);
      // Should be sorted descending
      for (let i = 0; i < ordered.length - 1; i++) {
        expect(ordered[i].value).toBeGreaterThanOrEqual(ordered[i + 1].value);
      }
    });

    it('should order low value cards first with low-value-first strategy', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const ordered = orderDeck(deck, 'low-value-first');

      // First card should be value 0
      expect(ordered[0].value).toBe(0);
      // Should be sorted ascending
      for (let i = 0; i < ordered.length - 1; i++) {
        expect(ordered[i].value).toBeLessThanOrEqual(ordered[i + 1].value);
      }
    });

    it('should place custom ordered cards first with custom strategy', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);

      // Use typeIds instead of Card objects
      const customOrder: CardTypeId[] = ['tracker-1', 'common-3', 'ls-ai-platform'];
      const ordered = orderDeck(deck, 'custom', customOrder);

      // First three cards should have the specified typeIds in order
      expect(ordered[0].typeId).toBe('tracker-1');
      expect(ordered[1].typeId).toBe('common-3');
      expect(ordered[2].typeId).toBe('ls-ai-platform');

      // Should still have all 64 cards
      expect(ordered).toHaveLength(64);
    });

    it('should shuffle all cards when custom strategy used without customOrder', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);
      const ordered = orderDeck(deck, 'custom');

      // Should have all cards
      expect(ordered).toHaveLength(deck.length);

      // Should contain all the same cards
      const originalIds = deck.map((c) => c.id).sort();
      const orderedIds = ordered.map((c) => c.id).sort();
      expect(orderedIds).toEqual(originalIds);
    });

    it('should maintain total deck size with custom strategy', () => {
      const deck = createDeck(DEFAULT_GAME_CONFIG);

      // Use typeIds instead of Card objects
      const customOrder: CardTypeId[] = ['tracker-2', 'common-5'];
      const ordered = orderDeck(deck, 'custom', customOrder);

      // Should have all 64 cards until we re-add smacker + datagrab
      expect(ordered).toHaveLength(64);

      // Should contain all the same cards
      const originalIds = deck.map((c) => c.id).sort();
      const orderedIds = ordered.map((c) => c.id).sort();
      expect(orderedIds).toEqual(originalIds);

      // First two should be the custom ordered ones
      expect(ordered[0].typeId).toBe('tracker-2');
      expect(ordered[1].typeId).toBe('common-5');
    });
  });
});
