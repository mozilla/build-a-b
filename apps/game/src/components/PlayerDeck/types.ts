import type { ActiveEffect } from '../../types';

export type PlayerDeckProps = {
  deckLength: number;
  turnValue: number;
  turnValueActiveEffects?: ActiveEffect[];
  owner: 'player' | 'cpu';
  billionaireId: string;
  activeIndicator?: boolean;
};
