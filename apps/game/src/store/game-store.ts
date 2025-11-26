/**
 * Zustand Store - Game Data Management
 * Manages all game state data (cards, players, UI state)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AudioTrackId } from '../config/audio-config';
import { createInitialPlayer } from './functions/helpers';
import type { GameStore } from '@/types';

// Extracted function modules
import { createAnimationActions } from './functions/animations';
import { createAssetPreloadingActions } from './functions/asset-preloading';
import { createAudioManager } from './functions/audio-manager';
import { createCardCollectionActions } from './functions/card-collection';
import { createDataGrabActions } from './functions/data-grab';
import { createDataWarActions } from './functions/data-war';
import { createDebugActions } from './functions/debug';
import { createEffectNotificationActions } from './functions/effect-notifications';
import { createForcedEmpathyActions } from './functions/forced-empathy';
import { createGameLifecycleActions } from './functions/game-lifecycle';
import { createLaunchStackActions } from './functions/launch-stacks';
import { createOWYWActions } from './functions/owyw';
import { createPlayerActions } from './functions/player-actions';
import { createPreRevealActions } from './functions/pre-reveal';
import { createSpecialEffectsActions } from './functions/special-effects';
import { createTemperTantrumActions } from './functions/temper-tantrum';
import { createTooltipActions } from './functions/tooltips';
import { createUIActions } from './functions/ui-actions';

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
      dataWarFaceUpPending: false, // True when pre-reveal (OWYW) is triggered from DataWar face-up card play
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

      // Play Trigger Tracking (per playthrough, not persisted)
      seenPlayTriggers: new Set<string>(),

      // Tableau Card Type Tracking (per playthrough, not persisted)
      seenTableauCardTypes: new Set<string>(),

      // Spread extracted function modules
      ...createPlayerActions(set),
      ...createGameLifecycleActions(set, get),
      ...createCardCollectionActions(set, get),
      ...createSpecialEffectsActions(set, get),
      ...createDataWarActions(set, get),
      ...createDataGrabActions(set, get),
      ...createTemperTantrumActions(set, get),
      ...createLaunchStackActions(set, get),
      ...createAnimationActions(set, get),
      ...createEffectNotificationActions(set, get),
      ...createPreRevealActions(set, get),
      ...createOWYWActions(set, get),
      ...createForcedEmpathyActions(set, get),
      ...createTooltipActions(set, get),
      ...createUIActions(set, get),
      ...createAudioManager(set, get),
      ...createAssetPreloadingActions(set, get),
      ...createDebugActions(set),
    }),
    { name: 'DataWarGame' },
  ),
);

// Expose store globally for game speed helper function
if (typeof window !== 'undefined') {
  // @ts-expect-error - global store for game speed helper
  window.__gameStore = useGameStore;
}
