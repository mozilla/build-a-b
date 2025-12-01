/**
 * Audio Lifecycle Hook (Howler.js-based)
 *
 * Manages Howl instance lifecycle events for mobile browsers.
 * Handles tab switching, page backgrounding, and force quit scenarios
 * to prevent "zombie audio" and provide seamless pause/resume behavior.
 *
 * Features:
 * - Pauses audio when page becomes hidden (tab switch, minimize, lock screen)
 * - Resumes audio when page becomes visible (only if system paused it)
 * - Prevents auto-resume if user manually paused before leaving
 * - Forces pause on page unload (prevents zombie audio on iOS)
 * - Handles iOS interruptions (phone calls, Siri) via visibilitychange
 *
 * Note: Howler.js automatically handles audio context unlocking on iOS.
 * The manual unlock logic has been removed in favor of Howler's built-in handling.
 */

import { useEffect, useRef } from 'react';
import type { Howl } from 'howler';

export interface UseAudioLifecycleOptions {
  /**
   * The Howl instance used for music playback
   */
  musicChannel: Howl | null;

  /**
   * Array of Howl instances used for sound effects
   */
  sfxChannels: (Howl | null)[];

  /**
   * Enable console logging for debugging
   * @default false
   */
  debug?: boolean;
}

/**
 * Hook to manage audio lifecycle across browser visibility changes
 * and page unload events.
 *
 * @example
 * ```tsx
 * function App() {
 *   const musicChannel = useGameStore(state => state.audioMusicChannel);
 *   const sfxChannels = useGameStore(state => state.audioSfxChannels);
 *
 *   useAudioLifecycle({ musicChannel, sfxChannels });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useAudioLifecycle(options: UseAudioLifecycleOptions): void {
  const { musicChannel, sfxChannels, debug = false } = options;

  // Tracks if the SYSTEM (not user) paused the music
  // This prevents auto-resuming music if the user had manually paused it
  const wasSystemPaused = useRef(false);

  // Use refs to track current Howl instances without triggering effect re-runs
  // This is critical because Zustand selectors return new array references on every render
  const musicChannelRef = useRef<Howl | null>(null);
  const sfxChannelsRef = useRef<(Howl | null)[]>([]);

  // Update refs when audio channels change
  useEffect(() => {
    musicChannelRef.current = musicChannel;
    sfxChannelsRef.current = sfxChannels;
  }, [musicChannel, sfxChannels]);

  // Setup lifecycle event listeners (runs once on mount)
  useEffect(() => {
    const log = (message: string, ...args: unknown[]) => {
      if (debug) {
        console.log(`[AudioLifecycle] ${message}`, ...args);
      }
    };

    /**
     * Handle visibility changes (tab switching, minimize, lock screen, iOS interruptions)
     * This event fires when:
     * - User switches tabs
     * - User minimizes browser
     * - User locks phone screen
     * - Phone call comes in (iOS)
     * - Siri is activated (iOS)
     * - Alarm goes off (iOS)
     */
    const handleVisibilityChange = () => {
      const music = musicChannelRef.current;

      if (document.visibilityState === 'hidden') {
        log('Page hidden - pausing audio');

        // Check if music is currently playing
        if (music && music.playing()) {
          music.pause();
          wasSystemPaused.current = true;
          log('Music paused by system, will auto-resume on return');
        } else {
          wasSystemPaused.current = false;
          log('Music already paused, will NOT auto-resume');
        }

        // Pause all active SFX (we don't resume these)
        sfxChannelsRef.current.forEach((sfx, index) => {
          if (sfx && sfx.playing()) {
            sfx.pause();
            log(`SFX channel ${index} paused`);
          }
        });
      } else if (document.visibilityState === 'visible') {
        log('Page visible - checking if should resume');

        // Only resume music if WE (the system) paused it
        // If the user paused it before leaving, don't auto-resume
        if (wasSystemPaused.current && music) {
          log('Attempting to resume music...');

          try {
            music.play();
            log('Music resumed successfully');
            wasSystemPaused.current = false;
          } catch (error) {
            // This can happen if autoplay policy blocks resume
            // or if audio context was suspended
            console.warn('[AudioLifecycle] Auto-resume blocked:', error);
            wasSystemPaused.current = false;
          }
        } else {
          log('Not resuming music (user had paused it or no music channel)');
        }

        // Note: We don't resume SFX channels - they're one-shot sounds
      }
    };

    /**
     * Handle page unload/hide (force quit, close tab, navigate away)
     * This is the "zombie audio" fix for iOS
     * 'pagehide' is more reliable than 'beforeunload' on mobile
     */
    const handlePageHide = () => {
      log('Page hiding - forcing all audio to pause (zombie audio prevention)');

      // Force pause on all audio channels
      if (musicChannelRef.current) {
        musicChannelRef.current.pause();
      }

      sfxChannelsRef.current.forEach((sfx) => {
        if (sfx) {
          sfx.pause();
        }
      });
    };

    // Attach event listeners
    log('Attaching lifecycle event listeners');
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    // Cleanup function - remove listeners on unmount
    return () => {
      log('Removing lifecycle event listeners');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [debug]); // Only re-run if debug flag changes
}
