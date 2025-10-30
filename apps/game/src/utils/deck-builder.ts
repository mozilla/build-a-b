/**
 * Deck builder utility - creates and manages card decks
 */

import type { Card } from '../types';
import type { GameConfig, CardTypeId } from '../config/game-config';

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { count, ...cardProperties } = cardType;
      const card: Card = {
        id: generateCardId(),
        ...cardProperties,
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
  | 'owyw-first' // OWYW (Open What You Want) cards at top
  | 'custom'; // Custom ordering - specify exact cards first, rest random

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
 * @param customOrder - Optional array of card typeIds to place first (only used with 'custom' strategy)
 * @returns New ordered array
 */
export function orderDeck(
  deck: Card[],
  strategy: DeckOrderStrategy,
  customOrder?: CardTypeId[],
): Card[] {
  const ordered = [...deck];

  switch (strategy) {
    case 'random':
      return shuffleDeck(ordered);

    case 'custom': {
      if (!customOrder || customOrder.length === 0) {
        // If no custom order specified, just shuffle
        return shuffleDeck(ordered);
      }

      // Find cards by typeId in the order specified
      const orderedCards: Card[] = [];
      const usedCardIds = new Set<string>();

      for (const typeId of customOrder) {
        // Find the first unused card with this typeId
        const card = ordered.find((c) => c.typeId === typeId && !usedCardIds.has(c.id));
        if (card) {
          orderedCards.push(card);
          usedCardIds.add(card.id);
        }
      }

      // Get remaining cards that weren't used
      const remainingCards = ordered.filter((c) => !usedCardIds.has(c.id));

      // Shuffle the remaining cards
      const shuffledRemaining = shuffleDeck(remainingCards);

      // Return custom order first, then shuffled remaining
      return [...orderedCards, ...shuffledRemaining];
    }

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
          ['forced_empathy', 'tracker_smacker', 'open_what_you_want', 'mandatory_recall'].includes(
            a.specialType,
          )
            ? 1
            : 0;
        const bIsFirewall =
          b.specialType &&
          ['forced_empathy', 'tracker_smacker', 'open_what_you_want', 'mandatory_recall'].includes(
            b.specialType,
          )
            ? 1
            : 0;
        return bIsFirewall - aIsFirewall;
      });

    case 'move-first':
      return ordered.sort((a, b) => {
        const aIsMove =
          a.specialType &&
          ['hostile_takeover', 'temper_tantrum', 'patent_theft', 'leveraged_buyout'].includes(
            a.specialType,
          )
            ? 1
            : 0;
        const bIsMove =
          b.specialType &&
          ['hostile_takeover', 'temper_tantrum', 'patent_theft', 'leveraged_buyout'].includes(
            b.specialType,
          )
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

    case 'owyw-first': {
      // For testing: OWYW first, then common, tracker, launch_stack
      const owyw = ordered.find((c) => c.specialType === 'open_what_you_want');
      const common = ordered.find((c) => !c.isSpecial);
      const tracker = ordered.find((c) => c.specialType === 'tracker');
      const launchStack = ordered.find((c) => c.specialType === 'launch_stack');
      const rest = ordered.filter(
        (c) => c !== owyw && c !== common && c !== tracker && c !== launchStack,
      );

      const result: Card[] = [];
      if (owyw) result.push(owyw);
      if (common) result.push(common);
      if (tracker) result.push(tracker);
      if (launchStack) result.push(launchStack);
      result.push(...rest);

      return result;
    }

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
  cardsPerPlayer: number,
): { playerDeck: Card[]; cpuDeck: Card[] } {
  if (deck.length !== cardsPerPlayer * 2) {
    console.warn(`Expected ${cardsPerPlayer * 2} cards, but deck has ${deck.length} cards`);
  }

  return {
    playerDeck: deck.slice(0, cardsPerPlayer),
    cpuDeck: deck.slice(cardsPerPlayer, cardsPerPlayer * 2),
  };
}

/**
 * Initializes a complete game deck (creates, orders, and deals)
 * @param config - Game configuration
 * @param playerStrategy - Ordering strategy for player's deck (default: 'random')
 * @param cpuStrategy - Ordering strategy for CPU's deck (default: 'random')
 * @param playerCustomOrder - Optional array of card typeIds that player should get first (for 'custom' strategy)
 * @param cpuCustomOrder - Optional array of card typeIds that CPU should get first (for 'custom' strategy)
 * @returns Object with playerDeck and cpuDeck ready for gameplay
 * @note Always orders the full deck with playerStrategy before dealing (player gets priority).
 *       Then CPU's portion is reordered with cpuStrategy on whatever cards remain.
 *       For custom strategy, specify typeIds like: ['tracker-1', 'common-3', 'firewall-empathy']
 */
export function initializeGameDeck(
  config: GameConfig,
  playerStrategy: DeckOrderStrategy = 'random',
  cpuStrategy: DeckOrderStrategy = 'random',
  playerCustomOrder?: CardTypeId[],
  cpuCustomOrder?: CardTypeId[],
): {
  playerDeck: Card[];
  cpuDeck: Card[];
} {
  const deck = createDeck(config);

  // For custom strategy with specific card orders for both players
  if (playerStrategy === 'custom' && (playerCustomOrder || cpuCustomOrder)) {
    const playerTypeIds = playerCustomOrder || [];
    const cpuTypeIds = cpuCustomOrder || [];

    // Find cards by typeId for player
    const playerCards: Card[] = [];
    const usedCardIds = new Set<string>();

    for (const typeId of playerTypeIds) {
      const card = deck.find((c) => c.typeId === typeId && !usedCardIds.has(c.id));
      if (card) {
        playerCards.push(card);
        usedCardIds.add(card.id);
      }
    }

    // Find cards by typeId for CPU
    const cpuCards: Card[] = [];
    for (const typeId of cpuTypeIds) {
      const card = deck.find((c) => c.typeId === typeId && !usedCardIds.has(c.id));
      if (card) {
        cpuCards.push(card);
        usedCardIds.add(card.id);
      }
    }

    // Remaining cards that haven't been assigned
    const remainingCards = deck.filter((c) => !usedCardIds.has(c.id));
    const shuffledRemaining = shuffleDeck(remainingCards);

    // Build ordered deck: player custom cards first, then CPU custom cards, then shuffled remaining
    const orderedDeck = [...playerCards, ...cpuCards, ...shuffledRemaining];
    const { playerDeck, cpuDeck } = dealCards(orderedDeck, config.cardsPerPlayer);

    return { playerDeck, cpuDeck };
  }

  // Order the full deck with player strategy (player gets priority)
  const orderedDeck = orderDeck(deck, playerStrategy, playerCustomOrder);
  const { playerDeck, cpuDeck: initialCpuDeck } = dealCards(orderedDeck, config.cardsPerPlayer);

  // Reorder CPU's deck with CPU strategy on whatever cards they received
  const cpuDeck = orderDeck(initialCpuDeck, cpuStrategy, cpuCustomOrder);

  return { playerDeck, cpuDeck };
}

/**
 * Resets the card ID counter (useful for testing)
 */
export function resetCardIdCounter(): void {
  cardIdCounter = 0;
}
