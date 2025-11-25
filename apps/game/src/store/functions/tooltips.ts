/**
 * Tooltip Management Functions
 * Handles tooltip display tracking and persistence
 */

import type { SetState, GetState } from '@/types';

export function createTooltipActions(set: SetState, get: GetState) {
  return {
    /**
     * Shows/hides the global tooltip
     */
    setShowTooltip: (show: boolean) => {
      set({ showTooltip: show });
    },

    /**
     * Increments the display count for a tooltip
     * Used to track how many times a tooltip has been shown
     */
    incrementTooltipCount: (tooltipId: string) => {
      const { tooltipDisplayCounts, tooltipPersistence } = get();

      // Increment the count (default to 0 if not present)
      const currentCount = tooltipDisplayCounts[tooltipId] || 0;
      const newCounts = {
        ...tooltipDisplayCounts,
        [tooltipId]: currentCount + 1,
      };

      set({ tooltipDisplayCounts: newCounts });

      if (tooltipPersistence === 'localStorage') {
        localStorage.setItem('tooltipDisplayCounts', JSON.stringify(newCounts));
      }
    },

    /**
     * Gets the display count for a tooltip
     */
    getTooltipDisplayCount: (tooltipId: string): number => {
      const { tooltipDisplayCounts } = get();
      return tooltipDisplayCounts[tooltipId] || 0;
    },

    /**
     * Checks if a tooltip should be shown based on max display count
     * @param tooltipId - The tooltip identifier
     * @param maxDisplayCount - Max times to show (null = always show)
     */
    shouldShowTooltip: (tooltipId: string, maxDisplayCount: number | null): boolean => {
      const currentCount = get().getTooltipDisplayCount(tooltipId);

      // If maxDisplayCount is null, always show
      if (maxDisplayCount === null) {
        return true;
      }

      // Check if we haven't reached the max display count
      return currentCount < maxDisplayCount;
    },

    /**
     * Clears all tooltip display counts
     */
    clearTooltipCounts: () => {
      set({ tooltipDisplayCounts: {} });
      localStorage.removeItem('tooltipDisplayCounts');
    },

    /**
     * Sets tooltip persistence mode (localStorage or memory)
     */
    setTooltipPersistence: (mode: 'localStorage' | 'memory') => {
      set({ tooltipPersistence: mode });

      if (mode === 'memory') {
        localStorage.removeItem('tooltipDisplayCounts');
      }
    },

    /**
     * Marks a play trigger as seen (for deck tooltip)
     */
    markPlayTriggerSeen: (trigger: string) => {
      const { seenPlayTriggers } = get();
      const newSet = new Set(seenPlayTriggers);
      newSet.add(trigger);
      set({ seenPlayTriggers: newSet });
    },

    /**
     * Determines if deck tooltip should be shown
     * Show tooltip until all unique play triggers have been seen
     */
    shouldShowDeckTooltip: (): boolean => {
      const { seenPlayTriggers } = get();
      const allTriggers = ['game_start', 'play_again', 'war_face_down', 'war_face_up'];
      return !allTriggers.every((trigger) => seenPlayTriggers.has(trigger));
    },

    /**
     * Marks a card type as seen on tableau
     */
    markTableauCardTypeSeen: (cardType: string) => {
      const { seenTableauCardTypes } = get();
      const newSet = new Set(seenTableauCardTypes);
      newSet.add(cardType);
      set({ seenTableauCardTypes: newSet });
    },

    /**
     * Checks if a card type has been seen on tableau
     */
    hasSeenTableauCardType: (cardType: string): boolean => {
      return get().seenTableauCardTypes.has(cardType);
    },
  };
}
