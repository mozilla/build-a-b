import type { ReactNode } from 'react';
import type { SwiperOptions } from 'swiper/types';
import type { Card } from '../../types';

export interface CardCarouselProps {
  cards: Card[];
  selectedCard: Card | null;
  onCardSelect: (card: Card) => void;
  renderCardContent?: (card: Card) => ReactNode; // Optional custom content below card
  className?: string;
  faceDownCardIds?: Set<string>; // Optional set of card IDs that should show face-down
  swiperOptions?: Partial<SwiperOptions>; // Optional custom swiper configuration
  cardClassName?: string; // Optional custom className for card container
  cardRotation?: string; // Optional rotation class (e.g., 'rotate-[-15deg]')
}
