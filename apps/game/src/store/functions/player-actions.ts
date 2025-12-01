/**
 * Player Actions Functions
 * Handles player state management and basic player operations
 */

import type { PlayerType, SetState } from '@/types';

export function createPlayerActions(set: SetState) {
  return {
    /**
     * Sets the active player
     * Used to control whose turn it is
     */
    setActivePlayer: (playerId: PlayerType) => {
      set({ activePlayer: playerId });
    },

    /**
     * Enables or disables "another play" mode
     * When enabled, only the active player should play (for tracker/blocker/launch_stack)
     */
    setAnotherPlayMode: (enabled: boolean) => {
      set({ anotherPlayMode: enabled });
    },
  };
}
