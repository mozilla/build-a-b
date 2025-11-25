/**
 * Audio Manager Functions
 * Handles audio playback including music and SFX channels,
 * volume control, fading, and audio state management
 */

import { AUDIO_TRACKS, type AudioTrackId } from '@/config/audio-config';
import { getPreloadedAudio } from '@/hooks/use-audio-preloader';
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

      const audio = getPreloadedAudio(trackId, track.category === 'music');
      if (!audio) {
        console.warn(`Audio not preloaded: ${trackId}`);
        return false;
      }

      // SFX: Find available channel for overlapping playback
      if (track.category === 'sfx') {
        // Find first available (null or ended) SFX channel
        let channelIndex = state.audioSfxChannels.findIndex(
          (ch) => ch === null || ch.ended || ch.paused,
        );

        // If all channels busy, use the first one (oldest sound)
        if (channelIndex === -1) {
          channelIndex = 0;
        }

        const sfxChannels = [...state.audioSfxChannels];
        const sfxTrackIds = [...state.audioSfxTrackIds];

        sfxChannels[channelIndex] = audio;
        sfxTrackIds[channelIndex] = trackId;

        audio.volume = options.volume ?? track.volume ?? 1.0;
        audio.currentTime = 0; // Reset to start

        set({
          audioSfxChannels: sfxChannels,
          audioSfxTrackIds: sfxTrackIds,
        });

        try {
          await audio.play();
          return true;
        } catch (error) {
          console.error(`Failed to play ${trackId}:`, error);
          return false;
        }
      }

      // Music: Only one track at a time
      const currentAudio = state.audioMusicChannel;

      // Helper function to fade volume (music only)
      const fadeVolume = (
        audioElement: HTMLAudioElement,
        targetVolume: number,
        duration: number,
      ): Promise<void> => {
        return new Promise((resolve) => {
          const startVolume = audioElement.volume;
          const volumeDelta = targetVolume - startVolume;
          const stepTime = 50;
          const steps = duration / stepTime;
          const volumeStep = volumeDelta / steps;

          set({
            audioMusicFading: true,
          });

          let currentStep = 0;
          const fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = startVolume + volumeStep * currentStep;

            if (currentStep >= steps) {
              audioElement.volume = targetVolume;
              clearInterval(fadeInterval);
              set({
                audioMusicFading: false,
              });
              resolve();
            } else {
              audioElement.volume = Math.max(0, Math.min(1, newVolume));
            }
          }, stepTime);
        });
      };

      // Handle fade out of current track
      if (currentAudio && currentAudio !== audio) {
        // Only fade/stop if it's a different track
        if (options.fadeOut && options.fadeOut > 0) {
          await fadeVolume(currentAudio, 0, options.fadeOut);
          currentAudio.pause();
          currentAudio.currentTime = 0;
        } else {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }

      // Setup new audio (music only - SFX handled above)
      audio.loop = options.loop ?? track.loop ?? false;
      audio.muted = false;

      const targetVolume = options.volume ?? track.volume ?? 1.0;

      set({
        audioMusicChannel: audio,
        audioMusicTrackId: trackId,
        audioMusicVolume: targetVolume,
      });

      if (options.fadeIn && options.fadeIn > 0) {
        audio.volume = 0;
        try {
          await audio.play();
          await fadeVolume(audio, targetVolume, options.fadeIn);
          return true;
        } catch (error) {
          console.error(`Failed to play ${trackId}:`, error);
          return false;
        }
      } else {
        audio.volume = targetVolume;
        try {
          await audio.play();
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

        sfxChannels.forEach((audio, index) => {
          if (audio && (!trackId || sfxTrackIds[index] === trackId)) {
            audio.pause();
            audio.currentTime = 0;
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
      const audio = state.audioMusicChannel;
      const currentTrackId = state.audioMusicTrackId;

      // If trackId is specified, only stop if it matches the currently playing track
      if (trackId && currentTrackId !== trackId) {
        return;
      }

      if (!audio) return;

      // Helper function to fade volume
      const fadeVolume = (
        audioElement: HTMLAudioElement,
        targetVolume: number,
        duration: number,
      ): Promise<void> => {
        return new Promise((resolve) => {
          const startVolume = audioElement.volume;
          const volumeDelta = targetVolume - startVolume;
          const stepTime = 50;
          const steps = duration / stepTime;
          const volumeStep = volumeDelta / steps;

          set({
            [channel === 'music' ? 'audioMusicFading' : 'audioSfxFading']: true,
          });

          let currentStep = 0;
          const fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = startVolume + volumeStep * currentStep;

            if (currentStep >= steps) {
              audioElement.volume = targetVolume;
              clearInterval(fadeInterval);
              set({
                [channel === 'music' ? 'audioMusicFading' : 'audioSfxFading']: false,
              });
              resolve();
            } else {
              audioElement.volume = Math.max(0, Math.min(1, newVolume));
            }
          }, stepTime);
        });
      };

      if (fadeOut && fadeOut > 0) {
        fadeVolume(audio, 0, fadeOut).then(() => {
          audio.pause();
          audio.currentTime = 0;
          set({
            [channel === 'music' ? 'audioMusicChannel' : 'audioSfxChannel']: null,
            [channel === 'music' ? 'audioMusicTrackId' : 'audioSfxTrackId']: null,
          });
        });
      } else {
        audio.pause();
        audio.currentTime = 0;
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
        const audio = state.audioMusicChannel;
        if (audio) {
          audio.pause();
        }
      } else {
        // Pause all active SFX
        state.audioSfxChannels.forEach((audio) => {
          if (audio) {
            audio.pause();
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
        const audio = state.audioMusicChannel;
        if (audio) {
          audio.currentTime = 0; // Start from beginning
          audio.play().catch((error: unknown) => {
            console.error(`Failed to resume music:`, error);
          });
        }
      } else {
        // Resume all paused SFX
        state.audioSfxChannels.forEach((audio) => {
          if (audio && audio.paused) {
            audio.play().catch((error: unknown) => {
              console.error(`Failed to resume sfx:`, error);
            });
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
        const audio = state.audioMusicChannel;
        const isFading = state.audioMusicFading;

        set({
          audioMusicVolume: clampedVolume,
        });

        if (audio && !isFading) {
          audio.volume = clampedVolume;
        }
      } else {
        set({
          audioSfxVolume: clampedVolume,
        });

        // Update volume for all active SFX (if not individually fading)
        state.audioSfxChannels.forEach((audio) => {
          if (audio && !state.audioSfxFading) {
            audio.volume = clampedVolume;
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
          playing: state.audioMusicChannel !== null && !state.audioMusicChannel.paused,
          trackId: state.audioMusicTrackId,
          volume: state.audioMusicVolume,
        },
        sfx: {
          playing: state.audioSfxChannels.some((ch) => ch !== null && !ch.paused),
          trackId: state.audioSfxTrackIds.find((id) => id !== null) ?? null,
          volume: state.audioSfxVolume,
        },
      };
    },
  };
}
