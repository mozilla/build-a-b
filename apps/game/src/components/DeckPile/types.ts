/**
 * DeckPile component types
 */

export interface DeckPileProps {
  cardCount: number;
  owner: 'player' | 'cpu';
  deckSwapCount?: number;
  className?: string;
  layoutOwner?: 'player' | 'cpu'; // Physical position after swaps (defaults to owner if not provided)
  activeIndicator?: boolean; // Show heartbeat animation when true
}
