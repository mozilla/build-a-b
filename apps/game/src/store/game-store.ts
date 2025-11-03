/**
 * Zustand Store - Game Data Management
 * Manages all game state data (cards, players, UI state)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ANIMATION_DURATIONS } from '../config/animation-timings';
import { DEFAULT_GAME_CONFIG } from '../config/game-config';
import type { Card, EffectNotification, Player, PlayerType, SpecialEffect } from '../types';
import {
  applyBlockerModifier,
  applyTrackerModifier,
  compareCards,
  isEffectBlocked,
  shouldTriggerDataWar,
} from '../utils/card-comparison';
import { initializeGameDeck, shuffleDeck } from '../utils/deck-builder';
import { getEffectType, isSpecialCard, shouldShowEffectNotification } from '../utils/effect-helpers';
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
      playerLaunchStacks: [], // Launch Stack cards player has collected
      cpuLaunchStacks: [], // Launch Stack cards CPU has collected
      playerTurnState: 'normal',
      cpuTurnState: 'normal',
      openWhatYouWantActive: null,
      openWhatYouWantCards: [],
      showOpenWhatYouWantModal: false,
      showOpenWhatYouWantAnimation: false,
      forcedEmpathySwapping: false,
      deckSwapCount: 0, // Tracks number of forced empathy swaps (odd = swapped, even = normal)
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
      seenEffectTypes: new Set(JSON.parse(localStorage.getItem('seenEffectTypes') || '[]')),
      pendingEffectNotifications: [],
      currentEffectNotification: null,
      showEffectNotificationBadge: false,
      showEffectNotificationModal: false,
      effectNotificationPersistence: 'localStorage',

      // Tooltip System
      seenTooltips: new Set(JSON.parse(localStorage.getItem('seenTooltips') || '[]')),
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
          pendingEffects: [],
          trackerSmackerActive: null,
          playerLaunchStacks: [],
          cpuLaunchStacks: [],
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
        const effectiveCardValue = shouldNegateValue ? 0 : card.value;

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
          },
          cardsInPlay: [...get().cardsInPlay, card],
        };

        // Set turn state for tracker (affects own turn value display)
        // Only set if not negated
        if (card.specialType === 'tracker' && !shouldNegateValue) {
          const turnStateKey = playerId === 'player' ? 'playerTurnState' : 'cpuTurnState';
          updates[turnStateKey] = 'tracker';
        }

        // Set turn state for blocker (affects opponent's turn value display)
        // Only set if not negated
        if (card.specialType === 'blocker' && !shouldNegateValue) {
          const turnStateKey = opponentId === 'player' ? 'playerTurnState' : 'cpuTurnState';
          updates[turnStateKey] = 'blocker';
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
          },
          cardsInPlay: [],
          // Reset turn states for new turn
          playerTurnState: 'normal',
          cpuTurnState: 'normal',
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
          },
        });
      },

      addLaunchStack: (playerId) => {
        const player = get()[playerId];
        const newCount = player.launchStackCount + 1;

        // Find the Launch Stack card that was just played
        const launchStackCard = player.playedCard;
        if (!launchStackCard || launchStackCard.specialType !== 'launch_stack') {
          console.error('addLaunchStack called without a Launch Stack card being played');
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

        // Apply tracker modifier (add tracker value to turn total)
        const newValue = applyTrackerModifier(player.currentTurnValue, trackerCard);

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
            currentTurnValue: newValue,
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
            // Apply tracker effect (adds to active effects and updates turn value)
            // This is already protected by the Tracker Smacker check inside applyTrackerEffect
            get().applyTrackerEffect(playedBy, card);
            break;
          case 'blocker': {
            // Check if Hostile Takeover is in play - if so, ignore blocker effect
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
            get().addLaunchStack(playedBy);
            break;
          case 'tracker_smacker':
            get().setTrackerSmackerActive(playedBy);
            break;
          case 'forced_empathy':
            // Trigger animation - this will visually swap the decks
            get().setForcedEmpathySwapping(true);

            // Wait for message (800ms) + animation (1500ms) = 2300ms total
            // This gives users time to see "Forced Empathy!" message and understand what's happening
            setTimeout(() => {
              get().swapDecks();
              // Increment swap count to track position (odd = swapped, even = normal)
              set({ deckSwapCount: get().deckSwapCount + 1 });
              // Reset animation state - decks stay in swapped positions with new owners
              get().setForcedEmpathySwapping(false);
            }, ANIMATION_DURATIONS.FORCED_EMPATHY_SWAP_DURATION + 800);
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
      setForcedEmpathySwapping: (swapping) => {
        set({ forcedEmpathySwapping: swapping });
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
        const newSeenTypes = new Set(seenEffectTypes);
        newSeenTypes.add(effectType);

        set({ seenEffectTypes: newSeenTypes });

        // Persist to localStorage if enabled
        if (effectNotificationPersistence === 'localStorage') {
          localStorage.setItem('seenEffectTypes', JSON.stringify(Array.from(newSeenTypes)));
        }
      },

      hasSeenEffect: (effectType) => {
        return get().seenEffectTypes.has(effectType);
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
        set({ seenEffectTypes: new Set() });
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
        const newSeenTooltips = new Set(seenTooltips);
        newSeenTooltips.add(tooltipId);

        set({ seenTooltips: newSeenTooltips });

        if (tooltipPersistence === 'localStorage') {
          localStorage.setItem('seenTooltips', JSON.stringify(Array.from(newSeenTooltips)));
        }
      },

      hasSeenTooltip: (tooltipId) => {
        return get().seenTooltips.has(tooltipId);
      },

      shouldShowTooltip: (tooltipId) => {
        return !get().hasSeenTooltip(tooltipId);
      },

      clearSeenTooltips: () => {
        set({ seenTooltips: new Set() });
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
          forcedEmpathySwapping: false,
          deckSwapCount: 0,
        });
      },
    }),
    { name: 'DataWarGame' },
  ),
);
