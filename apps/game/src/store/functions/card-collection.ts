/**
 * Card Collection and Distribution Functions
 * Handles card collection animations and distribution logic
 */

import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import type { Card, PlayerType, CardDistribution, SetState, GetState } from '@/types';

export function createCardCollectionActions(set: SetState, get: GetState) {
  return {
    /**
     * Enhanced card collection with per-card destinations
     * Supports both board-to-deck and deck-to-deck animations
     * @param distributions - Array of card distributions with source and destination
     * @param primaryWinner - The primary winner (for win effect animation)
     * @param visualOnly - If true, decks are already updated (just animate)
     * @param launchStackCount - Number of launch stacks being collected (affects timing)
     * @param skipBoardClear - If true, keeps remaining cards on board after animation
     */
    collectCardsDistributed: (
      distributions: CardDistribution[],
      primaryWinner?: PlayerType,
      visualOnly = false,
      launchStackCount = 0,
      skipBoardClear = false,
    ) => {
      const winnerId = primaryWinner || distributions[0]?.destination;

      // Calculate dynamic duration based on number of rockets
      // Rockets play sequentially: each takes 3000ms with 200ms gap between them
      // Formula: (n × 3000ms) + ((n-1) × 200ms) = total time for all rockets to finish
      // Example for 3 rockets: (3 × 3000) + (2 × 200) = 9400ms
      const GAP_BETWEEN_ROCKET_ANIMATIONS = 200;
      const rocketDuration =
        launchStackCount > 0
          ? launchStackCount * ANIMATION_DURATIONS.LAUNCH_STACK_WON_TOKEN_DURATION +
            (launchStackCount - 1) * GAP_BETWEEN_ROCKET_ANIMATIONS
          : ANIMATION_DURATIONS.WIN_ANIMATION;

      // Win confetti is now shown BEFORE effects in handleResolveTurn
      // so we skip showing it here to avoid duplicate confetti
      // Just clear accumulated effects if there's a winner
      if (winnerId) {
        get().clearAccumulatedEffects();
      }

      setTimeout(() => {
        // Start card collection animation (confetti already shown/cleared)
        set({
          collecting: { distributions, primaryWinner: winnerId },
          deckClickBlocked: true, // Block deck clicks during collection
        });

        // STAGE 3: Wait for animation, then distribute cards (or just clear states if visual-only)
        setTimeout(() => {
          const state = get();

          if (visualOnly) {
            // Visual-only mode: Decks already updated
            if (skipBoardClear) {
              // Skip board clearing - caller will handle it (e.g., stealCards)
              // This is a special effect collection, NOT the final turn collection
              // Keep deck blocked - it will be unblocked by the final turn collection
              set({ collecting: null });
            } else {
              // Clear all board states
              set({
                player: {
                  ...state.player,
                  playedCard: null,
                  playedCardsInHand: [],
                  currentTurnValue: 0,
                  activeEffects: [],
                  pendingTrackerBonus: 0,
                  pendingBlockerPenalty: 0,
                },
                cpu: {
                  ...state.cpu,
                  playedCard: null,
                  playedCardsInHand: [],
                  currentTurnValue: 0,
                  activeEffects: [],
                  pendingTrackerBonus: 0,
                  pendingBlockerPenalty: 0,
                },
                // Clear shown animation IDs when cards are collected
                shownAnimationCardIds: new Set(),
                cardsInPlay: [],
                // Reset turn states for new turn
                playerTurnState: 'normal',
                cpuTurnState: 'normal',
                anotherPlayExpected: false,
                collecting: null,
              });

              // Unblock deck clicks after a short delay
              setTimeout(() => {
                set({ deckClickBlocked: false, blockTransitions: false });
              }, 200);

              // Check win condition after all animations complete (rockets + collection)
              const hasWon = get().checkWinCondition();
              if (hasWon) {
                set({ shouldTransitionToWin: true });
                // Clear pre-reveal effects (like OWYW) - game is over, don't need them
                get().clearPreRevealEffects();
              }
            }

            // Call completion callback if set (for continuing effect processing)
            const callback = get().animationCompletionCallback;
            if (callback) {
              set({ animationCompletionCallback: null });
              callback();
            }
          } else {
            // Normal mode: Update decks and clear states
            // Group cards by destination
            const playerCards: Card[] = [];
            const cpuCards: Card[] = [];

            distributions.forEach(({ card, destination }) => {
              if (destination === 'player') {
                playerCards.push(card);
              } else {
                cpuCards.push(card);
              }
            });

            // Add cards to respective decks and clear all states
            set({
              player: {
                ...state.player,
                deck: [...state.player.deck, ...playerCards],
                playedCard: null,
                playedCardsInHand: [],
                currentTurnValue: 0,
                activeEffects: [],
                pendingTrackerBonus: 0,
                pendingBlockerPenalty: 0,
              },
              cpu: {
                ...state.cpu,
                deck: [...state.cpu.deck, ...cpuCards],
                playedCard: null,
                playedCardsInHand: [],
                currentTurnValue: 0,
                activeEffects: [],
                pendingTrackerBonus: 0,
                pendingBlockerPenalty: 0,
              },
              // Clear shown animation IDs when cards are collected
              shownAnimationCardIds: new Set(),
              cardsInPlay: [],
              // Reset turn states for new turn
              playerTurnState: 'normal',
              cpuTurnState: 'normal',
              anotherPlayExpected: false,
              collecting: null,
            });

            // Unblock deck clicks after a short delay
            setTimeout(() => {
              set({ deckClickBlocked: false });
            }, 200);

            // Check win condition after all animations complete (rockets + collection)
            const hasWon = get().checkWinCondition();
            if (hasWon) {
              set({ shouldTransitionToWin: true });
              // Clear pre-reveal effects (like OWYW) - game is over, don't need them
              get().clearPreRevealEffects();
            }
          }
        }, ANIMATION_DURATIONS.CARD_COLLECTION);
      }, rocketDuration); // Use dynamic duration based on number of rockets
    },

    /**
     * Backward compatibility wrapper - Converts old format to new CardDistribution format
     * @param winnerId - The player collecting the cards
     * @param cards - The cards being collected
     * @param launchStackCount - Number of launch stacks being collected
     */
    collectCards: (winnerId: PlayerType, cards: Card[], launchStackCount = 0) => {
      // Log collection
      get().logEvent(
        'COLLECT_CARDS',
        `${winnerId.toUpperCase()} collected ${cards.length} card(s)`,
        launchStackCount > 0 ? `Launch Stacks: ${launchStackCount}` : undefined,
        'success',
      );

      // Convert to new format - all cards from board go to winner
      const distributions: CardDistribution[] = cards.map((card) => ({
        card,
        destination: winnerId,
        source: { type: 'board' as const },
      }));

      get().collectCardsDistributed(distributions, winnerId, false, launchStackCount);
    },

    /**
     * Collects cards after all effects have been processed
     * @param winner - The winner of the turn (or 'tie')
     * @param launchStackCount - Number of launch stacks being collected
     */
    collectCardsAfterEffects: (winner: 'player' | 'cpu' | 'tie', launchStackCount = 0) => {
      if (winner === 'tie') {
        // Set flag for use-game-logic to detect and trigger Data War
        set({ needsDataWarAfterEffects: true });
        return;
      }

      // Don't collect cards if Temper Tantrum modal is active
      // Cards will be distributed manually after user selection
      if (get().showTemperTantrumModal) {
        return;
      }

      // Collect remaining cards in play after effects have been processed
      const { cardsInPlay } = get();
      if (cardsInPlay.length > 0) {
        get().collectCards(winner, cardsInPlay, launchStackCount);
      } else {
        // No cards left to collect (special effects collected them all)
        // But still need to unblock the deck since turn is over
        set({ deckClickBlocked: false });
      }
    },

    /**
     * Steals cards from one player to another
     * Used by Leveraged Buyout effect
     * @param from - The player to steal from
     * @param to - The player receiving the cards
     * @param count - Number of cards to steal
     */
    stealCards: (from: PlayerType, to: PlayerType, count: number) => {
      const fromPlayer = get()[from];
      const toPlayer = get()[to];
      const stolenCards = fromPlayer.deck.slice(0, count);
      const remainingCards = fromPlayer.deck.slice(count);

      // Update source deck and destination deck
      set({
        [from]: { ...fromPlayer, deck: remainingCards },
        [to]: { ...toPlayer, deck: [...toPlayer.deck, ...stolenCards] },
      });

      // Temporarily add stolen cards to the FROM player's playedCardsInHand (face-down)
      // This makes them visible on the board so they can be animated to the winner's deck
      const tempPlayedCards = stolenCards.map((card) => ({ card, isFaceDown: true }));

      set({
        [from]: {
          ...get()[from],
          playedCardsInHand: [...get()[from].playedCardsInHand, ...tempPlayedCards],
        },
      });

      // Create card distributions for animation
      const distributions: CardDistribution[] = stolenCards.map((card) => ({
        card,
        destination: to,
        source: {
          type: 'board' as const,
        },
      }));

      // Set callback to continue after animation
      // The animation will clear only the temporary cards, preserving played cards
      set({
        animationCompletionCallback: () => {
          // Remove only the stolen cards from playedCardsInHand, keep the original played cards
          const stolenIds = new Set(stolenCards.map((c) => c.id));
          const fromState = get()[from];
          set({
            [from]: {
              ...fromState,
              playedCardsInHand: fromState.playedCardsInHand.filter(
                (pcs) => !stolenIds.has(pcs.card.id),
              ),
            },
          });
          // Continue to next effect
          get().processNextEffect();
        },
      });

      // Trigger collection animation for stolen cards (skip board clear - we handle it in callback)
      get().collectCardsDistributed(distributions, to, true, 0, true);
    },
  };
}
