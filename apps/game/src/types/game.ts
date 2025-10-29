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
  | 'comparing' // Values being compared
  | 'data_war.animating' // Data War: showing "DATA WAR!" animation
  | 'data_war.reveal_face_down' // Data War: tap to reveal 3 face-down cards
  | 'data_war.reveal_face_up' // Data War: tap to reveal final card
  | 'special_effect.showing' // Special effect: displaying effect to player
  | 'special_effect.processing' // Special effect: brief delay before resolving
  | 'pre_reveal.processing' // Pre-reveal: processing non-interactive effects
  | 'pre_reveal.animating' // Pre-reveal: OWYW animation playing
  | 'pre_reveal.awaiting_interaction' // Pre-reveal: waiting for player to tap deck
  | 'pre_reveal.selecting' // Pre-reveal: player selecting card from modal
  | 'resolving' // Winner taking cards
  | 'game_over'; // Victory screen with share options

export type WinCondition = 'all_cards' | 'launch_stacks' | null;

export interface PlayedCardState {
  card: Card;
  isFaceDown: boolean; // True for Data War face-down cards
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
}

export interface SpecialEffect {
  type: SpecialCardType;
  playedBy: PlayerType;
  card: Card;
  isInstant: boolean; // True for instant effects, false for queued
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
