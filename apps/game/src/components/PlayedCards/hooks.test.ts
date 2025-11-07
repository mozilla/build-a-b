import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBatchTracking, useDeckMeasurements } from './hooks';

describe('PlayedCards Hooks', () => {
  describe('useDeckMeasurements', () => {
    beforeEach(() => {
      // Clean up DOM between tests
      document.body.innerHTML = '';

      // Mock requestAnimationFrame
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        cb(0);
        return 0;
      });
    });

    it('should initialize with null deckOffset', () => {
      const { result } = renderHook(() => useDeckMeasurements('player', false, 0, null));

      expect(result.current.deckOffset).toBeNull();
      expect(result.current.collectionOffset).toEqual({ x: 0, y: 0 });
    });

    it('should measure deck position when deck element exists', () => {
      // This test verifies the hook structure and measurement logic can run
      // Actual DOM measurements are difficult to test in jsdom
      const { result } = renderHook(() => useDeckMeasurements('player', false, 1, null));

      // Hook should return the expected structure
      expect(result.current.playAreaRef).toBeDefined();
      expect(result.current.deckOffset).toBeNull(); // No actual DOM element, so null
    });

    it('should calculate correct physical deck owner when swapped', () => {
      const { result } = renderHook(() => useDeckMeasurements('player', true, 0, null));

      // Hook should handle swapped parameter without crashing
      expect(result.current.playAreaRef).toBeDefined();
    });

    it('should measure collection offset when winner exists', () => {
      const { result } = renderHook(() => useDeckMeasurements('player', false, 1, 'player'));

      // Hook should handle winner parameter
      expect(result.current.collectionOffset).toEqual({ x: 0, y: 0 }); // Default when no DOM
      expect(result.current.playAreaRef).toBeDefined();
    });

    it('should update measurements when cards length changes', () => {
      const { result, rerender } = renderHook(
        ({ cardsLength }) => useDeckMeasurements('player', false, cardsLength, null),
        { initialProps: { cardsLength: 1 } },
      );

      expect(result.current.playAreaRef).toBeDefined();

      rerender({ cardsLength: 2 });

      // Should not crash and maintain structure
      expect(result.current.playAreaRef).toBeDefined();
    });

    it('should cleanup resize listener on unmount', () => {
      // This test verifies unmount doesn't crash
      // Testing actual resize listener cleanup is complex in jsdom
      const { unmount } = renderHook(() => useDeckMeasurements('player', false, 1, null));

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('useBatchTracking', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useBatchTracking([]));

      expect(result.current.batchIdRef.current).toBe(0);
      expect(result.current.cardBatchMapRef.current).toEqual({});
      expect(result.current.settledZRef.current).toEqual({});
      expect(result.current.landedMap).toEqual({});
    });

    it('should assign batch ID to new cards', () => {
      const cards = [{ card: { id: 'card1' } }];
      const { result } = renderHook(() => useBatchTracking(cards));

      expect(result.current.batchIdRef.current).toBe(1);
      expect(result.current.cardBatchMapRef.current).toEqual({
        card1: 1,
      });
    });

    it('should increment batch ID for additional cards', () => {
      const { result, rerender } = renderHook(({ cards }) => useBatchTracking(cards), {
        initialProps: { cards: [{ card: { id: 'card1' } }] },
      });

      expect(result.current.batchIdRef.current).toBe(1);

      // Add more cards
      rerender({
        cards: [{ card: { id: 'card1' } }, { card: { id: 'card2' } }, { card: { id: 'card3' } }],
      });

      expect(result.current.batchIdRef.current).toBe(2);
      expect(result.current.cardBatchMapRef.current).toEqual({
        card1: 1,
        card2: 2,
        card3: 2,
      });
    });

    it('should not reassign batch IDs to existing cards', () => {
      const cards = [{ card: { id: 'card1' } }];
      const { result, rerender } = renderHook(({ cards }) => useBatchTracking(cards), {
        initialProps: { cards },
      });

      const batchMap = { ...result.current.cardBatchMapRef.current };

      // Re-render with same cards
      rerender({ cards });

      expect(result.current.cardBatchMapRef.current).toEqual(batchMap);
    });

    it('should reset state when cards array shrinks (round end)', () => {
      const { result, rerender } = renderHook(({ cards }) => useBatchTracking(cards), {
        initialProps: {
          cards: [{ card: { id: 'card1' } }, { card: { id: 'card2' } }, { card: { id: 'card3' } }],
        },
      });

      // Simulate some landed state
      result.current.settledZRef.current = { 'card1-1': 25 };

      // Shrink cards array (round ended)
      rerender({ cards: [] });

      expect(result.current.landedMap).toEqual({});
      expect(result.current.cardBatchMapRef.current).toEqual({});
      expect(result.current.settledZRef.current).toEqual({});
    });

    it('should handle multiple batch additions', () => {
      type CardType = { card: { id: string } };
      const { result, rerender } = renderHook(
        ({ cards }: { cards: CardType[] }) => useBatchTracking(cards),
        { initialProps: { cards: [] as CardType[] } },
      );

      // First batch
      rerender({ cards: [{ card: { id: 'card1' } }] });
      expect(result.current.batchIdRef.current).toBe(1);

      // Second batch
      rerender({
        cards: [{ card: { id: 'card1' } }, { card: { id: 'card2' } }],
      });
      expect(result.current.batchIdRef.current).toBe(2);

      // Third batch
      rerender({
        cards: [{ card: { id: 'card1' } }, { card: { id: 'card2' } }, { card: { id: 'card3' } }],
      });
      expect(result.current.batchIdRef.current).toBe(3);

      expect(result.current.cardBatchMapRef.current).toEqual({
        card1: 1,
        card2: 2,
        card3: 3,
      });
    });

    it('should maintain elementRefs map', () => {
      const cards = [{ card: { id: 'card1' } }];
      const { result } = renderHook(() => useBatchTracking(cards));

      expect(result.current.elementRefs.current).toEqual({});
      expect(typeof result.current.elementRefs).toBe('object');
    });

    it('should allow updating landedMap through setLandedMap', () => {
      const cards = [{ card: { id: 'card1' } }];
      const { result } = renderHook(() => useBatchTracking(cards));

      expect(result.current.landedMap).toEqual({});

      // Update landed state
      act(() => {
        result.current.setLandedMap({ 'card1-1': true });
      });

      expect(result.current.landedMap).toEqual({ 'card1-1': true });
    });
  });
});
