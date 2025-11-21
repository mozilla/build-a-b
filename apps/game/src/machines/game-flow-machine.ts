/**
 * XState Machine - Game Flow Control
 * Manages all game phases and transitions
 */

import { assign, createMachine } from 'xstate';
import { ANIMATION_DURATIONS, getGameSpeedAdjustedDuration } from '../config/animation-timings';
import type { TooltipKey } from '../config/tooltip-config';
import { useGameStore } from '../store/game-store';
import { isEffectBlocked, shouldTriggerAnotherPlay } from '../utils/card-comparison';

export interface GameFlowContext {
  currentTurn: number;
  trackerSmackerActive: 'player' | 'cpu' | null;
  tooltipMessage: TooltipKey; // References a key from TOOLTIP_CONFIGS
}

export type GameFlowEvent =
  | { type: 'START_GAME' }
  | { type: 'SKIP_TO_GAME' } // Skip setup and go directly to ready state
  | { type: 'SELECT_BILLIONAIRE'; billionaire: string }
  | { type: 'SELECT_BACKGROUND'; background: string }
  | { type: 'SHOW_GUIDE' }
  | { type: 'SKIP_INSTRUCTIONS' }
  | { type: 'SHOW_MISSION' }
  | { type: 'START_PLAYING' }
  | { type: 'SKIP_GUIDE' }
  | { type: 'VS_ANIMATION_COMPLETE' }
  | { type: 'REVEAL_CARDS' }
  | { type: 'CARDS_REVEALED' }
  | { type: 'TIE' }
  | { type: 'NO_TIE' }
  | { type: 'DATA_GRAB' }
  | { type: 'SPECIAL_EFFECT' }
  | { type: 'NO_SPECIAL_EFFECT' }
  | { type: 'RESOLVE_TURN' }
  | { type: 'TAP_DECK' }
  | { type: 'DISMISS_EFFECT' }
  | { type: 'CHECK_WIN_CONDITION' }
  | { type: 'WIN' }
  | { type: 'CONTINUE' }
  | { type: 'RESET_GAME' }
  | { type: 'RESTART_GAME' } // Restart game and go to VS animation
  | { type: 'QUIT_GAME' }
  | { type: 'START_OWYW_ANIMATION' } // Start OWYW animation (transition to animating sub-state)
  | { type: 'CARD_SELECTED' } // Player confirmed card selection from OWYW modal
  | { type: 'PRE_REVEAL_COMPLETE' } // All pre-reveal effects processed
  | { type: 'SHOW_EFFECT_NOTIFICATION' } // Transition to effect notification
  | { type: 'EFFECT_NOTIFICATION_DISMISSED' } // User closed modal
  | { type: 'EFFECT_NOTIFICATION_COMPLETE' } // Skip if no notifications
  | { type: 'DATA_GRAB_COUNTDOWN_COMPLETE' } // Countdown finished, start mini-game
  | { type: 'DATA_GRAB_GAME_COMPLETE' } // Mini-game timer ended
  | { type: 'DATA_GRAB_RESULTS_VIEWED' }; // User viewed results, continue to resolving

export type EventType = GameFlowEvent['type'];
/**
 * Events that occur during non-gameplay phases (setup and intro screens)
 * These events fire before actual card gameplay begins
 */
export const NON_GAMEPLAY_EVENT_TYPES = [
  'START_GAME',
  'SELECT_BILLIONAIRE',
  'SELECT_BACKGROUND',
  'SHOW_GUIDE',
  'SKIP_INSTRUCTIONS',
  'SHOW_MISSION',
  'START_PLAYING',
  'SKIP_GUIDE',
  'VS_ANIMATION_COMPLETE',
] as const;

/**
 * Phases/states that occur during non-gameplay (setup and intro screens)
 * These are the state machine state names before actual card gameplay begins
 */
export const NON_GAMEPLAY_PHASES = [
  'welcome',
  'select_billionaire',
  'select_background',
  'intro',
  'quick_start_guide',
  'your_mission',
  'vs_animation',
] as const;

/**
 * Type union of all non-gameplay event types
 */
export type NonGameplayEventType = (typeof NON_GAMEPLAY_EVENT_TYPES)[number];
export type GameplayEventType = Exclude<EventType, NonGameplayEventType>;

/**
 * Type union of all non-gameplay phase names
 */
export type NonGameplayPhase = (typeof NON_GAMEPLAY_PHASES)[number];

/**
 * Type union of events that occur during non-gameplay phases
 */
export type NonGameplayEvent = Extract<GameFlowEvent, { type: NonGameplayEventType }>;
export type GameplayEvent = Exclude<GameFlowEvent, NonGameplayEvent>;

export const gameFlowMachine = createMachine(
  {
    id: 'dataWarGame',
    initial: 'welcome',
    types: {} as {
      context: GameFlowContext;
      events: GameFlowEvent;
    },
    context: {
      currentTurn: 0,
      trackerSmackerActive: null,
      tooltipMessage: 'EMPTY',
    },
    states: {
      welcome: {
        on: {
          START_GAME: 'select_billionaire',
          SKIP_TO_GAME: 'ready', // Allow skipping directly to ready for testing
        },
      },

      select_billionaire: {
        on: {
          SELECT_BILLIONAIRE: 'select_background',
        },
      },

      select_background: {
        on: {
          SELECT_BACKGROUND: 'intro',
        },
      },

      intro: {
        entry: assign({
          tooltipMessage: 'INTRO',
        }),
        on: {
          SHOW_GUIDE: 'quick_start_guide',
          SKIP_INSTRUCTIONS: {
            target: 'vs_animation',
            guard: 'assetsPreloaded',
          },
          SKIP_TO_GAME: 'ready', // Allow skipping directly to ready for testing
        },
      },

      quick_start_guide: {
        entry: assign({
          tooltipMessage: 'QUICK_START_GUIDE',
        }),
        on: {
          SHOW_MISSION: 'your_mission',
          SKIP_GUIDE: 'your_mission',
        },
      },

      your_mission: {
        entry: assign({
          tooltipMessage: 'YOUR_MISSION',
        }),
        on: {
          START_PLAYING: {
            target: 'vs_animation',
            guard: 'assetsPreloaded',
          },
        },
      },

      vs_animation: {
        on: {
          VS_ANIMATION_COMPLETE: 'ready',
        },
      },

      ready: {
        entry: assign({
          tooltipMessage: ({ context }) => {
            // Check if we're expecting another play (after tracker/blocker/launch stack)
            const state = useGameStore.getState();
            if (state.anotherPlayExpected) {
              return 'PLAY_AGAIN';
            }

            // First turn only: show "Tap to start!"
            if (context.currentTurn === 0) {
              return 'READY_TAP_DECK';
            }

            // All subsequent turns: show "Tap to continue"
            return 'TAP_TO_CONTINUE';
          },
        }),
        on: {
          REVEAL_CARDS: {
            target: 'revealing',
            guard: 'notShowingEffectModal',
          },
          CHECK_WIN_CONDITION: [
            {
              target: 'game_over',
              guard: 'hasWinCondition',
            },
            {
              target: 'pre_reveal',
            },
          ],
        },
      },

      revealing: {
        entry: assign({
          tooltipMessage: () => {
            return 'EMPTY';
          },
        }),
        on: {
          CARDS_REVEALED: 'effect_notification',
        },
      },

      effect_notification: {
        initial: 'checking',
        states: {
          checking: {
            // Check if there are unseen effect notifications and add to accumulation (non-blocking)
            entry: assign({
              tooltipMessage: () => {
                return 'EMPTY';
              },
            }),
            after: {
              // Dynamic delay based on whether there are accumulated effects to show
              effectNotificationDelay: {
                target: '#dataWarGame.comparing',
              },
            },
          },
        },
      },

      comparing: {
        entry: assign({
          tooltipMessage: () => {
            return 'EMPTY';
          },
        }),
        // Automatic transitions for special game states (Special Effects, Data War, Data Grab)
        // IMPORTANT: Special effects must be checked BEFORE data war to prevent conflicts
        // Normal resolution is handled manually via handleCompareTurnContinued to allow badge interaction
        after: {
          // Dynamic delay: Fast for common cards, normal for special cards/data war
          comparisonDelay: [
            // Check for special effects FIRST (highest priority)
            { target: 'special_effect', guard: 'hasSpecialEffectsAndNotAnimating' },
            // Then check for Data War and Data Grab (must check modal not open)
            { target: 'data_war', guard: 'isDataWarAndNotAnimating' },
            { target: 'data_grab', guard: 'isDataGrabAndNotAnimating' },
            // Normal resolution is handled manually (no automatic transition here)
          ],
        },
        on: {
          TIE: 'data_war',
          DATA_GRAB: 'data_grab',
          SPECIAL_EFFECT: 'special_effect',
          RESOLVE_TURN: {
            target: 'resolving',
            actions: () => {},
          },
        },
      },

      data_war: {
        initial: 'pre_animation',
        entry: () => {
          // Clear pending bonuses/penalties (Data War = fresh start)
          const { player, cpu } = useGameStore.getState();
          const playerHasHostileTakeover = player.playedCard?.specialType === 'hostile_takeover';
          const cpuHasHostileTakeover = cpu.playedCard?.specialType === 'hostile_takeover';

          // Check if HT effect applies (preserves HT owner's value)
          // First data war: both have exactly 1 card
          // HT as face-up: both have equal cards > 1
          const isFirstDataWar =
            player.playedCardsInHand.length === 1 && cpu.playedCardsInHand.length === 1;
          const htAsFaceUp =
            (playerHasHostileTakeover || cpuHasHostileTakeover) &&
            player.playedCardsInHand.length === cpu.playedCardsInHand.length &&
            player.playedCardsInHand.length > 1;
          const htEffectApplies = isFirstDataWar || htAsFaceUp;

          useGameStore.setState({
            player: {
              ...player,
              pendingTrackerBonus: 0,
              pendingBlockerPenalty: 0,
              currentTurnValue:
                playerHasHostileTakeover && htEffectApplies ? player.playedCard?.value ?? 6 : 0,
            },
            cpu: {
              ...cpu,
              pendingTrackerBonus: 0,
              pendingBlockerPenalty: 0,
              currentTurnValue:
                cpuHasHostileTakeover && htEffectApplies ? cpu.playedCard?.value ?? 6 : 0,
            },
            anotherPlayExpected: false, // Clear flag (fresh start)
            anotherPlayMode: false, // Clear another play mode (Data War is fresh start)
            activePlayer: 'player', // Reset active player to default
          });
        },
        states: {
          pre_animation: {
            // Delay before showing the data war animation (breathing room after comparison)
            // Skip delay immediately if this is the first data war from hostile takeover
            always: [
              {
                target: 'reveal_face_down',
                guard: 'isHostileTakeoverFirstDataWar',
              },
            ],
            after: {
              [getGameSpeedAdjustedDuration(ANIMATION_DURATIONS.INSTANT_ANIMATION_DELAY)]:
                'animating',
            },
          },
          animating: {
            // Show data war animation
            after: {
              [ANIMATION_DURATIONS.DATA_WAR_ANIMATION_DURATION]: 'reveal_face_down',
            },
          },
          reveal_face_down: {
            entry: assign({
              tooltipMessage: 'DATA_WAR_FACE_DOWN',
            }),
            on: {
              TAP_DECK: {
                target: 'reveal_face_up',
                guard: 'notShowingEffectModal',
              },
            },
          },
          reveal_face_up: {
            initial: 'settling',
            states: {
              settling: {
                // Wait for face-down cards to finish animating (6 cards total with stagger)
                // CARD_PLAY_FROM_DECK (800) + extra time for 3-card stagger (600) + settle (500)
                entry: assign({
                  tooltipMessage: 'EMPTY',
                }),
                after: {
                  [ANIMATION_DURATIONS.DATA_WAR_FACE_DOWN_CARDS_ANIMATION_DURATION]: 'ready',
                },
              },
              ready: {
                entry: assign({
                  tooltipMessage: 'DATA_WAR_FACE_UP',
                }),
                on: {
                  TAP_DECK: {
                    target: '#dataWarGame.comparing',
                    guard: 'notShowingEffectModal',
                    actions: assign({
                      currentTurn: ({ context }) => context.currentTurn + 1,
                    }),
                  },
                },
              },
            },
          },
        },
      },

      data_grab: {
        initial: 'pre_animation',
        states: {
          pre_animation: {
            // Delay before showing the data grab takeover animation (breathing room after comparison)
            after: {
              [ANIMATION_DURATIONS.INSTANT_ANIMATION_DELAY]: 'takeover',
            },
          },
          takeover: {
            // Intro animation + "Ready? Set? Go!" countdown
            entry: () => {
              // Initialize Data Grab state in store (shows takeover animation)
              useGameStore.getState().initializeDataGrab();
              // Clear tooltip
              useGameStore.setState({ tooltipMessage: 'EMPTY' } as Partial<GameFlowContext>);
            },
            after: {
              [ANIMATION_DURATIONS.DATA_GRAB_TAKEOVER]: 'playing',
            },
            on: {
              DATA_GRAB_COUNTDOWN_COMPLETE: 'playing',
            },
          },
          playing: {
            // Active mini-game (duration varies based on card count, max 8 seconds)
            entry: () => {
              // Start the mini-game timer
              useGameStore.getState().startDataGrabGame();
            },
            after: {
              // Fallback timeout (safety - actual completion triggered by animation)
              10000: 'results', // 10s max (generous safety margin)
            },
            on: {
              DATA_GRAB_GAME_COMPLETE: 'results',
            },
          },
          results: {
            // Show results in hand viewer - waits for user to click "Collect Cards"
            entry: () => {
              // Finalize results and show hand viewer
              useGameStore.getState().finalizeDataGrabResults();
            },
            on: {
              CHECK_WIN_CONDITION: {
                target: '#dataWarGame.resolving',
                actions: () => {
                  // User clicked "Collect Cards" - modal closing now
                  // Wait for modal close animation, then restore cards to tableau, then animate to decks
                  const store = useGameStore.getState();
                  const { dataGrabDistributions, animationQueue, pendingEffects } = store;

                  // Function to process pending effects (including Launch Stacks)
                  // This will queue animations and handle effects properly
                  const processPendingEffectsForDataGrab = () => {
                    // For Data Grab, we need to handle effects for both players' collected cards
                    // Since there's no single "winner", we'll process effects manually
                    // The animation queue system will handle showing animations in sequence
                    const { pendingEffects } = useGameStore.getState();

                    if (pendingEffects.length > 0) {
                      // Process pending effects for player (as winner for their collected cards)
                      useGameStore.getState().processPendingEffects('player');
                    }
                  };

                  // Function to run card collection after animations complete
                  const runCardCollection = () => {
                    if (dataGrabDistributions.length > 0) {
                      // Trigger collection animation - cards already rendered on tableau
                      // Visual-only animation - decks already have correct counts
                      useGameStore
                        .getState()
                        .collectCardsDistributed(dataGrabDistributions, undefined, true);

                      useGameStore.setState({
                        dataGrabDistributions: [],
                        dataGrabPlayerLaunchStacks: [],
                        dataGrabCPULaunchStacks: [],
                        dataGrabCollectedByPlayer: [],
                        dataGrabCollectedByCPU: [],
                      });
                    }
                  };

                  // Check if there are animations queued or pending effects to process
                  const hasAnimations = animationQueue.length > 0 || pendingEffects.length > 0;

                  if (hasAnimations) {
                    // Process pending effects (this will queue animations and set up callbacks)
                    processPendingEffectsForDataGrab();

                    // Get the updated callback after processing effects
                    const currentCallback = useGameStore.getState().animationCompletionCallback;
                    useGameStore.setState({
                      animationCompletionCallback: () => {
                        // Call the callback from processPendingEffects
                        if (currentCallback) {
                          currentCallback();
                        }
                        // Run card collection after all animations complete
                        runCardCollection();
                      },
                    });
                  } else {
                    // No animations - run card collection after modal closes
                    setTimeout(() => {
                      runCardCollection();
                    }, ANIMATION_DURATIONS.UI_TRANSITION_DELAY + ANIMATION_DURATIONS.DATA_GRAB_CARD_RESTORE); // Modal (300ms) + fast play (200ms)
                  }
                },
              },
            },
          },
        },
      },

      special_effect: {
        initial: 'showing',
        states: {
          showing: {
            entry: assign({
              tooltipMessage: 'EMPTY',
            }),
            on: {
              DISMISS_EFFECT: 'processing',
            },
          },
          processing: {
            after: {
              // After special effect completes, check for follow-up states
              500: [
                // Check for data war first (tie after special effect)
                { target: '#dataWarGame.data_war', guard: 'isDataWar' },
                // Check for data grab
                { target: '#dataWarGame.data_grab', guard: 'isDataGrab' },
                // Otherwise, resolve the turn
                { target: '#dataWarGame.resolving' },
              ],
            },
          },
        },
      },

      resolving: {
        entry: assign({
          currentTurn: ({ context }) => {
            return context.currentTurn + 1;
          },
        }),
        on: {
          CHECK_WIN_CONDITION: [
            {
              target: 'game_over',
              guard: 'hasWinCondition',
            },
            {
              target: 'pre_reveal',
            },
          ],
        },
      },

      pre_reveal: {
        initial: 'processing',
        states: {
          // Automatically process non-interactive effects
          processing: {
            entry: assign({
              tooltipMessage: () => {
                return 'EMPTY';
              },
            }),
            after: {
              // Dynamic delay based on whether cards collected or another play coming
              winAnimationDelay: [
                { target: 'animating', guard: 'hasPreRevealEffects' },
                { target: '#dataWarGame.ready' },
              ],
            },
            on: {
              START_OWYW_ANIMATION: 'animating',
            },
            // Wait for win animation to complete before transitioning (fast if another play)
          },

          // Animation plays (for OWYW)
          animating: {
            entry: assign({
              tooltipMessage: 'EMPTY',
            }),
            after: {
              [ANIMATION_DURATIONS.OWYW_ANIMATION]: 'awaiting_interaction',
            },
          },

          // Wait for user to tap deck before showing selection
          awaiting_interaction: {
            entry: assign({
              tooltipMessage: 'OWYW_TAP_DECK',
            }),
            on: {
              TAP_DECK: 'selecting',
            },
          },

          // User is selecting from modal
          selecting: {
            entry: assign({
              tooltipMessage: 'EMPTY',
            }),
            on: {
              CARD_SELECTED: '#dataWarGame.revealing',
            },
          },
        },
        on: {
          PRE_REVEAL_COMPLETE: 'ready',
        },
      },

      game_over: {
        entry: assign({
          tooltipMessage: 'GAME_OVER',
        }),
        on: {
          QUIT_GAME: {
            target: 'welcome',
            actions: assign({
              currentTurn: 0,
              trackerSmackerActive: null,
              tooltipMessage: 'EMPTY',
            }),
          },
          RESTART_GAME: {
            target: 'vs_animation',
            actions: assign({
              currentTurn: 0,
              trackerSmackerActive: null,
              tooltipMessage: 'EMPTY',
            }),
          },
        },
      },
    },

    on: {
      RESET_GAME: {
        target: '.welcome',
        actions: assign({
          currentTurn: 0,
          trackerSmackerActive: null,
          tooltipMessage: 'EMPTY',
        }),
      },
      RESTART_GAME: {
        target: '.vs_animation',
        actions: assign({
          currentTurn: 0,
          trackerSmackerActive: null,
          tooltipMessage: 'EMPTY',
        }),
      },
      QUIT_GAME: {
        target: '.welcome',
        actions: assign({
          currentTurn: 0,
          trackerSmackerActive: null,
          tooltipMessage: 'EMPTY',
        }),
      },
    },
  },
  {
    guards: {
      assetsPreloaded: () => {
        // Check if all essential assets (critical + high + medium) and VS video are ready
        const state = useGameStore.getState();
        return state.preloadingComplete === true;
      },
      hasWinCondition: () => {
        // Check Zustand store for win condition
        const state = useGameStore.getState();
        return state.winner !== null && state.winCondition !== null;
      },
      notAnimating: () => {
        // Check if game is NOT blocked (not paused by animations or modals)
        const state = useGameStore.getState();
        return !state.blockTransitions;
      },
      isDataWar: () => {
        // Check if the current turn is a tie (Data War)
        // IMPORTANT: Defer Data War check if we're waiting for another play to complete
        const state = useGameStore.getState();

        // If we're expecting another play, don't trigger Data War yet
        if (state.anotherPlayExpected) {
          return false;
        }

        // Safety check for tests
        if (!state.checkForDataWar) return false;
        return state.checkForDataWar();
      },
      isDataWarAndNotAnimating: () => {
        const state = useGameStore.getState();

        if (state.blockTransitions) return false;

        if (state.anotherPlayExpected) {
          return false;
        }

        // Data Grab has priority over Data War
        if (state.checkForDataGrab?.()) return false;

        // Safety check for tests
        if (!state.checkForDataWar) return false;
        return state.checkForDataWar();
      },
      hasSpecialEffects: () => {
        // Check if there are pending special effects to show
        const state = useGameStore.getState();
        return (state.pendingEffects?.length ?? 0) > 0;
      },
      hasSpecialEffectsAndNotAnimating: () => {
        const state = useGameStore.getState();
        if (state.blockTransitions) return false;

        // Safety check for tests
        if (!state.pendingEffects || !state.shownAnimationCardIds) return false;

        // Check if there are pending effects with UNSEEN animations
        // If all pending effect animations have already been shown, skip special_effect phase
        const hasUnseenAnimations = state.pendingEffects.some(
          (effect) => !state.shownAnimationCardIds.has(effect.card.id),
        );

        // Check if Data Grab is triggered
        const isDataGrabTriggered = state.checkForDataGrab?.() ?? false;

        // Check if all pending effects are post-resolution effects
        // Post-resolution effects don't need the special_effect phase
        // EXCEPTION: Launch Stack animations run BEFORE Data Grab mini-game
        const allEffectsArePostResolution = state.pendingEffects.every((effect) => {
          // Special case: if Data Grab is triggered, Launch Stack animation runs BEFORE Data Grab
          if (effect.type === 'launch_stack' && isDataGrabTriggered) {
            return false; // Not post-resolution in this context
          }
          return (
            effect.type === 'launch_stack' ||
            effect.type === 'patent_theft' ||
            effect.type === 'leveraged_buyout' ||
            effect.type === 'temper_tantrum' ||
            effect.type === 'mandatory_recall' ||
            effect.type === 'data_grab'
          );
        });

        // Only enter special_effect phase if there are unseen animations AND they're not all post-resolution
        return hasUnseenAnimations && !allEffectsArePostResolution;
      },
      hasPreRevealEffects: () => {
        // Check if there are pre-reveal effects to process (like OWYW)
        const state = useGameStore.getState();
        // Safety check for tests
        if (!state.hasPreRevealEffects) return false;
        return state.hasPreRevealEffects();
      },
      hasUnseenEffectNotifications: () => {
        // Check if there are unseen effect notifications to show
        const state = useGameStore.getState();
        // Safety check for tests
        if (!state.hasUnseenEffectNotifications) return false;
        return state.hasUnseenEffectNotifications();
      },
      notShowingEffectModal: () => {
        // Check if effect modal is NOT open (game should NOT be paused)
        // When modal is open (effectAccumulationPaused = true), prevent transitions
        const state = useGameStore.getState();
        return !state.effectAccumulationPaused;
      },
      isHostileTakeoverFirstDataWar: () => {
        // Check if we're in a one-sided data war triggered by Hostile Takeover
        // Uses the dedicated state flag instead of inferring from card counts
        return useGameStore.getState().hostileTakeoverDataWar;
      },
      isDataGrab: () => {
        // Check if a Data Grab card was played and there are enough cards in play
        const state = useGameStore.getState();
        // Safety check for tests
        if (!state.checkForDataGrab) return false;
        return state.checkForDataGrab();
      },
      isDataGrabAndNotAnimating: () => {
        const state = useGameStore.getState();
        if (state.blockTransitions) return false;
        // Safety check for tests
        if (!state.checkForDataGrab) return false;
        return state.checkForDataGrab();
      },
      shouldResolveWithoutChecks: () => {
        // Check if we should skip data war/special effect checks and go directly to resolving
        // This happens when:
        // 1. Hostile Takeover data war is complete
        // 2. We're waiting for "another play" to complete
        // 3. A card triggers "another play"
        const state = useGameStore.getState();

        // Don't skip if game is blocked (animations/modals)
        if (state.blockTransitions) return false;

        // Check if we're waiting for another play to complete
        if (state.anotherPlayExpected) {
          return true;
        }

        // Check if either card triggers "another play"
        const playerTriggersAnother =
          state.player.playedCard &&
          shouldTriggerAnotherPlay(state.player.playedCard) &&
          !isEffectBlocked(state.trackerSmackerActive, 'player');

        const cpuTriggersAnother =
          state.cpu.playedCard &&
          shouldTriggerAnotherPlay(state.cpu.playedCard) &&
          !isEffectBlocked(state.trackerSmackerActive, 'cpu');

        if (playerTriggersAnother || cpuTriggersAnother) {
          return true;
        }

        // Check if Hostile Takeover data war is complete
        const playerPlayedHt = state.player.playedCard?.specialType === 'hostile_takeover';
        const cpuPlayedHt = state.cpu.playedCard?.specialType === 'hostile_takeover';
        const hostileTakeoverPlayed = playerPlayedHt || cpuPlayedHt;

        if (hostileTakeoverPlayed) {
          const opponent = playerPlayedHt ? state.cpu : state.player;

          // If opponent has played their 4 data war cards (5 total), data war is complete
          if (opponent.playedCardsInHand.length >= 5) {
            return true;
          }

          // If both players have played HT and both have 5 cards, data war is complete
          if (
            playerPlayedHt &&
            cpuPlayedHt &&
            state.player.playedCardsInHand.length >= 5 &&
            state.cpu.playedCardsInHand.length >= 5
          ) {
            return true;
          }
        }

        return false;
      },
    },
    delays: {
      comparisonDelay: () => {
        const store = useGameStore.getState();

        // Card types that need SLOW timing (have animations/effects that need time to appreciate)
        const slowTimingCardTypes = [
          'forced_empathy', // Deck swap animation
          'hostile_takeover', // Triggers data war
          'data_grab', // Mini-game
          'open_what_you_want', // Modal selection
          'tracker_smacker', // Animation
          // Note: launch_stack, patent_theft, leveraged_buyout, temper_tantrum, mandatory_recall removed - animations play after resolution
        ];

        // Check if either player played a card that needs slow timing
        const playerSpecialType = store.player.playedCard?.specialType ?? '';
        const cpuSpecialType = store.cpu.playedCard?.specialType ?? '';
        const playerNeedsSlow = slowTimingCardTypes.includes(playerSpecialType);
        const cpuNeedsSlow = slowTimingCardTypes.includes(cpuSpecialType);
        const hasSlowTimingCards = playerNeedsSlow || cpuNeedsSlow;

        // Use fast timing for common cards, trackers, and blockers
        // Note: We don't check for data war here because even if cards tie,
        // we still want fast timing for the initial comparison (data war happens after)
        const useFastTiming = !hasSlowTimingCards;

        const baseDelay = useFastTiming
          ? ANIMATION_DURATIONS.CARD_COMPARISON_FAST
          : ANIMATION_DURATIONS.CARD_COMPARISON;

        const adjustedDelay = getGameSpeedAdjustedDuration(baseDelay);
        return adjustedDelay;
      },
      effectNotificationDelay: () => {
        const store = useGameStore.getState();

        // Use fast delay if there are no accumulated effects to show
        // (e.g., trackers/blockers which don't show notifications)
        const hasAccumulatedEffects = (store.accumulatedEffects?.length ?? 0) > 0;

        const delay = hasAccumulatedEffects
          ? ANIMATION_DURATIONS.EFFECT_NOTIFICATION_TRANSITION_DELAY
          : ANIMATION_DURATIONS.EFFECT_NOTIFICATION_TRANSITION_DELAY_FAST;

        return delay;
      },
      winAnimationDelay: () => {
        const store = useGameStore.getState();

        // Use fast delay if:
        // 1. Current cards trigger another play, OR
        // 2. We're currently in "another play" mode (playing because of previous card)
        const playerTriggersAnother = store.player.playedCard?.triggersAnotherPlay ?? false;
        const cpuTriggersAnother = store.cpu.playedCard?.triggersAnotherPlay ?? false;
        const hasAnotherPlayComing = playerTriggersAnother || cpuTriggersAnother;
        const inAnotherPlayMode = store.anotherPlayMode || store.anotherPlayExpected;

        // Use fast delay if we're in an "another play" sequence
        const useFastDelay = hasAnotherPlayComing || inAnotherPlayMode;

        const delay = useFastDelay
          ? ANIMATION_DURATIONS.WIN_ANIMATION_FAST
          : ANIMATION_DURATIONS.WIN_ANIMATION;

        return delay;
      },
    },
  },
);
