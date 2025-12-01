/**
 * Audio Manager Functions (Howler.js-based)
 * Handles audio playback including music and SFX channels,
 * volume control, fading, and audio state management
 *
 * Migrated to Howler.js for better iOS mobile audio support
 */

import { AUDIO_TRACKS, type AudioTrackId } from '@/config/audio-config';
import { getPreloadedHowl } from '@/hooks/use-howler-preloader';
import type { PlayOptions, StopOptions } from '@/types/audio';
import type { SetState, GetState } from '@/types';

export function createAudioManager(set: SetState, get: GetState) {
  return {
    /**
     * Plays an audio track with optional fade in/out and looping
     * Handles both music (single channel) and SFX (multi-channel) playback
     */
    playAudio: async (trackId: AudioTrackId, options: PlayOptions = {}): Promise<boolean> => {
      const track = AUDIO_TRACKS[trackId];
      if (!track) {
        console.error(`Unknown audio track: ${trackId}`);
        return false;
      }

      const state = get();
      const enabled = track.category === 'music' ? state.musicEnabled : state.soundEffectsEnabled;
      if (!enabled) return false;

      const howl = getPreloadedHowl(trackId);
      if (!howl) {
        console.warn(`Audio not preloaded: ${trackId}`);
        return false;
      }

      // SFX: Find available channel for overlapping playback
      if (track.category === 'sfx') {
        // Find first available (null or not playing) SFX channel
        let channelIndex = state.audioSfxChannels.findIndex(
          (ch) => ch === null || !ch.playing(),
        );

        // If all channels busy, use the first one (oldest sound)
        if (channelIndex === -1) {
          channelIndex = 0;
          // Stop the old sound before replacing
          const oldHowl = state.audioSfxChannels[channelIndex];
          if (oldHowl) {
            oldHowl.stop();
          }
        }

        const sfxChannels = [...state.audioSfxChannels];
        const sfxTrackIds = [...state.audioSfxTrackIds];

        sfxChannels[channelIndex] = howl;
        sfxTrackIds[channelIndex] = trackId;

        // Set volume for this specific sound
        const volume = options.volume ?? track.volume ?? 1.0;
        howl.volume(volume);

        set({
          audioSfxChannels: sfxChannels,
          audioSfxTrackIds: sfxTrackIds,
        });

        try {
          // Play the sound (returns sound ID for this instance)
          howl.play();
          return true;
        } catch (error) {
          console.error(`Failed to play ${trackId}:`, error);
          return false;
        }
      }

      // Music: Only one track at a time
      const currentHowl = state.audioMusicChannel;

      // Handle fade out of current track
      if (currentHowl && currentHowl !== howl) {
        // Only fade/stop if it's a different track
        if (options.fadeOut && options.fadeOut > 0) {
          // Fade from current volume to 0
          const currentVolume = typeof currentHowl.volume() === 'number' ? currentHowl.volume() as number : 1.0;
          currentHowl.fade(currentVolume, 0, options.fadeOut);
          
          // Stop after fade completes
          currentHowl.once('fade', () => {
            currentHowl.stop();
          });
        } else {
          currentHowl.stop();
        }
      }

      // Setup new music track
      const targetVolume = options.volume ?? track.volume ?? 1.0;

      set({
        audioMusicChannel: howl,
        audioMusicTrackId: trackId,
        audioMusicVolume: targetVolume,
      });

      if (options.fadeIn && options.fadeIn > 0) {
        // Start at 0 volume, fade to target
        howl.volume(0);
        try {
          howl.play();
          howl.fade(0, targetVolume, options.fadeIn);
          return true;
        } catch (error) {
          console.error(`Failed to play ${trackId}:`, error);
          return false;
        }
      } else {
        // Set volume and play normally
        howl.volume(targetVolume);
        try {
          howl.play();
          return true;
        } catch (error) {
          console.error(`Failed to play ${trackId}:`, error);
          return false;
        }
      }
    },

    /**
     * Stops audio playback with optional fade out
     */
    stopAudio: (options: StopOptions) => {
      const { channel, trackId, fadeOut } = options;
      const state = get();

      if (channel === 'sfx') {
        // Stop all SFX channels if trackId matches (or all if no trackId specified)
        const sfxChannels = [...state.audioSfxChannels];
        const sfxTrackIds = [...state.audioSfxTrackIds];

        sfxChannels.forEach((howl, index) => {
          if (howl && (!trackId || sfxTrackIds[index] === trackId)) {
            howl.stop();
            sfxChannels[index] = null;
            sfxTrackIds[index] = null;
          }
        });

        set({
          audioSfxChannels: sfxChannels,
          audioSfxTrackIds: sfxTrackIds,
        });
        return;
      }

      // Music channel
      const howl = state.audioMusicChannel;
      const currentTrackId = state.audioMusicTrackId;

      // If trackId is specified, only stop if it matches the currently playing track
      if (trackId && currentTrackId !== trackId) {
        return;
      }

      if (!howl) return;

      if (fadeOut && fadeOut > 0) {
        const currentVolume = typeof howl.volume() === 'number' ? howl.volume() as number : 1.0;
        howl.fade(currentVolume, 0, fadeOut);
        howl.once('fade', () => {
          howl.stop();
          set({
            audioMusicChannel: null,
            audioMusicTrackId: null,
          });
        });
      } else {
        howl.stop();
        set({
          audioMusicChannel: null,
          audioMusicTrackId: null,
        });
      }
    },

    /**
     * Pauses audio playback
     */
    pauseAudio: (channel: 'music' | 'sfx') => {
      const state = get();
      if (channel === 'music') {
        const howl = state.audioMusicChannel;
        if (howl) {
          howl.pause();
        }
      } else {
        // Pause all active SFX
        state.audioSfxChannels.forEach((howl) => {
          if (howl) {
            howl.pause();
          }
        });
      }
    },

    /**
     * Resumes audio playback
     */
    resumeAudio: (channel: 'music' | 'sfx') => {
      const state = get();
      const enabled = channel === 'music' ? state.musicEnabled : state.soundEffectsEnabled;

      if (!enabled) return;

      if (channel === 'music') {
        const howl = state.audioMusicChannel;
        if (howl) {
          // Seek to beginning and play
          howl.seek(0);
          howl.play();
        }
      } else {
        // Resume all paused SFX
        state.audioSfxChannels.forEach((howl) => {
          if (howl && !howl.playing()) {
            howl.play();
          }
        });
      }
    },

    /**
     * Sets volume for music or SFX channel
     */
    setAudioVolume: (channel: 'music' | 'sfx', volume: number) => {
      const state = get();
      const clampedVolume = Math.max(0, Math.min(1, volume));

      if (channel === 'music') {
        const howl = state.audioMusicChannel;
        const isFading = state.audioMusicFading;

        set({
          audioMusicVolume: clampedVolume,
        });

        if (howl && !isFading) {
          howl.volume(clampedVolume);
        }
      } else {
        set({
          audioSfxVolume: clampedVolume,
        });

        // Update volume for all active SFX (if not individually fading)
        state.audioSfxChannels.forEach((howl) => {
          if (howl && !state.audioSfxFading) {
            howl.volume(clampedVolume);
          }
        });
      }
    },

    /**
     * Checks if an audio track is ready/loaded
     */
    isAudioReady: (trackId: AudioTrackId): boolean => {
      // Check store state for reactive updates
      return get().audioTracksReady.has(trackId);
    },

    /**
     * Marks an audio track as ready
     */
    markAudioReady: (trackId: AudioTrackId) => {
      set((state) => {
        const newSet = new Set(state.audioTracksReady);
        newSet.add(trackId);
        return { audioTracksReady: newSet };
      });
    },

    /**
     * Marks an audio track as failed to load
     */
    markAudioFailed: (trackId: AudioTrackId) => {
      set((state) => {
        const newSet = new Set(state.audioTracksReady);
        newSet.delete(trackId);
        return { audioTracksReady: newSet };
      });
    },

    /**
     * Gets current audio state for both music and SFX
     */
    getAudioState: () => {
      const state = get();
      return {
        music: {
          playing: state.audioMusicChannel !== null && state.audioMusicChannel.playing(),
          trackId: state.audioMusicTrackId,
          volume: state.audioMusicVolume,
        },
        sfx: {
          playing: state.audioSfxChannels.some((ch) => ch !== null && ch.playing()),
          trackId: state.audioSfxTrackIds.find((id) => id !== null) ?? null,
          volume: state.audioSfxVolume,
        },
      };
    },
  };
}
