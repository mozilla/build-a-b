import type { Player, PlayerType } from '@/types';

export function createInitialPlayer(id: PlayerType): Player {
  return {
    id,
    name: id === 'player' ? 'Player' : 'CPU',
    deck: [],
    playedCard: null,
    playedCardsInHand: [],
    currentTurnValue: 0,
    launchStackCount: 0,
    activeEffects: [],
    pendingTrackerBonus: 0,
    pendingBlockerPenalty: 0,
  };
}
