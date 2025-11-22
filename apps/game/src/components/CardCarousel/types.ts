import type { ReactNode } from 'react';
import type { SwiperOptions } from 'swiper/types';
import type { Card } from '../../types';

export interface CardCarouselProps {
  cards: Card[];
  selectedCard: Card | null;
  onCardSelect: (card: Card) => void;
  onCardClick?: (card: Card) => void; // Optional separate click handler (overrides onCardSelect for clicks)
  renderCardContent?: (card: Card) => ReactNode; // Optional custom content below card
  className?: string;
  faceDownCardIds?: Set<string>; // Optional set of card IDs that should show face-down
  glowCardIds?: Set<string>; // Optional set of card IDs that should show tracker glow
  scaleSelectedCards?: boolean; // Optional flag to scale selected cards instead of glowing
  swiperOptions?: Partial<SwiperOptions>; // Optional custom swiper configuration
  cardClassName?: string; // Optional custom className for card container
  cardRotation?: string; // Optional rotation class (e.g., 'rotate-[-15deg]')
}

export interface CardCarouselRef {
  slidePrev: () => void;
  slideNext: () => void;
  isBeginning: boolean;
  isEnd: boolean;
}
