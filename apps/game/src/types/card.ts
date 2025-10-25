/**
 * Card type definitions for Data War game
 */

export type CardValue = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type SpecialCardType =
  // Instant effects (trigger immediately)
  | 'forced_empathy' // Firewall: Pass decks one position to the right
  | 'tracker_smacker' // Firewall: Negate opponent Trackers & Moves for turn
  | 'hostile_takeover' // Move: Instant war against this 6 (ignores Trackers/Blockers/ties)
  // Non-instant effects (queued until end of hand)
  | 'tracker' // Triggers another play + adds point value to turn total
  | 'blocker' // Triggers another play + subtracts points from opponent (card has 0 value)
  | 'open_what_you_want' // Firewall: Look at top 3, arrange them in any order
  | 'mandatory_recall' // Firewall: If win, opponents shuffle Launch Stacks back into decks
  | 'temper_tantrum' // Move: If LOSE, steal 2 cards from winner's win pile
  | 'patent_theft' // Move: If win, steal 1 Launch Stack from opponent
  | 'leveraged_buyout' // Move: If win, take 2 cards from top of opponent decks
  | 'launch_stack' // Collect 3 to win (triggers another play)
  | 'data_grab'; // Everyone grabs cards from play area (physical mechanic)

export interface CardType {
  typeId: string; // Card type identifier (e.g., "common-1", "ls-ai-platform")
  imageUrl: string; // Path to card image
  value: CardValue; // Base value 0-6
  isSpecial: boolean;
  specialType?: SpecialCardType;
  triggersAnotherPlay?: boolean; // Does this card trigger another play?
  count: number; // How many copies of this card in the deck
}

export interface Card extends Omit<CardType, 'count' | 'typeId'> {
  id: string; // Unique identifier for this card instance (e.g., "CD-1-01", "TR-1-01")
  typeId: string; // Reference to CardType (e.g., "common-1")
}
