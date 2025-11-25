/**
 * Forced Empathy Card Functions
 * Handles deck swapping mechanic
 */

import type { SetState, GetState } from '@/types';

export function createForcedEmpathyActions(set: SetState, get: GetState) {
  return {
    /**
     * Shows/hides the Forced Empathy video animation
     */
    setShowForcedEmpathyAnimation: (show: boolean) => {
      set({ showForcedEmpathyAnimation: show });
    },

    /**
     * Sets whether deck swap animation is playing
     */
    setForcedEmpathySwapping: (swapping: boolean) => {
      set({ forcedEmpathySwapping: swapping });
    },

    /**
     * Swaps player and CPU decks
     * Increments deckSwapCount to trigger visual swap
     */
    swapDecks: () => {
      const { player, cpu } = get();

      // Swap the deck arrays
      set({
        player: {
          ...player,
          deck: cpu.deck,
        },
        cpu: {
          ...cpu,
          deck: player.deck,
        },
        deckSwapCount: get().deckSwapCount + 1, // Increment for animation trigger
      });
    },
  };
}
