import type { ReactNode } from 'react';
import type { Card } from '../../types';

export interface CardCarouselProps {
  cards: Card[];
  selectedCard: Card | null;
  onCardSelect: (card: Card) => void;
  renderCardContent?: (card: Card) => ReactNode; // Optional custom content below card
  className?: string;
}
