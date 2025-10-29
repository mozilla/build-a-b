/**
 * Zustand Store - Game Data Management
 * Manages all game state data (cards, players, UI state)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import type { Card, Player, PlayerType, PreRevealEffect, SpecialEffect } from '../types';
import { initializeGameDeck, type DeckOrderStrategy } from '../utils/deck-builder';
import { DEFAULT_GAME_CONFIG } from '../config/game-config';
import { ANIMATION_DURATIONS } from '../config/animation-timings';
import {
  compareCards,
  applyTrackerModifier,
  applyBlockerModifier,
  isEffectBlocked,
  shouldTriggerDataWar,
} from '../utils/card-comparison';

interface GameStore {
  // Player State
  player: Player;
  cpu: Player;

  // Game State
  cardsInPlay: Card[];
  activePlayer: PlayerType;
  anotherPlayMode: boolean; // True when only activePlayer should play (tracker/blocker/launch_stack)
  pendingEffects: SpecialEffect[];
  preRevealEffects: PreRevealEffect[]; // Queue of effects to process before reveal
  preRevealProcessed: boolean; // Flag to prevent duplicate pre-reveal processing
  trackerSmackerActive: PlayerType | null;
  winner: PlayerType | null;
  winCondition: 'all_cards' | 'launch_stacks' | null;

  // Open What You Want State
  openWhatYouWantActive: PlayerType | null;
  openWhatYouWantCards: Card[]; // Top 3 cards for selection
  showOpenWhatYouWantModal: boolean;
  showOpenWhatYouWantAnimation: boolean; // Shows during 2-second transition

  // Forced Empathy State
  forcedEmpathySwapping: boolean; // True when decks are actively animating
  decksVisuallySwapped: boolean;  // True when decks should stay in swapped positions

  // UI State
  selectedBillionaire: string;
  selectedBackground: string;
  isPaused: boolean;
  showMenu: boolean;
  showHandViewer: boolean;
  handViewerPlayer: PlayerType;
  showInstructions: boolean;
  audioEnabled: boolean;
  showTooltip: boolean;

  // Actions - Game Logic
  initializeGame: (
    playerStrategy?: DeckOrderStrategy,
    cpuStrategy?: DeckOrderStrategy,
    mirrorDecks?: boolean,
    orderBeforeDealing?: boolean,
  ) => void;
  playCard: (playerId: PlayerType) => void;
  collectCards: (winnerId: PlayerType, cards: Card[]) => void;
  addLaunchStack: (playerId: PlayerType) => void;
  swapDecks: () => void;
  stealCards: (from: PlayerType, to: PlayerType, count: number) => void;
  checkWinCondition: () => boolean;
  setActivePlayer: (playerId: PlayerType) => void;
  setAnotherPlayMode: (enabled: boolean) => void;

  // Actions - Turn Resolution
  resolveTurn: () => PlayerType | 'tie';
  collectCardsAfterEffects: (winner: PlayerType | 'tie') => void;
  applyTrackerEffect: (playerId: PlayerType, trackerCard: Card) => void;
  applyBlockerEffect: (playerId: PlayerType, blockerCard: Card) => void;
  checkForDataWar: () => boolean;
  handleCardEffect: (card: Card, playedBy: PlayerType) => void;

  // Actions - Special Effects
  addPendingEffect: (effect: SpecialEffect) => void;
  clearPendingEffects: () => void;
  processPendingEffects: (winner: PlayerType | 'tie') => void;
  addPreRevealEffect: (effect: PreRevealEffect) => void;
  clearPreRevealEffects: () => void;
  hasPreRevealEffects: () => boolean;
  setPreRevealProcessed: (processed: boolean) => void;
  setTrackerSmackerActive: (playerId: PlayerType | null) => void;
  stealLaunchStack: (from: PlayerType, to: PlayerType) => void;
  removeLaunchStacks: (playerId: PlayerType, count: number) => void;
  reorderTopCards: (playerId: PlayerType, cards: Card[]) => void;

  // Open What You Want Actions
  setOpenWhatYouWantActive: (playerId: PlayerType | null) => void;
  prepareOpenWhatYouWantCards: (playerId: PlayerType) => void;
  playSelectedCardFromOWYW: (selectedCard: Card) => void;
  setShowOpenWhatYouWantModal: (show: boolean) => void;
  setShowOpenWhatYouWantAnimation: (show: boolean) => void;

  // Forced Empathy Actions
  setForcedEmpathySwapping: (swapping: boolean) => void;
  setDecksVisuallySwapped: (swapped: boolean) => void;

  // Actions - UI
  selectBillionaire: (billionaire: string) => void;
  selectBackground: (background: string) => void;
  togglePause: () => void;
  toggleMenu: () => void;
  toggleHandViewer: (player?: PlayerType) => void;
  toggleAudio: () => void;
  toggleInstructions: () => void;
  setShowTooltip: (show: boolean) => void;
  resetGame: (
    playerStrategy?: DeckOrderStrategy,
    cpuStrategy?: DeckOrderStrategy,
    mirrorDecks?: boolean,
    orderBeforeDealing?: boolean,
  ) => void;
}

const createInitialPlayer = (id: PlayerType): Player => ({
  id,
  name: id === 'player' ? 'Player' : 'CPU',
  deck: [],
  playedCard: null,
  playedCardsInHand: [],
  currentTurnValue: 0,
  launchStackCount: 0,
});

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      player: createInitialPlayer('player'),
      cpu: createInitialPlayer('cpu'),
      cardsInPlay: [],
      activePlayer: 'player',
      anotherPlayMode: false,
      pendingEffects: [],
      preRevealEffects: [],
      preRevealProcessed: false,
      trackerSmackerActive: null,
      winner: null,
      winCondition: null,
      openWhatYouWantActive: null,
      openWhatYouWantCards: [],
      showOpenWhatYouWantModal: false,
      showOpenWhatYouWantAnimation: false,
      forcedEmpathySwapping: false,
      decksVisuallySwapped: false,
      selectedBillionaire: '',
      selectedBackground: '',
      isPaused: false,
      showMenu: false,
      showHandViewer: false,
      handViewerPlayer: 'player',
      showInstructions: false,
      audioEnabled: true,
      showTooltip: false,

      // Game Logic Actions
      initializeGame: (
        playerStrategy = 'random',
        cpuStrategy = 'random',
        mirrorDecks = false,
        orderBeforeDealing = false,
      ) => {
        const { playerDeck, cpuDeck } = initializeGameDeck(
          DEFAULT_GAME_CONFIG,
          playerStrategy,
          cpuStrategy,
          mirrorDecks,
          orderBeforeDealing,
        );
        set({
          player: { ...createInitialPlayer('player'), deck: playerDeck },
          cpu: { ...createInitialPlayer('cpu'), deck: cpuDeck },
          cardsInPlay: [],
          winner: null,
          winCondition: null,
          activePlayer: 'player',
          anotherPlayMode: false,
          pendingEffects: [],
          trackerSmackerActive: null,
          forcedEmpathySwapping: false,
          decksVisuallySwapped: false,
        });
      },

      playCard: (playerId) => {
        const playerState = get()[playerId];
        const [card, ...remainingDeck] = playerState.deck;

        if (!card) {
          // This shouldn't happen - win condition should have caught it before calling playCard
          if (import.meta.env.DEV) {
            console.error(
              `[BUG] playCard called for ${playerId} with empty deck - win condition should have prevented this`,
            );
          }
          return;
        }

        // In "another play" mode, ADD to existing value
        // In normal mode, SET the value
        const newTurnValue = get().anotherPlayMode
          ? playerState.currentTurnValue + card.value
          : card.value;

        const newPlayedCardsInHand = [
          ...playerState.playedCardsInHand,
          { card, isFaceDown: false },
        ];

        set({
          [playerId]: {
            ...playerState,
            playedCard: card,
            playedCardsInHand: newPlayedCardsInHand,
            deck: remainingDeck,
            currentTurnValue: newTurnValue,
          },
          cardsInPlay: [...get().cardsInPlay, card],
        });
      },

      collectCards: (winnerId, cards) => {
        const winner = get()[winnerId];
        set({
          [winnerId]: {
            ...winner,
            deck: [...winner.deck, ...(cards || [])], // Add to bottom of deck
            playedCard: null,
            playedCardsInHand: [], // Clear hand stack
            currentTurnValue: 0,
          },
          cardsInPlay: [],
        });

        // Also clear the loser's played card and hand stack
        const loserId = winnerId === 'player' ? 'cpu' : 'player';
        const loser = get()[loserId];
        set({
          [loserId]: {
            ...loser,
            playedCard: null,
            playedCardsInHand: [], // Clear hand stack
            currentTurnValue: 0,
          },
        });
      },

      addLaunchStack: (playerId) => {
        const player = get()[playerId];
        const newCount = player.launchStackCount + 1;

        set({
          [playerId]: {
            ...player,
            launchStackCount: newCount,
          },
        });

        // Check win condition
        if (newCount >= DEFAULT_GAME_CONFIG.launchStacksToWin) {
          set({ winner: playerId, winCondition: 'launch_stacks' });
        }
      },

      swapDecks: () => {
        const { player, cpu } = get();
        set({
          player: { ...player, deck: cpu.deck },
          cpu: { ...cpu, deck: player.deck },
        });
      },

      stealCards: (from, to, count) => {
        const fromPlayer = get()[from];
        const toPlayer = get()[to];
        const stolenCards = fromPlayer.deck.slice(0, count);
        const remainingCards = fromPlayer.deck.slice(count);

        set({
          [from]: { ...fromPlayer, deck: remainingCards },
          [to]: { ...toPlayer, deck: [...toPlayer.deck, ...stolenCards] },
        });
      },

      checkWinCondition: () => {
        const { player, cpu, winner, winCondition } = get();

        // If already won, return true
        if (winner !== null && winCondition !== null) {
          return true;
        }

        // Check if player has all cards
        if (cpu.deck.length === 0 && cpu.playedCard === null) {
          set({ winner: 'player', winCondition: 'all_cards' });
          return true;
        }

        // Check if CPU has all cards
        if (player.deck.length === 0 && player.playedCard === null) {
          set({ winner: 'cpu', winCondition: 'all_cards' });
          return true;
        }

        // Check launch stacks (already handled in addLaunchStack)
        if (player.launchStackCount >= DEFAULT_GAME_CONFIG.launchStacksToWin) {
          set({ winner: 'player', winCondition: 'launch_stacks' });
          return true;
        }

        if (cpu.launchStackCount >= DEFAULT_GAME_CONFIG.launchStacksToWin) {
          set({ winner: 'cpu', winCondition: 'launch_stacks' });
          return true;
        }

        return false;
      },

      setActivePlayer: (playerId) => {
        set({ activePlayer: playerId });
      },

      setAnotherPlayMode: (enabled) => {
        set({ anotherPlayMode: enabled });
      },

      // Turn Resolution Actions
      resolveTurn: () => {
        const { player, cpu } = get();

        // Compare current turn values (already modified by trackers/blockers)
        const result = compareCards(player, cpu);

        // Return winner WITHOUT collecting cards yet
        // Cards will be collected after processing pending effects
        return result.winner;
      },

      collectCardsAfterEffects: (winner: 'player' | 'cpu' | 'tie') => {
        if (winner === 'tie') {
          return;
        }

        // Collect remaining cards in play after effects have been processed
        const { cardsInPlay } = get();
        if (cardsInPlay.length > 0) {
          get().collectCards(winner, cardsInPlay);
        }
      },

      applyTrackerEffect: (playerId, trackerCard) => {
        const player = get()[playerId];

        // Check if effect is blocked by Tracker Smacker
        if (isEffectBlocked(get().trackerSmackerActive, playerId)) {
          return;
        }

        // Apply tracker modifier (add tracker value to turn total)
        const newValue = applyTrackerModifier(player.currentTurnValue, trackerCard);

        set({
          [playerId]: {
            ...player,
            currentTurnValue: newValue,
          },
        });
      },

      applyBlockerEffect: (playerId, blockerCard) => {
        // Blocker affects the opponent
        const opponentId = playerId === 'player' ? 'cpu' : 'player';
        const opponent = get()[opponentId];

        // Check if effect is blocked by Tracker Smacker
        if (isEffectBlocked(get().trackerSmackerActive, playerId)) {
          return;
        }

        // Apply blocker modifier (subtract from opponent's turn value)
        const newValue = applyBlockerModifier(opponent.currentTurnValue, blockerCard);

        set({
          [opponentId]: {
            ...opponent,
            currentTurnValue: newValue,
          },
        });
      },

      checkForDataWar: () => {
        const { player, cpu } = get();

        if (!player.playedCard || !cpu.playedCard) {
          return false;
        }

        return shouldTriggerDataWar(
          player.playedCard,
          cpu.playedCard,
          player.currentTurnValue,
          cpu.currentTurnValue,
        );
      },

      handleCardEffect: (card, playedBy) => {
        // Handle special card effects
        if (!card.isSpecial || !card.specialType) {
          return;
        }

        // Create special effect
        const effect: SpecialEffect = {
          type: card.specialType,
          playedBy,
          card,
          isInstant: ['forced_empathy', 'tracker_smacker', 'hostile_takeover'].includes(
            card.specialType,
          ),
        };

        // If instant effect, we'll handle it immediately in the machine
        // Otherwise, add to pending effects queue
        if (!effect.isInstant) {
          get().addPendingEffect(effect);
        }

        // Handle specific effects
        switch (card.specialType) {
          case 'tracker':
            // Tracker value is already added by playCard
            // The "another play" trigger is handled in handleResolveTurn
            // Check if effect is blocked by Tracker Smacker
            if (!isEffectBlocked(get().trackerSmackerActive, playedBy)) {
              // Tracker effect is allowed (will trigger another play)
            }
            break;
          case 'blocker':
            get().applyBlockerEffect(playedBy, card);
            break;
          case 'launch_stack':
            get().addLaunchStack(playedBy);
            break;
          case 'tracker_smacker':
            get().setTrackerSmackerActive(playedBy);
            break;
          case 'forced_empathy':
            // Trigger animation - this will visually swap the decks
            get().setForcedEmpathySwapping(true);

            // Wait for animation to complete, then swap the actual deck data
            // The visual animation shows decks swapping positions
            // At the end, we swap the data so they're back at their original positions with swapped data
            setTimeout(() => {
              get().swapDecks();
              // Toggle the visual swap state to keep decks in swapped positions
              get().setDecksVisuallySwapped(!get().decksVisuallySwapped);
              // Reset animation state (but keep visual swap active)
              get().setForcedEmpathySwapping(false);
            }, ANIMATION_DURATIONS.FORCED_EMPATHY_SWAP);
            break;
          // Other effects will be handled when processing pending effects
        }
      },

      // Special Effects Actions
      addPendingEffect: (effect) => {
        set({ pendingEffects: [...get().pendingEffects, effect] });
      },

      clearPendingEffects: () => {
        set({ pendingEffects: [] });
      },

      addPreRevealEffect: (effect) => {
        set({ preRevealEffects: [...get().preRevealEffects, effect] });
      },

      clearPreRevealEffects: () => {
        set({ preRevealEffects: [] });
      },

      hasPreRevealEffects: () => {
        return get().preRevealEffects.length > 0;
      },

      setPreRevealProcessed: (processed) => {
        set({ preRevealProcessed: processed });
      },

      setTrackerSmackerActive: (playerId) => {
        set({ trackerSmackerActive: playerId });
      },

      processPendingEffects: (winner) => {
        const { pendingEffects } = get();

        // Process each pending effect
        for (const effect of pendingEffects) {
          // Check if effect is blocked by Tracker Smacker
          if (
            isEffectBlocked(get().trackerSmackerActive, effect.playedBy) &&
            (effect.type === 'tracker' ||
              effect.type === 'leveraged_buyout' ||
              effect.type === 'patent_theft' ||
              effect.type === 'temper_tantrum')
          ) {
            continue;
          }

          switch (effect.type) {
            case 'open_what_you_want':
              // Mark that OWYW is active for this player's next turn
              get().setOpenWhatYouWantActive(effect.playedBy);

              // Queue pre-reveal effect for next turn (animation + modal)
              // Only player requires interaction (tap to see cards)
              get().addPreRevealEffect({
                type: 'owyw',
                playerId: effect.playedBy,
                requiresInteraction: effect.playedBy === 'player', // Only player needs to tap
              });
              break;

            case 'mandatory_recall':
              // If the player who played this card won, opponents shuffle Launch Stacks back
              if (winner === effect.playedBy) {
                const opponentId = effect.playedBy === 'player' ? 'cpu' : 'player';
                get().removeLaunchStacks(opponentId, get()[opponentId].launchStackCount);
              }
              break;

            case 'temper_tantrum':
              // If the player who played this card LOST, steal 2 cards from winner's win pile
              if (winner !== 'tie' && winner !== effect.playedBy) {
                // Steal from the cards that were just won (cardsInPlay)
                const cardsToSteal = get().cardsInPlay.slice(0, 2);
                if (cardsToSteal.length > 0) {
                  // Add stolen cards to loser's deck
                  const loser = get()[effect.playedBy];
                  set({
                    [effect.playedBy]: {
                      ...loser,
                      deck: [...loser.deck, ...cardsToSteal],
                    },
                    cardsInPlay: get().cardsInPlay.slice(2), // Remove stolen cards
                  });
                }
              }
              break;

            case 'patent_theft':
              // If the player who played this card won, steal 1 Launch Stack from opponent
              if (winner === effect.playedBy) {
                const opponentId = effect.playedBy === 'player' ? 'cpu' : 'player';
                if (get()[opponentId].launchStackCount > 0) {
                  get().stealLaunchStack(opponentId, effect.playedBy);
                }
              }
              break;

            case 'leveraged_buyout':
              // If the player who played this card won, take 2 cards from top of opponent's deck
              if (winner === effect.playedBy) {
                const opponentId = effect.playedBy === 'player' ? 'cpu' : 'player';
                get().stealCards(opponentId, effect.playedBy, 2);
              }
              break;

            case 'data_grab': {
              // Digital adaptation: Randomly distribute cards in play between both players
              const { cardsInPlay } = get();
              const shuffledCards = [...cardsInPlay].sort(() => Math.random() - 0.5);
              const playerCards: Card[] = [];
              const cpuCards: Card[] = [];

              shuffledCards.forEach((card, index) => {
                if (index % 2 === 0) {
                  playerCards.push(card);
                } else {
                  cpuCards.push(card);
                }
              });

              const player = get().player;
              const cpu = get().cpu;
              set({
                player: { ...player, deck: [...player.deck, ...playerCards] },
                cpu: { ...cpu, deck: [...cpu.deck, ...cpuCards] },
                cardsInPlay: [], // All cards grabbed
              });
              break;
            }
          }
        }

        // Clear pending effects after processing
        get().clearPendingEffects();
      },

      stealLaunchStack: (from, to) => {
        const fromPlayer = get()[from];
        const toPlayer = get()[to];

        if (fromPlayer.launchStackCount > 0) {
          set({
            [from]: { ...fromPlayer, launchStackCount: fromPlayer.launchStackCount - 1 },
            [to]: { ...toPlayer, launchStackCount: toPlayer.launchStackCount + 1 },
          });
        }
      },

      removeLaunchStacks: (playerId, count) => {
        const player = get()[playerId];
        set({
          [playerId]: {
            ...player,
            launchStackCount: Math.max(0, player.launchStackCount - count),
          },
        });
      },

      reorderTopCards: (playerId, cards) => {
        const player = get()[playerId];
        const remainingDeck = player.deck.slice(cards.length);
        set({
          [playerId]: {
            ...player,
            deck: [...cards, ...remainingDeck],
          },
        });
      },

      // Open What You Want Actions
      setOpenWhatYouWantActive: (playerId) => {
        set({ openWhatYouWantActive: playerId });
      },

      prepareOpenWhatYouWantCards: (playerId) => {
        const player = get()[playerId];
        // Get top 3 cards from player's deck
        const top3Cards = player.deck.slice(0, 3);
        set({ openWhatYouWantCards: top3Cards });
      },

      playSelectedCardFromOWYW: (selectedCard) => {
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

      setShowOpenWhatYouWantModal: (show) => {
        set({ showOpenWhatYouWantModal: show });
      },

      setShowOpenWhatYouWantAnimation: (show) => {
        set({ showOpenWhatYouWantAnimation: show });
      },

      // Forced Empathy Actions
      setForcedEmpathySwapping: (swapping) => {
        set({ forcedEmpathySwapping: swapping });
      },

      setDecksVisuallySwapped: (swapped) => {
        set({ decksVisuallySwapped: swapped });
      },

      // UI Actions
      selectBillionaire: (billionaire) => {
        set({
          selectedBillionaire: billionaire,
          player: {
            ...get().player,
            billionaireCharacter: billionaire,
          },
        });
      },

      selectBackground: (background) => {
        set({ selectedBackground: background });
      },

      togglePause: () => {
        set({ isPaused: !get().isPaused });
      },

      toggleMenu: () => {
        const currentShowMenu = get().showMenu;
        set({
          showMenu: !currentShowMenu,
          isPaused: !currentShowMenu, // Pause when opening menu
        });
      },

      toggleHandViewer: (player) => {
        set({
          showHandViewer: !get().showHandViewer,
          handViewerPlayer: player || get().handViewerPlayer,
        });
      },

      toggleAudio: () => {
        set({ audioEnabled: !get().audioEnabled });
      },

      toggleInstructions: () => {
        set({ showInstructions: !get().showInstructions });
      },

      setShowTooltip: (show) => {
        set({ showTooltip: show });
      },

      resetGame: (
        playerStrategy = 'random',
        cpuStrategy = 'random',
        mirrorDecks = false,
        orderBeforeDealing = false,
      ) => {
        const { playerDeck, cpuDeck } = initializeGameDeck(
          DEFAULT_GAME_CONFIG,
          playerStrategy,
          cpuStrategy,
          mirrorDecks,
          orderBeforeDealing,
        );
        set({
          player: { ...createInitialPlayer('player'), deck: playerDeck },
          cpu: { ...createInitialPlayer('cpu'), deck: cpuDeck },
          cardsInPlay: [],
          activePlayer: 'player',
          anotherPlayMode: false,
          pendingEffects: [],
          preRevealEffects: [],
          preRevealProcessed: false,
          trackerSmackerActive: null,
          winner: null,
          winCondition: null,
          isPaused: false,
          showMenu: false,
          showHandViewer: false,
          showTooltip: false,
          forcedEmpathySwapping: false,
          decksVisuallySwapped: false,
        });
      },
    }),
    { name: 'DataWarGame' },
  ),
);

// Selector hooks for better performance
export const usePlayer = () => useGameStore((state) => state.player);
export const useCPU = () => useGameStore((state) => state.cpu);
export const useCardsInPlay = () => useGameStore((state) => state.cardsInPlay);
export const useWinner = () => useGameStore((state) => state.winner);
export const useUIState = () =>
  useGameStore((state) => ({
    isPaused: state.isPaused,
    showMenu: state.showMenu,
    showHandViewer: state.showHandViewer,
    showInstructions: state.showInstructions,
    audioEnabled: state.audioEnabled,
    showTooltip: state.showTooltip,
  }));
export const useOpenWhatYouWantState = () =>
  useGameStore(
    useShallow((state) => ({
      isActive: state.openWhatYouWantActive,
      cards: state.openWhatYouWantCards,
      showModal: state.showOpenWhatYouWantModal,
      showAnimation: state.showOpenWhatYouWantAnimation,
    })),
  );
