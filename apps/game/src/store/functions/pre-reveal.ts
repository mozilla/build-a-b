/**
 * Pre-Reveal Effects
 * Effects that trigger before cards are revealed (like OWYW)
 */

import type { PreRevealEffect, SetState, GetState } from '@/types';

export function createPreRevealActions(set: SetState, get: GetState) {
  return {
    /**
     * Adds an effect to the pre-reveal queue
     * These effects process before the next card reveal
     */
    addPreRevealEffect: (effect: PreRevealEffect) => {
      set({ preRevealEffects: [...get().preRevealEffects, effect] });
    },

    /**
     * Clears all pre-reveal effects
     */
    clearPreRevealEffects: () => {
      set({ preRevealEffects: [] });
    },

    /**
     * Checks if there are pending pre-reveal effects
     */
    hasPreRevealEffects: () => {
      return get().preRevealEffects.length > 0;
    },

    /**
     * Sets the pre-reveal processed flag
     * Used to prevent duplicate processing
     */
    setPreRevealProcessed: (processed: boolean) => {
      set({ preRevealProcessed: processed });
    },
  };
}
