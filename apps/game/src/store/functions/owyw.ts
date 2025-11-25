/**
 * Open What You Want (OWYW) Card Functions
 * Handles the OWYW card selection mechanic
 */

import type { Card, PlayerType, SetState, GetState } from '@/types';

export function createOWYWActions(set: SetState, get: GetState) {
  return {
    /**
     * Sets which player has OWYW active
     */
    setOpenWhatYouWantActive: (playerId: PlayerType | null) => {
      set({ openWhatYouWantActive: playerId });
    },

    /**
     * Prepares the top 3 cards from a player's deck for OWYW selection
     */
    prepareOpenWhatYouWantCards: (playerId: PlayerType) => {
      const player = get()[playerId];
      // Get top 3 cards from player's deck
      const top3Cards = player.deck.slice(0, 3);
      set({ openWhatYouWantCards: top3Cards });
    },

    /**
     * Handles card selection from OWYW modal
     * Selected card goes to top of deck, unselected cards shuffled to back
     */
    playSelectedCardFromOWYW: (selectedCard: Card) => {
      const playerId = get().openWhatYouWantActive;
      if (!playerId) return;

      const player = get()[playerId];
      const { openWhatYouWantCards } = get();

      // Remove selected card from deck
      const deckWithoutTop3 = player.deck.slice(3);

      // Get the 2 unselected cards and shuffle them
      const unselectedCards = openWhatYouWantCards.filter((c) => c.id !== selectedCard.id);
      const shuffledUnselected = [...unselectedCards].sort(() => Math.random() - 0.5);

      // Put unselected cards at the back of the deck
      const newDeck = [selectedCard, ...deckWithoutTop3, ...shuffledUnselected];

      // Update player state with reordered deck
      set({
        [playerId]: {
          ...player,
          deck: newDeck,
        },
      });

      // Clear OWYW cards and modal
      set({
        openWhatYouWantCards: [],
        showOpenWhatYouWantModal: false,
      });

      // Note: The selected card is now at the top of the deck
      // It will be played during the normal revealing phase
    },

    /**
     * Shows/hides the OWYW modal
     */
    setShowOpenWhatYouWantModal: (show: boolean) => {
      set({ showOpenWhatYouWantModal: show });
    },

    /**
     * Shows/hides the OWYW animation
     */
    setShowOpenWhatYouWantAnimation: (show: boolean) => {
      set({ showOpenWhatYouWantAnimation: show });
    },
  };
}
