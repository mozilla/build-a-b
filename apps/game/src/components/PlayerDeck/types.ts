import type { TurnValueState } from '../TurnValue/types';

export type PlayerDeckProps = {
  deckLength: number;
  handleDeckClick?: () => void;
  turnValue: number;
  turnValueState: TurnValueState;
  owner: 'player' | 'cpu';
  tooltipContent?: string;
  billionaireId: string;
};
