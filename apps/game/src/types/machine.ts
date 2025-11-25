import type { NON_GAMEPLAY_EVENT_TYPES, NON_GAMEPLAY_PHASES } from '@/config/store';
import type { TooltipKey } from '@/config/tooltip-config';

export type GameFlowContext = {
  currentTurn: number;
  trackerSmackerActive: 'player' | 'cpu' | null;
  tooltipMessage: TooltipKey; // References a key from TOOLTIP_CONFIGS
};

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
  | { type: 'BACK_TO_INTRO' }
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
