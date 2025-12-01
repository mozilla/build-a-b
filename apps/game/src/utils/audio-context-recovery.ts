/**
 * Audio Context Recovery Utility
 *
 * Provides utilities to recover from AudioContext suspension issues
 * that are common on iOS and mobile browsers.
 *
 * Usage:
 * - Call setupAudioContextRecovery() once at app initialization
 * - It will automatically attempt to resume suspended AudioContext
 * - Provides manual recovery function if needed
 */

import { Howler } from 'howler';

let recoveryListenersAttached = false;

/**
 * Attempt to resume a suspended AudioContext
 * Returns true if successful, false otherwise
 */
export async function resumeAudioContext(): Promise<boolean> {
  if (!Howler.ctx) {
    console.warn('[AudioRecovery] No AudioContext available');
    return false;
  }

  const state = Howler.ctx.state;
  console.log(`[AudioRecovery] AudioContext state: ${state}`);

  if (state === 'suspended') {
    try {
      await Howler.ctx.resume();
      console.log(`[AudioRecovery] AudioContext resumed successfully. New state: ${Howler.ctx.state}`);
      return Howler.ctx.state === 'running';
    } catch (error) {
      console.error('[AudioRecovery] Failed to resume AudioContext:', error);
      return false;
    }
  }

  return state === 'running';
}

/**
 * Check if AudioContext is in a problematic state
 */
export function isAudioContextSuspended(): boolean {
  return Howler.ctx?.state === 'suspended' || Howler.ctx?.state === 'interrupted';
}

/**
 * Setup automatic AudioContext recovery
 * This listens for user interactions and attempts to resume suspended AudioContext
 *
 * Call this once at app initialization
 */
export function setupAudioContextRecovery(): void {
  if (recoveryListenersAttached) {
    console.warn('[AudioRecovery] Recovery listeners already attached');
    return;
  }

  const attemptRecovery = async () => {
    if (isAudioContextSuspended()) {
      console.log('[AudioRecovery] Attempting automatic recovery on user interaction');
      const recovered = await resumeAudioContext();
      if (recovered) {
        console.log('[AudioRecovery] ✓ Audio recovered successfully');
      } else {
        console.warn('[AudioRecovery] ✗ Audio recovery failed');
      }
    }
  };

  // Listen for various user interaction events
  // These are opportunities to resume the AudioContext
  const events = ['touchstart', 'touchend', 'click', 'keydown'];
  
  events.forEach((event) => {
    document.addEventListener(event, attemptRecovery, { 
      capture: true,
      passive: true,
      once: false, // Keep trying on each interaction
    });
  });

  recoveryListenersAttached = true;
  console.log('[AudioRecovery] Recovery system initialized');
}

/**
 * Force unlock audio by playing a silent sound
 * This is a last resort if AudioContext won't resume normally
 *
 * Returns true if successful
 */
export async function forceUnlockAudio(): Promise<boolean> {
  if (!Howler.ctx) {
    return false;
  }

  try {
    // First, try to resume the context
    if (Howler.ctx.state === 'suspended') {
      await Howler.ctx.resume();
    }

    // Then play a silent buffer to force the audio hardware to wake up
    const buffer = Howler.ctx.createBuffer(1, 1, 22050);
    const source = Howler.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(Howler.ctx.destination);
    source.start(0);

    console.log('[AudioRecovery] Force unlock successful');
    return true;
  } catch (error) {
    console.error('[AudioRecovery] Force unlock failed:', error);
    return false;
  }
}

/**
 * Get diagnostic information about current audio state
 * Useful for debugging
 */
export function getAudioDiagnostics(): {
  hasContext: boolean;
  contextState: string;
  usingWebAudio: boolean;
  noAudio: boolean;
  autoSuspend: boolean;
  autoUnlock: boolean;
} {
  return {
    hasContext: !!Howler.ctx,
    contextState: Howler.ctx?.state || 'no-context',
    usingWebAudio: Howler.usingWebAudio,
    noAudio: Howler.noAudio,
    autoSuspend: Howler.autoSuspend,
    autoUnlock: Howler.autoUnlock,
  };
}
