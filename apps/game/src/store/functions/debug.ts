/**
 * Debug Functions
 * Handles debug logging and game speed control
 */

import type { SetState } from '@/types';

export function createDebugActions(set: SetState) {
  return {
    /**
     * Sets the game speed multiplier (for debugging/testing)
     */
    setGameSpeedMultiplier: (multiplier: number) => {
      set({ gameSpeedMultiplier: multiplier });
    },

    /**
     * Logs a game event to the event log
     */
    logEvent: (
      type: string,
      message: string,
      details?: string,
      level: 'info' | 'success' | 'warning' | 'error' = 'info',
    ) => {
      const event = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type,
        message,
        details,
        level,
      };
      set((state) => ({
        eventLog: [...state.eventLog, event],
      }));
    },
  };
}
