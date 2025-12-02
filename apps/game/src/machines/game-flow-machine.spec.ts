import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createActor } from 'xstate';
import { ANIMATION_DURATIONS } from '../config/animation-timings';
import { gameFlowMachine } from './game-flow-machine';

// Create mock functions that can be overridden per test
const mockCheckForDataWar = vi.fn(() => false);
const mockHasPreRevealEffects = vi.fn(() => false);
const mockHasUnseenEffectNotifications = vi.fn(() => false);

// Create a default mock state that can be overridden per test
let mockStoreState: any = {
  preloadingComplete: true,
  highPriorityAssetsReady: true,
  criticalPriorityAssetsReady: true,
  winner: null,
  winCondition: null,
  checkForDataWar: mockCheckForDataWar,
  pendingEffects: [],
  hasPreRevealEffects: mockHasPreRevealEffects,
  hasUnseenEffectNotifications: mockHasUnseenEffectNotifications,
  anotherPlayExpected: false,
  openWhatYouWantActive: null,
  hostileTakeoverDataWar: false,
  player: {
    playedCard: null,
    playedCardsInHand: [],
    pendingTrackerBonus: 0,
    pendingBlockerPenalty: 0,
    currentTurnValue: 0,
    activeEffects: [],
  },
  cpu: {
    playedCard: null,
    playedCardsInHand: [],
    pendingTrackerBonus: 0,
    pendingBlockerPenalty: 0,
    currentTurnValue: 0,
    activeEffects: [],
  },
};

// Mock the store to allow tests to bypass asset preloading guards
vi.mock('../store/game-store', () => ({
  useGameStore: {
    getState: vi.fn(() => ({
      ...mockStoreState,
      playCard: vi.fn(), // Mock playCard function for OWYW transitions
    })),
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
}));

describe('gameFlowMachine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset mocks before each test
    mockCheckForDataWar.mockReturnValue(false);
    mockHasPreRevealEffects.mockReturnValue(false);
    mockHasUnseenEffectNotifications.mockReturnValue(false);

    // Reset mock store state
    mockStoreState = {
      preloadingComplete: true,
      highPriorityAssetsReady: true,
      criticalPriorityAssetsReady: true,
      winner: null,
      winCondition: null,
      checkForDataWar: mockCheckForDataWar,
      pendingEffects: [],
      hasPreRevealEffects: mockHasPreRevealEffects,
      hasUnseenEffectNotifications: mockHasUnseenEffectNotifications,
      anotherPlayExpected: false,
      openWhatYouWantActive: null,
      hostileTakeoverDataWar: false,
      player: {
        playedCard: null,
        playedCardsInHand: [],
        pendingTrackerBonus: 0,
        pendingBlockerPenalty: 0,
        currentTurnValue: 0,
        activeEffects: [],
      },
      cpu: {
        playedCard: null,
        playedCardsInHand: [],
        pendingTrackerBonus: 0,
        pendingBlockerPenalty: 0,
        currentTurnValue: 0,
        activeEffects: [],
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should start in welcome state', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      expect(actor.getSnapshot().value).toBe('welcome');

      actor.stop();
    });
  });

  describe('game setup flow', () => {
    it('should transition from welcome to select_billionaire', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      actor.send({ type: 'START_GAME' });

      expect(actor.getSnapshot().value).toBe('select_billionaire');

      actor.stop();
    });

    it('should transition through complete setup flow', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Welcome -> Select Billionaire
      actor.send({ type: 'START_GAME' });
      expect(actor.getSnapshot().value).toBe('select_billionaire');

      // Select Billionaire -> Select Background
      actor.send({ type: 'SELECT_BILLIONAIRE', billionaire: 'elon' });
      expect(actor.getSnapshot().value).toBe('select_background');

      // Select Background -> Intro
      actor.send({ type: 'SELECT_BACKGROUND', background: 'space' });
      expect(actor.getSnapshot().value).toBe('intro');

      // Intro -> Quick Start Guide
      actor.send({ type: 'SHOW_GUIDE' });
      expect(actor.getSnapshot().value).toBe('quick_start_guide');

      // Quick Start Guide -> Your Mission
      actor.send({ type: 'SKIP_GUIDE' });
      expect(actor.getSnapshot().value).toBe('your_mission');

      // Your Mission -> VS Animation
      actor.send({ type: 'START_PLAYING' });
      expect(actor.getSnapshot().value).toBe('vs_animation');

      actor.stop();
    });

    it('should transition from quick_start_guide back to intro when BACK_TO_INTRO event is sent', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Navigate to quick_start_guide
      actor.send({ type: 'START_GAME' });
      actor.send({ type: 'SELECT_BILLIONAIRE', billionaire: 'elon' });
      actor.send({ type: 'SELECT_BACKGROUND', background: 'space' });
      actor.send({ type: 'SHOW_GUIDE' });
      expect(actor.getSnapshot().value).toBe('quick_start_guide');

      // Quick Start Guide -> Intro (back)
      actor.send({ type: 'BACK_TO_INTRO' });
      expect(actor.getSnapshot().value).toBe('intro');

      actor.stop();
    });

    it('should transition from vs_animation to ready when VS_ANIMATION_COMPLETE event is sent', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Navigate to vs_animation state
      actor.send({ type: 'START_GAME' });
      actor.send({ type: 'SELECT_BILLIONAIRE', billionaire: 'elon' });
      actor.send({ type: 'SELECT_BACKGROUND', background: 'space' });
      actor.send({ type: 'SKIP_INSTRUCTIONS' }); // Skip intro
      actor.send({ type: 'START_PLAYING' }); // Transition from your_mission to vs_animation

      expect(actor.getSnapshot().value).toBe('vs_animation');

      // Send VS_ANIMATION_COMPLETE event (triggered by video 'ended' event)
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });

      expect(actor.getSnapshot().value).toBe('ready');
      expect(actor.getSnapshot().context.tooltipMessage).toBe('TAP_TO_PLAY');
      actor.stop();
    });
  });

  describe('gameplay flow', () => {
    it('should transition from ready to revealing when cards are revealed', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Navigate to ready state
      actor.send({ type: 'START_GAME' });
      actor.send({ type: 'SELECT_BILLIONAIRE', billionaire: 'elon' });
      actor.send({ type: 'SELECT_BACKGROUND', background: 'space' });
      actor.send({ type: 'SKIP_INSTRUCTIONS' }); // Skip intro
      actor.send({ type: 'START_PLAYING' }); // Transition from your_mission to vs_animation
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });

      expect(actor.getSnapshot().value).toBe('ready');

      // Start turn
      actor.send({ type: 'REVEAL_CARDS' });
      expect(actor.getSnapshot().value).toBe('revealing');

      actor.stop();
    });

    it('should transition from revealing to comparing on CARDS_REVEALED', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Navigate to revealing state
      actor.send({ type: 'START_GAME' });
      actor.send({ type: 'SELECT_BILLIONAIRE', billionaire: 'elon' });
      actor.send({ type: 'SELECT_BACKGROUND', background: 'space' });
      actor.send({ type: 'SKIP_INSTRUCTIONS' }); // Skip intro
      actor.send({ type: 'START_PLAYING' }); // Transition from your_mission to vs_animation
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });
      actor.send({ type: 'REVEAL_CARDS' });

      expect(actor.getSnapshot().value).toBe('revealing');

      // Send CARDS_REVEALED event
      actor.send({ type: 'CARDS_REVEALED' });
      expect(actor.getSnapshot().value).toEqual({ effect_notification: 'checking' });

      // Wait for effect notification delay to complete
      vi.advanceTimersByTime(ANIMATION_DURATIONS.EFFECT_NOTIFICATION_TRANSITION_DELAY);
      expect(actor.getSnapshot().value).toBe('comparing');
      actor.stop();
    });

    it('should transition to data_war on TIE', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Navigate to comparing state
      actor.send({ type: 'START_GAME' });
      actor.send({ type: 'SELECT_BILLIONAIRE', billionaire: 'elon' });
      actor.send({ type: 'SELECT_BACKGROUND', background: 'space' });
      actor.send({ type: 'SKIP_INSTRUCTIONS' }); // Skip intro
      actor.send({ type: 'START_PLAYING' }); // Transition from your_mission to vs_animation
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });
      actor.send({ type: 'REVEAL_CARDS' });
      actor.send({ type: 'CARDS_REVEALED' });
      // Wait for effect notification delay to complete
      vi.advanceTimersByTime(ANIMATION_DURATIONS.EFFECT_NOTIFICATION_TRANSITION_DELAY);

      expect(actor.getSnapshot().value).toBe('comparing');

      // Send TIE event which directly transitions to data_war
      actor.send({ type: 'TIE' });
      expect(actor.getSnapshot().value).toEqual({ data_war: 'pre_animation' });

      actor.stop();
    });

    it('should transition to special_effect when special card is played', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Navigate to comparing state
      actor.send({ type: 'START_GAME' });
      actor.send({ type: 'SELECT_BILLIONAIRE', billionaire: 'elon' });
      actor.send({ type: 'SELECT_BACKGROUND', background: 'space' });
      actor.send({ type: 'SKIP_INSTRUCTIONS' }); // Skip intro
      actor.send({ type: 'START_PLAYING' }); // Transition from your_mission to vs_animation
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });
      actor.send({ type: 'REVEAL_CARDS' });
      actor.send({ type: 'CARDS_REVEALED' });
      // Wait for effect notification delay to complete
      vi.advanceTimersByTime(ANIMATION_DURATIONS.EFFECT_NOTIFICATION_TRANSITION_DELAY);

      actor.send({ type: 'SPECIAL_EFFECT' });
      expect(actor.getSnapshot().value).toEqual({ special_effect: 'showing' });

      actor.stop();
    });

    it('should transition to resolving after special effect is processed', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Navigate to special_effect state
      actor.send({ type: 'START_GAME' });
      actor.send({ type: 'SELECT_BILLIONAIRE', billionaire: 'elon' });
      actor.send({ type: 'SELECT_BACKGROUND', background: 'space' });
      actor.send({ type: 'SKIP_INSTRUCTIONS' }); // Skip intro
      actor.send({ type: 'START_PLAYING' }); // Transition from your_mission to vs_animation
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });
      actor.send({ type: 'REVEAL_CARDS' });
      actor.send({ type: 'CARDS_REVEALED' });
      // Wait for effect notification delay to complete
      vi.advanceTimersByTime(ANIMATION_DURATIONS.EFFECT_NOTIFICATION_TRANSITION_DELAY);
      actor.send({ type: 'SPECIAL_EFFECT' });

      expect(actor.getSnapshot().value).toEqual({ special_effect: 'showing' });

      actor.send({ type: 'DISMISS_EFFECT' });
      expect(actor.getSnapshot().value).toEqual({ special_effect: 'processing' });

      actor.stop();
    });

    it('should transition to resolving directly when no tie or special effect', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Navigate to comparing state
      actor.send({ type: 'START_GAME' });
      actor.send({ type: 'SELECT_BILLIONAIRE', billionaire: 'elon' });
      actor.send({ type: 'SELECT_BACKGROUND', background: 'space' });
      actor.send({ type: 'SKIP_INSTRUCTIONS' }); // Skip intro
      actor.send({ type: 'START_PLAYING' }); // Transition from your_mission to vs_animation
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });
      actor.send({ type: 'REVEAL_CARDS' });
      actor.send({ type: 'CARDS_REVEALED' });
      // Wait for effect notification delay to complete
      vi.advanceTimersByTime(ANIMATION_DURATIONS.EFFECT_NOTIFICATION_TRANSITION_DELAY);

      actor.send({ type: 'RESOLVE_TURN' });
      expect(actor.getSnapshot().value).toBe('resolving');

      actor.stop();
    });
  });

  describe('data war (tie) flow', () => {
    it('should navigate through data war substates', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Navigate to data_war state
      actor.send({ type: 'START_GAME' });
      actor.send({ type: 'SELECT_BILLIONAIRE', billionaire: 'elon' });
      actor.send({ type: 'SELECT_BACKGROUND', background: 'space' });
      actor.send({ type: 'SKIP_INSTRUCTIONS' }); // Skip intro
      actor.send({ type: 'START_PLAYING' }); // Transition from your_mission to vs_animation
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });
      actor.send({ type: 'REVEAL_CARDS' });
      actor.send({ type: 'CARDS_REVEALED' });
      // Wait for effect notification delay to complete
      vi.advanceTimersByTime(ANIMATION_DURATIONS.EFFECT_NOTIFICATION_TRANSITION_DELAY);

      expect(actor.getSnapshot().value).toBe('comparing');

      // Send TIE event to enter data_war
      actor.send({ type: 'TIE' });

      // Should start in pre_animation substate
      expect(actor.getSnapshot().value).toEqual({ data_war: 'pre_animation' });

      // After delay, should move to reveal_face_down
      setTimeout(() => {
        expect(actor.getSnapshot().value).toEqual({ data_war: 'reveal_face_down' });
      }, 2100);

      actor.stop();
    });

    it('should transition from reveal_face_down to reveal_face_up on TAP_DECK', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Navigate to data_war.reveal_face_down state
      actor.send({ type: 'START_GAME' });
      actor.send({ type: 'SELECT_BILLIONAIRE', billionaire: 'elon' });
      actor.send({ type: 'SELECT_BACKGROUND', background: 'space' });
      actor.send({ type: 'SKIP_INSTRUCTIONS' }); // Skip intro
      actor.send({ type: 'START_PLAYING' }); // Transition from your_mission to vs_animation
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });
      actor.send({ type: 'REVEAL_CARDS' });
      actor.send({ type: 'CARDS_REVEALED' });
      actor.send({ type: 'TIE' });

      // Fast-forward through animating state
      setTimeout(() => {
        actor.send({ type: 'TAP_DECK' });
        expect(actor.getSnapshot().value).toEqual({ data_war: 'reveal_face_up' });
      }, 2100);

      actor.stop();
    });

    it('should return to comparing after data war completes', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Navigate through data war
      actor.send({ type: 'START_GAME' });
      actor.send({ type: 'SELECT_BILLIONAIRE', billionaire: 'elon' });
      actor.send({ type: 'SELECT_BACKGROUND', background: 'space' });
      actor.send({ type: 'SKIP_INSTRUCTIONS' }); // Skip intro
      actor.send({ type: 'START_PLAYING' }); // Transition from your_mission to vs_animation
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });
      actor.send({ type: 'REVEAL_CARDS' });
      actor.send({ type: 'CARDS_REVEALED' });
      actor.send({ type: 'TIE' });

      setTimeout(() => {
        actor.send({ type: 'TAP_DECK' }); // Move to reveal_face_up
        actor.send({ type: 'TAP_DECK' }); // Complete data war

        expect(actor.getSnapshot().value).toBe('comparing');
        expect(actor.getSnapshot().context.currentTurn).toBe(1);
      }, 2100);

      actor.stop();
    });
  });

  describe('resolving and win conditions', () => {
    it('should increment turn counter when entering resolving state', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      expect(actor.getSnapshot().context.currentTurn).toBe(0);

      // Navigate to resolving state
      actor.send({ type: 'START_GAME' });
      actor.send({ type: 'SELECT_BILLIONAIRE', billionaire: 'elon' });
      actor.send({ type: 'SELECT_BACKGROUND', background: 'space' });
      actor.send({ type: 'SKIP_INSTRUCTIONS' }); // Skip intro
      actor.send({ type: 'START_PLAYING' }); // Transition from your_mission to vs_animation
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });
      actor.send({ type: 'REVEAL_CARDS' });
      actor.send({ type: 'CARDS_REVEALED' });
      // Wait for effect notification delay to complete
      vi.advanceTimersByTime(ANIMATION_DURATIONS.EFFECT_NOTIFICATION_TRANSITION_DELAY);
      actor.send({ type: 'RESOLVE_TURN' });

      expect(actor.getSnapshot().context.currentTurn).toBe(1);

      actor.stop();
    });

    it('should return to ready state when no win condition', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Navigate to resolving state
      actor.send({ type: 'START_GAME' });
      actor.send({ type: 'SELECT_BILLIONAIRE', billionaire: 'elon' });
      actor.send({ type: 'SELECT_BACKGROUND', background: 'space' });
      actor.send({ type: 'SKIP_INSTRUCTIONS' }); // Skip intro
      actor.send({ type: 'START_PLAYING' }); // Transition from your_mission to vs_animation
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });
      actor.send({ type: 'REVEAL_CARDS' });
      actor.send({ type: 'CARDS_REVEALED' });
      // Wait for effect notification delay to complete
      vi.advanceTimersByTime(ANIMATION_DURATIONS.EFFECT_NOTIFICATION_TRANSITION_DELAY);
      actor.send({ type: 'RESOLVE_TURN' });

      // Check win condition (guard returns false, transitions to pre_reveal)
      actor.send({ type: 'CHECK_WIN_CONDITION' });

      // State should be in pre_reveal.processing first
      expect(actor.getSnapshot().value).toEqual({ pre_reveal: 'processing' });

      // Wait for WIN_ANIMATION duration (1200ms) to transition to ready
      vi.advanceTimersByTime(ANIMATION_DURATIONS.WIN_ANIMATION);

      expect(actor.getSnapshot().value).toBe('ready');

      actor.stop();
    });
  });

  describe('global transitions', () => {
    it('should reset game from any state', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Navigate to some state
      actor.send({ type: 'START_GAME' });
      actor.send({ type: 'SELECT_BILLIONAIRE', billionaire: 'elon' });
      actor.send({ type: 'SELECT_BACKGROUND', background: 'space' });

      expect(actor.getSnapshot().value).not.toBe('welcome');

      // Reset game
      actor.send({ type: 'RESET_GAME' });

      expect(actor.getSnapshot().value).toBe('welcome');
      expect(actor.getSnapshot().context.currentTurn).toBe(0);
      expect(actor.getSnapshot().context.trackerSmackerActive).toBe(null);

      actor.stop();
    });

    it('should quit game and return to welcome', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Navigate to some state
      actor.send({ type: 'START_GAME' });
      actor.send({ type: 'SELECT_BILLIONAIRE', billionaire: 'elon' });

      actor.send({ type: 'QUIT_GAME' });

      expect(actor.getSnapshot().value).toBe('welcome');

      actor.stop();
    });
  });

  describe('context management', () => {
    it('should track trackerSmackerActive in context', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      expect(actor.getSnapshot().context.trackerSmackerActive).toBe(null);

      actor.stop();
    });
  });

  describe('DataWar OWYW flow', () => {
    // Helper to navigate to data_war.reveal_face_up.ready state
    const navigateToDataWarFaceUpReady = (actor: any) => {
      actor.send({ type: 'START_GAME' });
      actor.send({ type: 'SELECT_BILLIONAIRE', billionaire: 'elon' });
      actor.send({ type: 'SELECT_BACKGROUND', background: 'space' });
      actor.send({ type: 'SKIP_INSTRUCTIONS' });
      actor.send({ type: 'START_PLAYING' });
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });
      actor.send({ type: 'REVEAL_CARDS' });
      actor.send({ type: 'CARDS_REVEALED' });
      vi.advanceTimersByTime(ANIMATION_DURATIONS.EFFECT_NOTIFICATION_TRANSITION_DELAY);

      // Enter data_war (starts in pre_animation)
      actor.send({ type: 'TIE' });

      // Wait for pre_animation → animating (1500ms)
      vi.advanceTimersByTime(1500);

      // Wait for animating → reveal_face_down (2000ms)
      vi.advanceTimersByTime(ANIMATION_DURATIONS.DATA_WAR_ANIMATION_DURATION);

      // Reveal face-down cards (reveal_face_down → reveal_face_up.settling)
      actor.send({ type: 'TAP_DECK' });

      // Wait for settling → ready (2500ms)
      vi.advanceTimersByTime(ANIMATION_DURATIONS.DATA_WAR_FACE_DOWN_CARDS_ANIMATION_DURATION);

      // Now in data_war.reveal_face_up.ready
    };

    it('should route to owyw_selecting when player played OWYW during face-up', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Set up OWYW in player's played cards
      mockStoreState.player.playedCardsInHand = [
        { card: { id: 'card1', name: 'Test Card', specialType: 'open_what_you_want' } },
      ];
      mockStoreState.hostileTakeoverDataWar = false;

      navigateToDataWarFaceUpReady(actor);
      expect(actor.getSnapshot().value).toEqual({ data_war: { reveal_face_up: 'ready' } });

      // Tap deck should route to owyw_selecting
      actor.send({ type: 'TAP_DECK' });
      expect(actor.getSnapshot().value).toEqual({ data_war: { reveal_face_up: 'owyw_selecting' } });

      actor.stop();
    });

    it('should route to comparing when no OWYW was played', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // No OWYW in played cards
      mockStoreState.player.playedCardsInHand = [
        { card: { id: 'card1', name: 'Test Card', specialType: null } },
      ];
      mockStoreState.cpu.playedCardsInHand = [
        { card: { id: 'card2', name: 'Test Card', specialType: null } },
      ];
      mockStoreState.hostileTakeoverDataWar = false;

      navigateToDataWarFaceUpReady(actor);
      expect(actor.getSnapshot().value).toEqual({ data_war: { reveal_face_up: 'ready' } });

      // Tap deck should route to comparing (normal path)
      actor.send({ type: 'TAP_DECK' });
      expect(actor.getSnapshot().value).toBe('comparing');

      actor.stop();
    });

    it('should detect OWYW from openWhatYouWantActive flag', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Set OWYW active from previous turn
      mockStoreState.openWhatYouWantActive = 'player';
      mockStoreState.player.playedCardsInHand = [];
      mockStoreState.hostileTakeoverDataWar = false;

      navigateToDataWarFaceUpReady(actor);

      // Tap deck should route to owyw_selecting
      actor.send({ type: 'TAP_DECK' });
      expect(actor.getSnapshot().value).toEqual({ data_war: { reveal_face_up: 'owyw_selecting' } });

      actor.stop();
    });

    it('should transition to comparing when CARD_SELECTED is sent from owyw_selecting', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      mockStoreState.player.playedCardsInHand = [
        { card: { id: 'card1', name: 'Test Card', specialType: 'open_what_you_want' } },
      ];
      mockStoreState.hostileTakeoverDataWar = false;

      navigateToDataWarFaceUpReady(actor);
      actor.send({ type: 'TAP_DECK' });

      expect(actor.getSnapshot().value).toEqual({ data_war: { reveal_face_up: 'owyw_selecting' } });

      // Send CARD_SELECTED (after player selects card)
      actor.send({ type: 'CARD_SELECTED' });
      expect(actor.getSnapshot().value).toBe('comparing');
      expect(actor.getSnapshot().context.currentTurn).toBe(1);

      actor.stop();
    });

    it('should handle Hostile Takeover - player has HT, CPU plays face-up with OWYW', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Player has HT, CPU played OWYW
      mockStoreState.player.playedCard = { specialType: 'hostile_takeover' };
      mockStoreState.cpu.playedCardsInHand = [
        { card: { id: 'card1', name: 'Test Card', specialType: 'open_what_you_want' } },
      ];
      mockStoreState.hostileTakeoverDataWar = true;

      navigateToDataWarFaceUpReady(actor);

      // CPU plays face-up, should detect OWYW
      actor.send({ type: 'TAP_DECK' });
      expect(actor.getSnapshot().value).toEqual({ data_war: { reveal_face_up: 'owyw_selecting' } });

      actor.stop();
    });

    it('should handle Hostile Takeover - CPU has HT, player plays face-up with OWYW', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // CPU has HT, player played OWYW
      mockStoreState.cpu.playedCard = { specialType: 'hostile_takeover' };
      mockStoreState.player.playedCardsInHand = [
        { card: { id: 'card1', name: 'Test Card', specialType: 'open_what_you_want' } },
      ];
      mockStoreState.hostileTakeoverDataWar = true;

      navigateToDataWarFaceUpReady(actor);

      // Player plays face-up, should detect OWYW
      actor.send({ type: 'TAP_DECK' });
      expect(actor.getSnapshot().value).toEqual({ data_war: { reveal_face_up: 'owyw_selecting' } });

      actor.stop();
    });

    it('should not trigger OWYW if wrong player played it during Hostile Takeover', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Player has HT (doesn't play face-up), player also played OWYW (shouldn't trigger)
      mockStoreState.player.playedCard = { specialType: 'hostile_takeover' };
      mockStoreState.player.playedCardsInHand = [
        { card: { id: 'card1', name: 'Test Card', specialType: 'open_what_you_want' } },
      ];
      mockStoreState.cpu.playedCardsInHand = [];
      mockStoreState.hostileTakeoverDataWar = true;

      navigateToDataWarFaceUpReady(actor);

      // Should route to comparing (not owyw_selecting) because player doesn't play face-up
      actor.send({ type: 'TAP_DECK' });
      expect(actor.getSnapshot().value).toBe('comparing');

      actor.stop();
    });

    it('should increment currentTurn when transitioning from owyw_selecting to comparing', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      mockStoreState.player.playedCardsInHand = [
        { card: { id: 'card1', name: 'Test Card', specialType: 'open_what_you_want' } },
      ];
      mockStoreState.hostileTakeoverDataWar = false;

      navigateToDataWarFaceUpReady(actor);

      const turnBeforeSelection = actor.getSnapshot().context.currentTurn;

      actor.send({ type: 'TAP_DECK' });
      expect(actor.getSnapshot().value).toEqual({ data_war: { reveal_face_up: 'owyw_selecting' } });

      actor.send({ type: 'CARD_SELECTED' });
      expect(actor.getSnapshot().context.currentTurn).toBe(turnBeforeSelection + 1);

      actor.stop();
    });

    it('should trigger OWYW on SECOND face-up when played as first face-up (nested DataWar)', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Setup: Player will play OWYW as FIRST face-up card
      mockStoreState.player.playedCardsInHand = [
        { card: { id: 'fd1', name: 'Face Down 1' }, isFaceDown: true },
        { card: { id: 'fd2', name: 'Face Down 2' }, isFaceDown: true },
        { card: { id: 'fd3', name: 'Face Down 3' }, isFaceDown: true },
      ];
      mockStoreState.cpu.playedCardsInHand = [
        { card: { id: 'fd1', name: 'Face Down 1' }, isFaceDown: true },
        { card: { id: 'fd2', name: 'Face Down 2' }, isFaceDown: true },
        { card: { id: 'fd3', name: 'Face Down 3' }, isFaceDown: true },
      ];
      mockStoreState.hostileTakeoverDataWar = false;
      mockStoreState.openWhatYouWantActive = null;

      navigateToDataWarFaceUpReady(actor);
      expect(actor.getSnapshot().value).toEqual({ data_war: { reveal_face_up: 'ready' } });

      // FIRST face-up: Play OWYW (should NOT trigger modal yet)
      actor.send({ type: 'TAP_DECK' });
      expect(actor.getSnapshot().value).toBe('comparing');

      // Simulate cards being played - OWYW is now in playedCardsInHand
      mockStoreState.player.playedCardsInHand = [
        { card: { id: 'fd1', name: 'Face Down 1' }, isFaceDown: true },
        { card: { id: 'fd2', name: 'Face Down 2' }, isFaceDown: true },
        { card: { id: 'fd3', name: 'Face Down 3' }, isFaceDown: true },
        { card: { id: 'owyw', name: 'OWYW', specialType: 'open_what_you_want' }, isFaceDown: false },
      ];
      mockStoreState.cpu.playedCardsInHand = [
        { card: { id: 'fd1', name: 'Face Down 1' }, isFaceDown: true },
        { card: { id: 'fd2', name: 'Face Down 2' }, isFaceDown: true },
        { card: { id: 'fd3', name: 'Face Down 3' }, isFaceDown: true },
        { card: { id: 'regular', name: 'Regular Card' }, isFaceDown: false },
      ];

      // Cards tie again → another DataWar face-up phase
      actor.send({ type: 'TIE' });
      vi.advanceTimersByTime(1500); // pre_animation → animating
      vi.advanceTimersByTime(ANIMATION_DURATIONS.DATA_WAR_ANIMATION_DURATION); // animating → reveal_face_down
      actor.send({ type: 'TAP_DECK' }); // reveal_face_down → reveal_face_up.settling
      vi.advanceTimersByTime(ANIMATION_DURATIONS.DATA_WAR_FACE_DOWN_CARDS_ANIMATION_DURATION); // settling → ready

      expect(actor.getSnapshot().value).toEqual({ data_war: { reveal_face_up: 'ready' } });

      // SECOND face-up: Should trigger OWYW modal (OWYW was played in first face-up)
      actor.send({ type: 'TAP_DECK' });
      expect(actor.getSnapshot().value).toEqual({ data_war: { reveal_face_up: 'owyw_selecting' } });

      actor.stop();
    });

    it('should NOT trigger OWYW twice if OWYW is the only face-up card', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // OWYW is the only face-up card (just played)
      mockStoreState.player.playedCardsInHand = [
        { card: { id: 'fd1', name: 'Face Down 1' }, isFaceDown: true },
        { card: { id: 'fd2', name: 'Face Down 2' }, isFaceDown: true },
        { card: { id: 'fd3', name: 'Face Down 3' }, isFaceDown: true },
      ];
      mockStoreState.cpu.playedCardsInHand = [
        { card: { id: 'fd1', name: 'Face Down 1' }, isFaceDown: true },
        { card: { id: 'fd2', name: 'Face Down 2' }, isFaceDown: true },
        { card: { id: 'fd3', name: 'Face Down 3' }, isFaceDown: true },
      ];
      mockStoreState.hostileTakeoverDataWar = false;
      mockStoreState.openWhatYouWantActive = null;

      navigateToDataWarFaceUpReady(actor);

      // About to play OWYW as first face-up - should NOT trigger
      actor.send({ type: 'TAP_DECK' });
      expect(actor.getSnapshot().value).toBe('comparing'); // Goes to comparing, not owyw_selecting

      actor.stop();
    });
  });
});
