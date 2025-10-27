/**
 * Deck builder utility - creates and manages card decks
 */

import type { Card } from '../types';
import type { GameConfig } from '../config/game-config';

/**
 * Generates a unique ID for a card instance
 */
let cardIdCounter = 0;
function generateCardId(): string {
  return `card-${++cardIdCounter}`;
}

/**
 * Creates a full deck of Card instances from the game configuration
 * @param config - Game configuration with deck composition
 * @returns Array of Card instances (not shuffled)
 */
export function createDeck(config: GameConfig): Card[] {
  const deck: Card[] = [];

  // Iterate through each card type in the configuration
  for (const cardType of config.deckComposition) {
    // Create the specified number of copies for each card type
    for (let i = 0; i < cardType.count; i++) {
      const card: Card = {
        id: generateCardId(),
        typeId: cardType.typeId,
        imageUrl: cardType.imageUrl,
        value: cardType.value,
        isSpecial: cardType.isSpecial,
        specialType: cardType.specialType,
        triggersAnotherPlay: cardType.triggersAnotherPlay,
      };
      deck.push(card);
    }
  }

  return deck;
}

/**
 * Deck ordering strategies for testing and gameplay
 */
export type DeckOrderStrategy =
  | 'random' // Standard Fisher-Yates shuffle
  | 'tracker-first' // Tracker cards at top of deck
  | 'firewall-first' // Firewall cards at top
  | 'move-first' // Move cards at top
  | 'blocker-first' // Blocker cards at top
  | 'launch-stack-first' // Launch stack cards at top
  | 'special-first' // All special cards at top
  | 'common-first' // Common cards at top
  | 'high-value-first' // Sort by value (5→1)
  | 'low-value-first' // Sort by value (1→5)
  | 'owyw-first'; // OWYW (Open What You Want) cards at top

/**
 * Shuffles a deck using the Fisher-Yates algorithm
 * @param deck - Array of cards to shuffle
 * @returns New shuffled array (does not mutate original)
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];

  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Orders a deck based on a specific strategy (for testing purposes)
 * @param deck - Array of cards to order
 * @param strategy - Ordering strategy to apply
 * @returns New ordered array
 */
export function orderDeck(deck: Card[], strategy: DeckOrderStrategy): Card[] {
  const ordered = [...deck];

  switch (strategy) {
    case 'random':
      return shuffleDeck(ordered);

    case 'tracker-first':
      return ordered.sort((a, b) => {
        const aIsTracker = a.specialType === 'tracker' ? 1 : 0;
        const bIsTracker = b.specialType === 'tracker' ? 1 : 0;
        return bIsTracker - aIsTracker;
      });

    case 'firewall-first':
      return ordered.sort((a, b) => {
        const aIsFirewall =
          a.specialType &&
          [
            'forced_empathy',
            'tracker_smacker',
            'open_what_you_want',
            'mandatory_recall',
          ].includes(a.specialType)
            ? 1
            : 0;
        const bIsFirewall =
          b.specialType &&
          [
            'forced_empathy',
            'tracker_smacker',
            'open_what_you_want',
            'mandatory_recall',
          ].includes(b.specialType)
            ? 1
            : 0;
        return bIsFirewall - aIsFirewall;
      });

    case 'move-first':
      return ordered.sort((a, b) => {
        const aIsMove =
          a.specialType &&
          [
            'hostile_takeover',
            'temper_tantrum',
            'patent_theft',
            'leveraged_buyout',
          ].includes(a.specialType)
            ? 1
            : 0;
        const bIsMove =
          b.specialType &&
          [
            'hostile_takeover',
            'temper_tantrum',
            'patent_theft',
            'leveraged_buyout',
          ].includes(b.specialType)
            ? 1
            : 0;
        return bIsMove - aIsMove;
      });

    case 'blocker-first':
      return ordered.sort((a, b) => {
        const aIsBlocker = a.specialType === 'blocker' ? 1 : 0;
        const bIsBlocker = b.specialType === 'blocker' ? 1 : 0;
        return bIsBlocker - aIsBlocker;
      });

    case 'launch-stack-first':
      return ordered.sort((a, b) => {
        const aIsLaunchStack = a.specialType === 'launch_stack' ? 1 : 0;
        const bIsLaunchStack = b.specialType === 'launch_stack' ? 1 : 0;
        return bIsLaunchStack - aIsLaunchStack;
      });

    case 'special-first':
      return ordered.sort((a, b) => {
        const aIsSpecial = a.isSpecial ? 1 : 0;
        const bIsSpecial = b.isSpecial ? 1 : 0;
        return bIsSpecial - aIsSpecial;
      });

    case 'common-first':
      return ordered.sort((a, b) => {
        const aIsCommon = !a.isSpecial ? 1 : 0;
        const bIsCommon = !b.isSpecial ? 1 : 0;
        return bIsCommon - aIsCommon;
      });

    case 'high-value-first':
      return ordered.sort((a, b) => b.value - a.value);

    case 'low-value-first':
      return ordered.sort((a, b) => a.value - b.value);

    case 'owyw-first':
      return ordered.sort((a, b) => {
        const aIsOWYW = a.specialType === 'open_what_you_want' ? 1 : 0;
        const bIsOWYW = b.specialType === 'open_what_you_want' ? 1 : 0;
        return bIsOWYW - aIsOWYW;
      });

    default:
      return ordered;
  }
}

/**
 * Deals cards between player and CPU
 * @param deck - Shuffled deck to deal from
 * @param cardsPerPlayer - Number of cards each player should receive
 * @returns Object with playerDeck and cpuDeck arrays
 */
export function dealCards(
  deck: Card[],
  cardsPerPlayer: number
): { playerDeck: Card[]; cpuDeck: Card[] } {
  if (deck.length !== cardsPerPlayer * 2) {
    console.warn(
      `Expected ${cardsPerPlayer * 2} cards, but deck has ${deck.length} cards`
    );
  }

  return {
    playerDeck: deck.slice(0, cardsPerPlayer),
    cpuDeck: deck.slice(cardsPerPlayer, cardsPerPlayer * 2),
  };
}

/**
 * Initializes a complete game deck (creates, shuffles, and deals)
 * @param config - Game configuration
 * @param playerStrategy - Ordering strategy for player's deck (default: 'random')
 * @param cpuStrategy - Ordering strategy for CPU's deck (default: 'random')
 * @param mirrorDecks - If true, both decks will have identical cards in identical order
 * @returns Object with playerDeck and cpuDeck ready for gameplay
 */
export function initializeGameDeck(
  config: GameConfig,
  playerStrategy: DeckOrderStrategy = 'random',
  cpuStrategy: DeckOrderStrategy = 'random',
  mirrorDecks: boolean = false
): {
  playerDeck: Card[];
  cpuDeck: Card[];
} {
  if (mirrorDecks) {
    // Create a single deck and give identical copies to both players
    const deck = createDeck(config);
    const shuffled = shuffleDeck(deck);
    const { playerDeck } = dealCards(shuffled, config.cardsPerPlayer);

    // Apply the same ordering strategy to both decks
    const orderedDeck = orderDeck(playerDeck, playerStrategy);

    return {
      playerDeck: orderedDeck,
      cpuDeck: [...orderedDeck], // Clone the deck for CPU
    };
  }

  const deck = createDeck(config);
  const shuffled = shuffleDeck(deck);
  const { playerDeck, cpuDeck } = dealCards(shuffled, config.cardsPerPlayer);

  // Apply ordering strategies to each deck
  return {
    playerDeck: orderDeck(playerDeck, playerStrategy),
    cpuDeck: orderDeck(cpuDeck, cpuStrategy),
  };
}

/**
 * Resets the card ID counter (useful for testing)
 */
export function resetCardIdCounter(): void {
  cardIdCounter = 0;
}
