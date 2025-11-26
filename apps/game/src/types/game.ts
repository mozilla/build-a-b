/**
 * Game state type definitions for Data War
 */

import type { Card, SpecialCardType } from './card';

export type PlayerType = 'player' | 'cpu';

export type GamePhase =
  | 'welcome' // Welcome screen
  | 'intro' // Intro screen
  | 'select_billionaire' // Character selection
  | 'billionaire_details' // Billionaire bio drawer
  | 'select_background' // Background selection
  | 'quick_start_guide' // Quick launch guide
  | 'vs_animation' // Head-to-head VS takeover animation
  | 'ready' // Ready to start turn (tap deck prompt)
  | 'revealing' // Cards being revealed
  | 'effect_notification.checking' // Effect notification: checking for unseen effects
  | 'effect_notification.showing' // Effect notification: displaying effect badge and modal
  | 'effect_notification.transitioning' // Effect notification: delay before comparing
  | 'comparing' // Values being compared
  | 'data_war.animating' // Data War: showing "DATA WAR!" animation
  | 'data_war.reveal_face_down' // Data War: tap to reveal 3 face-down cards
  | 'data_war.reveal_face_up.settling' // Data War: waiting for face-down cards to finish animating
  | 'data_war.reveal_face_up.ready' // Data War: tap to reveal final card
  | 'data_war.reveal_face_up.owyw_selecting' // Data War: OWYW modal for selecting face-up card
  | 'data_grab.takeover' // Data Grab: intro animation and countdown
  | 'data_grab.playing' // Data Grab: active mini-game (10 seconds)
  | 'data_grab.results' // Data Grab: showing results in hand viewer
  | 'special_effect.showing' // Special effect: displaying effect to player
  | 'special_effect.processing' // Special effect: brief delay before resolving
  | 'pre_reveal.processing' // Pre-reveal: processing non-interactive effects
  | 'pre_reveal.awaiting_interaction' // Pre-reveal: waiting for player to tap deck
  | 'pre_reveal.selecting' // Pre-reveal: player selecting card from modal
  | 'resolving' // Winner taking cards
  | 'game_over'; // Victory screen with share options

export type WinCondition = 'all_cards' | 'launch_stacks' | null;

export interface PlayedCardState {
  card: Card;
  isFaceDown: boolean; // True for Data War face-down cards
}

export interface ActiveEffect {
  type: 'tracker' | 'blocker';
  value: number; // The modifier value
  source: PlayerType; // Who applied this effect
}

export interface Player {
  id: PlayerType;
  name: string;
  deck: Card[]; // Cards currently in player's possession
  playedCard: Card | null; // Latest card played this turn (for backwards compatibility)
  playedCardsInHand: PlayedCardState[]; // All cards played in current hand (for stacking display)
  currentTurnValue: number; // Calculated value for current turn (base + modifiers)
  launchStackCount: number; // Number of launch stacks collected (0-3)
  billionaireCharacter?: string; // Selected billionaire (player only)
  activeEffects: ActiveEffect[]; // Active effects for this player (for stacked display)
  pendingTrackerBonus: number; // Tracker bonus to apply to next card in same turn (0 if none)
  pendingBlockerPenalty: number; // Blocker penalty to apply to next card in same turn (0 if none)
}

export interface SpecialEffect {
  type: SpecialCardType;
  playedBy: PlayerType;
  card: Card;
  isInstant: boolean; // True for instant effects, false for queued
  destinationOverride?: PlayerType; // Override destination (e.g., stolen by Temper Tantrum)
}

export interface PreRevealEffect {
  type: 'owyw'; // Can add more types in future (e.g., 'forced_empathy_animation')
  playerId: PlayerType;
  requiresInteraction: boolean; // If true, waits for user to tap deck before executing
  data?: unknown; // Optional data for the effect
}

export interface DataWarState {
  isActive: boolean;
  faceDownRevealed: boolean; // Have 3 face-down cards been revealed?
}

export interface EffectNotification {
  card: Card;
  playedBy: PlayerType;
  specialType: SpecialCardType | null;
  effectType: string; // e.g., 'tracker', 'blocker', 'hostile_takeover'
  effectName: string; // e.g., 'Cursed Cursor', 'Enhanced Tracking Protection'
  effectDescription: string; // Full description from card data
}

export interface GameState {
  phase: GamePhase;
  currentTurn: number; // Turn counter (hand counter)
  player: Player;
  cpu: Player;
  cardsInPlay: Card[]; // Cards currently being contested
  activePlayer: PlayerType; // Whose action is expected
  pendingEffects: SpecialEffect[]; // Queue of special effects (in play order)
  trackerSmackerActive: PlayerType | null; // Who has Tracker Smacker blocking effects
  winner: PlayerType | null;
  winCondition: WinCondition;
  selectedBillionaire: string; // Selected billionaire character
  selectedBackground: string; // Background image URL
  isPaused: boolean;
  showMenu: boolean; // Menu overlay visible
  showHandViewer: boolean; // Hand viewer module visible
  handViewerPlayer: PlayerType; // Which hand to show in viewer
  showInstructions: boolean;
  audioEnabled: boolean;
  showTooltip: boolean; // Dynamic tooltip visible
  tooltipMessage: string; // Current tooltip text
  dataWarState: DataWarState;
}
