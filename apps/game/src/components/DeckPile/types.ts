/**
 * DeckPile component types
 */

export interface DeckPileProps {
  cardCount: number;
  owner: 'player' | 'cpu';
  onClick?: () => void;
  showTooltip?: boolean;
  tooltipContent?: string;
  activeIndicator?: boolean;
  forcedEmpathySwapping?: boolean;
  decksVisuallySwapped?: boolean;
}
