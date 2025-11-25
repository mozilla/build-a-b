/**
 * Launch Stack Management Functions
 * Handles Launch Stack collection, theft, and removal operations
 */

import { DEFAULT_GAME_CONFIG } from '@/config/game-config';
import type { Card, PlayerType, SetState, GetState } from '@/types';
import { shuffleDeck } from '@/utils/deck-builder';

export function createLaunchStackActions(set: SetState, get: GetState) {
  return {
    /**
     * Adds a Launch Stack card to a player's collection
     * Checks for win condition after adding
     * @param playerId - The player collecting the Launch Stack
     * @param launchStackCard - The Launch Stack card to add
     */
    addLaunchStack: (playerId: PlayerType, launchStackCard: Card) => {
      const player = get()[playerId];
      const newCount = player.launchStackCount + 1;

      // Validate that this is actually a Launch Stack card
      if (!launchStackCard || launchStackCard.specialType !== 'launch_stack') {
        return;
      }

      // DON'T remove Launch Stack from cardsInPlay yet - let it be collected normally
      // It will be removed during the collection animation
      // const updatedCardsInPlay = get().cardsInPlay.filter((c) => c.id !== launchStackCard.id);

      // Add to player's Launch Stack collection
      const launchStackKey = playerId === 'player' ? 'playerLaunchStacks' : 'cpuLaunchStacks';

      set({
        [playerId]: {
          ...player,
          launchStackCount: newCount,
        },
        [launchStackKey]: [...get()[launchStackKey], launchStackCard],
        // cardsInPlay: updatedCardsInPlay, // Don't update cardsInPlay - let collection handle it
      });

      // Check win condition
      if (newCount >= DEFAULT_GAME_CONFIG.launchStacksToWin) {
        set({ winner: playerId, winCondition: 'launch_stacks' });
      }
    },

    /**
     * Phase 1 of Patent Theft: Remove a Launch Stack card from opponent
     * @param from - The player to steal from
     * @returns The stolen card, or null if no Launch Stacks available
     */
    stealLaunchStackStart: (from: PlayerType): Card | null => {
      const fromPlayer = get()[from];
      const fromLaunchStackKey = from === 'player' ? 'playerLaunchStacks' : 'cpuLaunchStacks';
      const fromLaunchStacks = get()[fromLaunchStackKey];

      // Only steal if opponent has Launch Stack cards
      if (fromPlayer.launchStackCount > 0 && fromLaunchStacks.length > 0) {
        // Take the first Launch Stack card from opponent's collection
        const stolenCard = fromLaunchStacks[0];
        const remainingFromStacks = fromLaunchStacks.slice(1);

        // Reduce opponent's counter and remove card from their collection
        set({
          [from]: { ...fromPlayer, launchStackCount: fromPlayer.launchStackCount - 1 },
          [fromLaunchStackKey]: remainingFromStacks,
        });

        return stolenCard; // Return the stolen card for phase 2
      }
      return null;
    },

    /**
     * Phase 2 of Patent Theft: Add stolen card to winner's launch stack
     * This will automatically trigger the rocket animation via PlayerDeck's useEffect
     * @param to - The player receiving the Launch Stack
     * @param stolenCard - The stolen card to add
     */
    stealLaunchStackComplete: (to: PlayerType, stolenCard: Card) => {
      if (!stolenCard) return;

      const toPlayer = get()[to];
      const toLaunchStackKey = to === 'player' ? 'playerLaunchStacks' : 'cpuLaunchStacks';
      const toLaunchStacks = get()[toLaunchStackKey];

      // Add stolen card to winner's Launch Stack collection and increment counter
      // This counter increment will automatically trigger the rocket animation
      set({
        [to]: { ...toPlayer, launchStackCount: toPlayer.launchStackCount + 1 },
        [toLaunchStackKey]: [...toLaunchStacks, stolenCard],
      });
    },

    /**
     * Legacy function for backward compatibility (not used anymore)
     * Steals a Launch Stack card from one player to another in a single operation
     */
    stealLaunchStack: (from: PlayerType, to: PlayerType) => {
      const fromPlayer = get()[from];
      const toPlayer = get()[to];
      const fromLaunchStackKey = from === 'player' ? 'playerLaunchStacks' : 'cpuLaunchStacks';
      const toLaunchStackKey = to === 'player' ? 'playerLaunchStacks' : 'cpuLaunchStacks';
      const fromLaunchStacks = get()[fromLaunchStackKey];
      const toLaunchStacks = get()[toLaunchStackKey];

      // Only steal if opponent has Launch Stack cards
      if (fromPlayer.launchStackCount > 0 && fromLaunchStacks.length > 0) {
        // Take the first Launch Stack card from opponent's collection
        const stolenCard = fromLaunchStacks[0];
        const remainingFromStacks = fromLaunchStacks.slice(1);

        // Add stolen card to winner's Launch Stack collection
        // Winner's Launch Stack counter DOES increase
        set({
          [from]: { ...fromPlayer, launchStackCount: fromPlayer.launchStackCount - 1 },
          [to]: { ...toPlayer, launchStackCount: toPlayer.launchStackCount + 1 },
          [fromLaunchStackKey]: remainingFromStacks,
          [toLaunchStackKey]: [...toLaunchStacks, stolenCard],
        });
      }
    },

    /**
     * Removes Launch Stack cards from a player and returns them to their deck
     * Used by Mandatory Recall effect
     * @param playerId - The player to remove Launch Stacks from
     * @param count - Number of Launch Stacks to remove
     */
    removeLaunchStacks: (playerId: PlayerType, count: number) => {
      const player = get()[playerId];
      const launchStackKey = playerId === 'player' ? 'playerLaunchStacks' : 'cpuLaunchStacks';
      const launchStacks = get()[launchStackKey];

      // Take the Launch Stack cards to return (up to count)
      const cardsToReturn = launchStacks.slice(0, count);
      const remainingLaunchStacks = launchStacks.slice(count);

      // Shuffle the cards back into the player's deck randomly
      const newDeck = shuffleDeck([...player.deck, ...cardsToReturn]);

      set({
        [playerId]: {
          ...player,
          launchStackCount: Math.max(0, player.launchStackCount - count),
          deck: newDeck,
        },
        [launchStackKey]: remainingLaunchStacks,
      });
    },

    /**
     * Reorders the top cards of a player's deck
     * Used by Open What You Want card effect
     * @param playerId - The player whose deck to reorder
     * @param cards - The cards in their new order
     */
    reorderTopCards: (playerId: PlayerType, cards: Card[]) => {
      const player = get()[playerId];
      const remainingDeck = player.deck.slice(cards.length);
      set({
        [playerId]: {
          ...player,
          deck: [...cards, ...remainingDeck],
        },
      });
    },
  };
}
