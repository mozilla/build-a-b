/**
 * XState Machine - Game Flow Control
 * Manages all game phases and transitions
 */

import { assign, createMachine } from 'xstate';
import { ANIMATION_DURATIONS } from '../config/animation-timings';
import { useGameStore } from '../store/game-store';

export interface GameFlowContext {
  currentTurn: number;
  trackerSmackerActive: 'player' | 'cpu' | null;
  tooltipMessage: string;
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
  | { type: 'EFFECT_NOTIFICATION_COMPLETE' }; // Skip if no notifications

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
      tooltipMessage: '',
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
          tooltipMessage: 'How do I play?',
        }),
        on: {
          SHOW_GUIDE: 'quick_start_guide',
          SKIP_INSTRUCTIONS: 'vs_animation',
          SKIP_TO_GAME: 'ready', // Allow skipping directly to ready for testing
        },
      },

      quick_start_guide: {
        entry: assign({
          tooltipMessage: 'Quick Launch Guide',
        }),
        on: {
          SHOW_MISSION: 'your_mission',
          SKIP_GUIDE: 'your_mission',
        },
      },

      your_mission: {
        entry: assign({
          tooltipMessage: 'Your mission: (should you choose to accept it)',
        }),
        on: {
          START_PLAYING: 'vs_animation',
        },
      },

      vs_animation: {
        after: {
          [ANIMATION_DURATIONS.VS_ANIMATION_DURATION]: 'ready', // Auto-transition after animation
        },
        on: {
          VS_ANIMATION_COMPLETE: 'ready',
        },
      },

      ready: {
        entry: assign({
          tooltipMessage: 'Tap stack to start!',
        }),
        on: {
          REVEAL_CARDS: 'revealing',
        },
      },

      revealing: {
        entry: assign({
          tooltipMessage: '',
        }),
        on: {
          CARDS_REVEALED: 'effect_notification',
        },
      },

      effect_notification: {
        initial: 'checking',
        states: {
          checking: {
            // Check if there are unseen effect notifications to show
            entry: assign({
              tooltipMessage: '',
            }),
            after: {
              500: [
                // Small delay after instant effects complete
                {
                  target: 'showing',
                  guard: 'hasUnseenEffectNotifications',
                },
                {
                  target: '#dataWarGame.comparing', // Skip if no notifications
                },
              ],
            },
            on: {
              EFFECT_NOTIFICATION_COMPLETE: '#dataWarGame.comparing',
            },
          },

          showing: {
            // Show notification badge and tooltip on card
            entry: assign({
              tooltipMessage: 'Tap to see effect',
            }),
            on: {
              EFFECT_NOTIFICATION_DISMISSED: 'transitioning',
            },
          },

          transitioning: {
            // Delay after modal closes before continuing
            entry: assign({
              tooltipMessage: '',
            }),
            after: {
              [ANIMATION_DURATIONS.EFFECT_NOTIFICATION_TRANSITION_DELAY]: '#dataWarGame.comparing',
            },
          },
        },
      },

      comparing: {
        entry: assign({
          tooltipMessage: '', // Clear any previous tooltips
        }),
        // Give players time to see the revealed cards before resolving
        after: {
          [ANIMATION_DURATIONS.CARD_COMPARISON]: [
            { target: 'data_war', guard: 'isDataWar' },
            { target: 'special_effect', guard: 'hasSpecialEffects' },
            { target: 'resolving' },
          ],
        },
        on: {
          TIE: 'data_war',
          SPECIAL_EFFECT: 'special_effect',
          RESOLVE_TURN: 'resolving',
        },
      },

      data_war: {
        initial: 'animating',
        entry: () => {
          // Clear pending bonuses/penalties (Data War = fresh start)
          const { player, cpu } = useGameStore.getState();
          useGameStore.setState({
            player: {
              ...player,
              pendingTrackerBonus: 0,
              pendingBlockerPenalty: 0,
              currentTurnValue: 0,
            },
            cpu: {
              ...cpu,
              pendingTrackerBonus: 0,
              pendingBlockerPenalty: 0,
              currentTurnValue: 0,
            },
            anotherPlayExpected: false, // Clear flag (fresh start)
          });
        },
        states: {
          animating: {
            entry: assign({
              tooltipMessage: 'DATA WAR!',
            }),
            after: {
              [ANIMATION_DURATIONS.DATA_WAR_ANIMATION_DURATION]: 'reveal_face_down',
            },
          },
          reveal_face_down: {
            entry: assign({
              tooltipMessage: 'Tap to reveal 3 cards face down',
            }),
            on: {
              TAP_DECK: 'reveal_face_up',
            },
          },
          reveal_face_up: {
            entry: assign({
              tooltipMessage: 'Tap to reveal final card',
            }),
            on: {
              TAP_DECK: {
                target: '#dataWarGame.comparing',
                actions: assign({
                  currentTurn: ({ context }) => context.currentTurn + 1,
                }),
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
              tooltipMessage: '',
            }),
            on: {
              DISMISS_EFFECT: 'processing',
            },
          },
          processing: {
            after: {
              500: '#dataWarGame.resolving',
            },
          },
        },
      },

      resolving: {
        entry: assign({
          currentTurn: ({ context }) => context.currentTurn + 1,
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
              tooltipMessage: '',
            }),
            after: {
              [ANIMATION_DURATIONS.WIN_ANIMATION]: [
                { target: 'animating', guard: 'hasPreRevealEffects' },
                { target: '#dataWarGame.ready' },
              ],
            },
            on: {
              START_OWYW_ANIMATION: 'animating',
            },
            // Wait 1.2s for win animation to complete before transitioning
          },

          // Animation plays (for OWYW)
          animating: {
            entry: assign({
              tooltipMessage: '',
            }),
            after: {
              [ANIMATION_DURATIONS.OWYW_ANIMATION]: 'awaiting_interaction',
            },
          },

          // Wait for user to tap deck before showing selection
          awaiting_interaction: {
            entry: assign({
              tooltipMessage: 'Tap to see top 3 cards',
            }),
            on: {
              TAP_DECK: 'selecting',
            },
          },

          // User is selecting from modal
          selecting: {
            entry: assign({
              tooltipMessage: '',
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
        type: 'final',
        entry: assign({
          tooltipMessage: 'Game Over!',
        }),
      },
    },

    on: {
      RESET_GAME: {
        target: '.welcome',
        actions: assign({
          currentTurn: 0,
          trackerSmackerActive: null,
          tooltipMessage: '',
        }),
      },
      RESTART_GAME: {
        target: '.vs_animation',
        actions: assign({
          currentTurn: 0,
          trackerSmackerActive: null,
          tooltipMessage: '',
        }),
      },
      QUIT_GAME: {
        target: '.welcome',
        actions: assign({
          currentTurn: 0,
          trackerSmackerActive: null,
          tooltipMessage: '',
        }),
      },
    },
  },
  {
    guards: {
      hasWinCondition: () => {
        // Check Zustand store for win condition
        const state = useGameStore.getState();
        return state.winner !== null && state.winCondition !== null;
      },
      isDataWar: () => {
        // Check if the current turn is a tie (Data War)
        // IMPORTANT: Defer Data War check if we're waiting for another play to complete
        const state = useGameStore.getState();

        // If we're expecting another play, don't trigger Data War yet
        if (state.anotherPlayExpected) {
          return false;
        }

        return state.checkForDataWar();
      },
      hasSpecialEffects: () => {
        // Check if there are pending special effects to show
        const state = useGameStore.getState();
        return state.pendingEffects.length > 0;
      },
      hasPreRevealEffects: () => {
        // Check if there are pre-reveal effects to process (like OWYW)
        const state = useGameStore.getState();
        return state.hasPreRevealEffects();
      },
      hasUnseenEffectNotifications: () => {
        // Check if there are unseen effect notifications to show
        const state = useGameStore.getState();
        return state.hasUnseenEffectNotifications();
      },
    },
  },
);
