import type { ActiveEffect } from '../../types';

export type PlayerDeckProps = {
  deckLength: number;
  handleDeckClick?: () => void;
  turnValue: number;
  turnValueActiveEffects?: ActiveEffect[];
  owner: 'player' | 'cpu';
  tooltipContent?: string;
  billionaireId: string;
  activeIndicator?: boolean;
};
