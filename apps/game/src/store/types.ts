import type { CardTypeId } from '@/config/game-config';
import type { Card, Player, PlayerType, PreRevealEffect, SpecialEffect } from '@/types';
import type { DeckOrderStrategy } from '@/utils/deck-builder';

export type GameStore = {
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

  // Turn State - Stable throughout turn lifecycle
  playerTurnState: 'normal' | 'tracker' | 'blocker';
  cpuTurnState: 'normal' | 'tracker' | 'blocker';

  // Open What You Want State
  openWhatYouWantActive: PlayerType | null;
  openWhatYouWantCards: Card[]; // Top 3 cards for selection
  showOpenWhatYouWantModal: boolean;
  showOpenWhatYouWantAnimation: boolean; // Shows during 2-second transition

  // Forced Empathy State
  forcedEmpathySwapping: boolean; // True when decks are actively animating
  deckSwapCount: number; // Number of times decks have been swapped (odd = swapped, even = normal)

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
    playerCustomOrder?: CardTypeId[],
    cpuCustomOrder?: CardTypeId[],
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
    playerCustomOrder?: CardTypeId[],
    cpuCustomOrder?: CardTypeId[],
  ) => void;
};
