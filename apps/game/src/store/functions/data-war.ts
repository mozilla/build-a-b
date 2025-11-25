/**
 * Data War Functions
 * Handles Data War detection and logic for normal ties and Hostile Takeover cards
 */

import { shouldTriggerDataWar } from '@/utils/card-comparison';
import type { SetState, GetState } from '@/types';

export function createDataWarActions(set: SetState, get: GetState) {
  return {
    /**
     * Checks if a Data War should be triggered
     * Handles both normal Data Wars (ties) and Hostile Takeover Data Wars
     * @returns true if Data War should trigger, false otherwise
     */
    checkForDataWar: (): boolean => {
      const { player, cpu } = get();

      // Check for Hostile Takeover FIRST (before checking if both have cards)
      // When HT is played, only the HT player has a card initially
      const playerPlayedHt = player.playedCard?.specialType === 'hostile_takeover';
      const cpuPlayedHt = cpu.playedCard?.specialType === 'hostile_takeover';

      if (playerPlayedHt || cpuPlayedHt) {
        // Determine who played HT and who is the opponent
        const htPlayer = playerPlayedHt ? player : cpu;
        const opponent = playerPlayedHt ? cpu : player;
        const htPlayerKey = playerPlayedHt ? 'player' : 'cpu';
        const opponentKey = playerPlayedHt ? 'cpu' : 'player';

        // Check if opponent has enough cards for data war (3 face-down + 1 face-up = 4 cards)
        const cardsNeededForDataWar = 4;
        if (opponent.deck.length < cardsNeededForDataWar) {
          set({
            winner: playerPlayedHt ? 'player' : 'cpu',
            winCondition: 'all_cards',
            shouldTransitionToWin: true,
          });
          return false;
        }

        // Case 1: Initial HT play or HT as "another play"
        // HT player has more cards OR both have just 1 card (initial play)
        const isInitialPlay =
          htPlayer.playedCardsInHand.length <= 1 && opponent.playedCardsInHand.length <= 1;
        const htHasMore = htPlayer.playedCardsInHand.length > opponent.playedCardsInHand.length;

        if (isInitialPlay || htHasMore) {
          set({ hostileTakeoverDataWar: true });
          return true;
        }

        // Case 2: HT was played as face-up card in existing Data War
        // Both have multiple cards - opponent will play more cards on top
        if (htPlayer.playedCardsInHand.length === opponent.playedCardsInHand.length) {
          // Reset opponent's values but keep their cards on board:
          // - HT player keeps their value (6)
          // - Opponent's turn value resets to 0 (their tracker/blocker ignored)
          // - Opponent will play 3 face-down + 1 face-up on top of existing cards
          set({
            hostileTakeoverDataWar: true,
            [htPlayerKey]: {
              ...get()[htPlayerKey],
              currentTurnValue: 6, // HT value
            },
            [opponentKey]: {
              ...get()[opponentKey],
              currentTurnValue: 0, // Reset value (tracker/blocker ignored)
              pendingTrackerBonus: 0,
              pendingBlockerPenalty: 0,
              // Only clear tracker/blocker effects (HT ignores them), keep other effects
              activeEffects: get()[opponentKey].activeEffects.filter(
                (effect) => effect.type !== 'tracker' && effect.type !== 'blocker',
              ),
            },
          });

          return true;
        }

        // Case 3: Opponent has MORE cards - returning from HT Data War
        // HT data war is complete, check for normal tie
        set({ hostileTakeoverDataWar: false });
        if (player.playedCard && cpu.playedCard) {
          return player.currentTurnValue === cpu.currentTurnValue;
        }
        return false;
      }

      // For normal data war, both players must have played cards
      if (!player.playedCard || !cpu.playedCard) {
        return false;
      }

      // Check if this would be a tie (data war condition)
      const wouldTie = shouldTriggerDataWar(
        player.playedCard,
        cpu.playedCard,
        player.currentTurnValue,
        cpu.currentTurnValue,
      );

      // If it's a tie, check if both players have enough cards for data war
      if (wouldTie) {
        const cardsNeededForDataWar = 4;
        const playerNotEnoughCards = player.deck.length < cardsNeededForDataWar;
        const cpuNotEnoughCards = cpu.deck.length < cardsNeededForDataWar;

        if (playerNotEnoughCards || cpuNotEnoughCards) {
          // Player who doesn't have enough cards loses
          // If both don't have enough, the one with fewer cards loses
          let winner: 'player' | 'cpu';
          if (playerNotEnoughCards && cpuNotEnoughCards) {
            winner = player.deck.length < cpu.deck.length ? 'cpu' : 'player';
          } else {
            winner = playerNotEnoughCards ? 'cpu' : 'player';
          }
          set({
            winner,
            winCondition: 'all_cards',
            shouldTransitionToWin: true,
          });
          return false; // No data war - game over
        }
      }

      return wouldTie;
    },
  };
}
