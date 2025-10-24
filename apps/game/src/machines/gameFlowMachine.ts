/**
 * XState Machine - Game Flow Control
 * Manages all game phases and transitions
 */

import { assign, createMachine } from 'xstate';

export interface GameFlowContext {
  currentTurn: number;
  trackerSmackerActive: 'player' | 'cpu' | null;
  tooltipMessage: string;
}

export type GameFlowEvent =
  | { type: 'START_GAME' }
  | { type: 'SELECT_BILLIONAIRE'; billionaire: string }
  | { type: 'SELECT_BACKGROUND'; background: string }
  | { type: 'SHOW_GUIDE' }
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
  | { type: 'QUIT_GAME' };

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
        entry: assign({
          tooltipMessage: 'Welcome to Data War!',
        }),
        on: {
          START_GAME: 'select_billionaire',
        },
      },

      select_billionaire: {
        entry: assign({
          tooltipMessage: "Whose little face is going to space?",
        }),
        on: {
          SELECT_BILLIONAIRE: 'select_background',
        },
      },

      select_background: {
        entry: assign({
          tooltipMessage: 'Which one do you want to play on?',
        }),
        on: {
          SELECT_BACKGROUND: 'quick_start_guide',
        },
      },

      quick_start_guide: {
        on: {
          SKIP_GUIDE: 'vs_animation',
          SHOW_GUIDE: 'quick_start_guide',
        },
      },

      vs_animation: {
        entry: assign({
          tooltipMessage: 'Get ready for battle!',
        }),
        after: {
          2000: 'ready', // Auto-transition after 2s animation
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
        after: {
          1000: 'comparing', // Wait for flip animations
        },
        on: {
          CARDS_REVEALED: 'comparing',
        },
      },

      comparing: {
        on: {
          TIE: 'data_war',
          SPECIAL_EFFECT: 'special_effect',
          RESOLVE_TURN: 'resolving',
        },
      },

      data_war: {
        initial: 'animating',
        states: {
          animating: {
            entry: assign({
              tooltipMessage: 'DATA WAR!',
            }),
            after: {
              2000: 'reveal_face_down',
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
              tooltipMessage: 'Special card effect!',
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
              target: 'ready',
            },
          ],
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
      QUIT_GAME: {
        target: '.welcome',
      },
    },
  },
  {
    guards: {
      hasWinCondition: () => {
        // Will be implemented to check Zustand store
        return false;
      },
    },
  }
);
