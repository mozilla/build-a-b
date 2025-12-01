/**
 * Effect Notification System Functions
 * Handles effect notification badges, modals, and tracking which effects have been seen
 */

import type { EffectNotification, PlayerType } from '@/types';
import { getEffectType, isSpecialCard, shouldShowEffectNotification } from '@/utils/effect-helpers';
import type { SetState, GetState } from '@/types';

export function createEffectNotificationActions(set: SetState, get: GetState) {
  return {
    /**
     * Marks an effect type as seen by the user
     * Persists to localStorage if persistence is enabled
     */
    markEffectAsSeen: (effectType: string) => {
      const { seenEffectTypes, effectNotificationPersistence } = get();

      // Convert to Set for operations, then back to array
      const seenSet = new Set(seenEffectTypes);
      seenSet.add(effectType);
      const newSeenTypes = Array.from(seenSet);

      set({ seenEffectTypes: newSeenTypes });

      // Persist to localStorage if enabled
      if (effectNotificationPersistence === 'localStorage') {
        localStorage.setItem('seenEffectTypes', JSON.stringify(newSeenTypes));
      }
    },

    /**
     * Checks if user has seen a specific effect type
     */
    hasSeenEffect: (effectType: string): boolean => {
      // Convert to Set for O(1) lookup
      return new Set(get().seenEffectTypes).has(effectType);
    },

    /**
     * Checks if there are any unseen effect notifications in currently played cards
     */
    hasUnseenEffectNotifications: (): boolean => {
      const { player, cpu, hasSeenEffect } = get();

      // Check player's played card
      if (player.playedCard && isSpecialCard(player.playedCard)) {
        const effectType = getEffectType(player.playedCard);
        if (shouldShowEffectNotification(effectType) && !hasSeenEffect(effectType)) {
          return true;
        }
      }

      // Check CPU's played card
      if (cpu.playedCard && isSpecialCard(cpu.playedCard)) {
        const effectType = getEffectType(cpu.playedCard);
        if (shouldShowEffectNotification(effectType) && !hasSeenEffect(effectType)) {
          return true;
        }
      }

      return false;
    },

    /**
     * Prepares effect notifications for currently played cards
     * Accumulates notifications for display
     */
    prepareEffectNotification: () => {
      const { player, cpu, addEffectToAccumulation } = get();

      // Collect ALL notifications (priority: player first, then CPU)
      const cards = [
        { card: player.playedCard, playedBy: 'player' as PlayerType },
        { card: cpu.playedCard, playedBy: 'cpu' as PlayerType },
      ];

      for (const { card, playedBy } of cards) {
        if (card && isSpecialCard(card)) {
          const effectType = getEffectType(card);

          if (shouldShowEffectNotification(effectType)) {
            // Add to accumulation (non-blocking)
            addEffectToAccumulation({
              card,
              playedBy,
              effectType,
              specialType: card.specialType || null,
              effectName: card.name,
              effectDescription: card.specialActionDescription || '',
            });
          }
        }
      }
    },

    /**
     * Dismisses the current effect notification and shows the next one
     */
    dismissEffectNotification: () => {
      const { currentEffectNotification, pendingEffectNotifications, markEffectAsSeen } = get();

      if (currentEffectNotification) {
        markEffectAsSeen(currentEffectNotification.effectType);
      }

      // Remove the current notification from the queue
      const remainingNotifications = pendingEffectNotifications.slice(1);

      if (remainingNotifications.length > 0) {
        // Show the next notification
        set({
          pendingEffectNotifications: remainingNotifications,
          currentEffectNotification: remainingNotifications[0],
          showEffectNotificationModal: false, // Close modal, will reopen for next
          showEffectNotificationBadge: true, // Keep badge visible for remaining notifications
        });
      } else {
        // No more notifications
        set({
          pendingEffectNotifications: [],
          currentEffectNotification: null,
          showEffectNotificationBadge: false,
          showEffectNotificationModal: false,
        });
      }
    },

    /**
     * Shows/hides the effect notification modal
     */
    setShowEffectNotificationModal: (show: boolean) => {
      set({ showEffectNotificationModal: show });
    },

    /**
     * Clears all seen effects (for testing)
     */
    clearSeenEffects: () => {
      set({ seenEffectTypes: [] });
      localStorage.removeItem('seenEffectTypes');
    },

    /**
     * Sets the persistence mode for effect notifications
     */
    setEffectNotificationPersistence: (mode: 'localStorage' | 'memory') => {
      set({ effectNotificationPersistence: mode });

      if (mode === 'memory') {
        // Clear localStorage if switching to memory mode
        localStorage.removeItem('seenEffectTypes');
      }
    },

    /**
     * Adds an effect to the accumulation queue (non-blocking)
     */
    addEffectToAccumulation: (notification: EffectNotification) => {
      const { accumulatedEffects } = get();

      // Prevent duplicate effects in the same turn (check both type and player)
      const isAlreadyAccumulated = accumulatedEffects.some(
        (effect) =>
          effect.effectType === notification.effectType &&
          effect.playedBy === notification.playedBy,
      );

      if (!isAlreadyAccumulated) {
        set({
          accumulatedEffects: [...accumulatedEffects, notification],
          showEffectNotificationBadge: true,
        });
      }
    },

    /**
     * Clears all accumulated effects
     */
    clearAccumulatedEffects: () => {
      const { showEffectNotificationModal } = get();

      // If modal is open, only set blockTransitions to false after a short delay
      // to allow the modal closing animation to complete
      if (showEffectNotificationModal) {
        set({
          accumulatedEffects: [],
          showEffectNotificationBadge: false,
          effectAccumulationPaused: false,
          showEffectNotificationModal: false,
          awaitingResolution: false,
        });
        // Delay unblocking to allow modal to close visually
        setTimeout(() => {
          set({ blockTransitions: false });
        }, 150);
      } else {
        set({
          accumulatedEffects: [],
          showEffectNotificationBadge: false,
          effectAccumulationPaused: false,
          showEffectNotificationModal: false,
          blockTransitions: false,
          awaitingResolution: false,
        });
      }
    },

    /**
     * Opens the effect notification modal and pauses the game
     */
    openEffectModal: () => {
      set({
        showEffectNotificationModal: true,
        effectAccumulationPaused: true, // Pause game
        blockTransitions: true, // Block state machine transitions while modal is open
      });
    },

    /**
     * Closes the effect notification modal and resumes the game
     */
    closeEffectModal: () => {
      // Close modal but keep accumulated effects visible (badge stays)
      // Effects are only cleared when turn ends (in collectCards)
      set({
        showEffectNotificationModal: false,
        effectAccumulationPaused: false, // Resume game
        blockTransitions: false, // Resume state machine transitions
        // Do NOT clear accumulatedEffects or badge - they persist until turn ends
      });
    },

    /**
     * Starts the effect badge timer
     * Returns true if the game should wait for the timer
     */
    startEffectBadgeTimer: (): boolean => {
      const { effectBadgeTimerDuration } = get();

      if (effectBadgeTimerDuration === 0) {
        // Timer disabled, proceed immediately
        return false;
      }

      set({
        effectBadgeTimerActive: true,
        effectBadgeTimerStartTime: Date.now(),
      });

      // Return true to indicate game should wait
      return true;
    },

    /**
     * Stops the effect badge timer
     */
    stopEffectBadgeTimer: () => {
      set({
        effectBadgeTimerActive: false,
        effectBadgeTimerStartTime: null,
      });
    },

    /**
     * Checks if the effect timer is currently active
     */
    isEffectTimerActive: (): boolean => {
      return get().effectBadgeTimerActive;
    },
  };
}
