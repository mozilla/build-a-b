/**
 * Card type definitions for Data War game
 */

export type CardValue = 1 | 2 | 3 | 4 | 5 | 6;

export type SpecialCardType =
  // Instant effects (trigger immediately)
  | 'forced_empathy' // Firewall: Swap decks instantly
  | 'tracker_smacker' // Firewall: Block opponent effects for turn
  | 'hostile_takeover' // Move: Instant war against value 6
  // Non-instant effects (queued until end of hand)
  | 'tracker' // Play again + add value to turn total
  | 'blocker' // Subtract value from opponent turn
  | 'open_what_you_want' // Firewall: Look at top 3, select one to play
  | 'mandatory_recall' // Firewall: Steal 2 cards
  | 'temper_tantrum' // Move: Steal 2 cards
  | 'patent_theft' // Move: Steal 2 cards
  | 'leveraged_buyout' // Move: Steal 2 cards
  | 'launch_stack'; // Collect 3 to win

export interface CardType {
  typeId: string; // Card type identifier (e.g., "common-1", "ls-ai-platform")
  imageUrl: string; // Path to card image
  value: CardValue; // Base value
  isSpecial: boolean;
  specialType?: SpecialCardType;
  count: number; // How many copies of this card in the deck
}

export interface Card extends Omit<CardType, 'count' | 'typeId'> {
  id: string; // Unique identifier for this card instance (e.g., "card-1", "card-2")
  typeId: string; // Reference to CardType (e.g., "common-1")
}
