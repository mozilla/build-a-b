/**
 * Audio Lifecycle Hook (Howler.js-optimized)
 *
 * Manages Howl instance lifecycle events for mobile browsers.
 * Works WITH Howler's AudioContext management instead of against it.
 *
 * Key improvements for iOS:
 * - Leverages Howler's global AudioContext (Howler.ctx)
 * - Properly resumes AudioContext on visibility change
 * - Handles iOS interruptions (calls, notifications, Siri)
 * - Prevents "zombie audio" on page unload
 * - Works with Howler's autoSuspend feature
 *
 * Based on Howler.js best practices:
 * - Howler automatically suspends AudioContext after 30s of inactivity
 * - Howler automatically resumes AudioContext when play() is called
 * - We need to help it resume after visibility changes
 */

import { useEffect, useRef } from 'react';
import type { Howl } from 'howler';
import { Howler } from 'howler';

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
 * Hook to manage audio lifecycle across browser visibility changes,
 * interruptions, and page unload events.
 *
 * @example
 * ```tsx
 * function App() {
 *   const musicChannel = useGameStore(state => state.audioMusicChannel);
 *   const sfxChannels = useGameStore(state => state.audioSfxChannels);
 *
 *   useAudioLifecycle({ musicChannel, sfxChannels, debug: true });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useAudioLifecycle(options: UseAudioLifecycleOptions): void {
  const { musicChannel, sfxChannels, debug = false } = options;

  // Track music state
  const wasMusicPlaying = useRef(false);
  const isMusicPausedByUser = useRef(false);

  // Use refs to track current Howl instances
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
     * - Notifications (sometimes on iOS)
     */
    const handleVisibilityChange = () => {
      const music = musicChannelRef.current;

      if (document.visibilityState === 'hidden') {
        log('Page hidden - pausing audio and noting state');

        // Track if music was playing BEFORE we pause it
        if (music && music.playing()) {
          wasMusicPlaying.current = true;
          isMusicPausedByUser.current = false;
          music.pause();
          log('Music paused by system (will auto-resume)');
        } else {
          wasMusicPlaying.current = false;
          isMusicPausedByUser.current = music !== null; // If music exists but not playing, user paused it
          log('Music not playing (will NOT auto-resume)');
        }

        // Pause all active SFX
        sfxChannelsRef.current.forEach((sfx, index) => {
          if (sfx && sfx.playing()) {
            sfx.pause();
            log(`SFX channel ${index} paused`);
          }
        });

        // CRITICAL: Suspend the AudioContext to save resources
        // This is important for iOS battery life
        if (Howler.ctx && Howler.ctx.state === 'running') {
          Howler.ctx.suspend().then(() => {
            log('AudioContext suspended');
          }).catch((error) => {
            log('Failed to suspend AudioContext:', error);
          });
        }
      } else if (document.visibilityState === 'visible') {
        log('Page visible - attempting to resume audio');
        log(`AudioContext state: ${Howler.ctx?.state}`);
        log(`Was music playing: ${wasMusicPlaying.current}`);
        log(`User paused: ${isMusicPausedByUser.current}`);

        // CRITICAL: Resume the AudioContext first
        // This is the KEY fix for iOS audio not working after backgrounding
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
          Howler.ctx.resume().then(() => {
            log('AudioContext resumed successfully');
            log(`New AudioContext state: ${Howler.ctx.state}`);
          }).catch((error) => {
            console.error('[AudioLifecycle] Failed to resume AudioContext:', error);
            // If resume fails, audio will be dead until user interaction
            // Let's try to recover on next user interaction
            const recoverAudio = () => {
              if (Howler.ctx && Howler.ctx.state === 'suspended') {
                Howler.ctx.resume().then(() => {
                  log('AudioContext recovered on user interaction');
                }).catch((err) => {
                  console.error('[AudioLifecycle] Recovery failed:', err);
                });
              }
            };
            document.addEventListener('touchend', recoverAudio, { once: true });
            document.addEventListener('click', recoverAudio, { once: true });
          });
        }

        // Small delay to ensure AudioContext is fully resumed
        setTimeout(() => {
          // Only resume music if:
          // 1. Music was playing when we backgrounded (wasMusicPlaying)
          // 2. User didn't manually pause it (isMusicPausedByUser)
          // 3. Music channel exists
          const music = musicChannelRef.current;
          if (wasMusicPlaying.current && !isMusicPausedByUser.current && music) {
            log('Attempting to resume music...');
            try {
              music.play();
              log('Music resumed successfully');
            } catch (error) {
              console.warn('[AudioLifecycle] Auto-resume blocked:', error);
            }
          } else {
            log('Not resuming music:', {
              wasPlaying: wasMusicPlaying.current,
              userPaused: isMusicPausedByUser.current,
              hasMusic: !!music,
            });
          }

          // Reset state flags
          wasMusicPlaying.current = false;
          isMusicPausedByUser.current = false;
        }, 100); // 100ms delay to ensure AudioContext is stable

        // Note: We don't resume SFX channels - they're one-shot sounds that should
        // restart naturally when game events trigger them
      }
    };

    /**
     * Handle audio interruptions (iOS-specific)
     * iOS fires this when phone calls, alarms, etc interrupt audio
     */
    const handleInterruptionBegin = () => {
      log('Audio interruption began (iOS)');
      const music = musicChannelRef.current;
      
      if (music && music.playing()) {
        wasMusicPlaying.current = true;
        isMusicPausedByUser.current = false;
        music.pause();
      }
    };

    const handleInterruptionEnd = () => {
      log('Audio interruption ended (iOS)');
      
      // Resume AudioContext
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume().then(() => {
          log('AudioContext resumed after interruption');
        }).catch((error) => {
          console.error('[AudioLifecycle] Failed to resume after interruption:', error);
        });
      }

      // Resume music if it was playing
      setTimeout(() => {
        const music = musicChannelRef.current;
        if (wasMusicPlaying.current && music) {
          try {
            music.play();
            log('Music resumed after interruption');
          } catch (error) {
            console.warn('[AudioLifecycle] Failed to resume music:', error);
          }
        }
        wasMusicPlaying.current = false;
      }, 100);
    };

    /**
     * Handle page unload/hide (force quit, close tab, navigate away)
     * This is the "zombie audio" fix for iOS
     * 'pagehide' is more reliable than 'beforeunload' on mobile
     */
    const handlePageHide = () => {
      log('Page hiding - forcing all audio to stop (zombie audio prevention)');

      // Stop all audio immediately
      if (musicChannelRef.current) {
        musicChannelRef.current.stop();
      }

      sfxChannelsRef.current.forEach((sfx) => {
        if (sfx) {
          sfx.stop();
        }
      });

      // Suspend the AudioContext to save resources
      if (Howler.ctx && Howler.ctx.state === 'running') {
        Howler.ctx.suspend().catch((error) => {
          log('Failed to suspend on page hide:', error);
        });
      }
    };

    // Attach event listeners
    log('Attaching lifecycle event listeners');
    log(`Initial AudioContext state: ${Howler.ctx?.state}`);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    
    // iOS-specific interruption events
    // These fire when phone calls, alarms, etc interrupt audio
    if ('onbegininterruption' in document) {
      document.addEventListener('begininterruption', handleInterruptionBegin);
      document.addEventListener('endinterruption', handleInterruptionEnd);
      log('iOS interruption handlers attached');
    }

    // Cleanup function - remove listeners on unmount
    return () => {
      log('Removing lifecycle event listeners');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      
      if ('onbegininterruption' in document) {
        document.removeEventListener('begininterruption', handleInterruptionBegin);
        document.removeEventListener('endinterruption', handleInterruptionEnd);
      }
    };
  }, [debug]);
}
