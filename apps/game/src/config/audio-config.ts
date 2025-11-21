/**
 * Audio Configuration Registry
 * Centralized mapping of game phases/events to audio files
 *
 * Audio files are loaded from Supabase storage
 */
import { SUPABASE_BASE_URL } from '@/config/special-effect-animations';

// Reuse same base URL as video assets
export const AUDIO_BASE_URL = SUPABASE_BASE_URL;

/**
 * Audio track registry
 * Maps track IDs to their configuration
 */
export const AUDIO_TRACKS = {
  // ===== MUSIC =====

  /** Title music - plays during setup/menu/pause */
  title_music: {
    webm: `audio-title-music.webm`,
    mp3: 'audio-title-music.mp3',
    priority: 'critical',
    category: 'music',
    loop: true,
    volume: 0.66,
    fadeDuration: 1000,
  },

  /** Gameplay music - upbeat loop during turns */
  gameplay_music: {
    webm: `audio-gameplay-loop.webm`,
    mp3: 'audio-gameplay-loop.mp3',
    priority: 'high',
    category: 'music',
    loop: true,
    volume: 0.5,
    fadeDuration: 500,
  },

  /** Victory music - player wins */
  victory_music: {
    webm: `audio-player-win.webm`,
    mp3: 'audio-player-win.mp3',
    priority: 'medium',
    category: 'music',
    loop: false,
    volume: 0.9,
  },

  /** Defeat music - player loses */
  defeat_music: {
    webm: `audio-opponent-win.webm`,
    mp3: 'audio-opponent-win.mp3',
    priority: 'medium',
    category: 'music',
    loop: false,
    volume: 0.9,
  },

  // ===== UI SOUND EFFECTS =====

  /** Button press - common UI interactions */
  button_press: {
    webm: `audio-button-d.webm`,
    mp3: 'audio-button-d.mp3',
    priority: 'critical',
    category: 'sfx',
    loop: false,
    volume: 1.0,
  },

  /** Whoosh - drawer/menu/special card */
  whoosh: {
    webm: `audio-drawer_start-turn.webm`,
    mp3: 'audio-drawer_start-turn.mp3',
    priority: 'critical',
    category: 'sfx',
    loop: false,
    volume: 0.8,
  },

  cha_ching: {
    webm: 'audio-launch-stack-cha-ching.webm',
    mp3: 'audio-launch-stack-cha-ching.mp3',
    priority: 'medium',
    category: 'sfx',
    loop: false,
    volume: 1.0,
  },

  bonk: {
    webm: 'audio-bonk.webm',
    mp3: 'audio-bonk.mp3',
    priority: 'medium',
    category: 'sfx',
    loop: false,
    volume: 1.0,
  },

  /** Option focus - carousel/list item focus */
  option_focus: {
    webm: `audio-select-bg.webm`,
    mp3: 'audio-select-bg.mp3',
    priority: 'critical',
    category: 'sfx',
    loop: false,
    volume: 0.7,
  },

  // ===== GAMEPLAY SOUND EFFECTS =====

  /** Card flip - revealing cards */
  card_flip: {
    webm: `audio-card-flip.webm`,
    mp3: 'audio-card-flip.mp3',
    priority: 'high',
    category: 'sfx',
    loop: false,
    volume: 1.0,
  },

  /** Card collect - winner takes cards */
  card_collect: {
    webm: `audio-card-collect.webm`,
    mp3: 'audio-card-collect.mp3',
    priority: 'high',
    category: 'sfx',
    loop: false,
    volume: 0.9,
  },

  /** Turn value update */
  turn_value: {
    webm: `audio-turn-value.webm`,
    mp3: 'audio-turn-value.mp3',
    priority: 'high',
    category: 'sfx',
    loop: false,
    volume: 0.8,
  },

  war_three_card: {
    webm: 'audio-war-3-card.webm',
    mp3: 'audio-war-3-card.mp3',
    priority: 'high',
    category: 'sfx',
    loop: false,
    volume: 1.0,
  },

  // ===== VS ANIMATION SOUNDS =====

  /** VS sequence - dramatic intro (synced to video) */
  vs_sequence: {
    webm: `audio-vs-animation.webm`,
    mp3: 'audio-vs-animation.mp3',
    priority: 'high',
    category: 'sfx',
    loop: false,
    volume: 1.0,
  },

  /** Reverse build up - pin to front of VS options */
  reverse_buildup: {
    webm: `audio-vs-animation-reverse-build-up.webm`,
    mp3: 'audio-vs-animation-reverse-build-up.mp3',
    priority: 'high',
    category: 'sfx',
    loop: false,
    volume: 0.9,
  },

  /** GO! - end of VS sequence */
  go: {
    webm: `audio-go.webm`,
    mp3: 'audio-go.mp3',
    priority: 'high',
    category: 'sfx',
    loop: false,
    volume: 1.0,
  },

  // ===== SPECIAL EFFECTS =====

  data_war: {
    webm: 'audio-data-war.webm',
    mp3: 'audio-data-war.mp3',
    priority: 'medium',
    category: 'sfx',
    loop: false,
    volume: 1.0,
  },

  event_takeover: {
    webm: 'audio-event-takeover.webm',
    mp3: 'audio-event-takeover.mp3',
    priority: 'medium',
    category: 'sfx',
    loop: false,
    volume: 0.9,
  },

  launch_stack_rocket: {
    webm: 'audio-launch-stack-rocket.webm',
    mp3: 'audio-launch-stack-rocket.mp3',
    priority: 'medium',
    category: 'sfx',
    loop: false,
    volume: 1.0,
  },

  launch_stack_collect: {
    webm: 'audio-launch-stack-card-collect.webm',
    mp3: 'audio-launch-stack-card-collect.mp3',
    priority: 'medium',
    category: 'sfx',
    loop: false,
    volume: 1.0,
  },

  /** Hand viewer */
  hand_viewer: {
    webm: `audio-hand-viewer_deck-swap.webm`,
    mp3: 'audio-hand-viewer_deck-swap.mp3',
    priority: 'medium',
    category: 'sfx',
    loop: false,
    volume: 0.8,
  },

  /** Deck swap - Forced Empathy */
  deck_swap: {
    webm: `audio-hand-viewer_deck-swap.webm`,
    mp3: 'audio-hand-viewer_deck-swap.mp3',
    priority: 'medium',
    category: 'sfx',
    loop: false,
    volume: 0.8,
  },

  // ===== WIN/LOSE SOUNDS =====

  /** Player victory - win notification */
  player_win: {
    webm: 'audio-player-win.webm',
    mp3: 'audio-player-win.mp3',
    priority: 'high',
    category: 'sfx',
    loop: false,
    volume: 1.0,
  },

  /** Opponent victory - lose notification */
  opponent_win: {
    webm: 'audio-opponent-win.webm',
    mp3: 'audio-opponent-win.mp3',
    priority: 'high',
    category: 'sfx',
    loop: false,
    volume: 1.0,
  },

  end_sequence: {
    webm: 'audio-end-sequence.webm',
    mp3: 'audio-end-sequence.mp3',
    priority: 'high',
    category: 'sfx',
    loop: false,
    volume: 1.0,
  },

  rocket_flyby: {
    webm: 'audio-rocket-flyby.webm',
    mp3: 'audio-rocket-flyby.mp3',
    priority: 'medium',
    category: 'sfx',
    loop: false,
    volume: 1.0,
  },
};

/**
 * Typed audio track IDs for autocomplete
 */
export type AudioTrackId = keyof typeof AUDIO_TRACKS;

/**
 * Constant object for type-safe track ID references
 * Use TRACKS.TITLE_MUSIC instead of 'title_music' string
 */
export const TRACKS = {
  // Music
  TITLE_MUSIC: 'title_music',
  GAMEPLAY_MUSIC: 'gameplay_music',
  VICTORY_MUSIC: 'victory_music',
  DEFEAT_MUSIC: 'defeat_music',

  // UI Sound Effects
  BUTTON_PRESS: 'button_press',
  WHOOSH: 'whoosh',
  CHA_CHING: 'cha_ching',
  OPTION_FOCUS: 'option_focus',
  BONK: 'bonk',

  // Gameplay Sound Effects
  CARD_FLIP: 'card_flip',
  CARD_COLLECT: 'card_collect',
  TURN_VALUE: 'turn_value',
  WAR_THREE_CARD: 'war_three_card',

  // VS Animation
  VS_SEQUENCE: 'vs_sequence',
  REVERSE_BUILDUP: 'reverse_buildup',
  GO: 'go',

  // Special Effects
  HAND_VIEWER: 'hand_viewer',
  LAUNCH_STACK_COLLECT: 'launch_stack_collect',
  LAUNCH_STACK_ROCKET: 'launch_stack_rocket',
  DATA_WAR: 'data_war',
  EVENT_TAKEOVER: 'event_takeover',
  DECK_SWAP: 'deck_swap',

  // Win/Lose
  PLAYER_WIN: 'player_win',
  OPPONENT_WIN: 'opponent_win',
  END_SEQUENCE: 'end_sequence',

  // Game Over
  ROCKET_FLYBY: 'rocket_flyby',
} as const satisfies Record<string, AudioTrackId>;

/**
 * Helper to get audio URLs by track ID
 */
export function getAudioUrls(trackId: AudioTrackId): {
  webm: string;
  mp3: string;
} {
  const track = AUDIO_TRACKS[trackId];
  return {
    webm: `${AUDIO_BASE_URL}${track.webm}`,
    mp3: `${AUDIO_BASE_URL}${track.mp3}`,
  };
}

/**
 * Get all audio tracks by priority tier
 */
export function getAudioByPriority(
  priority: 'critical' | 'high' | 'medium' | 'low',
): AudioTrackId[] {
  return Object.keys(AUDIO_TRACKS).filter(
    (id) => AUDIO_TRACKS[id as AudioTrackId].priority === priority,
  ) as AudioTrackId[];
}

/**
 * Browser format support detection (cached)
 */
let _supportsWebM: boolean | null = null;

export function supportsWebM(): boolean {
  if (_supportsWebM !== null) return _supportsWebM;

  const audio = document.createElement('audio');
  _supportsWebM = audio.canPlayType('audio/webm; codecs="opus"') !== '';
  return _supportsWebM;
}

/**
 * Get the appropriate audio URL for current browser
 */
export function getAudioUrl(trackId: AudioTrackId): string {
  const urls = getAudioUrls(trackId);
  return supportsWebM() ? urls.webm : urls.mp3;
}
