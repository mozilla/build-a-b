/**
 * Temper Tantrum Card Functions
 * Handles the Temper Tantrum card selection modal and card stealing logic
 */

import type { Card, PlayerType, CardDistribution, SetState, GetState } from '@/types';

export function createTemperTantrumActions(set: SetState, get: GetState) {
  return {
    /**
     * Initializes the Temper Tantrum selection modal
     * Winner selects up to 2 cards from their own cards to keep
     * @param winner - The player who won the turn
     */
    initializeTemperTantrumSelection: (winner: 'player' | 'cpu') => {
      const state = get();
      const loser = winner === 'player' ? 'cpu' : 'player';

      // Get cards from BOTH players (extract Card from PlayedCardState)
      const winnerCards = state[winner].playedCardsInHand.map((pcs) => pcs.card);
      const loserCards = state[loser].playedCardsInHand.map((pcs) => pcs.card);
      const maxSelections = Math.min(2, winnerCards.length);

      // Extract face-down card IDs from winner's cards (only winner's cards are shown in modal)
      const faceDownCardIds = new Set(
        state[winner].playedCardsInHand.filter((pcs) => pcs.isFaceDown).map((pcs) => pcs.card.id),
      );

      set({
        showTemperTantrumModal: true,
        temperTantrumAvailableCards: [...winnerCards], // Only winner's cards shown in modal
        temperTantrumSelectedCards: [],
        temperTantrumMaxSelections: maxSelections,
        temperTantrumWinner: winner,
        temperTantrumLoserCards: [...loserCards], // Store loser's cards for later distribution
        temperTantrumFaceDownCardIds: faceDownCardIds,
        blockTransitions: true, // Pause game while modal is open
      });
    },

    /**
     * Selects or deselects a card in the Temper Tantrum modal
     * @param card - The card to select/deselect
     */
    selectTemperTantrumCard: (card: Card) => {
      const { temperTantrumSelectedCards, temperTantrumMaxSelections } = get();

      // Check if card is already selected
      const isSelected = temperTantrumSelectedCards.some((c) => c.id === card.id);

      if (isSelected) {
        // Deselect card
        const newSelected = temperTantrumSelectedCards.filter((c) => c.id !== card.id);
        set({ temperTantrumSelectedCards: newSelected });
      } else {
        // Select card (if not at max)
        if (temperTantrumSelectedCards.length < temperTantrumMaxSelections) {
          set({
            temperTantrumSelectedCards: [...temperTantrumSelectedCards, card],
          });
        }
      }
    },

    /**
     * Confirms the Temper Tantrum card selection
     * Unselected cards from winner are stolen and given to the loser
     */
    confirmTemperTantrumSelection: () => {
      const { temperTantrumSelectedCards, temperTantrumWinner } = get();

      if (!temperTantrumWinner) return;

      const winner = temperTantrumWinner;
      const loser: PlayerType = winner === 'player' ? 'cpu' : 'player';

      // Separate stolen cards into Launch Stacks and regular cards
      const stolenCards = temperTantrumSelectedCards;
      const stolenLaunchStacks = stolenCards.filter((card) => card.specialType === 'launch_stack');
      const stolenRegularCards = stolenCards.filter((card) => card.specialType !== 'launch_stack');

      // Build distribution array for Tantrum animation - ALL stolen cards
      // They animate from board to loser's deck area
      const distributions: CardDistribution[] = stolenCards.map((card) => ({
        card,
        destination: loser,
        source: { type: 'board' as const },
      }));

      // UPDATE DECK for stolen regular cards only
      // NOTE: Stolen Launch Stacks are handled by processNextEffect after takeover animation
      // NOTE: Remaining cards (winner's + loser's original) are handled by collectCardsAfterEffects
      const state = get();

      // Remove ALL stolen cards from cardsInPlay so they don't get collected again
      // (regular cards animate now, launch stacks animate during takeover)
      const stolenCardIds = new Set(stolenCards.map((c) => c.id));
      const updatedCardsInPlay = state.cardsInPlay.filter((card) => !stolenCardIds.has(card.id));

      set({
        player: {
          ...state.player,
          deck:
            loser === 'player' ? [...state.player.deck, ...stolenRegularCards] : state.player.deck,
          // NOTE: Don't clear playedCardsInHand here - collectCardsDistributed needs them for animation
        },
        cpu: {
          ...state.cpu,
          deck: loser === 'cpu' ? [...state.cpu.deck, ...stolenRegularCards] : state.cpu.deck,
          // NOTE: Don't clear playedCardsInHand here - collectCardsDistributed needs them for animation
        },
        cardsInPlay: updatedCardsInPlay,
      });

      // Close modal and clear state
      set({
        showTemperTantrumModal: false,
        temperTantrumAvailableCards: [],
        temperTantrumSelectedCards: [],
        temperTantrumLoserCards: [],
        temperTantrumWinner: null,
        temperTantrumFaceDownCardIds: new Set(),
        blockTransitions: false,
      });

      // Set destination override for stolen Launch Stacks so they go to loser (Tantrum player)
      const stolenLaunchStackIds = new Set(stolenLaunchStacks.map((ls) => ls.id));
      const currentQueue = get().effectsQueue;

      // Find which stolen Launch Stacks are in the queue (face-up ones)
      const launchStacksInQueue = new Set(
        currentQueue
          .filter((e) => e.type === 'launch_stack' && stolenLaunchStackIds.has(e.card.id))
          .map((e) => e.card.id),
      );

      // Face-down Launch Stacks won't be in the queue - add them directly to deck
      const faceDownStolenLaunchStacks = stolenLaunchStacks.filter(
        (ls) => !launchStacksInQueue.has(ls.id),
      );

      if (faceDownStolenLaunchStacks.length > 0) {
        const currentState = get();
        set({
          player: {
            ...currentState.player,
            deck:
              loser === 'player'
                ? [...currentState.player.deck, ...faceDownStolenLaunchStacks]
                : currentState.player.deck,
          },
          cpu: {
            ...currentState.cpu,
            deck:
              loser === 'cpu'
                ? [...currentState.cpu.deck, ...faceDownStolenLaunchStacks]
                : currentState.cpu.deck,
          },
        });
      }

      const updatedQueue = currentQueue.map((e) => {
        if (e.type === 'launch_stack' && stolenLaunchStackIds.has(e.card.id)) {
          // Override destination - stolen launch stacks go to loser instead of winner
          return { ...e, destinationOverride: loser };
        }
        return e;
      });
      set({ effectsQueue: updatedQueue });

      // Set callback to continue processing after card animation completes
      set({
        animationCompletionCallback: () => {
          // Remove stolen cards from playedCardsInHand so they don't reappear
          const currentState = get();
          set({
            player: {
              ...currentState.player,
              playedCardsInHand: currentState.player.playedCardsInHand.filter(
                (pcs) => !stolenCardIds.has(pcs.card.id),
              ),
            },
            cpu: {
              ...currentState.cpu,
              playedCardsInHand: currentState.cpu.playedCardsInHand.filter(
                (pcs) => !stolenCardIds.has(pcs.card.id),
              ),
            },
          });
          get().processNextEffect();
        },
      });

      // Use visual-only collection animation for Tantrum cards (decks already updated)
      // skipBoardClear=true keeps remaining cards on the board for later collection
      get().collectCardsDistributed(distributions, winner, true, 0, true);
    },

    /**
     * Shows/hides the Temper Tantrum modal
     */
    setShowTemperTantrumModal: (show: boolean) => {
      set({ showTemperTantrumModal: show });
    },
  };
}
