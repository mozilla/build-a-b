import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { gameFlowMachine } from './game-flow-machine';

describe('gameFlowMachine', () => {
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

    it('should auto-transition from vs_animation to ready after 2 seconds', () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Navigate to vs_animation state
      actor.send({ type: 'START_GAME' });
      actor.send({ type: 'SELECT_BILLIONAIRE', billionaire: 'elon' });
      actor.send({ type: 'SELECT_BACKGROUND', background: 'space' });
      actor.send({ type: 'SKIP_INSTRUCTIONS' }); // Skip intro and go straight to vs_animation

      expect(actor.getSnapshot().value).toBe('vs_animation');

      // Wait for auto-transition (2000ms + buffer)
      setTimeout(() => {
        expect(actor.getSnapshot().value).toBe('ready');
        expect(actor.getSnapshot().context.tooltipMessage).toBe('READY_TAP_DECK');
        actor.stop();
      }, 2100);
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
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });
      actor.send({ type: 'REVEAL_CARDS' });

      expect(actor.getSnapshot().value).toBe('revealing');

      // Send CARDS_REVEALED event
      actor.send({ type: 'CARDS_REVEALED' });
      expect(actor.getSnapshot().value).toEqual({ effect_notification: 'checking' });

      // Skip effect notification
      actor.send({ type: 'EFFECT_NOTIFICATION_COMPLETE' });
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
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });
      actor.send({ type: 'REVEAL_CARDS' });
      actor.send({ type: 'CARDS_REVEALED' });
      actor.send({ type: 'EFFECT_NOTIFICATION_COMPLETE' }); // Skip effect notification

      actor.send({ type: 'TIE' });
      expect(actor.getSnapshot().value).toEqual({ data_war: 'animating' });

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
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });
      actor.send({ type: 'REVEAL_CARDS' });
      actor.send({ type: 'CARDS_REVEALED' });
      actor.send({ type: 'EFFECT_NOTIFICATION_COMPLETE' }); // Skip effect notification

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
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });
      actor.send({ type: 'REVEAL_CARDS' });
      actor.send({ type: 'CARDS_REVEALED' });
      actor.send({ type: 'EFFECT_NOTIFICATION_COMPLETE' }); // Skip effect notification
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
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });
      actor.send({ type: 'REVEAL_CARDS' });
      actor.send({ type: 'CARDS_REVEALED' });
      actor.send({ type: 'EFFECT_NOTIFICATION_COMPLETE' }); // Skip effect notification

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
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });
      actor.send({ type: 'REVEAL_CARDS' });
      actor.send({ type: 'CARDS_REVEALED' });
      actor.send({ type: 'EFFECT_NOTIFICATION_COMPLETE' }); // Skip effect notification
      actor.send({ type: 'TIE' });

      // Should start in animating substate
      expect(actor.getSnapshot().value).toEqual({ data_war: 'animating' });

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
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });
      actor.send({ type: 'REVEAL_CARDS' });
      actor.send({ type: 'CARDS_REVEALED' });
      actor.send({ type: 'EFFECT_NOTIFICATION_COMPLETE' }); // Skip effect notification
      actor.send({ type: 'RESOLVE_TURN' });

      expect(actor.getSnapshot().context.currentTurn).toBe(1);

      actor.stop();
    });

    it('should return to ready state when no win condition', async () => {
      const actor = createActor(gameFlowMachine);
      actor.start();

      // Navigate to resolving state
      actor.send({ type: 'START_GAME' });
      actor.send({ type: 'SELECT_BILLIONAIRE', billionaire: 'elon' });
      actor.send({ type: 'SELECT_BACKGROUND', background: 'space' });
      actor.send({ type: 'SKIP_INSTRUCTIONS' }); // Skip intro
      actor.send({ type: 'VS_ANIMATION_COMPLETE' });
      actor.send({ type: 'REVEAL_CARDS' });
      actor.send({ type: 'CARDS_REVEALED' });
      actor.send({ type: 'EFFECT_NOTIFICATION_COMPLETE' }); // Skip effect notification
      actor.send({ type: 'RESOLVE_TURN' });

      // Check win condition (guard returns false, transitions to pre_reveal)
      actor.send({ type: 'CHECK_WIN_CONDITION' });

      // State should be in pre_reveal.processing first
      expect(actor.getSnapshot().value).toEqual({ pre_reveal: 'processing' });

      // Wait for WIN_ANIMATION duration (1200ms) to transition to ready
      await new Promise((resolve) => setTimeout(resolve, 1300));

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
});
