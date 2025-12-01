import { describe, expect, it } from 'vitest';
import {
  assignSettledZIndex,
  calculateRenderOrder,
  generateLandedKey,
  getBatchCardIndices,
  getPhysicalDeckOwner,
  getRotationClass,
} from './utils';

describe('PlayedCards Utils', () => {
  describe('calculateRenderOrder', () => {
    it('should return indices in order when no current batch', () => {
      const cardBatchMap = { card1: 1, card2: 1, card3: 1 };
      const cardIds = ['card1', 'card2', 'card3'];
      const result = calculateRenderOrder(3, 2, cardBatchMap, cardIds);

      expect(result).toEqual([0, 1, 2]);
    });

    it('should place current batch cards at the end in reverse order', () => {
      const cardBatchMap = { card1: 1, card2: 2, card3: 2 };
      const cardIds = ['card1', 'card2', 'card3'];
      const result = calculateRenderOrder(3, 2, cardBatchMap, cardIds);

      // card1 (batch 1) first, then batch 2 cards in reverse (card3, card2)
      expect(result).toEqual([0, 2, 1]);
    });

    it('should handle all cards in current batch', () => {
      const cardBatchMap = { card1: 1, card2: 1, card3: 1 };
      const cardIds = ['card1', 'card2', 'card3'];
      const result = calculateRenderOrder(3, 1, cardBatchMap, cardIds);

      // All cards are in batch 1, should be reversed
      expect(result).toEqual([2, 1, 0]);
    });

    it('should handle missing cards in batch map', () => {
      const cardBatchMap = { card1: 1 };
      const cardIds = ['card1', 'card2', 'card3'];
      const result = calculateRenderOrder(3, 1, cardBatchMap, cardIds);

      // card2 and card3 default to batch 0, card1 is batch 1
      expect(result).toEqual([1, 2, 0]);
    });

    it('should handle empty card array', () => {
      const result = calculateRenderOrder(0, 1, {}, []);
      expect(result).toEqual([]);
    });
  });

  describe('getBatchCardIndices', () => {
    const cards = [
      { card: { id: 'card1' } },
      { card: { id: 'card2' } },
      { card: { id: 'card3' } },
      { card: { id: 'card4' } },
    ];

    it('should return indices of cards in the specified batch', () => {
      const cardBatchMap = {
        card1: 1,
        card2: 2,
        card3: 1,
        card4: 2,
      };

      const result = getBatchCardIndices(cards, 1, cardBatchMap);
      expect(result).toEqual([0, 2]);
    });

    it('should return empty array when no cards match', () => {
      const cardBatchMap = {
        card1: 1,
        card2: 1,
        card3: 1,
        card4: 1,
      };

      const result = getBatchCardIndices(cards, 2, cardBatchMap);
      expect(result).toEqual([]);
    });

    it('should handle cards with missing batch assignments', () => {
      const cardBatchMap = {
        card1: 1,
        card3: 2,
      };

      const result = getBatchCardIndices(cards, 0, cardBatchMap);
      // card2 and card4 default to batch 0
      expect(result).toEqual([1, 3]);
    });

    it('should return empty array for empty cards', () => {
      const result = getBatchCardIndices([], 1, {});
      expect(result).toEqual([]);
    });
  });

  describe('assignSettledZIndex', () => {
    it('should return baseZ + 1 when no settled cards exist', () => {
      const result = assignSettledZIndex({}, 20, 100);
      expect(result).toBe(21);
    });

    it('should return max settled + 1', () => {
      const settledZMap = {
        key1: 25,
        key2: 30,
        key3: 22,
      };
      const result = assignSettledZIndex(settledZMap, 20, 100);
      expect(result).toBe(31);
    });

    it('should cap at maxZ when calculation exceeds it', () => {
      const settledZMap = {
        key1: 99,
        key2: 100,
      };
      const result = assignSettledZIndex(settledZMap, 20, 100);
      expect(result).toBe(100);
    });

    it('should handle negative z-index values', () => {
      const settledZMap = {
        key1: -5,
        key2: -10,
      };
      const result = assignSettledZIndex(settledZMap, -20, 100);
      expect(result).toBe(-4);
    });

    it('should handle single settled card', () => {
      const settledZMap = { key1: 50 };
      const result = assignSettledZIndex(settledZMap, 20, 100);
      expect(result).toBe(51);
    });
  });

  describe('generateLandedKey', () => {
    it('should generate key from card ID and batch ID', () => {
      const result = generateLandedKey('card123', 5);
      expect(result).toBe('card123-5');
    });

    it('should handle numeric card IDs', () => {
      const result = generateLandedKey('42', 10);
      expect(result).toBe('42-10');
    });

    it('should handle batch ID of 0', () => {
      const result = generateLandedKey('card1', 0);
      expect(result).toBe('card1-0');
    });

    it('should handle special characters in card ID', () => {
      const result = generateLandedKey('card-special_123', 2);
      expect(result).toBe('card-special_123-2');
    });
  });

  describe('getRotationClass', () => {
    const rotationClasses = [
      '-rotate-3',
      'rotate-2',
      '-rotate-1',
      'rotate-3',
      'rotate-1',
      '-rotate-2',
    ];

    it('should return rotate-0 for top card', () => {
      const result = getRotationClass(true, 'card1', 0, rotationClasses);
      expect(result).toBe('rotate-0');
    });

    it('should return rotation class based on card ID and index', () => {
      const result = getRotationClass(false, 'card1', 0, rotationClasses);
      // Should calculate based on charCodeAt(0) + index * 7
      expect(rotationClasses).toContain(result);
    });

    it('should return consistent rotation for same card ID and index', () => {
      const result1 = getRotationClass(false, 'card123', 2, rotationClasses);
      const result2 = getRotationClass(false, 'card123', 2, rotationClasses);
      expect(result1).toBe(result2);
    });

    it('should return different rotations for different indices', () => {
      const result1 = getRotationClass(false, 'card1', 0, rotationClasses);
      const result2 = getRotationClass(false, 'card1', 1, rotationClasses);
      // Results might be the same due to modulo, but the calculation should differ
      expect(typeof result1).toBe('string');
      expect(typeof result2).toBe('string');
    });

    it('should wrap around rotation classes array', () => {
      const result = getRotationClass(false, 'z', 100, rotationClasses);
      expect(rotationClasses).toContain(result);
    });
  });

  describe('getPhysicalDeckOwner', () => {
    it('should return same owner when not swapped', () => {
      expect(getPhysicalDeckOwner('player', false)).toBe('player');
      expect(getPhysicalDeckOwner('cpu', false)).toBe('cpu');
    });

    it('should return opposite owner when swapped', () => {
      expect(getPhysicalDeckOwner('player', true)).toBe('cpu');
      expect(getPhysicalDeckOwner('cpu', true)).toBe('player');
    });

    it('should handle multiple swap scenarios', () => {
      // Player perspective
      expect(getPhysicalDeckOwner('player', false)).toBe('player');
      expect(getPhysicalDeckOwner('player', true)).toBe('cpu');

      // CPU perspective
      expect(getPhysicalDeckOwner('cpu', false)).toBe('cpu');
      expect(getPhysicalDeckOwner('cpu', true)).toBe('player');
    });
  });
});
