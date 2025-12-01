/**
 * Data Grab Mini-Game Functions
 * Handles the Data Grab mini-game state and logic
 */

import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import { DATA_GRAB_CONFIG } from '@/config/data-grab-config';
import type { PlayerType, CardDistribution, SetState, GetState } from '@/types';

export function createDataGrabActions(set: SetState, get: GetState) {
  return {
    /**
     * Checks if Data Grab should trigger
     * @returns true if Data Grab should trigger, false otherwise
     */
    checkForDataGrab: (): boolean => {
      const { player, cpu } = get();

      // Check if either player played a Data Grab card
      const playerPlayedDataGrab = player.playedCard?.specialType === 'data_grab';
      const cpuPlayedDataGrab = cpu.playedCard?.specialType === 'data_grab';

      // Check if minimum cards requirement is met (count all played cards from both players)
      const totalCardsInPlay = player.playedCardsInHand.length + cpu.playedCardsInHand.length;
      const hasMinimumCards = totalCardsInPlay >= DATA_GRAB_CONFIG.MIN_CARDS_IN_PLAY;

      // Data Grab triggers if:
      // 1. Either player played a Data Grab card, AND
      // 2. There are at least MIN_CARDS_IN_PLAY cards in play
      return (playerPlayedDataGrab || cpuPlayedDataGrab) && hasMinimumCards;
    },

    /**
     * Initializes Data Grab state with all cards in play
     * Clears playedCardsInHand since those cards are now in the mini-game
     */
    initializeDataGrab: () => {
      const { player, cpu } = get();

      // Collect all played cards from both players, preserving face-up/face-down state
      const allPlayedCards = [...player.playedCardsInHand, ...cpu.playedCardsInHand];

      // Initialize Data Grab with all cards in play (with face-up/down state preserved)
      // Clear playedCardsInHand since those cards are now in the mini-game
      set({
        dataGrabActive: true,
        dataGrabCards: allPlayedCards,
        dataGrabCollectedByPlayer: [],
        dataGrabCollectedByCPU: [],
        dataGrabDistributions: [],
        showDataGrabTakeover: true,
        dataGrabGameActive: false,
        showDataGrabResults: false,
        player: {
          ...player,
          playedCardsInHand: [], // Clear to prevent double collection
        },
        cpu: {
          ...cpu,
          playedCardsInHand: [], // Clear to prevent double collection
        },
      });
    },

    /**
     * Starts the Data Grab mini-game
     * Hides takeover screen and activates the game
     */
    startDataGrabGame: () => {
      set({
        showDataGrabTakeover: false,
        dataGrabGameActive: true,
      });
    },

    /**
     * Records a card collection during Data Grab
     * @param cardId - The ID of the card being collected
     * @param collectedBy - Which player collected the card
     */
    collectDataGrabCard: (cardId: string, collectedBy: PlayerType) => {
      const { dataGrabCards, dataGrabCollectedByPlayer, dataGrabCollectedByCPU } = get();

      // Find the played card state
      const playedCardState = dataGrabCards.find((pcs) => pcs.card.id === cardId);
      if (!playedCardState) {
        return;
      }

      // Check if already collected
      const alreadyCollected =
        dataGrabCollectedByPlayer.some((pcs) => pcs.card.id === cardId) ||
        dataGrabCollectedByCPU.some((pcs) => pcs.card.id === cardId);

      if (alreadyCollected) {
        return;
      }

      // Add to appropriate collection (do NOT remove from dataGrabCards)
      if (collectedBy === 'player') {
        set({
          dataGrabCollectedByPlayer: [...dataGrabCollectedByPlayer, playedCardState],
        });
      } else {
        set({
          dataGrabCollectedByCPU: [...dataGrabCollectedByCPU, playedCardState],
        });
      }
    },

    /**
     * Finalizes Data Grab results
     * Distributes cards to players, handles Launch Stacks, and prepares animations
     */
    finalizeDataGrabResults: () => {
      const { dataGrabCards, dataGrabCollectedByPlayer, dataGrabCollectedByCPU } = get();

      // Get IDs of already collected cards
      const collectedIds = new Set([
        ...dataGrabCollectedByPlayer.map((pcs) => pcs.card.id),
        ...dataGrabCollectedByCPU.map((pcs) => pcs.card.id),
      ]);

      // Filter out cards that were already collected
      const missedCards = dataGrabCards.filter((pcs) => !collectedIds.has(pcs.card.id));

      const updatedPlayerCards = [...dataGrabCollectedByPlayer];
      const updatedCPUCards = [...dataGrabCollectedByCPU];

      // All missed cards go to CPU
      missedCards.forEach((playedCardState) => {
        updatedCPUCards.push(playedCardState);
      });

      // Separate Launch Stacks from regular cards for each player
      // IMPORTANT: Only face-up launch stacks count toward launch stack counter
      // Face-down launch stacks are treated as regular cards
      const playerLaunchStacks = updatedPlayerCards.filter(
        (pcs) => pcs.card.specialType === 'launch_stack' && !pcs.isFaceDown,
      );
      const playerRegularCards = updatedPlayerCards.filter(
        (pcs) => pcs.card.specialType !== 'launch_stack' || pcs.isFaceDown,
      );
      const cpuLaunchStacks = updatedCPUCards.filter(
        (pcs) => pcs.card.specialType === 'launch_stack' && !pcs.isFaceDown,
      );
      const cpuRegularCards = updatedCPUCards.filter(
        (pcs) => pcs.card.specialType !== 'launch_stack' || pcs.isFaceDown,
      );

      // Extract Card objects for main deck updates (excluding Launch Stacks)
      const playerCards = playerRegularCards.map((pcs) => pcs.card);
      const cpuCards = cpuRegularCards.map((pcs) => pcs.card);

      // Rebuild complete card lists (for display and animation)
      const finalPlayerCards = [...playerRegularCards, ...playerLaunchStacks];
      const finalCPUCards = [...cpuRegularCards, ...cpuLaunchStacks];

      // Get current state for deck updates
      const state = get();

      // Create card distributions for visual animation
      // Cards go exactly where they were collected during Data Grab
      const distributions: CardDistribution[] = [
        // Player's regular cards
        ...playerRegularCards.map((pcs) => ({
          card: pcs.card,
          source: { type: 'board' as const },
          destination: 'player' as const,
        })),
        // CPU's regular cards
        ...cpuRegularCards.map((pcs) => ({
          card: pcs.card,
          source: { type: 'board' as const },
          destination: 'cpu' as const,
        })),
        // Player's Launch Stacks
        ...playerLaunchStacks.map((pcs) => ({
          card: pcs.card,
          source: { type: 'board' as const },
          destination: 'player' as const,
        })),
        // CPU's Launch Stacks
        ...cpuLaunchStacks.map((pcs) => ({
          card: pcs.card,
          source: { type: 'board' as const },
          destination: 'cpu' as const,
        })),
      ];

      // UPDATE MAIN DECKS IMMEDIATELY (math/logic happens now)
      // Open modal FIRST, then delay card restoration
      set({
        player: {
          ...state.player,
          deck: [...state.player.deck, ...playerCards], // Only regular cards, not Launch Stacks
          playedCard: null,
          playedCardsInHand: [], // Don't restore yet - will do after modal opens
          currentTurnValue: 0,
          pendingTrackerBonus: 0,
          pendingBlockerPenalty: 0,
        },
        cpu: {
          ...state.cpu,
          deck: [...state.cpu.deck, ...cpuCards], // Only regular cards, not Launch Stacks
          playedCard: null,
          playedCardsInHand: [], // Don't restore yet - will do after modal opens
          currentTurnValue: 0,
          pendingBlockerPenalty: 0,
          pendingTrackerBonus: 0,
        },
        dataGrabCollectedByPlayer: updatedPlayerCards, // Store for modal display
        dataGrabCollectedByCPU: updatedCPUCards, // Store for modal display
        dataGrabGameActive: false,
        showDataGrabResults: true, // Modal opens immediately
        blockTransitions: true, // Block deck clicks while modal is open and during collection
        cardsInPlay: [], // Don't add yet - will do after modal opens
        anotherPlayExpected: false,
        // Store distributions AND Launch Stacks for processing after modal closes
        dataGrabDistributions: distributions,
        dataGrabPlayerLaunchStacks: playerLaunchStacks,
        dataGrabCPULaunchStacks: cpuLaunchStacks,
      });

      // Delay card restoration so modal opens first, then cards animate behind it
      setTimeout(() => {
        set({
          player: {
            ...get().player,
            playedCardsInHand: finalPlayerCards, // Restore collected cards to tableau
          },
          cpu: {
            ...get().cpu,
            playedCardsInHand: finalCPUCards, // Restore collected cards to tableau
          },
          cardsInPlay: [...finalPlayerCards, ...finalCPUCards].map((pcs) => pcs.card),
        });
      }, ANIMATION_DURATIONS.DATA_GRAB_CARD_RESTORE_DELAY); // 150ms delay for modal to start opening

      // Remove special effect cards from pending effects (except Launch Stacks)
      // Launch Stacks keep their effects for rocket animations
      // All other special effects (Temper Tantrum, Patent Theft, etc.) are removed
      // so they don't animate/process after Data Grab closes
      const allFaceDownLaunchStacks = [
        ...updatedPlayerCards.filter(
          (pcs) => pcs.card.specialType === 'launch_stack' && pcs.isFaceDown,
        ),
        ...updatedCPUCards.filter(
          (pcs) => pcs.card.specialType === 'launch_stack' && pcs.isFaceDown,
        ),
      ];

      const faceDownLaunchStackIds = new Set(allFaceDownLaunchStacks.map((pcs) => pcs.card.id));

      // Special effect types to remove (all except launch_stack)
      const specialEffectTypes = [
        'data_grab',
        'temper_tantrum',
        'patent_theft',
        'leveraged_buyout',
        'mandatory_recall',
        'forced_empathy',
        'tracker_smacker',
        'hostile_takeover',
        'open_what_you_want',
      ];

      const updatedEffects = get().pendingEffects.filter(
        (e) =>
          !specialEffectTypes.includes(e.type) &&
          !(e.type === 'launch_stack' && faceDownLaunchStackIds.has(e.card.id)),
      );

      set({ pendingEffects: updatedEffects });
    },

    /**
     * Shows/hides Data Grab takeover screen
     */
    setShowDataGrabTakeover: (show: boolean) => {
      set({ showDataGrabTakeover: show });
    },

    /**
     * Sets Data Grab game active state
     */
    setDataGrabGameActive: (active: boolean) => {
      set({ dataGrabGameActive: active });
    },

    /**
     * Shows/hides Data Grab results modal
     */
    setShowDataGrabResults: (show: boolean) => {
      set({ showDataGrabResults: show });

      // Reset Data Grab state when closing results
      // NOTE: Don't clear dataGrabCollectedByPlayer/CPU here - they're needed for animation
      // They'll be cleared after the animation completes in the state machine
      if (!show) {
        set({
          dataGrabActive: false,
          dataGrabCards: [],
          // dataGrabCollectedByPlayer: [],  // Keep for animation
          // dataGrabCollectedByCPU: [],     // Keep for animation
        });
      }
    },

    /**
     * Shows/hides Data Grab cookie decorations (debug option)
     */
    setShowDataGrabCookies: (show: boolean) => {
      set({ showDataGrabCookies: show });
    },
  };
}
