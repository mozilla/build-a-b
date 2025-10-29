export type CardState = 'initial' | 'flipped' | 'final';

export type CardProps = {
  cardFrontSrc?: string;
  state?: CardState;
  onBackClick?: () => void;
  onFrontClick?: () => void;
  positions?: {
    initial: { x: number; y: number };
    flipped: { x: number; y: number };
    final: { x: number; y: number };
  };
  showFrontInStates?: CardState[];
};
