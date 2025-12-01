/**
 * Audio System Types
 * Defines interfaces for dual-channel audio playback (music + SFX)
 * Using Howler.js for better mobile browser support (especially iOS)
 */

import type { Howl } from 'howler';

export type AudioPriority = 'critical' | 'high' | 'medium' | 'low';

export type AudioCategory = 'music' | 'sfx';

/**
 * Audio track configuration
 */
export interface AudioTrack {
  /** Primary WebM file path (relative to SUPABASE_BASE_URL) */
  webm: string;
  /** Fallback MP3 file path (relative to SUPABASE_BASE_URL) */
  mp3: string;
  /** Preloading priority tier */
  priority: AudioPriority;
  /** Whether this is music or sound effect */
  category: AudioCategory;
  /** Whether the audio should loop */
  loop?: boolean;
  /** Base volume (0-1) */
  volume?: number;
  /** Duration for crossfade transitions (ms) */
  fadeDuration?: number;
}

/**
 * Audio channel state for music or SFX
 */
export interface AudioChannel {
  /** Current audio element playing */
  current: HTMLAudioElement | null;
  /** Target volume before any ducking */
  baseVolume: number;
  /** Whether this channel is currently fading */
  isFading: boolean;
  /** Fade timeout ID for cleanup */
  fadeTimeout?: number;
}

/**
 * Audio manager interface
 */
export interface AudioManager {
  /** Play audio track on appropriate channel */
  play: (trackId: string, options?: PlayOptions) => Promise<void>;
  /** Stop audio on specific channel */
  stop: (channel: 'music' | 'sfx', fadeDuration?: number) => void;
  /** Pause audio on specific channel */
  pause: (channel: 'music' | 'sfx') => void;
  /** Resume audio on specific channel */
  resume: (channel: 'music' | 'sfx') => void;
  /** Set volume for channel (0-1) */
  setVolume: (channel: 'music' | 'sfx', volume: number) => void;
  /** Check if audio is ready to play (preloaded) */
  isReady: (trackId: string) => boolean;
  /** Get current playback state */
  getState: () => AudioManagerState;
}

export interface PlayOptions {
  /** Override loop setting */
  loop?: boolean;
  /** Override volume */
  volume?: number;
  /** Fade in duration (ms) */
  fadeIn?: number;
  /** Fade out current track before playing new one (ms) */
  fadeOut?: number;
}

export interface StopOptions {
  /** Audio channel to stop ('music' or 'sfx') */
  channel: 'music' | 'sfx';
  /** Specific track ID to stop (optional - if omitted, stops whatever is playing) */
  trackId?: string;
  /** Fade out duration in milliseconds */
  fadeOut?: number;
}

export interface AudioManagerState {
  music: {
    playing: boolean;
    trackId: string | null;
    volume: number;
  };
  sfx: {
    playing: boolean;
    trackId: string | null;
    volume: number;
  };
}

/**
 * Preloaded audio registry entry (Legacy - HTMLAudioElement)
 * @deprecated Use PreloadedHowl instead
 */
export interface PreloadedAudio {
  element: HTMLAudioElement;
  format: 'webm' | 'mp3';
  ready: boolean;
}

/**
 * Preloaded Howl instance registry entry
 * Used by the new Howler.js-based audio system
 */
export interface PreloadedHowl {
  howl: Howl;
  format: 'webm' | 'mp3';
  ready: boolean;
  trackId: string;
}
