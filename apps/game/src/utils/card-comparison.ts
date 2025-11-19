/**
 * Card comparison utilities for Data War game
 * Determines winners, handles ties, and manages card value calculations
 */

import { blockerValues } from '@/config/blockers';
import type { Card, Player } from '../types';

/**
 * Result of comparing two cards
 */
export interface ComparisonResult {
  winner: 'player' | 'cpu' | 'tie';
  playerValue: number;
  cpuValue: number;
  isTie: boolean;
}

/**
 * Compares two players' current turn values to determine the winner
 * Takes into account modifiers (trackers add value, blockers subtract from opponent)
 *
 * @param player - Player state with currentTurnValue
 * @param cpu - CPU state with currentTurnValue
 * @returns ComparisonResult indicating winner or tie
 */
export function compareCards(player: Player, cpu: Player): ComparisonResult {
  const playerValue = player.currentTurnValue;
  const cpuValue = cpu.currentTurnValue;

  if (playerValue > cpuValue) {
    return {
      winner: 'player',
      playerValue,
      cpuValue,
      isTie: false,
    };
  }

  if (cpuValue > playerValue) {
    return {
      winner: 'cpu',
      playerValue,
      cpuValue,
      isTie: false,
    };
  }

  // Values are equal - it's a tie (Data War!)
  return {
    winner: 'tie',
    playerValue,
    cpuValue,
    isTie: true,
  };
}

/**
 * Calculates the effective value for a card, considering:
 * - Base card value
 * - Tracker effects (add tracker value to total)
 * - Blocker effects (applied to opponent, not this card)
 *
 * Note: This is for the initial card value. Modifiers are applied
 * separately during turn resolution.
 *
 * @param card - The card to evaluate
 * @returns The base value of the card
 */
export function getCardBaseValue(card: Card): number {
  return card.value;
}

/**
 * Checks if a card requires special handling during comparison
 *
 * @param card - The card to check
 * @returns Object indicating what special handling is needed
 */
export function getCardSpecialProperties(card: Card): {
  triggersAnotherPlay: boolean;
  isTracker: boolean;
  isBlocker: boolean;
  isLaunchStack: boolean;
  isInstantEffect: boolean;
  specialType: string | null;
} {
  return {
    triggersAnotherPlay: card.triggersAnotherPlay ?? false,
    isTracker: card.specialType === 'tracker',
    isBlocker: card.specialType === 'blocker',
    isLaunchStack: card.specialType === 'launch_stack',
    isInstantEffect: isInstantEffect(card),
    specialType: card.specialType ?? null,
  };
}

/**
 * Determines if a card has an instant effect that should trigger immediately
 * (as opposed to being queued until end of hand)
 *
 * Instant effects:
 * - forced_empathy (deck swap)
 * - tracker_smacker (block opponent effects)
 * - hostile_takeover (instant Data War)
 *
 * @param card - The card to check
 * @returns true if card has instant effect
 */
export function isInstantEffect(card: Card): boolean {
  const instantEffects = ['forced_empathy', 'tracker_smacker', 'hostile_takeover'];
  return card.specialType ? instantEffects.includes(card.specialType) : false;
}

/**
 * Checks if a card should trigger another play for the same player
 *
 * Cards that trigger another play:
 * - All Trackers (6 cards)
 * - All Blockers (4 cards)
 * - All Launch Stacks (5 cards)
 * Total: 15 cards
 *
 * @param card - The card to check
 * @returns true if card triggers another play
 */
export function shouldTriggerAnotherPlay(card: Card): boolean {
  return card.triggersAnotherPlay ?? false;
}

/**
 * Applies tracker modifier to a player's turn value
 * Trackers add their point value to the turn total
 *
 * @param currentValue - Current turn value
 * @param trackerCard - The tracker card being played
 * @returns Updated turn value with tracker bonus
 */
export function applyTrackerModifier(currentValue: number, trackerCard: Card): number {
  if (trackerCard.specialType !== 'tracker') {
    console.warn('applyTrackerModifier called with non-tracker card');
    return currentValue;
  }

  // Tracker adds its value to the total
  return currentValue + trackerCard.value;
}

/**
 * Applies blocker modifier to opponent's turn value
 * Blockers subtract points from opponent's turn value
 *
 * Blocker-1: subtract 1 point
 * Blocker-2: subtract 2 points
 *
 * @param opponentValue - Opponent's current turn value
 * @param blockerCard - The blocker card being played
 * @returns Updated opponent value (can be negative)
 */
export function applyBlockerModifier(opponentValue: number, blockerCard: Card): number {
  if (blockerCard.specialType !== 'blocker') {
    console.warn('applyBlockerModifier called with non-blocker card');
    return opponentValue;
  }

  // Blocker-1 has typeId 'blocker-1' (subtract 1)
  // Blocker-2 has typeId 'blocker-2' (subtract 2)
  const blockerValue = blockerValues[blockerCard.typeId] ?? 0;

  if (blockerValue === 0 && import.meta.env.DEV) {
    console.warn(`Unknown blocker typeId: ${blockerCard.typeId}`);
  }

  // Subtract from opponent (can go negative)
  return opponentValue - blockerValue;
}

/**
 * Checks if Tracker Smacker is active and blocking effects
 * If active, opponent's trackers and billionaire move effects are negated
 *
 * @param trackerSmackerActive - Which player (if any) has Tracker Smacker active
 * @param cardPlayedBy - Which player played the card
 * @returns true if the card's effects should be blocked
 */
export function isEffectBlocked(
  trackerSmackerActive: 'player' | 'cpu' | null,
  cardPlayedBy: 'player' | 'cpu',
): boolean {
  if (!trackerSmackerActive) return false;

  // Tracker Smacker blocks opponent's effects
  const opponent = cardPlayedBy === 'player' ? 'cpu' : 'player';
  return trackerSmackerActive === opponent;
}

/**
 * Determines if a hand should trigger a Data War (tie scenario)
 * Special case: Hostile Takeover always triggers Data War, ignoring ties
 *
 * @param playerCard - Player's card
 * @param cpuCard - CPU's card
 * @param playerValue - Player's calculated turn value
 * @param cpuValue - CPU's calculated turn value
 * @returns true if Data War should be triggered
 */
export function shouldTriggerDataWar(
  playerCard: Card,
  cpuCard: Card,
  playerValue: number,
  cpuValue: number,
): boolean {
  // Hostile Takeover always triggers Data War
  if (playerCard.specialType === 'hostile_takeover' || cpuCard.specialType === 'hostile_takeover') {
    return true;
  }

  // Check if values are tied
  if (playerValue !== cpuValue) return false; // No tie, no Data War

  // Values are tied - check if either player needs to play another card
  // Trackers and Blockers trigger "play another card" on tie
  const playerHasNextPlay = playerCard.triggersAnotherPlay;
  const cpuHasNextPlay = cpuCard.triggersAnotherPlay;

  // If either player has a next play card, they play another card instead of Data War
  if (playerHasNextPlay || cpuHasNextPlay) return false;

  // Tie with no next play cards - trigger Data War
  return true;
}

/**
 * Validates that both players have cards to play
 *
 * @param playerDeck - Player's deck
 * @param cpuDeck - CPU's deck
 * @returns true if both players can play
 */
export function canPlayHand(playerDeck: Card[], cpuDeck: Card[]): boolean {
  return playerDeck.length > 0 && cpuDeck.length > 0;
}

/**
 * Validates that both players have enough cards for Data War
 * Data War requires 4 cards total (3 face-down + 1 face-up)
 *
 * @param playerDeck - Player's deck
 * @param cpuDeck - CPU's deck
 * @returns true if both players have at least 4 cards
 */
export function canPlayDataWar(playerDeck: Card[], cpuDeck: Card[]): boolean {
  return playerDeck.length >= 4 && cpuDeck.length >= 4;
}
