import type { CardTypeId } from '@/config/game-config';
import type { SpecialEffectAnimationType } from '@/config/special-effect-animations';
import type {
  Card,
  EffectNotification,
  PlayedCardState,
  Player,
  PlayerType,
  PreRevealEffect,
  SpecialEffect,
} from '@/types';
import type { DeckOrderStrategy } from '@/utils/deck-builder';

/**
 * Card Distribution - Defines where a card should animate to and from
 * Used by the enhanced collection system to support both board-to-deck and deck-to-deck animations
 */
export interface CardDistribution {
  card: Card;
  destination: PlayerType; // Which player's deck to animate to
  source?: {
    type: 'board' | 'deck'; // Where the card is coming from
    owner?: PlayerType; // Which player's deck (required for deck-to-deck animations)
  };
}

/**
 * Collecting State - Enhanced collection system that supports per-card destinations
 * Replaces the old { winner, cards } format with explicit per-card routing
 */
export interface CollectingState {
  distributions: CardDistribution[]; // Each card has its own destination and source
  primaryWinner?: PlayerType; // Who won the turn (for win effect animation)
}

export type GameStore = {
  // Player State
  player: Player;
  cpu: Player;

  // Game State
  cardsInPlay: Card[];
  activePlayer: PlayerType;
  anotherPlayMode: boolean; // True when only activePlayer should play (tracker/blocker/launch_stack)
  anotherPlayExpected: boolean; // True when we're waiting for another play to complete before comparison
  pendingEffects: SpecialEffect[];
  preRevealEffects: PreRevealEffect[]; // Queue of effects to process before reveal
  preRevealProcessed: boolean; // Flag to prevent duplicate pre-reveal processing
  trackerSmackerActive: PlayerType | null;
  winner: PlayerType | null;
  winCondition: 'all_cards' | 'launch_stacks' | null;
  showingWinEffect: PlayerType | null; // Player currently showing win celebration (before collection)
  collecting: CollectingState | null; // Enhanced collection system with per-card destinations

  // Launch Stack Collections - Cards removed from playable decks when collected
  // These count towards player's total cards but cannot be played
  playerLaunchStacks: Card[]; // Launch Stack cards player has collected
  cpuLaunchStacks: Card[]; // Launch Stack cards CPU has collected

  // Turn State - Stable throughout turn lifecycle
  playerTurnState: 'normal' | 'tracker' | 'blocker';
  cpuTurnState: 'normal' | 'tracker' | 'blocker';

  // Open What You Want State
  openWhatYouWantActive: PlayerType | null;
  openWhatYouWantCards: Card[]; // Top 3 cards for selection
  showOpenWhatYouWantModal: boolean;
  showOpenWhatYouWantAnimation: boolean; // Shows during 2-second transition

  // Forced Empathy State
  showForcedEmpathyAnimation: boolean; // True when video overlay is showing
  forcedEmpathySwapping: boolean; // True when decks are physically animating positions
  deckSwapCount: number; // Number of times decks have been swapped (odd = swapped, even = normal)

  // Special Effect Animations
  showHostileTakeoverAnimation: boolean; // Shows when hostile takeover is played
  showLaunchStackAnimation: boolean; // Shows after collecting a launch stack
  showDataWarAnimation: boolean; // Shows when data war occurs
  dataWarVideoPlaying: boolean; // True while the DATA WAR video is actively playing
  showTrackerSmackerAnimation: boolean; // Shows when tracker smacker is played
  showLeveragedBuyoutAnimation: boolean; // Shows when leveraged buyout is played
  showPatentTheftAnimation: boolean; // Shows when patent theft is played
  showTemperTantrumAnimation: boolean; // Shows when temper tantrum is played
  showMandatoryRecallAnimation: boolean; // Shows when mandatory recall is played
  showTheftWonAnimation: boolean; // Shows when patent theft wins and steals Launch Stack
  showRecallWonAnimation: boolean; // Shows when mandatory recall wins and returns Launch Stacks
  recallReturnCount: number; // Number of launch stacks being returned by Mandatory Recall

  // Animation Queue System
  animationQueue: Array<{
    type: SpecialEffectAnimationType;
    playedBy: PlayerType;
    params?: Record<string, string>;
  }>;
  isPlayingQueuedAnimation: boolean; // True when processing queued animations
  animationsPaused: boolean; // Internal: Animation queue is processing
  blockTransitions: boolean; // External: Game is paused (blocks state machine transitions during animations OR modals)
  currentAnimationPlayer: PlayerType | null; // Tracks which player's animation is currently playing
  shownAnimationCardIds: Set<string>; // Track which card IDs have already shown animations (prevents duplicates)

  // Data Grab Mini-Game State
  dataGrabActive: boolean; // True when Data Grab is triggered
  dataGrabCards: PlayedCardState[]; // Cards currently falling in mini-game (preserves face-up/down state)
  dataGrabCollectedByPlayer: PlayedCardState[]; // Cards player has collected
  dataGrabCollectedByCPU: PlayedCardState[]; // Cards CPU has collected
  dataGrabDistributions: CardDistribution[]; // Card distributions for animation after modal closes
  dataGrabPlayerLaunchStacks: PlayedCardState[]; // Launch Stacks collected by player (processed after modal)
  dataGrabCPULaunchStacks: PlayedCardState[]; // Launch Stacks collected by CPU (processed after modal)
  showDataGrabTakeover: boolean; // Show intro animation and countdown
  dataGrabGameActive: boolean; // True during active gameplay (~1.5 seconds)
  showDataGrabResults: boolean; // Show results in hand viewer
  showDataGrabCookies: boolean; // Debug option to show floating cookie decorations

  // Temper Tantrum Card Selection State
  showTemperTantrumModal: boolean; // Show modal for player card selection
  temperTantrumAvailableCards: Card[]; // Cards player can choose from (winner's cards only)
  temperTantrumSelectedCards: Card[]; // Cards player has selected (max 2)
  temperTantrumMaxSelections: number; // Always 2 (or less if fewer cards available)
  temperTantrumWinner: 'player' | 'cpu' | null; // Who won the turn (to return remaining cards)
  temperTantrumLoserCards: Card[]; // Loser's cards (stored to preserve for distribution)

  // Effect Notification System
  seenEffectTypes: string[]; // Effect types user has seen (e.g., 'tracker', 'blocker', 'hostile_takeover') - stored as array, used as Set
  pendingEffectNotifications: EffectNotification[]; // Queue of notifications to show
  currentEffectNotification: EffectNotification | null; // Currently displayed notification in modal
  showEffectNotificationBadge: boolean; // Show badge on card
  showEffectNotificationModal: boolean; // Show modal
  effectNotificationPersistence: 'localStorage' | 'memory'; // Configurable persistence

  // Effect Notification - Accumulation System
  accumulatedEffects: EffectNotification[]; // Effects accumulated during current turn
  effectAccumulationPaused: boolean; // True when modal is open (pauses game)
  awaitingResolution: boolean; // True when waiting to send RESOLVE_TURN but blocked by modal

  // Progress Timer for Effect Badge (future feature)
  effectBadgeTimerDuration: number; // Milliseconds to wait before auto-play (0 = disabled)
  effectBadgeTimerActive: boolean; // True when timer is running
  effectBadgeTimerStartTime: number | null; // Timestamp when timer started

  // Tooltip System
  tooltipDisplayCounts: Record<string, number>; // Tooltip ID -> display count mapping
  tooltipPersistence: 'localStorage' | 'memory'; // Configurable persistence

  // UI State
  selectedBillionaire: string;
  cpuBillionaire: string;
  selectedBackground: string;
  isPaused: boolean;
  showMenu: boolean;
  audioEnabled: boolean;
  showHandViewer: boolean;
  handViewerPlayer: PlayerType;
  showInstructions: boolean;
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
  showTooltip: boolean;

  // Asset Preloading State
  assetsLoaded: number; // Number of essential assets loaded (images + VS video)
  assetsTotal: number; // Total essential assets to load
  essentialAssetsReady: boolean; // Critical + High + Medium images loaded
  highPriorityAssetsReady: boolean; // Critical + High images loaded (backgrounds)
  criticalPriorityAssetsReady: boolean; // Critical images loaded (billionaire avatars)
  vsVideoReady: boolean; // VS animation video ready to play
  preloadingComplete: boolean; // All essential assets ready (gates progression)
  criticalProgress: number; // Progress percentage for critical assets (billionaire avatars)
  highPriorityProgress: number; // Progress percentage for high-priority assets
  essentialProgress: number; // Progress percentage for essential assets
  hasShownCriticalLoadingScreen: boolean; // Whether user saw the billionaire loading screen
  hasShownHighPriorityLoadingScreen: boolean; // Whether user saw the background loading screen
  hasShownEssentialLoadingScreen: boolean; // Whether user saw the essential assets loading screen

  // Actions - Game Logic
  initializeGame: (
    playerStrategy?: DeckOrderStrategy,
    cpuStrategy?: DeckOrderStrategy,
    playerCustomOrder?: CardTypeId[],
    cpuCustomOrder?: CardTypeId[],
  ) => void;
  playCard: (playerId: PlayerType) => void;
  collectCards: (winnerId: PlayerType, cards: Card[]) => void; // Backward compatibility wrapper
  collectCardsDistributed: (distributions: CardDistribution[], primaryWinner?: PlayerType, visualOnly?: boolean) => void; // New enhanced collection
  addLaunchStack: (playerId: PlayerType, launchStackCard: Card) => void;
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
  setShowForcedEmpathyAnimation: (show: boolean) => void;
  setForcedEmpathySwapping: (swapping: boolean) => void;

  // Special Effect Animation Actions
  setShowHostileTakeoverAnimation: (show: boolean) => void;
  setShowLaunchStackAnimation: (show: boolean) => void;
  setShowDataWarAnimation: (show: boolean) => void;
  setShowTrackerSmackerAnimation: (show: boolean) => void;
  setShowLeveragedBuyoutAnimation: (show: boolean) => void;
  setShowPatentTheftAnimation: (show: boolean) => void;
  setShowTemperTantrumAnimation: (show: boolean) => void;
  setShowMandatoryRecallAnimation: (show: boolean) => void;
  setShowTheftWonAnimation: (show: boolean) => void;
  setShowRecallWonAnimation: (show: boolean) => void;

  // Animation Queue Actions
  queueAnimation: (type: SpecialEffectAnimationType, playedBy: PlayerType) => void;
  processNextAnimation: () => void;
  clearAnimationQueue: () => void;
  queueSpecialCardAnimations: () => boolean; // Returns true if animations were queued
  setAnimationCompletionCallback: (callback: (() => void) | null) => void;
  animationCompletionCallback: (() => void) | null;

  // Data Grab Actions
  checkForDataGrab: () => boolean; // Check if Data Grab should trigger
  initializeDataGrab: () => void; // Initialize Data Grab state
  startDataGrabGame: () => void; // Start the mini-game
  collectDataGrabCard: (cardId: string, collectedBy: PlayerType) => void; // Player/CPU collects a card
  finalizeDataGrabResults: () => void; // Process results and distribute cards
  setShowDataGrabTakeover: (show: boolean) => void;
  setDataGrabGameActive: (active: boolean) => void;
  setShowDataGrabResults: (show: boolean) => void;
  setShowDataGrabCookies: (show: boolean) => void; // Toggle cookie decorations (debug)

  // Temper Tantrum Actions
  initializeTemperTantrumSelection: (winner: 'player' | 'cpu') => void; // Prepare modal state with winner info
  selectTemperTantrumCard: (card: Card) => void; // Player selects/deselects a card
  confirmTemperTantrumSelection: () => void; // Player confirms final selection
  setShowTemperTantrumModal: (show: boolean) => void;

  // Effect Notification Actions
  markEffectAsSeen: (effectType: string) => void;
  hasSeenEffect: (effectType: string) => boolean;
  hasUnseenEffectNotifications: () => boolean;
  prepareEffectNotification: () => void;
  dismissEffectNotification: () => void;
  setShowEffectNotificationModal: (show: boolean) => void;
  clearSeenEffects: () => void; // For testing
  setEffectNotificationPersistence: (mode: 'localStorage' | 'memory') => void;

  // Effect Notification - Accumulation Actions
  addEffectToAccumulation: (notification: EffectNotification) => void;
  clearAccumulatedEffects: () => void;
  openEffectModal: () => void; // Opens modal AND pauses game
  closeEffectModal: () => void; // Closes modal AND resumes game

  // Progress Timer Actions
  startEffectBadgeTimer: () => boolean; // Returns true if game should wait
  stopEffectBadgeTimer: () => void;
  isEffectTimerActive: () => boolean;

  // Tooltip System Actions
  incrementTooltipCount: (tooltipId: string) => void; // Increment display count
  getTooltipDisplayCount: (tooltipId: string) => number; // Get current display count
  shouldShowTooltip: (tooltipId: string, maxDisplayCount: number | null) => boolean; // Check if should show
  clearTooltipCounts: () => void; // For testing
  setTooltipPersistence: (mode: 'localStorage' | 'memory') => void;

  // Active Effects Actions
  clearActiveEffects: (playerId: PlayerType) => void;

  // Actions - UI
  selectBillionaire: (billionaire: string) => void;
  selectBackground: (background: string) => void;
  togglePause: () => void;
  toggleMenu: () => void;
  toggleHandViewer: (player?: PlayerType) => void;
  toggleMusic: () => void;
  toggleSoundEffects: () => void;
  toggleInstructions: () => void;
  setShowTooltip: (show: boolean) => void;
  resetGame: (
    playerStrategy?: DeckOrderStrategy,
    cpuStrategy?: DeckOrderStrategy,
    playerCustomOrder?: CardTypeId[],
    cpuCustomOrder?: CardTypeId[],
  ) => void;

  // Actions - Asset Preloading
  updatePreloadingProgress: (stats: {
    assetsLoaded: number;
    assetsTotal: number;
    essentialAssetsReady: boolean;
    highPriorityAssetsReady: boolean;
    criticalPriorityAssetsReady: boolean;
    vsVideoReady: boolean;
    criticalProgress: number;
    highPriorityProgress: number;
    essentialProgress: number;
  }) => void;
  setHasShownCriticalLoadingScreen: (shown: boolean) => void;
  setHasShownHighPriorityLoadingScreen: (shown: boolean) => void;
  setHasShownEssentialLoadingScreen: (shown: boolean) => void;
};
