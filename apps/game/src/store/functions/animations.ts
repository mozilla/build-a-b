/**
 * Animation Queue Management Functions
 * Handles animation queue, special effect animations, and animation completion callbacks
 */

import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import type { SpecialEffectAnimationType } from '@/config/special-effect-animations';
import type { Card, PlayerType, SpecialCardType, SetState, GetState } from '@/types';

export function createAnimationActions(set: SetState, get: GetState) {
  return {
    /**
     * Shows/hides Hostile Takeover animation
     */
    setShowHostileTakeoverAnimation: (show: boolean) => {
      set({ showHostileTakeoverAnimation: show });
    },

    /**
     * Shows/hides Launch Stack animation
     */
    setShowLaunchStackAnimation: (show: boolean) => {
      set({ showLaunchStackAnimation: show });
    },

    /**
     * Shows/hides Data War animation
     */
    setShowDataWarAnimation: (show: boolean) => {
      set({ showDataWarAnimation: show });
    },

    /**
     * Shows/hides Tracker Smacker animation
     */
    setShowTrackerSmackerAnimation: (show: boolean) => {
      set({ showTrackerSmackerAnimation: show });
    },

    /**
     * Shows/hides Leveraged Buyout animation
     */
    setShowLeveragedBuyoutAnimation: (show: boolean) => {
      set({ showLeveragedBuyoutAnimation: show });
    },

    /**
     * Shows/hides Patent Theft animation
     */
    setShowPatentTheftAnimation: (show: boolean) => {
      set({ showPatentTheftAnimation: show });
    },

    /**
     * Shows/hides Temper Tantrum animation
     */
    setShowTemperTantrumAnimation: (show: boolean) => {
      set({ showTemperTantrumAnimation: show });
    },

    /**
     * Shows/hides Mandatory Recall animation
     */
    setShowMandatoryRecallAnimation: (show: boolean) => {
      set({ showMandatoryRecallAnimation: show });
    },

    /**
     * Shows/hides Theft Won animation (Patent Theft victory)
     */
    setShowTheftWonAnimation: (show: boolean) => {
      set({ showTheftWonAnimation: show });
    },

    /**
     * Shows/hides Recall Won animation (Mandatory Recall victory)
     */
    setShowRecallWonAnimation: (show: boolean) => {
      set({ showRecallWonAnimation: show });
    },

    /**
     * Queues an animation to play
     * Blocks state machine transitions while animations are processing
     */
    queueAnimation: (type: SpecialEffectAnimationType, playedBy: PlayerType) => {
      const queue = get().animationQueue;
      set({
        animationQueue: [...queue, { type, playedBy }],
        animationsPaused: true, // Internal: Animation queue is processing
        blockTransitions: true, // External: Block state machine transitions during animations
      });

      // If not currently playing an animation, start processing
      if (!get().isPlayingQueuedAnimation) {
        get().processNextAnimation();
      }
    },

    /**
     * Processes the next animation in the queue
     * Automatically called after each animation completes
     */
    processNextAnimation: () => {
      const { animationQueue, animationCompletionCallback } = get();

      // No more animations to process
      if (animationQueue.length === 0) {
        set({
          isPlayingQueuedAnimation: false,
          animationsPaused: false, // Internal: Queue is free
          currentAnimationPlayer: null,
          // NOTE: Don't set blockTransitions = false here!
          // The callback may queue more animations or need to complete processing.
          // blockTransitions will be set to false by processNextEffect when truly done,
          // or by queueAnimation if more effects need to play.
        });

        // Release blockTransitions before calling callback
        // The callback (handleCompareTurnContinued) expects blockTransitions to be false
        set({ blockTransitions: false });

        // Call completion callback if set
        if (animationCompletionCallback) {
          const callback = animationCompletionCallback;
          set({ animationCompletionCallback: null }); // Clear callback
          callback(); // Execute callback to resume game flow
        }
        return;
      }

      // Get the next animation from the queue
      const [nextAnimation, ...remainingQueue] = animationQueue;
      set({
        animationQueue: remainingQueue,
        isPlayingQueuedAnimation: true,
        currentAnimationPlayer: nextAnimation.playedBy, // Track which player's animation is playing
      });

      // Map animation type to the appropriate state flag
      const animationTypeToSetter: Record<string, (show: boolean) => void> = {
        tracker_smacker: get().setShowTrackerSmackerAnimation,
        forced_empathy: get().setShowForcedEmpathyAnimation,
        hostile_takeover: get().setShowHostileTakeoverAnimation,
        launch_stack: get().setShowLaunchStackAnimation,
        move_theft: get().setShowPatentTheftAnimation, // Patent Theft now uses move_theft animation
        move_buyout: get().setShowLeveragedBuyoutAnimation, // Leveraged Buyout now uses move_buyout animation
        move_tantrum: get().setShowTemperTantrumAnimation, // Temper Tantrum now uses move_tantrum animation
        firewall_recall: get().setShowMandatoryRecallAnimation, // Mandatory Recall now uses firewall_recall animation
        open_what_you_want: get().setShowOpenWhatYouWantAnimation,
        data_grab: (show) => set({ showDataGrabTakeover: show }),
        mandatory_recall_won: get().setShowRecallWonAnimation,
        // Note: theft_won removed - move_theft animation now plays instead
      };

      const setter = animationTypeToSetter[nextAnimation.type];
      if (setter) {
        // Show the animation
        setter(true);

        // Hide after duration and process next
        setTimeout(() => {
          setter(false);
          // Small delay before starting next animation
          setTimeout(() => {
            get().processNextAnimation();
          }, 300);
        }, ANIMATION_DURATIONS.SPECIAL_EFFECT_DISPLAY);
      } else {
        // If no setter found, continue to next animation
        get().processNextAnimation();
      }
    },

    /**
     * Clears the animation queue and resets all animation state
     */
    clearAnimationQueue: () => {
      set({
        animationQueue: [],
        isPlayingQueuedAnimation: false,
        animationsPaused: false,
        blockTransitions: false,
        hostileTakeoverDataWar: false,
        currentAnimationPlayer: null,
        animationCompletionCallback: null,
        shownAnimationCardIds: new Set(),
      });
    },

    /**
     * Sets the callback to execute when animation queue completes
     */
    setAnimationCompletionCallback: (callback: (() => void) | null) => {
      set({ animationCompletionCallback: callback });
    },

    /**
     * Checks and queues animations for special cards played by both players
     * Returns true if animations were queued
     */
    queueSpecialCardAnimations: (): boolean => {
      const { player, cpu, trackerSmackerActive, shownAnimationCardIds } = get();

      const playerCard = player.playedCard;
      const cpuCard = cpu.playedCard;

      const animationsToQueue: Array<{ type: SpecialCardType; playedBy: PlayerType }> = [];

      // Helper to check if a card should show animation
      const shouldShowAnimation = (card: Card | null, playedBy: PlayerType): boolean => {
        if (!card || !card.specialType) return false;

        // Skip if this card has already shown its animation
        if (shownAnimationCardIds.has(card.id)) return false;

        const isPostResolutionCard =
          // Skip tracker and blocker - they don't have animations
          card.specialType === 'tracker' ||
          card.specialType === 'blocker' ||
          card.specialType === 'launch_stack' ||
          card.specialType === 'patent_theft' ||
          card.specialType === 'leveraged_buyout' ||
          card.specialType === 'temper_tantrum' ||
          card.specialType === 'mandatory_recall' ||
          // Skip data_grab - it has its own mini-game flow, no separate animation needed
          card.specialType === 'data_grab' ||
          // Skip forced_empathy - it has custom animation handling in handleCardEffect
          card.specialType === 'forced_empathy' ||
          card.specialType === 'open_what_you_want';

        if (isPostResolutionCard) {
          return false;
        }

        // Check if blocked by opponent's tracker smacker (only for Billionaire Move cards)
        // Note: patent_theft, leveraged_buyout, temper_tantrum removed - now post-resolution animations (handled above)
        const isBillionaireMove = card.specialType === 'hostile_takeover';

        if (isBillionaireMove && trackerSmackerActive && trackerSmackerActive !== playedBy) {
          return false; // Blocked by tracker smacker
        }

        return true;
      };

      // Queue player animation first (if applicable)
      if (shouldShowAnimation(playerCard, 'player')) {
        animationsToQueue.push({ type: playerCard!.specialType!, playedBy: 'player' });
        // Mark this card as having shown its animation
        shownAnimationCardIds.add(playerCard!.id);
      }

      // Then queue CPU animation (skip if both players played the same card type)
      const bothPlayedSameCard = playerCard?.specialType === cpuCard?.specialType;
      if (shouldShowAnimation(cpuCard, 'cpu') && !bothPlayedSameCard) {
        animationsToQueue.push({ type: cpuCard!.specialType!, playedBy: 'cpu' });
        // Mark this card as having shown its animation
        shownAnimationCardIds.add(cpuCard!.id);
      } else if (bothPlayedSameCard && cpuCard) {
        // Both played same card - mark CPU's card as shown even though we skip its animation
        shownAnimationCardIds.add(cpuCard.id);
      }

      // Update the set in store
      set({ shownAnimationCardIds });

      // Queue all animations
      animationsToQueue.forEach(({ type, playedBy }) => {
        get().queueAnimation(type as SpecialEffectAnimationType, playedBy);
      });

      return animationsToQueue.length > 0;
    },
  };
}
