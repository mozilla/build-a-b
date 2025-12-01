import { describe, it, expect } from 'vitest';
import {
  compareCards,
  getCardBaseValue,
  getCardSpecialProperties,
  isInstantEffect,
  shouldTriggerAnotherPlay,
  applyTrackerModifier,
  applyBlockerModifier,
  isEffectBlocked,
  shouldTriggerDataWar,
  canPlayHand,
  canPlayDataWar,
} from './card-comparison';
import type { Card, CardValue, Player, SpecialCardType } from '../types';

// Helper to create mock players
const createMockPlayer = (
  id: 'player' | 'cpu',
  currentTurnValue: number,
  deckSize: number = 10,
): Player => ({
  id,
  name: id === 'player' ? 'Player' : 'CPU',
  deck: Array(deckSize).fill({} as Card),
  playedCard: null,
  currentTurnValue,
  launchStackCount: 0,
  playedCardsInHand: [],
  activeEffects: [],
  pendingBlockerPenalty: 0,
  pendingTrackerBonus: 0,
});

// Helper to create mock cards
const createMockCard = (
  value: CardValue,
  specialType?: SpecialCardType,
  triggersAnotherPlay?: boolean,
): Card => ({
  id: `card-${Math.random()}`,
  typeId: `type-${value}`,
  value: value,
  imageUrl: '/test.webp',
  isSpecial: !!specialType,
  specialType: specialType,
  triggersAnotherPlay,
  name: 'test',
});

describe('cardComparison', () => {
  describe('compareCards', () => {
    it('should declare player winner when player value is higher', () => {
      const player = createMockPlayer('player', 5);
      const cpu = createMockPlayer('cpu', 3);

      const result = compareCards(player, cpu);

      expect(result.winner).toBe('player');
      expect(result.isTie).toBe(false);
      expect(result.playerValue).toBe(5);
      expect(result.cpuValue).toBe(3);
    });

    it('should declare CPU winner when CPU value is higher', () => {
      const player = createMockPlayer('player', 2);
      const cpu = createMockPlayer('cpu', 6);

      const result = compareCards(player, cpu);

      expect(result.winner).toBe('cpu');
      expect(result.isTie).toBe(false);
      expect(result.playerValue).toBe(2);
      expect(result.cpuValue).toBe(6);
    });

    it('should declare tie when values are equal', () => {
      const player = createMockPlayer('player', 4);
      const cpu = createMockPlayer('cpu', 4);

      const result = compareCards(player, cpu);

      expect(result.winner).toBe('tie');
      expect(result.isTie).toBe(true);
      expect(result.playerValue).toBe(4);
      expect(result.cpuValue).toBe(4);
    });

    it('should handle zero values', () => {
      const player = createMockPlayer('player', 0);
      const cpu = createMockPlayer('cpu', 0);

      const result = compareCards(player, cpu);

      expect(result.winner).toBe('tie');
      expect(result.isTie).toBe(true);
    });
  });

  describe('getCardBaseValue', () => {
    it('should return the card value', () => {
      const card = createMockCard(5);
      expect(getCardBaseValue(card)).toBe(5);
    });

    it('should work for value 0 cards', () => {
      const card = createMockCard(0);
      expect(getCardBaseValue(card)).toBe(0);
    });

    it('should work for value 6 cards', () => {
      const card = createMockCard(6);
      expect(getCardBaseValue(card)).toBe(6);
    });
  });

  describe('getCardSpecialProperties', () => {
    it('should identify tracker cards', () => {
      const card = createMockCard(1, 'tracker', true);
      const props = getCardSpecialProperties(card);

      expect(props.isTracker).toBe(true);
      expect(props.triggersAnotherPlay).toBe(true);
      expect(props.isBlocker).toBe(false);
      expect(props.isLaunchStack).toBe(false);
    });

    it('should identify blocker cards', () => {
      const card = createMockCard(0, 'blocker', true);
      const props = getCardSpecialProperties(card);

      expect(props.isBlocker).toBe(true);
      expect(props.triggersAnotherPlay).toBe(true);
      expect(props.isTracker).toBe(false);
    });

    it('should identify launch stack cards', () => {
      const card = createMockCard(0, 'launch_stack', true);
      const props = getCardSpecialProperties(card);

      expect(props.isLaunchStack).toBe(true);
      expect(props.triggersAnotherPlay).toBe(true);
    });

    it('should identify instant effect cards', () => {
      const forcedEmpathy = createMockCard(6, 'forced_empathy');
      const trackerSmacker = createMockCard(6, 'tracker_smacker');
      const hostileTakeover = createMockCard(6, 'hostile_takeover');

      expect(getCardSpecialProperties(forcedEmpathy).isInstantEffect).toBe(true);
      expect(getCardSpecialProperties(trackerSmacker).isInstantEffect).toBe(true);
      expect(getCardSpecialProperties(hostileTakeover).isInstantEffect).toBe(true);
    });

    it('should return false for non-instant effect cards', () => {
      const tracker = createMockCard(1, 'tracker');
      const blocker = createMockCard(0, 'blocker');

      expect(getCardSpecialProperties(tracker).isInstantEffect).toBe(false);
      expect(getCardSpecialProperties(blocker).isInstantEffect).toBe(false);
    });

    it('should handle common cards without special properties', () => {
      const card = createMockCard(3);
      const props = getCardSpecialProperties(card);

      expect(props.isTracker).toBe(false);
      expect(props.isBlocker).toBe(false);
      expect(props.isLaunchStack).toBe(false);
      expect(props.triggersAnotherPlay).toBe(false);
      expect(props.isInstantEffect).toBe(false);
      expect(props.specialType).toBe(null);
    });
  });

  describe('isInstantEffect', () => {
    it('should return true for forced_empathy', () => {
      const card = createMockCard(6, 'forced_empathy');
      expect(isInstantEffect(card)).toBe(true);
    });

    it('should return true for tracker_smacker', () => {
      const card = createMockCard(6, 'tracker_smacker');
      expect(isInstantEffect(card)).toBe(true);
    });

    it('should return true for hostile_takeover', () => {
      const card = createMockCard(6, 'hostile_takeover');
      expect(isInstantEffect(card)).toBe(true);
    });

    it('should return false for non-instant effects', () => {
      const tracker = createMockCard(1, 'tracker');
      const blocker = createMockCard(0, 'blocker');
      const launchStack = createMockCard(0, 'launch_stack');

      expect(isInstantEffect(tracker)).toBe(false);
      expect(isInstantEffect(blocker)).toBe(false);
      expect(isInstantEffect(launchStack)).toBe(false);
    });

    it('should return false for common cards', () => {
      const card = createMockCard(3);
      expect(isInstantEffect(card)).toBe(false);
    });
  });

  describe('shouldTriggerAnotherPlay', () => {
    it('should return true when triggersAnotherPlay is true', () => {
      const card = createMockCard(1, 'tracker', true);
      expect(shouldTriggerAnotherPlay(card)).toBe(true);
    });

    it('should return false when triggersAnotherPlay is false', () => {
      const card = createMockCard(6, 'forced_empathy', false);
      expect(shouldTriggerAnotherPlay(card)).toBe(false);
    });

    it('should return false when triggersAnotherPlay is undefined', () => {
      const card = createMockCard(3);
      expect(shouldTriggerAnotherPlay(card)).toBe(false);
    });
  });

  describe('applyTrackerModifier', () => {
    it('should add tracker value to current value', () => {
      const trackerCard = createMockCard(2, 'tracker');
      const result = applyTrackerModifier(5, trackerCard);

      expect(result).toBe(7); // 5 + 2
    });

    it('should work with different tracker values', () => {
      const tracker1 = createMockCard(1, 'tracker');
      const tracker2 = createMockCard(2, 'tracker');
      const tracker3 = createMockCard(3, 'tracker');

      expect(applyTrackerModifier(10, tracker1)).toBe(11);
      expect(applyTrackerModifier(10, tracker2)).toBe(12);
      expect(applyTrackerModifier(10, tracker3)).toBe(13);
    });

    it('should handle zero base value', () => {
      const tracker = createMockCard(2, 'tracker');
      const result = applyTrackerModifier(0, tracker);

      expect(result).toBe(2);
    });
  });

  describe('applyBlockerModifier', () => {
    it('should subtract 1 from opponent value for blocker-1', () => {
      const blocker = createMockCard(0, 'blocker');
      blocker.typeId = 'blocker-1';

      const result = applyBlockerModifier(5, blocker);

      expect(result).toBe(4); // 5 - 1
    });

    it('should subtract 2 from opponent value for blocker-2', () => {
      const blocker = createMockCard(0, 'blocker');
      blocker.typeId = 'blocker-2';

      const result = applyBlockerModifier(5, blocker);

      expect(result).toBe(3); // 5 - 2
    });

    it('should go below 0', () => {
      const blocker = createMockCard(0, 'blocker');
      blocker.typeId = 'blocker-2';

      const result = applyBlockerModifier(1, blocker);

      expect(result).toBe(-1);
    });

    it('should handle zero opponent value', () => {
      const blocker = createMockCard(0, 'blocker');
      blocker.typeId = 'blocker-1';

      const result = applyBlockerModifier(0, blocker);

      expect(result).toBe(-1);
    });
  });

  describe('isEffectBlocked', () => {
    it('should return false when tracker smacker is not active', () => {
      expect(isEffectBlocked(null, 'player')).toBe(false);
      expect(isEffectBlocked(null, 'cpu')).toBe(false);
    });

    it('should block CPU effects when player has tracker smacker active', () => {
      expect(isEffectBlocked('player', 'cpu')).toBe(true);
    });

    it('should not block player effects when player has tracker smacker active', () => {
      expect(isEffectBlocked('player', 'player')).toBe(false);
    });

    it('should block player effects when CPU has tracker smacker active', () => {
      expect(isEffectBlocked('cpu', 'player')).toBe(true);
    });

    it('should not block CPU effects when CPU has tracker smacker active', () => {
      expect(isEffectBlocked('cpu', 'cpu')).toBe(false);
    });
  });

  describe('shouldTriggerDataWar', () => {
    it('should trigger on tie (equal values)', () => {
      const playerCard = createMockCard(4);
      const cpuCard = createMockCard(4);

      expect(shouldTriggerDataWar(playerCard, cpuCard, 4, 4)).toBe(true);
    });

    it('should not trigger when values are different', () => {
      const playerCard = createMockCard(4);
      const cpuCard = createMockCard(5);

      expect(shouldTriggerDataWar(playerCard, cpuCard, 4, 5)).toBe(false);
    });

    it('should always trigger for hostile takeover (player)', () => {
      const playerCard = createMockCard(6, 'hostile_takeover');
      const cpuCard = createMockCard(3);

      // Even though values are different
      expect(shouldTriggerDataWar(playerCard, cpuCard, 6, 3)).toBe(true);
    });

    it('should always trigger for hostile takeover (cpu)', () => {
      const playerCard = createMockCard(3);
      const cpuCard = createMockCard(6, 'hostile_takeover');

      // Even though values are different
      expect(shouldTriggerDataWar(playerCard, cpuCard, 3, 6)).toBe(true);
    });

    it('should trigger for hostile takeover even when tied', () => {
      const playerCard = createMockCard(6, 'hostile_takeover');
      const cpuCard = createMockCard(6);

      expect(shouldTriggerDataWar(playerCard, cpuCard, 6, 6)).toBe(true);
    });
  });

  describe('canPlayHand', () => {
    it('should return true when both players have cards', () => {
      const playerDeck = [createMockCard(1), createMockCard(2)];
      const cpuDeck = [createMockCard(3), createMockCard(4)];

      expect(canPlayHand(playerDeck, cpuDeck)).toBe(true);
    });

    it('should return false when player deck is empty', () => {
      const playerDeck: Card[] = [];
      const cpuDeck = [createMockCard(3)];

      expect(canPlayHand(playerDeck, cpuDeck)).toBe(false);
    });

    it('should return false when CPU deck is empty', () => {
      const playerDeck = [createMockCard(1)];
      const cpuDeck: Card[] = [];

      expect(canPlayHand(playerDeck, cpuDeck)).toBe(false);
    });

    it('should return false when both decks are empty', () => {
      expect(canPlayHand([], [])).toBe(false);
    });
  });

  describe('canPlayDataWar', () => {
    it('should return true when both players have at least 4 cards', () => {
      const playerDeck = Array(5)
        .fill(null)
        .map(() => createMockCard(1));
      const cpuDeck = Array(4)
        .fill(null)
        .map(() => createMockCard(2));

      expect(canPlayDataWar(playerDeck, cpuDeck)).toBe(true);
    });

    it('should return false when player has less than 4 cards', () => {
      const playerDeck = Array(3)
        .fill(null)
        .map(() => createMockCard(1));
      const cpuDeck = Array(5)
        .fill(null)
        .map(() => createMockCard(2));

      expect(canPlayDataWar(playerDeck, cpuDeck)).toBe(false);
    });

    it('should return false when CPU has less than 4 cards', () => {
      const playerDeck = Array(10)
        .fill(null)
        .map(() => createMockCard(1));
      const cpuDeck = Array(2)
        .fill(null)
        .map(() => createMockCard(2));

      expect(canPlayDataWar(playerDeck, cpuDeck)).toBe(false);
    });

    it('should return false when both have less than 4 cards', () => {
      const playerDeck = Array(1)
        .fill(null)
        .map(() => createMockCard(1));
      const cpuDeck = Array(1)
        .fill(null)
        .map(() => createMockCard(2));

      expect(canPlayDataWar(playerDeck, cpuDeck)).toBe(false);
    });
  });
});
