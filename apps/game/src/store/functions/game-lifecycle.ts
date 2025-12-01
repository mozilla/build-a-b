/**
 * Game Lifecycle Functions
 * Handles game initialization, reset, win conditions, and turn resolution
 */

import { DEFAULT_GAME_CONFIG } from '@/config/game-config';
import type { CardTypeId } from '@/config/game-config';
import { compareCards } from '@/utils/card-comparison';
import { initializeGameDeck, type DeckOrderStrategy } from '@/utils/deck-builder';
import type { SetState, GetState } from '@/types';
import { createInitialPlayer } from './helpers';

export function createGameLifecycleActions(set: SetState, get: GetState) {
  return {
    /**
     * Initializes a new game with the specified deck strategies
     * @param playerStrategy - Deck order strategy for player
     * @param cpuStrategy - Deck order strategy for CPU
     * @param playerCustomOrder - Custom card order for player (if strategy is 'custom')
     * @param cpuCustomOrder - Custom card order for CPU (if strategy is 'custom')
     */
    initializeGame: (
      playerStrategy: DeckOrderStrategy = 'random',
      cpuStrategy: DeckOrderStrategy = 'random',
      playerCustomOrder?: CardTypeId[],
      cpuCustomOrder?: CardTypeId[],
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
        cpuAutoPlayInProgress: false,
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
        seenPlayTriggers: new Set<string>(), // Reset play triggers for new playthrough
        seenTableauCardTypes: new Set<string>(), // Reset tableau card types for new playthrough
        isPlayingQueuedAnimation: false,
        animationsPaused: false,
        blockTransitions: false,
        hostileTakeoverDataWar: false,
        currentAnimationPlayer: null,
        animationCompletionCallback: null,
        shownAnimationCardIds: new Set(),
      });
    },

    /**
     * Checks if a player has met the win condition
     * @returns true if game is won, false otherwise
     */
    checkWinCondition: (): boolean => {
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
        get().logEvent('WIN_CONDITION', 'CPU wins by collecting all cards!', undefined, 'success');
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

    /**
     * Resolves the current turn by comparing card values
     * @returns The winner of the turn ('player', 'cpu', or 'tie')
     */
    resolveTurn: (): 'player' | 'cpu' | 'tie' => {
      const { player, cpu } = get();

      // Compare current turn values (already modified by trackers/blockers)
      const result = compareCards(player, cpu);

      // Return winner WITHOUT collecting cards yet
      // Cards will be collected after processing pending effects
      return result.winner;
    },

    /**
     * Resets the game to initial state with new decks
     * @param playerStrategy - Deck order strategy for player
     * @param cpuStrategy - Deck order strategy for CPU
     * @param playerCustomOrder - Custom card order for player (if strategy is 'custom')
     * @param cpuCustomOrder - Custom card order for CPU (if strategy is 'custom')
     */
    resetGame: (
      playerStrategy: DeckOrderStrategy = 'random',
      cpuStrategy: DeckOrderStrategy = 'random',
      playerCustomOrder?: CardTypeId[],
      cpuCustomOrder?: CardTypeId[],
    ) => {
      // Stop and cleanup audio before resetting state
      const { stopAudio } = get();
      stopAudio({ channel: 'music' });
      stopAudio({ channel: 'sfx' });

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
        cpuAutoPlayInProgress: false,
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
        playerTurnState: 'normal',
        cpuTurnState: 'normal',
        openWhatYouWantActive: null,
        openWhatYouWantCards: [],
        showOpenWhatYouWantModal: false,
        showOpenWhatYouWantAnimation: false,
        dataWarFaceUpPending: false,
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
        patentTheftStolenCard: null,
        patentTheftWinner: null,
        animationQueue: [],
        isPlayingQueuedAnimation: false,
        animationsPaused: false,
        blockTransitions: false,
        hostileTakeoverDataWar: false,
        currentAnimationPlayer: null,
        animationCompletionCallback: null,
        // Reset Data Grab state
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
        showDataGrabCookies: false,
        // Reset Temper Tantrum state
        showTemperTantrumModal: false,
        temperTantrumAvailableCards: [],
        temperTantrumSelectedCards: [],
        temperTantrumMaxSelections: 2,
        temperTantrumWinner: null,
        temperTantrumLoserCards: [],
        temperTantrumFaceDownCardIds: new Set(),
        // Reset Effect Notification System state
        pendingEffectNotifications: [],
        currentEffectNotification: null,
        showEffectNotificationBadge: false,
        showEffectNotificationModal: false,
        accumulatedEffects: [],
        effectAccumulationPaused: false,
        awaitingResolution: false,
        effectBadgeTimerActive: false,
        effectBadgeTimerStartTime: null,
        effectsQueue: [],
        effectsWinner: null,
        launchStacksForWinnerCount: 0,
        needsDataWarAfterEffects: false,
        // Reset Asset Preloading State
        hasShownCriticalLoadingScreen: false,
        hasShownHighPriorityLoadingScreen: false,
        hasShownEssentialLoadingScreen: false,
        // Memory cleanup - Reset unbounded data structures
        eventLog: [],
        shownAnimationCardIds: new Set(),
        seenPlayTriggers: new Set<string>(),
        seenTableauCardTypes: new Set<string>(),
        // Reset audio channels
        audioMusicChannel: null,
        audioSfxChannels: [null, null, null, null],
        audioMusicTrackId: null,
        audioSfxTrackIds: [null, null, null, null],
      });
    },
  };
}
