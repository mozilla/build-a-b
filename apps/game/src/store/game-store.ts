/**
 * Zustand Store - Game Data Management
 * Manages all game state data (cards, players, UI state)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ANIMATION_DURATIONS } from '../config/animation-timings';
import { DEFAULT_GAME_CONFIG } from '../config/game-config';
import type {
  Card,
  CardValue,
  EffectNotification,
  Player,
  PlayerType,
  SpecialEffect,
} from '../types';
import {
  applyBlockerModifier,
  compareCards,
  isEffectBlocked,
  shouldTriggerDataWar,
} from '../utils/card-comparison';
import { initializeGameDeck, shuffleDeck } from '../utils/deck-builder';
import {
  getEffectType,
  isSpecialCard,
  shouldShowEffectNotification,
} from '../utils/effect-helpers';
import type { GameStore } from './types';

const createInitialPlayer = (id: PlayerType): Player => ({
  id,
  name: id === 'player' ? 'Player' : 'CPU',
  deck: [],
  playedCard: null,
  playedCardsInHand: [],
  currentTurnValue: 0,
  launchStackCount: 0,
  activeEffects: [],
  pendingTrackerBonus: 0,
  pendingBlockerPenalty: 0,
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
      anotherPlayExpected: false,
      pendingEffects: [],
      preRevealEffects: [],
      preRevealProcessed: false,
      trackerSmackerActive: null,
      winner: null,
      winCondition: null,
      playerLaunchStacks: [], // Launch Stack cards player has collected
      cpuLaunchStacks: [], // Launch Stack cards CPU has collected
      playerTurnState: 'normal',
      cpuTurnState: 'normal',
      openWhatYouWantActive: null,
      openWhatYouWantCards: [],
      showOpenWhatYouWantModal: false,
      showOpenWhatYouWantAnimation: false,
      showForcedEmpathyAnimation: false,
      forcedEmpathySwapping: false,
      deckSwapCount: 0, // Tracks number of forced empathy swaps (odd = swapped, even = normal)
      showHostileTakeoverAnimation: false,
      showLaunchStackAnimation: false,
      showDataWarAnimation: false,
      selectedBillionaire: '',
      selectedBackground: '',
      isPaused: false,
      showMenu: false,
      showHandViewer: false,
      handViewerPlayer: 'player',
      showInstructions: false,
      audioEnabled: true,
      showTooltip: false,

      // Effect Notification System
      seenEffectTypes: JSON.parse(localStorage.getItem('seenEffectTypes') || '[]'),
      pendingEffectNotifications: [],
      currentEffectNotification: null,
      showEffectNotificationBadge: false,
      showEffectNotificationModal: false,
      effectNotificationPersistence: 'localStorage',

      // Tooltip System
      seenTooltips: JSON.parse(localStorage.getItem('seenTooltips') || '[]'),
      tooltipPersistence: 'localStorage',

      // Game Logic Actions
      initializeGame: (
        playerStrategy = 'random',
        cpuStrategy = 'random',
        playerCustomOrder,
        cpuCustomOrder,
      ) => {
        const { playerDeck, cpuDeck } = initializeGameDeck(
          DEFAULT_GAME_CONFIG,
          playerStrategy,
          cpuStrategy,
          playerCustomOrder,
          cpuCustomOrder,
        );
        set({
          player: { ...createInitialPlayer('player'), deck: playerDeck },
          cpu: { ...createInitialPlayer('cpu'), deck: cpuDeck },
          cardsInPlay: [],
          winner: null,
          winCondition: null,
          activePlayer: 'player',
          anotherPlayMode: false,
          anotherPlayExpected: false,
          pendingEffects: [],
          trackerSmackerActive: null,
          playerLaunchStacks: [],
          cpuLaunchStacks: [],
          showForcedEmpathyAnimation: false,
          forcedEmpathySwapping: false,
          deckSwapCount: 0,
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

        const opponentId = playerId === 'player' ? 'cpu' : 'player';

        /**
         * Helper: Determines if a tracker/blocker card's effect should be negated
         * Effects are negated if:
         * 1. Tracker Smacker is active (blocks opponent's trackers/blockers), OR
         * 2. Hostile Takeover is in play (ignores ALL trackers/blockers from both players)
         */
        const isTrackerBlockerNegated = (cardType: string | undefined): boolean => {
          if (cardType !== 'tracker' && cardType !== 'blocker') {
            return false;
          }

          // Check if blocked by Tracker Smacker
          const blockedBySmacker = isEffectBlocked(get().trackerSmackerActive, playerId);

          // Check if Hostile Takeover is in play (either player)
          const { player: p, cpu: c } = get();
          const hostileTakeoverInPlay =
            p.playedCard?.specialType === 'hostile_takeover' ||
            c.playedCard?.specialType === 'hostile_takeover';

          return blockedBySmacker || hostileTakeoverInPlay;
        };

        // Determine if this card's value should be negated
        const shouldNegateValue = isTrackerBlockerNegated(card.specialType);

        // Calculate the effective card value (0 if negated, otherwise normal value)
        let effectiveCardValue = shouldNegateValue ? 0 : card.value;

        // APPLY PENDING TRACKER BONUS FROM EARLIER IN SAME TURN
        // If in anotherPlayMode (second+ card), apply any pending tracker bonus
        if (get().anotherPlayMode && playerState.pendingTrackerBonus > 0) {
          effectiveCardValue += playerState.pendingTrackerBonus;
        }

        // APPLY PENDING BLOCKER PENALTY FROM EARLIER IN SAME TURN
        // If in anotherPlayMode (second+ card), apply any pending blocker penalty
        if (get().anotherPlayMode && playerState.pendingBlockerPenalty > 0) {
          effectiveCardValue = Math.max(
            0,
            effectiveCardValue - playerState.pendingBlockerPenalty,
          ) as CardValue;
        }

        // In "another play" mode, ADD to existing value
        // In normal mode, SET the value
        const newTurnValue = get().anotherPlayMode
          ? playerState.currentTurnValue + effectiveCardValue
          : effectiveCardValue;

        const newPlayedCardsInHand = [
          ...playerState.playedCardsInHand,
          { card, isFaceDown: false },
        ];

        // Determine turn states based on card effects
        const updates: Partial<GameStore> = {
          [playerId]: {
            ...playerState,
            playedCard: card,
            playedCardsInHand: newPlayedCardsInHand,
            deck: remainingDeck,
            currentTurnValue: newTurnValue,
            // CLEAR pending bonuses/penalties after applying (only if in anotherPlayMode)
            // If NOT in anotherPlayMode (first card), keep them at 0 or set them below for trackers
            pendingTrackerBonus: get().anotherPlayMode ? 0 : playerState.pendingTrackerBonus,
            pendingBlockerPenalty: get().anotherPlayMode ? 0 : playerState.pendingBlockerPenalty,
          },
          cardsInPlay: [...get().cardsInPlay, card],
        };

        // Handle tracker card: STORE bonus for next card (in same turn, via anotherPlayMode)
        if (card.specialType === 'tracker' && !shouldNegateValue) {
          const turnStateKey = playerId === 'player' ? 'playerTurnState' : 'cpuTurnState';
          updates[turnStateKey] = 'tracker';

          // Add to active effects for display purposes
          const newActiveEffects = [
            ...playerState.activeEffects,
            {
              type: 'tracker' as const,
              value: card.value,
              source: playerId,
            },
          ];

          // STORE the tracker bonus for next card (don't apply to this card)
          updates[playerId] = {
            ...(updates[playerId] as Player),
            pendingTrackerBonus: card.value, // Store +1, +2, or +3 for next card
            activeEffects: newActiveEffects, // Add to display
          };
        }

        // Set turn state for blocker (affects opponent's turn value display)
        // Blocker logic stays in handleCardEffect (applies immediately to opponent)
        if (card.specialType === 'blocker' && !shouldNegateValue) {
          const turnStateKey = opponentId === 'player' ? 'playerTurnState' : 'cpuTurnState';
          updates[turnStateKey] = 'blocker';
        }

        // Update anotherPlayExpected flag
        // If this card triggers another play, we're expecting more cards
        // If this card doesn't trigger another play and we're in anotherPlayMode, sequence is ending
        if (card.triggersAnotherPlay) {
          updates.anotherPlayExpected = true;
        } else if (get().anotherPlayMode) {
          updates.anotherPlayExpected = false;
        }

        set(updates);
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
            activeEffects: [], // Clear active effects
            pendingTrackerBonus: 0, // Clear pending bonus (turn is over)
            pendingBlockerPenalty: 0, // Clear pending penalty (turn is over)
          },
          cardsInPlay: [],
          // Reset turn states for new turn
          playerTurnState: 'normal',
          cpuTurnState: 'normal',
          anotherPlayExpected: false, // Clear flag (turn is over)
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
            activeEffects: [], // Clear active effects
            pendingTrackerBonus: 0, // Clear pending bonus (turn is over)
            pendingBlockerPenalty: 0, // Clear pending penalty (turn is over)
          },
        });
      },

      addLaunchStack: (playerId, launchStackCard) => {
        const player = get()[playerId];
        const newCount = player.launchStackCount + 1;

        // Validate that this is actually a Launch Stack card
        if (!launchStackCard || launchStackCard.specialType !== 'launch_stack') {
          console.error('addLaunchStack called without a Launch Stack card');
          return;
        }

        // Remove Launch Stack from cardsInPlay (it won't be collected by winner)
        const updatedCardsInPlay = get().cardsInPlay.filter((c) => c.id !== launchStackCard.id);

        // Add to player's Launch Stack collection
        const launchStackKey = playerId === 'player' ? 'playerLaunchStacks' : 'cpuLaunchStacks';

        set({
          [playerId]: {
            ...player,
            launchStackCount: newCount,
          },
          [launchStackKey]: [...get()[launchStackKey], launchStackCard],
          cardsInPlay: updatedCardsInPlay,
        });

        // Check win condition
        if (newCount >= DEFAULT_GAME_CONFIG.launchStacksToWin) {
          set({ winner: playerId, winCondition: 'launch_stacks' });
        }
      },

      swapDecks: () => {
        const { player, cpu } = get();
        // Swap ONLY the deck arrays between player and cpu
        // Visual positions stay the same after animation: bottom = player, top = cpu
        // launchStackCount, points, and current turn state do NOT swap
        // The visual animation + data swap results in correct final positions
        set({
          player: {
            ...player,
            deck: cpu.deck,
          },
          cpu: {
            ...cpu,
            deck: player.deck,
          },
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

        // Check if player has all cards (including Launch Stacks in collection)
        if (
          cpu.deck.length === 0 &&
          cpu.playedCard === null &&
          get().cpuLaunchStacks.length === 0
        ) {
          set({ winner: 'player', winCondition: 'all_cards' });
          return true;
        }

        // Check if CPU has all cards (including Launch Stacks in collection)
        if (
          player.deck.length === 0 &&
          player.playedCard === null &&
          get().playerLaunchStacks.length === 0
        ) {
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

        // Note: The tracker value is already added to currentTurnValue in playCard()
        // This function only tracks the effect for display purposes

        // Add to active effects
        const newActiveEffects = [
          ...player.activeEffects,
          {
            type: 'tracker' as const,
            value: trackerCard.value,
            source: playerId,
          },
        ];

        set({
          [playerId]: {
            ...player,
            activeEffects: newActiveEffects,
          },
        });
      },

      applyBlockerEffect: (playerId, blockerCard) => {
        // Blocker affects the opponent
        const opponentId = playerId === 'player' ? 'cpu' : 'player';
        const opponent = get()[opponentId];

        // Note: Blocker cards are NOT affected by Tracker Smacker
        // Tracker Smacker only blocks Trackers and Billionaire Move effects

        // Apply blocker modifier (subtract from opponent's turn value)
        const newValue = applyBlockerModifier(opponent.currentTurnValue, blockerCard);

        // Add to opponent's active effects
        const newActiveEffects = [
          ...opponent.activeEffects,
          {
            type: 'blocker' as const,
            value: blockerCard.value,
            source: playerId,
          },
        ];

        set({
          [opponentId]: {
            ...opponent,
            currentTurnValue: newValue,
            activeEffects: newActiveEffects,
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
            // NO LONGER APPLY TRACKER EFFECT HERE
            // Tracker logic is now handled in playCard() (store bonus for next card)
            break;
          case 'blocker': {
            // KEEP BLOCKER LOGIC - applies immediately to opponent
            const { player: p, cpu: c } = get();
            const hostileTakeoverInPlay =
              p.playedCard?.specialType === 'hostile_takeover' ||
              c.playedCard?.specialType === 'hostile_takeover';

            if (!hostileTakeoverInPlay) {
              get().applyBlockerEffect(playedBy, card);
            }
            // If Hostile Takeover is in play, blocker effect is completely ignored
            break;
          }
          case 'launch_stack':
            // DON'T add launch stack immediately
            // It will be added in processPendingEffects if the player wins the turn
            break;
          case 'tracker_smacker':
            get().setTrackerSmackerActive(playedBy);
            break;
          case 'forced_empathy':
            // Wait for card to settle on board before showing animation overlay
            setTimeout(() => {
              // STEP 1: Show video overlay (decks don't move yet)
              get().setShowForcedEmpathyAnimation(true);

              // STEP 2: After video ends, hide video and start deck pile animation
              setTimeout(() => {
                get().setShowForcedEmpathyAnimation(false);
                get().setForcedEmpathySwapping(true);

                // STEP 3: After deck piles finish moving (DURATION only, no delay), swap data and hide animation
                setTimeout(() => {
                  get().swapDecks();
                  set({ deckSwapCount: get().deckSwapCount + 1 });
                  get().setForcedEmpathySwapping(false);
                }, ANIMATION_DURATIONS.FORCED_EMPATHY_SWAP_DURATION);
              }, ANIMATION_DURATIONS.FORCED_EMPATHY_VIDEO_DURATION);
            }, ANIMATION_DURATIONS.CARD_SETTLE_DELAY);
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

        // Immediately recalculate turn values for any blocked tracker cards
        // This handles the case where Tracker Smacker is played in the same turn as opponent's tracker
        // NOTE: Tracker Smacker only blocks TRACKERS and BILLIONAIRE MOVE effects, NOT blockers
        const { player, cpu } = get();

        // Check if player's card should be negated (only trackers)
        if (player.playedCard) {
          const isPlayerBlocked = isEffectBlocked(playerId, 'player');
          if (isPlayerBlocked && player.playedCard.specialType === 'tracker') {
            set({
              player: {
                ...player,
                currentTurnValue: 0,
                pendingTrackerBonus: 0, // CLEAR pending tracker bonus (blocked)
                activeEffects: [], // CLEAR active effects for display
              },
              playerTurnState: 'normal', // Reset to normal UI state
            });
          }
        }

        // Check if CPU's card should be negated (only trackers)
        if (cpu.playedCard) {
          const isCpuBlocked = isEffectBlocked(playerId, 'cpu');
          if (isCpuBlocked && cpu.playedCard.specialType === 'tracker') {
            set({
              cpu: {
                ...cpu,
                currentTurnValue: 0,
                pendingTrackerBonus: 0, // CLEAR pending tracker bonus (blocked)
                activeEffects: [], // CLEAR active effects for display
              },
              cpuTurnState: 'normal', // Reset to normal UI state
            });
          }
        }
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

            case 'launch_stack':
              // If the player who played this card won the turn, add it to their collection
              if (winner === effect.playedBy) {
                get().addLaunchStack(effect.playedBy, effect.card);
              }
              // If they lost, the launch stack card goes to the winner with other cards
              // (it stays in cardsInPlay and will be collected normally)
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
        const launchStackKey = playerId === 'player' ? 'playerLaunchStacks' : 'cpuLaunchStacks';
        const launchStacks = get()[launchStackKey];

        // Take the Launch Stack cards to return (up to count)
        const cardsToReturn = launchStacks.slice(0, count);
        const remainingLaunchStacks = launchStacks.slice(count);

        // Shuffle the cards back into the player's deck randomly
        const newDeck = shuffleDeck([...player.deck, ...cardsToReturn]);

        set({
          [playerId]: {
            ...player,
            launchStackCount: Math.max(0, player.launchStackCount - count),
            deck: newDeck,
          },
          [launchStackKey]: remainingLaunchStacks,
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
      setShowForcedEmpathyAnimation: (show) => {
        set({ showForcedEmpathyAnimation: show });
      },
      setForcedEmpathySwapping: (swapping) => {
        set({ forcedEmpathySwapping: swapping });
      },

      // Special Effect Animation Actions
      setShowHostileTakeoverAnimation: (show) => {
        set({ showHostileTakeoverAnimation: show });
      },
      setShowLaunchStackAnimation: (show) => {
        set({ showLaunchStackAnimation: show });
      },
      setShowDataWarAnimation: (show) => {
        set({ showDataWarAnimation: show });
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

      // Effect Notification Actions
      markEffectAsSeen: (effectType) => {
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

      hasSeenEffect: (effectType) => {
        // Convert to Set for O(1) lookup
        return new Set(get().seenEffectTypes).has(effectType);
      },

      hasUnseenEffectNotifications: () => {
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

      prepareEffectNotification: () => {
        const { player, cpu, hasSeenEffect } = get();

        // Collect ALL unseen notifications (priority: player first, then CPU)
        const cards = [
          { card: player.playedCard, playedBy: 'player' as PlayerType },
          { card: cpu.playedCard, playedBy: 'cpu' as PlayerType },
        ];

        const notifications: EffectNotification[] = [];

        for (const { card, playedBy } of cards) {
          if (card && isSpecialCard(card)) {
            const effectType = getEffectType(card);

            if (shouldShowEffectNotification(effectType) && !hasSeenEffect(effectType)) {
              notifications.push({
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

        if (notifications.length > 0) {
          // Set all pending notifications and show the first one
          set({
            pendingEffectNotifications: notifications,
            currentEffectNotification: notifications[0],
            showEffectNotificationBadge: true,
          });
        } else {
          // No unseen notifications
          set({
            pendingEffectNotifications: [],
            currentEffectNotification: null,
            showEffectNotificationBadge: false,
          });
        }
      },

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

      setShowEffectNotificationModal: (show) => {
        set({ showEffectNotificationModal: show });
      },

      clearSeenEffects: () => {
        set({ seenEffectTypes: [] });
        localStorage.removeItem('seenEffectTypes');
      },

      setEffectNotificationPersistence: (mode) => {
        set({ effectNotificationPersistence: mode });

        if (mode === 'memory') {
          // Clear localStorage if switching to memory mode
          localStorage.removeItem('seenEffectTypes');
        }
      },

      // Tooltip System Actions
      markTooltipAsSeen: (tooltipId) => {
        const { seenTooltips, tooltipPersistence } = get();

        // Convert to Set for operations, then back to array
        const seenSet = new Set(seenTooltips);
        seenSet.add(tooltipId);
        const newSeenTooltips = Array.from(seenSet);

        set({ seenTooltips: newSeenTooltips });

        if (tooltipPersistence === 'localStorage') {
          localStorage.setItem('seenTooltips', JSON.stringify(newSeenTooltips));
        }
      },

      hasSeenTooltip: (tooltipId) => {
        return new Set(get().seenTooltips).has(tooltipId);
      },

      shouldShowTooltip: (tooltipId) => {
        return !get().hasSeenTooltip(tooltipId);
      },

      clearSeenTooltips: () => {
        set({ seenTooltips: [] });
        localStorage.removeItem('seenTooltips');
      },

      setTooltipPersistence: (mode) => {
        set({ tooltipPersistence: mode });

        if (mode === 'memory') {
          localStorage.removeItem('seenTooltips');
        }
      },

      // Active Effects Actions
      clearActiveEffects: (playerId) => {
        const playerState = get()[playerId];

        set({
          [playerId]: {
            ...playerState,
            activeEffects: [],
          },
        });
      },

      resetGame: (
        playerStrategy = 'random',
        cpuStrategy = 'random',
        playerCustomOrder,
        cpuCustomOrder,
      ) => {
        const { playerDeck, cpuDeck } = initializeGameDeck(
          DEFAULT_GAME_CONFIG,
          playerStrategy,
          cpuStrategy,
          playerCustomOrder,
          cpuCustomOrder,
        );
        set({
          player: { ...createInitialPlayer('player'), deck: playerDeck },
          cpu: { ...createInitialPlayer('cpu'), deck: cpuDeck },
          cardsInPlay: [],
          activePlayer: 'player',
          anotherPlayMode: false,
          anotherPlayExpected: false,
          pendingEffects: [],
          preRevealEffects: [],
          preRevealProcessed: false,
          trackerSmackerActive: null,
          winner: null,
          winCondition: null,
          playerLaunchStacks: [],
          cpuLaunchStacks: [],
          isPaused: false,
          showMenu: false,
          showHandViewer: false,
          showTooltip: false,
          showForcedEmpathyAnimation: false,
          forcedEmpathySwapping: false,
          deckSwapCount: 0,
        });
      },
    }),
    { name: 'DataWarGame' },
  ),
);
