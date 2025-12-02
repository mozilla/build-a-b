import { describe, it, expect } from 'vitest';
import { detectDataWarOWYW } from './owyw-helpers';
import type { PlayerType } from '@/types/game';

describe('detectDataWarOWYW', () => {
  // Helper to create mock game state
  const createMockState = (
    playerCards: Array<{ specialType?: string | undefined; isFaceDown: boolean }> = [],
    cpuCards: Array<{ specialType?: string | undefined; isFaceDown: boolean }> = [],
    options: {
      openWhatYouWantActive?: PlayerType | null;
      playerHasHT?: boolean;
      cpuHasHT?: boolean;
      hostileTakeoverDataWar?: boolean;
    } = {},
  ) => ({
    openWhatYouWantActive: options.openWhatYouWantActive ?? null,
    player: {
      playedCardsInHand: playerCards.map((c) => ({
        card: { specialType: c.specialType },
        isFaceDown: c.isFaceDown,
      })),
      playedCard: options.playerHasHT ? { specialType: 'hostile_takeover' } : null,
    },
    cpu: {
      playedCardsInHand: cpuCards.map((c) => ({
        card: { specialType: c.specialType },
        isFaceDown: c.isFaceDown,
      })),
      playedCard: options.cpuHasHT ? { specialType: 'hostile_takeover' } : null,
    },
    hostileTakeoverDataWar: options.hostileTakeoverDataWar ?? false,
  });

  describe('OWYW from previous turn (openWhatYouWantActive)', () => {
    it('should detect active player OWYW when player is face-up', () => {
      const state = createMockState([], [], { openWhatYouWantActive: 'player' });

      const result = detectDataWarOWYW(state);

      expect(result.hasOWYW).toBe(true);
      expect(result.owyWPlayer).toBe('player');
      expect(result.isFromPreviousTurn).toBe(true);
    });

    it('should detect active CPU OWYW when CPU is face-up', () => {
      const state = createMockState([], [], { openWhatYouWantActive: 'cpu' });

      const result = detectDataWarOWYW(state);

      expect(result.hasOWYW).toBe(true);
      expect(result.owyWPlayer).toBe('cpu');
      expect(result.isFromPreviousTurn).toBe(true);
    });

    it('should NOT detect player OWYW if player has HT and is not face-up', () => {
      const state = createMockState([], [], {
        openWhatYouWantActive: 'player',
        playerHasHT: true,
        hostileTakeoverDataWar: true,
      });

      const result = detectDataWarOWYW(state);

      expect(result.hasOWYW).toBe(false);
    });

    it('should NOT detect CPU OWYW if CPU has HT and is not face-up', () => {
      const state = createMockState([], [], {
        openWhatYouWantActive: 'cpu',
        cpuHasHT: true,
        hostileTakeoverDataWar: true,
      });

      const result = detectDataWarOWYW(state);

      expect(result.hasOWYW).toBe(false);
    });
  });

  describe('OWYW from current DataWar (playedCardsInHand)', () => {
    describe('Timing: Before playing face-up card', () => {
      it('should return FALSE when no face-up cards played yet', () => {
        // Scenario: About to play FIRST face-up card (OWYW will be played now)
        const state = createMockState(
          [{ isFaceDown: true }, { isFaceDown: true }, { isFaceDown: true }], // Only face-down cards
          [{ isFaceDown: true }, { isFaceDown: true }, { isFaceDown: true }],
        );

        const result = detectDataWarOWYW(state);

        expect(result.hasOWYW).toBe(false);
        expect(result.owyWPlayer).toBe(null);
      });

      it('should return TRUE when OWYW is in face-up cards (at index 0)', () => {
        // Scenario: OWYW was played as first face-up, about to play SECOND face-up
        const state = createMockState(
          [
            { isFaceDown: true },
            { isFaceDown: true },
            { isFaceDown: true },
            { specialType: 'open_what_you_want', isFaceDown: false }, // OWYW at index 0
          ],
          [{ isFaceDown: true }, { isFaceDown: true }, { isFaceDown: true }, { isFaceDown: false }],
        );

        const result = detectDataWarOWYW(state);

        expect(result.hasOWYW).toBe(true);
        expect(result.owyWPlayer).toBe('player');
        expect(result.isFromPreviousTurn).toBe(false);
      });

      it('should return TRUE when OWYW is in face-up cards (at index 1)', () => {
        // Scenario: Regular card first, OWYW second, about to play THIRD face-up
        const state = createMockState(
          [
            { isFaceDown: true },
            { isFaceDown: true },
            { isFaceDown: true },
            { isFaceDown: false }, // Regular card
            { specialType: 'open_what_you_want', isFaceDown: false }, // OWYW at index 1
          ],
          [
            { isFaceDown: true },
            { isFaceDown: true },
            { isFaceDown: true },
            { isFaceDown: false },
            { isFaceDown: false },
          ],
        );

        const result = detectDataWarOWYW(state);

        expect(result.hasOWYW).toBe(true);
        expect(result.owyWPlayer).toBe('player');
        expect(result.isFromPreviousTurn).toBe(false);
      });

      it('should return FALSE when OWYW has cards after it (already used)', () => {
        // Scenario: OWYW was used to select another card - there's a face-up card after OWYW
        // This means OWYW was already triggered and shouldn't trigger again
        const state = createMockState(
          [
            { isFaceDown: true },
            { isFaceDown: true },
            { isFaceDown: true },
            { specialType: 'open_what_you_want', isFaceDown: false }, // OWYW at index 0
            { isFaceDown: false }, // Card selected via OWYW (e.g., buyout)
          ],
          [
            { isFaceDown: true },
            { isFaceDown: true },
            { isFaceDown: true },
            { isFaceDown: false },
            { isFaceDown: false },
          ],
        );

        const result = detectDataWarOWYW(state);

        // OWYW has a card after it, so it was already used
        expect(result.hasOWYW).toBe(false);
        expect(result.owyWPlayer).toBe(null);
      });

      it('should return FALSE when no OWYW in face-up cards', () => {
        // Scenario: Regular cards only, no OWYW
        const state = createMockState(
          [
            { isFaceDown: true },
            { isFaceDown: true },
            { isFaceDown: true },
            { isFaceDown: false },
            { isFaceDown: false },
          ],
          [
            { isFaceDown: true },
            { isFaceDown: true },
            { isFaceDown: true },
            { isFaceDown: false },
            { isFaceDown: false },
          ],
        );

        const result = detectDataWarOWYW(state);

        expect(result.hasOWYW).toBe(false);
        expect(result.owyWPlayer).toBe(null);
      });
    });

    describe('CPU OWYW detection', () => {
      it('should detect CPU OWYW in face-up cards', () => {
        const state = createMockState(
          [{ isFaceDown: true }, { isFaceDown: true }, { isFaceDown: true }, { isFaceDown: false }],
          [
            { isFaceDown: true },
            { isFaceDown: true },
            { isFaceDown: true },
            { specialType: 'open_what_you_want', isFaceDown: false },
          ],
        );

        const result = detectDataWarOWYW(state);

        expect(result.hasOWYW).toBe(true);
        expect(result.owyWPlayer).toBe('cpu');
        expect(result.isFromPreviousTurn).toBe(false);
      });

      it('should prioritize player OWYW when both have OWYW', () => {
        const state = createMockState(
          [
            { isFaceDown: true },
            { isFaceDown: true },
            { isFaceDown: true },
            { specialType: 'open_what_you_want', isFaceDown: false },
          ],
          [
            { isFaceDown: true },
            { isFaceDown: true },
            { isFaceDown: true },
            { specialType: 'open_what_you_want', isFaceDown: false },
          ],
        );

        const result = detectDataWarOWYW(state);

        expect(result.hasOWYW).toBe(true);
        expect(result.owyWPlayer).toBe('player'); // Player checked first
      });
    });
  });

  describe('Hostile Takeover interaction', () => {
    it('should only check CPU cards when player has HT (player does not play face-up)', () => {
      const state = createMockState(
        [
          { isFaceDown: true },
          { isFaceDown: true },
          { isFaceDown: true },
          { specialType: 'open_what_you_want', isFaceDown: false },
        ],
        [{ isFaceDown: true }, { isFaceDown: true }, { isFaceDown: true }, { isFaceDown: false }],
        {
          playerHasHT: true,
          hostileTakeoverDataWar: true,
        },
      );

      const result = detectDataWarOWYW(state);

      // Player has OWYW but doesn't play face-up (HT), so should return FALSE
      expect(result.hasOWYW).toBe(false);
    });

    it('should only check player cards when CPU has HT (CPU does not play face-up)', () => {
      const state = createMockState(
        [
          { isFaceDown: true },
          { isFaceDown: true },
          { isFaceDown: true },
          { specialType: 'open_what_you_want', isFaceDown: false },
        ],
        [{ isFaceDown: true }, { isFaceDown: true }, { isFaceDown: true }, { isFaceDown: false }],
        {
          cpuHasHT: true,
          hostileTakeoverDataWar: true,
        },
      );

      const result = detectDataWarOWYW(state);

      // Player has OWYW and plays face-up (CPU has HT), so should return TRUE
      expect(result.hasOWYW).toBe(true);
      expect(result.owyWPlayer).toBe('player');
    });

    it('should detect CPU OWYW when player has HT and CPU plays face-up', () => {
      const state = createMockState(
        [{ isFaceDown: true }, { isFaceDown: true }, { isFaceDown: true }, { isFaceDown: false }],
        [
          { isFaceDown: true },
          { isFaceDown: true },
          { isFaceDown: true },
          { specialType: 'open_what_you_want', isFaceDown: false },
        ],
        {
          playerHasHT: true,
          hostileTakeoverDataWar: true,
        },
      );

      const result = detectDataWarOWYW(state);

      expect(result.hasOWYW).toBe(true);
      expect(result.owyWPlayer).toBe('cpu');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty playedCardsInHand arrays', () => {
      const state = createMockState([], []);

      const result = detectDataWarOWYW(state);

      expect(result.hasOWYW).toBe(false);
      expect(result.owyWPlayer).toBe(null);
    });

    it('should handle only face-down cards', () => {
      const state = createMockState(
        [{ isFaceDown: true }, { isFaceDown: true }, { isFaceDown: true }],
        [{ isFaceDown: true }, { isFaceDown: true }, { isFaceDown: true }],
      );

      const result = detectDataWarOWYW(state);

      expect(result.hasOWYW).toBe(false);
    });

    it('should filter face-down cards when checking for OWYW', () => {
      const state = createMockState(
        [
          { specialType: 'open_what_you_want', isFaceDown: true }, // Face-down OWYW (shouldn't count)
          { isFaceDown: true },
          { isFaceDown: true },
          { isFaceDown: false },
        ],
        [{ isFaceDown: true }, { isFaceDown: true }, { isFaceDown: true }, { isFaceDown: false }],
      );

      const result = detectDataWarOWYW(state);

      // OWYW is face-down, so shouldn't be detected
      expect(result.hasOWYW).toBe(false);
    });

    it('should handle OWYW as only face-up card', () => {
      const state = createMockState(
        [
          { isFaceDown: true },
          { isFaceDown: true },
          { isFaceDown: true },
          { specialType: 'open_what_you_want', isFaceDown: false },
        ],
        [{ isFaceDown: true }, { isFaceDown: true }, { isFaceDown: true }, { isFaceDown: false }],
      );

      const result = detectDataWarOWYW(state);

      expect(result.hasOWYW).toBe(true);
      expect(result.owyWPlayer).toBe('player');
    });
  });

  describe('Priority: Previous turn OWYW over current turn', () => {
    it('should prioritize openWhatYouWantActive over playedCardsInHand', () => {
      // Both flags set - should prioritize previous turn (openWhatYouWantActive)
      const state = createMockState(
        [
          { isFaceDown: true },
          { isFaceDown: true },
          { isFaceDown: true },
          { specialType: 'open_what_you_want', isFaceDown: false },
        ],
        [{ isFaceDown: true }, { isFaceDown: true }, { isFaceDown: true }, { isFaceDown: false }],
        {
          openWhatYouWantActive: 'player',
        },
      );

      const result = detectDataWarOWYW(state);

      expect(result.hasOWYW).toBe(true);
      expect(result.owyWPlayer).toBe('player');
      expect(result.isFromPreviousTurn).toBe(true); // Should be from previous turn
    });
  });
});
