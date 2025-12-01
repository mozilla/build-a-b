export type CardState = 'initial' | 'flipped' | 'final';

export type CardProps = {
  variant?: 'deck-pile' | 'animated-card';
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
  fullSize?: boolean; // Force full size (125px × 175px) regardless of state
} & Record<`data-${string}`, string>;
