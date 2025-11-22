/**
 * Zustand Store - Game Data Management
 * Manages all game state data (cards, players, UI state)
 */

import type { SpecialEffectAnimationType } from '@/config/special-effect-animations';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ANIMATION_DURATIONS, getGameSpeedAdjustedDuration } from '../config/animation-timings';
import { AUDIO_TRACKS, TRACKS, type AudioTrackId } from '../config/audio-config';
import { getRandomBillionaire, type BillionaireId } from '../config/billionaires';
import { DATA_GRAB_CONFIG } from '../config/data-grab-config';
import { DEFAULT_GAME_CONFIG } from '../config/game-config';
import { getPreloadedAudio } from '../hooks/use-audio-preloader';
import type { Card, CardValue, Player, PlayerType, SpecialCardType, SpecialEffect } from '../types';
import type { PlayOptions } from '../types/audio';
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
import type { CardDistribution, GameStore } from './types';

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
      showingWinEffect: null,
      collecting: null,
      deckClickBlocked: false,
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
      shouldTransitionToWin: false,
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
      dataWarVideoPlaying: false,
      showTrackerSmackerAnimation: false,
      showLeveragedBuyoutAnimation: false,
      showPatentTheftAnimation: false,
      showTemperTantrumAnimation: false,
      showMandatoryRecallAnimation: false,
      showTheftWonAnimation: false,
      showRecallWonAnimation: false,
      recallReturnCount: 0,
      patentTheftStolenCard: null, // Temporarily stores stolen card during Patent Theft animation sequence
      patentTheftWinner: null, // Stores winner ID during Patent Theft animation sequence

      // Animation Queue System
      animationQueue: [],
      isPlayingQueuedAnimation: false,
      animationsPaused: false,
      blockTransitions: false,
      hostileTakeoverDataWar: false,
      currentAnimationPlayer: null,
      animationCompletionCallback: null,
      shownAnimationCardIds: new Set(),

      // Data Grab Mini-Game State
      dataGrabActive: false,
      dataGrabCards: [],
      dataGrabCollectedByPlayer: [],
      dataGrabCollectedByCPU: [],
      dataGrabDistributions: [],
      dataGrabPlayerLaunchStacks: [],
      dataGrabCPULaunchStacks: [],
      showDataGrabTakeover: false,
      dataGrabGameActive: false,
      showDataGrabResults: false,
      showDataGrabCookies: false, // Debug option - disabled by default

      // Debug Options
      gameSpeedMultiplier: 0.6, // Default: slower speed for better UX
      eventLog: [], // Debug event log for tracking game events

      // Temper Tantrum Card Selection State
      showTemperTantrumModal: false,
      temperTantrumAvailableCards: [],
      temperTantrumSelectedCards: [],
      temperTantrumMaxSelections: 2,
      temperTantrumWinner: null,
      temperTantrumLoserCards: [],
      temperTantrumFaceDownCardIds: new Set(),

      // Sequential Effect Processing State
      effectsQueue: [],
      effectsWinner: null,
      launchStacksForWinnerCount: 0,
      needsDataWarAfterEffects: false,

      selectedBillionaire: '',
      cpuBillionaire: '',
      selectedBackground: '',
      isPaused: false,
      showMenu: false,
      showGameOverScreen: false,
      audioEnabled: true,
      showHandViewer: false,
      handViewerPlayer: 'player',
      showInstructions: false,
      musicEnabled: localStorage.getItem('musicEnabled') !== 'false', // Default true unless explicitly disabled
      soundEffectsEnabled: localStorage.getItem('soundEffectsEnabled') !== 'false', // Default true unless explicitly disabled
      showTooltip: false,

      // Audio Manager State
      audioMusicChannel: null,
      audioSfxChannels: [null, null, null, null], // 4 channels for overlapping SFX
      audioMusicTrackId: null,
      audioSfxTrackIds: [null, null, null, null],
      audioMusicVolume: 1.0,
      audioSfxVolume: 1.0,
      audioMusicFading: false,
      audioSfxFading: false,
      audioTracksReady: new Set<AudioTrackId>(),

      // Asset Preloading State
      assetsLoaded: 0,
      assetsTotal: 0,
      essentialAssetsReady: false,
      highPriorityAssetsReady: false,
      criticalPriorityAssetsReady: false,
      vsVideoReady: false,
      preloadingComplete: false,
      criticalProgress: 0,
      highPriorityProgress: 0,
      essentialProgress: 0,
      hasShownCriticalLoadingScreen: false,
      hasShownHighPriorityLoadingScreen: false,
      hasShownEssentialLoadingScreen: false,

      // Effect Notification System
      seenEffectTypes: JSON.parse(localStorage.getItem('seenEffectTypes') || '[]'),
      pendingEffectNotifications: [],
      currentEffectNotification: null,
      showEffectNotificationBadge: false,
      showEffectNotificationModal: false,
      effectNotificationPersistence: 'localStorage',

      // Effect Notification - Accumulation System
      accumulatedEffects: [],
      effectAccumulationPaused: false,
      awaitingResolution: false,

      // Progress Timer for Effect Badge
      effectBadgeTimerDuration: 0, // Set to 0 for now (disabled)
      effectBadgeTimerActive: false,
      effectBadgeTimerStartTime: null,

      // Tooltip System
      tooltipDisplayCounts: JSON.parse(localStorage.getItem('tooltipDisplayCounts') || '{}'),
      tooltipPersistence: 'localStorage',

      // Game Logic Actions
      initializeGame: (
        playerStrategy = 'random',
        cpuStrategy = 'random',
        playerCustomOrder,
        cpuCustomOrder,
      ) => {
        // Clear event log on new game
        set({ eventLog: [] });

        const { playerDeck, cpuDeck } = initializeGameDeck(
          DEFAULT_GAME_CONFIG,
          playerStrategy,
          cpuStrategy,
          playerCustomOrder,
          cpuCustomOrder,
        );

        // Log game initialization
        get().logEvent(
          'GAME_INIT',
          'Game initialized',
          `Player: ${playerStrategy}, CPU: ${cpuStrategy}`,
          'success',
        );

        set({
          player: { ...createInitialPlayer('player'), deck: playerDeck },
          cpu: { ...createInitialPlayer('cpu'), deck: cpuDeck },
          cardsInPlay: [],
          winner: null,
          winCondition: null,
          shouldTransitionToWin: false,
          showingWinEffect: null,
          collecting: null,
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
          showHostileTakeoverAnimation: false,
          showTrackerSmackerAnimation: false,
          showLeveragedBuyoutAnimation: false,
          showPatentTheftAnimation: false,
          showTemperTantrumAnimation: false,
          showMandatoryRecallAnimation: false,
          showTheftWonAnimation: false,
          showRecallWonAnimation: false,
          recallReturnCount: 0,
          patentTheftStolenCard: null,
          patentTheftWinner: null,
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

      playCard: (playerId) => {
        const playerState = get()[playerId];
        const [card, ...remainingDeck] = playerState.deck;

        if (!card) {
          // This shouldn't happen - win condition should have caught it before calling playCard
          get().logEvent('PLAY_CARD', `${playerId} has no cards to play`, undefined, 'error');
          return;
        }

        const opponentId = playerId === 'player' ? 'cpu' : 'player';

        // Log card play
        get().logEvent(
          'PLAY_CARD',
          `${playerId.toUpperCase()} played ${card.name} (${card.value})`,
          card.specialType ? `Special: ${card.specialType}` : undefined,
          'info',
        );

        /**
         * Helper: Determines if a tracker/blocker card's effect should be negated
         * Effects are negated if:
         * 1. Tracker Smacker is active (blocks opponent's trackers/blockers), OR
         * 2. Hostile Takeover data war is active (HT ignores opponent's trackers/blockers), OR
         * 3. Opponent has HT (HT ignores this player's trackers/blockers)
         */
        const isTrackerBlockerNegated = (cardType: string | undefined): boolean => {
          if (cardType !== 'tracker' && cardType !== 'blocker') {
            return false;
          }

          // Check if blocked by Tracker Smacker
          const blockedBySmacker = isEffectBlocked(get().trackerSmackerActive, playerId);

          // Check if we're in a Hostile Takeover data war
          // During HT data war, opponent's trackers/blockers are ignored
          const inHTDataWar = get().hostileTakeoverDataWar;

          // Check if opponent has HT (their HT ignores this player's tracker/blocker)
          const opponentState = get()[opponentId];
          const opponentHasHT = opponentState.playedCard?.specialType === 'hostile_takeover';

          return blockedBySmacker || inHTDataWar || opponentHasHT;
        };

        // Determine if this card's value should be negated
        const shouldNegateValue = isTrackerBlockerNegated(card.specialType);

        // Calculate the effective card value (0 if negated, otherwise normal value)
        // Trackers now display their value immediately (just like any other card)
        let effectiveCardValue = shouldNegateValue ? 0 : card.value;

        // APPLY PENDING BLOCKER PENALTY FROM EARLIER IN SAME TURN
        // If in anotherPlayMode (second+ card), apply any pending blocker penalty
        if (get().anotherPlayMode && playerState.pendingBlockerPenalty > 0) {
          effectiveCardValue = (effectiveCardValue -
            playerState.pendingBlockerPenalty) as CardValue;
        }

        // In "another play" mode, ADD to existing value
        // In normal mode, SET the value
        const newTurnValue = playerState.currentTurnValue + effectiveCardValue;

        // Play turn value SFX if value changed and is non-zero
        if (effectiveCardValue !== 0 && playerId === 'player') {
          get().playAudio(TRACKS.TURN_VALUE);
        }

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
            // CLEAR pending penalties after applying (only if in anotherPlayMode)
            pendingTrackerBonus: 0, // No longer used - trackers show value immediately
            pendingBlockerPenalty: get().anotherPlayMode ? 0 : playerState.pendingBlockerPenalty,
          },
          cardsInPlay: [...get().cardsInPlay, card],
        };

        // Handle tracker card: Set turn state and active effects for display
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

          // Update active effects for display (tracker value is now immediately visible in currentTurnValue)
          updates[playerId] = {
            ...(updates[playerId] as Player),
            activeEffects: newActiveEffects,
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

      /**
       * Enhanced collection system - Supports per-card destinations and sources
       * Enables both board-to-deck and deck-to-deck animations
       */
      collectCardsDistributed: (
        distributions,
        primaryWinner,
        visualOnly = false,
        launchStackCount = 0,
        skipBoardClear = false,
      ) => {
        const winnerId = primaryWinner || distributions[0]?.destination;

        // Calculate dynamic duration based on number of rockets
        // Each rocket needs time to animate, and they may be staggered
        const rocketDuration =
          launchStackCount > 0
            ? ANIMATION_DURATIONS.WIN_ANIMATION +
              launchStackCount * ANIMATION_DURATIONS.WIN_ANIMATION // Base + 1200ms per rocket
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
                set({ collecting: null });
                // Unblock deck clicks after a short delay
                setTimeout(() => {
                  set({ deckClickBlocked: false });
                }, 200);
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
              }
            }
          }, ANIMATION_DURATIONS.CARD_COLLECTION);
        }, rocketDuration); // Use dynamic duration based on number of rockets
      },

      /**
       * Backward compatibility wrapper - Converts old format to new CardDistribution format
       */
      collectCards: (winnerId, cards, launchStackCount = 0) => {
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

      addLaunchStack: (playerId, launchStackCard) => {
        const player = get()[playerId];
        const newCount = player.launchStackCount + 1;

        // Validate that this is actually a Launch Stack card
        if (!launchStackCard || launchStackCard.specialType !== 'launch_stack') {
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
        // Swap deck arrays between player and cpu
        // Visual positions reset after animation, but data actually swaps
        // If player had 40 cards and CPU had 24, after swap player has 24 and CPU has 40
        set({
          player: {
            ...player,
            deck: cpu.deck,
          },
          cpu: {
            ...cpu,
            deck: player.deck,
          },
          deckSwapCount: get().deckSwapCount + 1, // Increment for animation trigger
        });
      },

      stealCards: (from, to, count) => {
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

      checkWinCondition: () => {
        const { player, cpu, winner, winCondition } = get();

        // If already won, return true
        if (winner !== null && winCondition !== null) {
          return true;
        }

        // Check if player has all cards (opponent has no deck cards left)
        if (cpu.deck.length === 0 && cpu.playedCard === null) {
          get().logEvent(
            'WIN_CONDITION',
            'PLAYER wins by collecting all cards!',
            undefined,
            'success',
          );
          set({ winner: 'player', winCondition: 'all_cards' });
          return true;
        }

        // Check if CPU has all cards (opponent has no deck cards left)
        if (player.deck.length === 0 && player.playedCard === null) {
          get().logEvent(
            'WIN_CONDITION',
            'CPU wins by collecting all cards!',
            undefined,
            'success',
          );
          set({ winner: 'cpu', winCondition: 'all_cards' });
          return true;
        }

        // Check launch stacks (already handled in addLaunchStack)
        if (player.launchStackCount >= DEFAULT_GAME_CONFIG.launchStacksToWin) {
          get().logEvent(
            'WIN_CONDITION',
            `PLAYER wins with ${player.launchStackCount} Launch Stacks!`,
            undefined,
            'success',
          );
          set({ winner: 'player', winCondition: 'launch_stacks' });
          return true;
        }

        if (cpu.launchStackCount >= DEFAULT_GAME_CONFIG.launchStacksToWin) {
          get().logEvent(
            'WIN_CONDITION',
            `CPU wins with ${cpu.launchStackCount} Launch Stacks!`,
            undefined,
            'success',
          );
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

        // Check for Hostile Takeover FIRST (before checking if both have cards)
        // When HT is played, only the HT player has a card initially
        const playerPlayedHt = player.playedCard?.specialType === 'hostile_takeover';
        const cpuPlayedHt = cpu.playedCard?.specialType === 'hostile_takeover';

        if (playerPlayedHt || cpuPlayedHt) {
          // Determine who played HT and who is the opponent
          const htPlayer = playerPlayedHt ? player : cpu;
          const opponent = playerPlayedHt ? cpu : player;

          // Case 1: HT player has MORE cards - HT was just played as initial card
          // This is the first time seeing HT - trigger HT's special Data War
          if (htPlayer.playedCardsInHand.length > opponent.playedCardsInHand.length) {
            set({ hostileTakeoverDataWar: true });
            return true;
          }

          // Case 2: Equal cards - HT was played as face-up card in existing Data War
          // Only trigger Data War if HT's effect should apply (HT always forces Data War)
          // But this should be handled differently - only opponent plays
          if (htPlayer.playedCardsInHand.length === opponent.playedCardsInHand.length) {
            // HT as face-up still triggers its effect - opponent must play alone
            set({ hostileTakeoverDataWar: true });
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

        // Normal tie logic for non-HT situations
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
          isInstant: [
            'forced_empathy',
            'tracker_smacker',
            'hostile_takeover',
            'tracker', // Instant - no animation, just value modifier
            'blocker', // Instant - no animation, just value modifier
          ].includes(card.specialType),
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

            // Only ignore blocker if HT is in play AND it's the ORIGINAL play
            // Original play: BOTH players have exactly 1 card (before Data War starts)
            // Once Data War cards are added, blockers should work normally
            const isOriginalPlay =
              p.playedCardsInHand.length === 1 && c.playedCardsInHand.length === 1;
            const shouldIgnoreDueToHT = hostileTakeoverInPlay && isOriginalPlay;

            if (!shouldIgnoreDueToHT) {
              get().applyBlockerEffect(playedBy, card);
            }
            // If Hostile Takeover is in play on first Data War, blocker effect is ignored
            break;
          }
          case 'launch_stack':
            // DON'T add launch stack immediately
            // It will be added in processPendingEffects if the player wins the turn
            break;
          case 'tracker_smacker':
            get().setTrackerSmackerActive(playedBy);
            // Animation will be queued and played sequentially
            break;
          case 'hostile_takeover':
            // Animation will be queued and played sequentially
            break;
          case 'leveraged_buyout':
            // Animation will be queued and played sequentially
            break;
          case 'patent_theft':
            // Animation will be queued and played sequentially
            break;
          case 'temper_tantrum':
            // Animation will be queued and played sequentially
            break;
          case 'mandatory_recall':
            // Animation will be queued and played sequentially
            break;
          case 'forced_empathy':
            // Block game transitions during Forced Empathy animation
            set({ blockTransitions: true });

            // Wait for card to settle on board before showing animation overlay
            // Use instant animation delay for consistency with other instant animations
            setTimeout(() => {
              // STEP 1: Show video overlay (decks don't move yet)
              get().setShowForcedEmpathyAnimation(true);

              // STEP 2: After video ends, hide video and start deck pile animation
              setTimeout(() => {
                get().setShowForcedEmpathyAnimation(false);
                get().setForcedEmpathySwapping(true);

                // STEP 3: After deck piles finish moving (DURATION only, no delay), swap decks and hide animation
                setTimeout(() => {
                  get().swapDecks(); // Swaps deck data and increments deckSwapCount
                  get().setForcedEmpathySwapping(false);

                  // Wait for deck swap to visually settle before unblocking game
                  setTimeout(() => {
                    // Unblock game transitions now that animation is fully complete
                    set({ blockTransitions: false });

                    // Only call callback if no animations are queued
                    // If animations are queued (e.g., OWYW), let the queue system handle the callback
                    const {
                      animationQueue,
                      animationCompletionCallback,
                      isPlayingQueuedAnimation,
                    } = get();
                    if (
                      animationCompletionCallback &&
                      animationQueue.length === 0 &&
                      !isPlayingQueuedAnimation
                    ) {
                      set({ animationCompletionCallback: null });
                      animationCompletionCallback();
                    }
                  }, ANIMATION_DURATIONS.FORCED_EMPATHY_SETTLE_DELAY);
                }, ANIMATION_DURATIONS.FORCED_EMPATHY_SWAP_DURATION);
              }, ANIMATION_DURATIONS.FORCED_EMPATHY_VIDEO_DURATION);
            }, getGameSpeedAdjustedDuration(ANIMATION_DURATIONS.INSTANT_ANIMATION_DELAY)); // Use instant animation delay for consistency
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

        // Categorize effects into priority groups for sequential processing
        // Order: 1) Non-interactive (buyout, theft, recall) → 2) Interactive (tantrum) → 3) Launch Stack
        const nonInteractiveEffects: SpecialEffect[] = [];
        const interactiveEffects: SpecialEffect[] = [];
        const launchStackEffects: SpecialEffect[] = [];

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
            // Immediate effects - process now, don't queue
            case 'open_what_you_want':
              // Mark that OWYW is active for this player's next turn
              get().setOpenWhatYouWantActive(effect.playedBy);
              // Queue pre-reveal effect for next turn
              get().addPreRevealEffect({
                type: 'owyw',
                playerId: effect.playedBy,
                requiresInteraction: effect.playedBy === 'player',
              });
              break;

            case 'data_grab': {
              // Mini-game handles distribution via finalizeDataGrabResults()
              const { cardsInPlay } = get();
              if (cardsInPlay.length === 0) break;

              // Fallback: Random distribution if mini-game wasn't played
              const shuffledCards = [...cardsInPlay].sort(() => Math.random() - 0.5);
              const playerCards: Card[] = [];
              const cpuCards: Card[] = [];
              shuffledCards.forEach((card, index) => {
                if (index % 2 === 0) playerCards.push(card);
                else cpuCards.push(card);
              });

              const player = get().player;
              const cpu = get().cpu;
              set({
                player: { ...player, deck: [...player.deck, ...playerCards] },
                cpu: { ...cpu, deck: [...cpu.deck, ...cpuCards] },
                cardsInPlay: [],
              });
              break;
            }

            // Non-interactive effects - queue for sequential processing
            case 'leveraged_buyout':
            case 'patent_theft':
            case 'mandatory_recall':
              nonInteractiveEffects.push(effect);
              break;

            // Interactive effects - queue after non-interactive
            case 'temper_tantrum':
              interactiveEffects.push(effect);
              break;

            // Launch Stack - always last
            case 'launch_stack':
              launchStackEffects.push(effect);
              break;
          }
        }

        // Combine in priority order: non-interactive → interactive → launch_stack
        const orderedEffects = [
          ...nonInteractiveEffects,
          ...interactiveEffects,
          ...launchStackEffects,
        ];

        // Calculate launch stacks going to winner for rocket timing
        const launchStacksForWinner = launchStackEffects.filter((effect) => {
          const wonByPlayer = winner === effect.playedBy;
          const lostByPlayer = winner !== 'tie' && winner !== effect.playedBy;
          return wonByPlayer || lostByPlayer;
        }).length;

        set({
          effectsQueue: orderedEffects,
          effectsWinner: winner,
          launchStacksForWinnerCount: launchStacksForWinner,
        });

        // Clear pending effects
        get().clearPendingEffects();

        // Start sequential processing
        if (orderedEffects.length > 0) {
          get().processNextEffect();
          return true;
        }

        return false;
      },

      processNextEffect: () => {
        const {
          effectsQueue,
          effectsWinner: winner,
          dataGrabPlayerLaunchStacks,
          dataGrabCPULaunchStacks,
        } = get();

        // If no more effects, do final card collection
        if (effectsQueue.length === 0) {
          const launchStacksForWinner = get().launchStacksForWinnerCount;
          // Release blockTransitions before card collection since all effects are done
          set({ blockTransitions: false });
          get().collectCardsAfterEffects(winner || 'tie', launchStacksForWinner);
          return;
        }

        // Get next effect and update queue
        const effect = effectsQueue[0];
        const remainingEffects = effectsQueue.slice(1);
        set({ effectsQueue: remainingEffects });

        // Queue animation and set callback to process effect + continue
        switch (effect.type) {
          case 'leveraged_buyout':
            // Buyout only triggers when the player who played it WINS
            if (winner === effect.playedBy) {
              get().queueAnimation('move_buyout', effect.playedBy);
              set({
                animationCompletionCallback: () => {
                  const opponentId = effect.playedBy === 'player' ? 'cpu' : 'player';
                  // stealCards will animate the cards and call processNextEffect when done
                  get().stealCards(opponentId, effect.playedBy, 2);
                },
              });
            } else {
              // Effect didn't trigger, continue to next effect
              get().processNextEffect();
            }
            break;

          case 'patent_theft': {
            // Theft only triggers when the player who played it WINS and opponent has launch stacks
            const opponentId = effect.playedBy === 'player' ? 'cpu' : 'player';
            if (winner === effect.playedBy && get()[opponentId].launchStackCount > 0) {
              get().queueAnimation('move_theft', effect.playedBy);
              set({
                animationCompletionCallback: () => {
                  const stolenCard = get().stealLaunchStackStart(opponentId);
                  if (stolenCard) {
                    get().stealLaunchStackComplete(effect.playedBy, stolenCard);
                  }
                  // Continue to next effect
                  get().processNextEffect();
                },
              });
            } else {
              // Effect didn't trigger (lost or no launch stacks to steal), continue to next effect
              get().processNextEffect();
            }
            break;
          }

          case 'mandatory_recall': {
            // Recall only triggers when the player who played it WINS and opponent has launch stacks
            const opponentId = effect.playedBy === 'player' ? 'cpu' : 'player';
            if (winner === effect.playedBy && get()[opponentId].launchStackCount > 0) {
              get().queueAnimation('firewall_recall', effect.playedBy);
              set({
                animationCompletionCallback: () => {
                  const launchStackCount = get()[opponentId].launchStackCount;

                  if (launchStackCount > 0) {
                    set({ recallReturnCount: launchStackCount });
                    get().removeLaunchStacks(opponentId, launchStackCount);
                    get().queueAnimation('mandatory_recall_won', effect.playedBy);
                  }
                  // Continue to next effect
                  get().processNextEffect();
                },
              });
            } else {
              // Effect didn't trigger (lost or no launch stacks to recall), continue to next effect
              get().processNextEffect();
            }
            break;
          }

          case 'temper_tantrum':
            // Tantrum only triggers when the player who played it LOSES
            if (winner && winner !== 'tie' && winner !== effect.playedBy) {
              get().queueAnimation('move_tantrum', effect.playedBy);
              set({
                animationCompletionCallback: () => {
                  const loser = effect.playedBy;
                  const actualWinner = winner as PlayerType;

                  if (loser === 'player') {
                    // PLAYER LOSES: Show modal - modal close will call processNextEffect
                    get().initializeTemperTantrumSelection(actualWinner);
                    // Don't call processNextEffect here - modal will handle continuation
                    return;
                  } else {
                    // CPU LOSES: Automatic selection
                    const currentState = get();
                    const playerCards = currentState.player.playedCardsInHand.map(
                      (pcs) => pcs.card,
                    );
                    const cpuCards = currentState.cpu.playedCardsInHand.map((pcs) => pcs.card);
                    const winnerCards = actualWinner === 'player' ? playerCards : cpuCards;
                    const cardsToSteal = winnerCards.slice(0, 2);

                    if (cardsToSteal.length > 0) {
                      get().stealCards(actualWinner, loser, 2);
                    }
                  }
                  // Continue to next effect
                  get().processNextEffect();
                },
              });
            } else {
              // Tantrum player won or tied - no effect, continue to next
              get().processNextEffect();
            }
            break;

          case 'launch_stack': {
            // Gather all launch_stack effects (current one + remaining in queue)
            const remainingQueue = get().effectsQueue;
            const allLaunchStacks = [
              effect,
              ...remainingQueue.filter((e) => e.type === 'launch_stack'),
            ];

            // Play ONE animation for all launch stacks
            get().queueAnimation('launch_stack', effect.playedBy);
            set({
              animationCompletionCallback: () => {
                // Process ALL launch_stack effects
                for (const lsEffect of allLaunchStacks) {
                  // Use destination override if set (e.g., stolen by Temper Tantrum)
                  if (lsEffect.destinationOverride) {
                    get().addLaunchStack(lsEffect.destinationOverride, lsEffect.card);
                  } else {
                    // Check if this specific launch stack was collected in Data Grab
                    const matchedByCPU = dataGrabCPULaunchStacks.find(
                      (c) => c.card.id === lsEffect.card.id,
                    );
                    const matchedByPlayer = dataGrabPlayerLaunchStacks.find(
                      (c) => c.card.id === lsEffect.card.id,
                    );

                    if (matchedByCPU) {
                      get().addLaunchStack('cpu', matchedByCPU.card);
                    } else if (matchedByPlayer) {
                      get().addLaunchStack('player', matchedByPlayer.card);
                    } else if (winner === lsEffect.playedBy) {
                      // Won - goes to player who played it
                      get().addLaunchStack(lsEffect.playedBy, lsEffect.card);
                    } else if (winner !== 'tie') {
                      // Lost - goes to winner
                      const winnerId = lsEffect.playedBy === 'player' ? 'cpu' : 'player';
                      get().addLaunchStack(winnerId, lsEffect.card);
                    }
                  }
                }

                // Remove remaining launch_stack effects from queue
                const filteredQueue = get().effectsQueue.filter((e) => e.type !== 'launch_stack');
                set({ effectsQueue: filteredQueue });

                // Continue to next effect
                get().processNextEffect();
              },
            });
            break;
          }
        }
      },

      /**
       * Phase 1 of Patent Theft: Remove card from opponent's launch stack
       * Returns the stolen card so it can be added to winner's stack after animation
       */
      stealLaunchStackStart: (from: PlayerType) => {
        const fromPlayer = get()[from];
        const fromLaunchStackKey = from === 'player' ? 'playerLaunchStacks' : 'cpuLaunchStacks';
        const fromLaunchStacks = get()[fromLaunchStackKey];

        // Only steal if opponent has Launch Stack cards
        if (fromPlayer.launchStackCount > 0 && fromLaunchStacks.length > 0) {
          // Take the first Launch Stack card from opponent's collection
          const stolenCard = fromLaunchStacks[0];
          const remainingFromStacks = fromLaunchStacks.slice(1);

          // Reduce opponent's counter and remove card from their collection
          set({
            [from]: { ...fromPlayer, launchStackCount: fromPlayer.launchStackCount - 1 },
            [fromLaunchStackKey]: remainingFromStacks,
          });

          return stolenCard; // Return the stolen card for phase 2
        }
        return null;
      },

      /**
       * Phase 2 of Patent Theft: Add stolen card to winner's launch stack
       * This will automatically trigger the rocket animation via PlayerDeck's useEffect
       */
      stealLaunchStackComplete: (to: PlayerType, stolenCard: Card) => {
        if (!stolenCard) return;

        const toPlayer = get()[to];
        const toLaunchStackKey = to === 'player' ? 'playerLaunchStacks' : 'cpuLaunchStacks';
        const toLaunchStacks = get()[toLaunchStackKey];

        // Add stolen card to winner's Launch Stack collection and increment counter
        // This counter increment will automatically trigger the rocket animation
        set({
          [to]: { ...toPlayer, launchStackCount: toPlayer.launchStackCount + 1 },
          [toLaunchStackKey]: [...toLaunchStacks, stolenCard],
        });
      },

      // Legacy function for backward compatibility (not used anymore)
      stealLaunchStack: (from, to) => {
        const fromPlayer = get()[from];
        const toPlayer = get()[to];
        const fromLaunchStackKey = from === 'player' ? 'playerLaunchStacks' : 'cpuLaunchStacks';
        const toLaunchStackKey = to === 'player' ? 'playerLaunchStacks' : 'cpuLaunchStacks';
        const fromLaunchStacks = get()[fromLaunchStackKey];
        const toLaunchStacks = get()[toLaunchStackKey];

        // Only steal if opponent has Launch Stack cards
        if (fromPlayer.launchStackCount > 0 && fromLaunchStacks.length > 0) {
          // Take the first Launch Stack card from opponent's collection
          const stolenCard = fromLaunchStacks[0];
          const remainingFromStacks = fromLaunchStacks.slice(1);

          // Add stolen card to winner's Launch Stack collection
          // Winner's Launch Stack counter DOES increase
          set({
            [from]: { ...fromPlayer, launchStackCount: fromPlayer.launchStackCount - 1 },
            [to]: { ...toPlayer, launchStackCount: toPlayer.launchStackCount + 1 },
            [fromLaunchStackKey]: remainingFromStacks,
            [toLaunchStackKey]: [...toLaunchStacks, stolenCard],
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
      setShowTrackerSmackerAnimation: (show) => {
        set({ showTrackerSmackerAnimation: show });
      },
      setShowLeveragedBuyoutAnimation: (show) => {
        set({ showLeveragedBuyoutAnimation: show });
      },
      setShowPatentTheftAnimation: (show) => {
        set({ showPatentTheftAnimation: show });
      },
      setShowTemperTantrumAnimation: (show) => {
        set({ showTemperTantrumAnimation: show });
      },
      setShowMandatoryRecallAnimation: (show) => {
        set({ showMandatoryRecallAnimation: show });
      },
      setShowTheftWonAnimation: (show) => {
        set({ showTheftWonAnimation: show });
      },
      setShowRecallWonAnimation: (show) => {
        set({ showRecallWonAnimation: show });
      },

      // Animation Queue Actions
      queueAnimation: (type, playedBy) => {
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

      setAnimationCompletionCallback: (callback) => {
        set({ animationCompletionCallback: callback });
      },

      // Check and queue animations for special cards played by both players
      // Returns true if animations were queued
      queueSpecialCardAnimations: () => {
        const { player, cpu, trackerSmackerActive, shownAnimationCardIds } = get();

        const playerCard = player.playedCard;
        const cpuCard = cpu.playedCard;

        const animationsToQueue: Array<{ type: SpecialCardType; playedBy: PlayerType }> = [];

        // Helper to check if a card should show animation
        const shouldShowAnimation = (card: Card | null, playedBy: PlayerType): boolean => {
          if (!card || !card.specialType) return false;

          // Skip if this card has already shown its animation
          if (shownAnimationCardIds.has(card.id)) return false;

          // Skip tracker and blocker - they don't have animations
          if (card.specialType === 'tracker' || card.specialType === 'blocker') return false;

          // Skip forced_empathy - it has custom animation handling in handleCardEffect
          if (card.specialType === 'forced_empathy') return false;

          // Skip data_grab - it has its own mini-game flow, no separate animation needed
          if (card.specialType === 'data_grab') return false;

          // Skip post-resolution animations - these play only after winner is determined
          const isPostResolutionCard =
            card.specialType === 'launch_stack' ||
            card.specialType === 'patent_theft' ||
            card.specialType === 'leveraged_buyout' ||
            card.specialType === 'temper_tantrum' ||
            card.specialType === 'mandatory_recall';

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

      // Data Grab Actions
      checkForDataGrab: () => {
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

      startDataGrabGame: () => {
        set({
          showDataGrabTakeover: false,
          dataGrabGameActive: true,
        });
      },

      collectDataGrabCard: (cardId, collectedBy) => {
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
            pendingTrackerBonus: 0,
            pendingBlockerPenalty: 0,
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

      setShowDataGrabTakeover: (show) => {
        set({ showDataGrabTakeover: show });
      },

      setDataGrabGameActive: (active) => {
        set({ dataGrabGameActive: active });
      },

      setShowDataGrabResults: (show) => {
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

      setShowDataGrabCookies: (show) => {
        set({ showDataGrabCookies: show });
      },

      // Debug Actions
      setGameSpeedMultiplier: (multiplier) => {
        set({ gameSpeedMultiplier: multiplier });
      },

      logEvent: (type, message, details?, level = 'info') => {
        const event = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          type,
          message,
          details,
          level,
        };
        set((state) => ({
          eventLog: [...state.eventLog, event],
        }));
      },

      // Temper Tantrum Actions
      initializeTemperTantrumSelection: (winner) => {
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

      selectTemperTantrumCard: (card) => {
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

      confirmTemperTantrumSelection: () => {
        const { temperTantrumSelectedCards, temperTantrumWinner } = get();

        if (!temperTantrumWinner) return;

        const winner = temperTantrumWinner;
        const loser: PlayerType = winner === 'player' ? 'cpu' : 'player';

        // Separate stolen cards into Launch Stacks and regular cards
        const stolenCards = temperTantrumSelectedCards;
        const stolenLaunchStacks = stolenCards.filter(
          (card) => card.specialType === 'launch_stack',
        );
        const stolenRegularCards = stolenCards.filter(
          (card) => card.specialType !== 'launch_stack',
        );

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
              loser === 'player'
                ? [...state.player.deck, ...stolenRegularCards]
                : state.player.deck,
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

      setShowTemperTantrumModal: (show) => {
        set({ showTemperTantrumModal: show });
      },

      // UI Actions
      selectBillionaire: (billionaire) => {
        const cpuBillionaire = getRandomBillionaire(billionaire as BillionaireId);
        set({
          selectedBillionaire: billionaire,
          cpuBillionaire,
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
        get().playAudio(TRACKS.WHOOSH);
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

      toggleMusic: () => {
        const newValue = !get().musicEnabled;
        set({ musicEnabled: newValue });
        localStorage.setItem('musicEnabled', String(newValue));
      },

      toggleSoundEffects: () => {
        const newValue = !get().soundEffectsEnabled;
        set({ soundEffectsEnabled: newValue });
        localStorage.setItem('soundEffectsEnabled', String(newValue));
      },

      toggleInstructions: () => {
        set({ showInstructions: !get().showInstructions });
      },

      setShowTooltip: (show) => {
        set({ showTooltip: show });
      },

      // ===== Audio Manager Actions =====

      playAudio: async (trackId: AudioTrackId, options: PlayOptions = {}): Promise<boolean> => {
        const track = AUDIO_TRACKS[trackId];
        if (!track) {
          console.error(`Unknown audio track: ${trackId}`);
          return false;
        }

        const state = get();
        const enabled = track.category === 'music' ? state.musicEnabled : state.soundEffectsEnabled;
        if (!enabled) return false;

        const audio = getPreloadedAudio(trackId, track.category === 'music');
        if (!audio) {
          console.warn(`Audio not preloaded: ${trackId}`);
          return false;
        }

        // SFX: Find available channel for overlapping playback
        if (track.category === 'sfx') {
          // Find first available (null or ended) SFX channel
          let channelIndex = state.audioSfxChannels.findIndex(
            (ch) => ch === null || ch.ended || ch.paused,
          );

          // If all channels busy, use the first one (oldest sound)
          if (channelIndex === -1) {
            channelIndex = 0;
          }

          const sfxChannels = [...state.audioSfxChannels];
          const sfxTrackIds = [...state.audioSfxTrackIds];

          sfxChannels[channelIndex] = audio;
          sfxTrackIds[channelIndex] = trackId;

          audio.volume = options.volume ?? track.volume ?? 1.0;
          audio.currentTime = 0; // Reset to start

          set({
            audioSfxChannels: sfxChannels,
            audioSfxTrackIds: sfxTrackIds,
          });

          try {
            await audio.play();
            return true;
          } catch (error) {
            console.error(`Failed to play ${trackId}:`, error);
            return false;
          }
        }

        // Music: Only one track at a time
        const currentAudio = state.audioMusicChannel;

        // Helper function to fade volume (music only)
        const fadeVolume = (
          audioElement: HTMLAudioElement,
          targetVolume: number,
          duration: number,
        ): Promise<void> => {
          return new Promise((resolve) => {
            const startVolume = audioElement.volume;
            const volumeDelta = targetVolume - startVolume;
            const stepTime = 50;
            const steps = duration / stepTime;
            const volumeStep = volumeDelta / steps;

            set({
              audioMusicFading: true,
            });

            let currentStep = 0;
            const fadeInterval = setInterval(() => {
              currentStep++;
              const newVolume = startVolume + volumeStep * currentStep;

              if (currentStep >= steps) {
                audioElement.volume = targetVolume;
                clearInterval(fadeInterval);
                set({
                  audioMusicFading: false,
                });
                resolve();
              } else {
                audioElement.volume = Math.max(0, Math.min(1, newVolume));
              }
            }, stepTime);
          });
        };

        // Handle fade out of current track
        if (currentAudio && currentAudio !== audio) {
          // Only fade/stop if it's a different track
          if (options.fadeOut && options.fadeOut > 0) {
            await fadeVolume(currentAudio, 0, options.fadeOut);
            currentAudio.pause();
            currentAudio.currentTime = 0;
          } else {
            currentAudio.pause();
            currentAudio.currentTime = 0;
          }
        }

        // Setup new audio (music only - SFX handled above)
        audio.loop = options.loop ?? track.loop ?? false;
        audio.muted = false;

        const targetVolume = options.volume ?? track.volume ?? 1.0;

        set({
          audioMusicChannel: audio,
          audioMusicTrackId: trackId,
          audioMusicVolume: targetVolume,
        });

        if (options.fadeIn && options.fadeIn > 0) {
          audio.volume = 0;
          try {
            await audio.play();
            await fadeVolume(audio, targetVolume, options.fadeIn);
            return true;
          } catch (error) {
            console.error(`Failed to play ${trackId}:`, error);
            return false;
          }
        } else {
          audio.volume = targetVolume;
          try {
            await audio.play();
            return true;
          } catch (error) {
            console.error(`Failed to play ${trackId}:`, error);
            return false;
          }
        }
      },

      stopAudio: (options) => {
        const { channel, trackId, fadeOut } = options;
        const state = get();

        if (channel === 'sfx') {
          // Stop all SFX channels if trackId matches (or all if no trackId specified)
          const sfxChannels = [...state.audioSfxChannels];
          const sfxTrackIds = [...state.audioSfxTrackIds];

          sfxChannels.forEach((audio, index) => {
            if (audio && (!trackId || sfxTrackIds[index] === trackId)) {
              audio.pause();
              audio.currentTime = 0;
              sfxChannels[index] = null;
              sfxTrackIds[index] = null;
            }
          });

          set({
            audioSfxChannels: sfxChannels,
            audioSfxTrackIds: sfxTrackIds,
          });
          return;
        }

        // Music channel
        const audio = state.audioMusicChannel;
        const currentTrackId = state.audioMusicTrackId;

        // If trackId is specified, only stop if it matches the currently playing track
        if (trackId && currentTrackId !== trackId) {
          return;
        }

        if (!audio) return;

        // Helper function to fade volume
        const fadeVolume = (
          audioElement: HTMLAudioElement,
          targetVolume: number,
          duration: number,
        ): Promise<void> => {
          return new Promise((resolve) => {
            const startVolume = audioElement.volume;
            const volumeDelta = targetVolume - startVolume;
            const stepTime = 50;
            const steps = duration / stepTime;
            const volumeStep = volumeDelta / steps;

            set({
              [channel === 'music' ? 'audioMusicFading' : 'audioSfxFading']: true,
            });

            let currentStep = 0;
            const fadeInterval = setInterval(() => {
              currentStep++;
              const newVolume = startVolume + volumeStep * currentStep;

              if (currentStep >= steps) {
                audioElement.volume = targetVolume;
                clearInterval(fadeInterval);
                set({
                  [channel === 'music' ? 'audioMusicFading' : 'audioSfxFading']: false,
                });
                resolve();
              } else {
                audioElement.volume = Math.max(0, Math.min(1, newVolume));
              }
            }, stepTime);
          });
        };

        if (fadeOut && fadeOut > 0) {
          fadeVolume(audio, 0, fadeOut).then(() => {
            audio.pause();
            audio.currentTime = 0;
            set({
              [channel === 'music' ? 'audioMusicChannel' : 'audioSfxChannel']: null,
              [channel === 'music' ? 'audioMusicTrackId' : 'audioSfxTrackId']: null,
            });
          });
        } else {
          audio.pause();
          audio.currentTime = 0;
          set({
            audioMusicChannel: null,
            audioMusicTrackId: null,
          });
        }
      },

      pauseAudio: (channel: 'music' | 'sfx') => {
        const state = get();
        if (channel === 'music') {
          const audio = state.audioMusicChannel;
          if (audio) {
            audio.pause();
          }
        } else {
          // Pause all active SFX
          state.audioSfxChannels.forEach((audio) => {
            if (audio) {
              audio.pause();
            }
          });
        }
      },

      resumeAudio: (channel: 'music' | 'sfx') => {
        const state = get();
        const enabled = channel === 'music' ? state.musicEnabled : state.soundEffectsEnabled;

        if (!enabled) return;

        if (channel === 'music') {
          const audio = state.audioMusicChannel;
          if (audio) {
            audio.currentTime = 0; // Start from beginning
            audio.play().catch((error: unknown) => {
              console.error(`Failed to resume music:`, error);
            });
          }
        } else {
          // Resume all paused SFX
          state.audioSfxChannels.forEach((audio) => {
            if (audio && audio.paused) {
              audio.play().catch((error: unknown) => {
                console.error(`Failed to resume sfx:`, error);
              });
            }
          });
        }
      },

      setAudioVolume: (channel: 'music' | 'sfx', volume: number) => {
        const state = get();
        const clampedVolume = Math.max(0, Math.min(1, volume));

        if (channel === 'music') {
          const audio = state.audioMusicChannel;
          const isFading = state.audioMusicFading;

          set({
            audioMusicVolume: clampedVolume,
          });

          if (audio && !isFading) {
            audio.volume = clampedVolume;
          }
        } else {
          set({
            audioSfxVolume: clampedVolume,
          });

          // Update volume for all active SFX (if not individually fading)
          state.audioSfxChannels.forEach((audio) => {
            if (audio && !state.audioSfxFading) {
              audio.volume = clampedVolume;
            }
          });
        }
      },

      isAudioReady: (trackId: AudioTrackId): boolean => {
        // Check store state for reactive updates
        return get().audioTracksReady.has(trackId);
      },

      markAudioReady: (trackId: AudioTrackId) => {
        set((state) => {
          const newSet = new Set(state.audioTracksReady);
          newSet.add(trackId);
          return { audioTracksReady: newSet };
        });
      },

      markAudioFailed: (trackId: AudioTrackId) => {
        set((state) => {
          const newSet = new Set(state.audioTracksReady);
          newSet.delete(trackId);
          return { audioTracksReady: newSet };
        });
      },

      getAudioState: () => {
        const state = get();
        return {
          music: {
            playing: state.audioMusicChannel !== null && !state.audioMusicChannel.paused,
            trackId: state.audioMusicTrackId,
            volume: state.audioMusicVolume,
          },
          sfx: {
            playing: state.audioSfxChannels.some((ch) => ch !== null && !ch.paused),
            trackId: state.audioSfxTrackIds.find((id) => id !== null) ?? null,
            volume: state.audioSfxVolume,
          },
        };
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

      // Effect Notification - Accumulation Actions
      addEffectToAccumulation: (notification) => {
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

      openEffectModal: () => {
        set({
          showEffectNotificationModal: true,
          effectAccumulationPaused: true, // Pause game
          blockTransitions: true, // Block state machine transitions while modal is open
        });
      },

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

      // Progress Timer Actions
      startEffectBadgeTimer: () => {
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

      stopEffectBadgeTimer: () => {
        set({
          effectBadgeTimerActive: false,
          effectBadgeTimerStartTime: null,
        });
      },

      isEffectTimerActive: () => {
        return get().effectBadgeTimerActive;
      },

      // Tooltip System Actions
      incrementTooltipCount: (tooltipId) => {
        const { tooltipDisplayCounts, tooltipPersistence } = get();

        // Increment the count (default to 0 if not present)
        const currentCount = tooltipDisplayCounts[tooltipId] || 0;
        const newCounts = {
          ...tooltipDisplayCounts,
          [tooltipId]: currentCount + 1,
        };

        set({ tooltipDisplayCounts: newCounts });

        if (tooltipPersistence === 'localStorage') {
          localStorage.setItem('tooltipDisplayCounts', JSON.stringify(newCounts));
        }
      },

      getTooltipDisplayCount: (tooltipId) => {
        const { tooltipDisplayCounts } = get();
        return tooltipDisplayCounts[tooltipId] || 0;
      },

      shouldShowTooltip: (tooltipId, maxDisplayCount) => {
        const currentCount = get().getTooltipDisplayCount(tooltipId);

        // If maxDisplayCount is null, always show
        if (maxDisplayCount === null) {
          return true;
        }

        // Check if we haven't reached the max display count
        return currentCount < maxDisplayCount;
      },

      clearTooltipCounts: () => {
        set({ tooltipDisplayCounts: {} });
        localStorage.removeItem('tooltipDisplayCounts');
      },

      setTooltipPersistence: (mode) => {
        set({ tooltipPersistence: mode });

        if (mode === 'memory') {
          localStorage.removeItem('tooltipDisplayCounts');
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

      updatePreloadingProgress: (stats) => {
        const shouldBeComplete = stats.essentialAssetsReady && stats.vsVideoReady;
        const shouldHighPriorityBeReady = stats.highPriorityAssetsReady;
        const shouldCriticalPriorityBeReady = stats.criticalPriorityAssetsReady;
        const currentState = get();
        const wasComplete = currentState.preloadingComplete;
        const wasHighPriorityReady = currentState.highPriorityAssetsReady;
        const wasCriticalPriorityReady = currentState.criticalPriorityAssetsReady;

        // Update progress immediately (except for delayed flags)
        set({
          assetsLoaded: stats.assetsLoaded,
          assetsTotal: stats.assetsTotal,
          essentialAssetsReady: stats.essentialAssetsReady,
          vsVideoReady: stats.vsVideoReady,
          highPriorityProgress: stats.highPriorityProgress,
          essentialProgress: stats.essentialProgress,
          criticalProgress: stats.criticalProgress,
        });

        if (shouldCriticalPriorityBeReady && !wasCriticalPriorityReady) {
          const hasShownCriticalLoadingScreen = currentState.hasShownCriticalLoadingScreen;
          const delay = hasShownCriticalLoadingScreen
            ? ANIMATION_DURATIONS.LOADING_SCREEN_COMPLETE_DELAY
            : 0;

          setTimeout(() => {
            set({ criticalPriorityAssetsReady: true });
          }, delay);
        }

        // Add delay before setting highPriorityAssetsReady to true
        // Only delay if user has seen the loading screen - otherwise allow immediate progression
        if (shouldHighPriorityBeReady && !wasHighPriorityReady) {
          const hasShownLoadingScreen = currentState.hasShownHighPriorityLoadingScreen;
          const delay = hasShownLoadingScreen
            ? ANIMATION_DURATIONS.LOADING_SCREEN_COMPLETE_DELAY
            : 0; // 800ms only if user saw loading screen

          setTimeout(() => {
            set({ highPriorityAssetsReady: true });
          }, delay);
        } else if (!shouldHighPriorityBeReady && wasHighPriorityReady) {
          // If assets become incomplete (e.g., new billionaire selected), update immediately
          set({ highPriorityAssetsReady: false });
        }

        // Add delay before setting preloadingComplete to true
        // Only delay if user has seen the loading screen - otherwise allow immediate progression
        if (shouldBeComplete && !wasComplete) {
          const hasShownLoadingScreen = currentState.hasShownEssentialLoadingScreen;
          const delay = hasShownLoadingScreen
            ? ANIMATION_DURATIONS.LOADING_SCREEN_COMPLETE_DELAY
            : 0; // 800ms only if user saw loading screen

          setTimeout(() => {
            set({ preloadingComplete: true });
          }, delay);
        } else if (!shouldBeComplete && wasComplete) {
          // If assets become incomplete (e.g., new billionaire selected), update immediately
          set({ preloadingComplete: false });
        }
      },

      setHasShownHighPriorityLoadingScreen: (shown) => {
        set({ hasShownHighPriorityLoadingScreen: shown });
      },

      setHasShownEssentialLoadingScreen: (shown) => {
        set({ hasShownEssentialLoadingScreen: shown });
      },

      setHasShownCriticalLoadingScreen: (shown) => {
        set({ hasShownCriticalLoadingScreen: shown });
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
          shouldTransitionToWin: false,
          showingWinEffect: null,
          collecting: null,
          deckClickBlocked: false,
          playerLaunchStacks: [],
          cpuLaunchStacks: [],
          isPaused: false,
          showMenu: false,
          showGameOverScreen: false,
          audioEnabled: true,
          showHandViewer: false,
          showTooltip: false,
          showForcedEmpathyAnimation: false,
          forcedEmpathySwapping: false,
          deckSwapCount: 0,
          showHostileTakeoverAnimation: false,
          showTrackerSmackerAnimation: false,
          showLeveragedBuyoutAnimation: false,
          showPatentTheftAnimation: false,
          showTemperTantrumAnimation: false,
          showMandatoryRecallAnimation: false,
          showTheftWonAnimation: false,
          animationQueue: [],
          isPlayingQueuedAnimation: false,
          animationsPaused: false,
          blockTransitions: false,
          hostileTakeoverDataWar: false,
          // Reset Data Grab state
          dataGrabActive: false,
          dataGrabCards: [],
          dataGrabCollectedByPlayer: [],
          dataGrabCollectedByCPU: [],
          dataGrabDistributions: [],
          showDataGrabTakeover: false,
          dataGrabGameActive: false,
          showDataGrabResults: false,
          // Reset Temper Tantrum state
          showTemperTantrumModal: false,
          temperTantrumAvailableCards: [],
          temperTantrumSelectedCards: [],
          temperTantrumMaxSelections: 2,
          temperTantrumWinner: null,
          temperTantrumLoserCards: [],
          // Reset Asset Preloading State
          hasShownCriticalLoadingScreen: false,
          hasShownHighPriorityLoadingScreen: false,
          hasShownEssentialLoadingScreen: false,
        });
      },
    }),
    { name: 'DataWarGame' },
  ),
);

// Expose store globally for game speed helper function
if (typeof window !== 'undefined') {
  // @ts-expect-error - global store for game speed helper
  window.__gameStore = useGameStore;
}
