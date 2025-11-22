import { TRACKS } from '@/config/audio-config';
import { useGameLogic } from '@/hooks/use-game-logic';
import { NON_GAMEPLAY_PHASES } from '@/machines/game-flow-machine';
import { useGameStore } from '@/store';
import { useEffect, useRef } from 'react';

type MusicTrack = typeof TRACKS.TITLE_MUSIC | typeof TRACKS.GAMEPLAY_MUSIC;

/**
 * Centralized music management hook
 * Handles all music transitions based on game phase and menu state
 *
 * Music Rules:
 * 1. TITLE_MUSIC plays during non-gameplay phases (welcome → vs_animation, game_over)
 * 2. GAMEPLAY_MUSIC plays during gameplay phases (ready → resolving)
 * 3. When menu opens during gameplay: GAMEPLAY_MUSIC → TITLE_MUSIC
 * 4. When menu closes during gameplay: TITLE_MUSIC → GAMEPLAY_MUSIC
 * 5. When music is disabled: stop all music immediately
 * 6. When music is re-enabled: play appropriate track for current state
 * 7. game_over phase: Stop music for WinnerAnimation, start Title Music when GameOver screen appears
 */
export function useMusicManager() {
  const playAudio = useGameStore((state) => state.playAudio);
  const stopAudio = useGameStore((state) => state.stopAudio);
  const musicEnabled = useGameStore((state) => state.musicEnabled);
  const showMenu = useGameStore((state) => state.showMenu);
  const showGameOverScreen = useGameStore((state) => state.showGameOverScreen);
  const isTitleMusicReady = useGameStore((state) => state.audioTracksReady.has(TRACKS.TITLE_MUSIC));
  const isGameplayMusicReady = useGameStore((state) =>
    state.audioTracksReady.has(TRACKS.GAMEPLAY_MUSIC),
  );
  const musicChannel = useGameStore((state) => state.audioMusicChannel);

  const { phase } = useGameLogic();
  const phaseKey = typeof phase === 'string' ? phase : String(phase);

  // Track what music should be playing based on game state
  const isNonGameplayPhase = NON_GAMEPLAY_PHASES.includes(
    phaseKey as (typeof NON_GAMEPLAY_PHASES)[number],
  );
  const isGameplayPhase = !isNonGameplayPhase;

  // Refs to track current state
  const currentMusicTrack = useRef<MusicTrack | null>(null);
  const isInGameplayPhase = useRef(false);
  const previousPhase = useRef<string | null>(null);

  /**
   * Stop all music immediately (used when music is disabled)
   */
  const stopAllMusic = () => {
    stopAudio({ channel: 'music' });
    currentMusicTrack.current = null;
  };

  /**
   * Determine which track should be playing based on current state
   */
  const getDesiredTrack = (): { trackId: MusicTrack | null; isReady: boolean } => {
    if (!musicEnabled) {
      return { trackId: null, isReady: true };
    }

    // Menu is open during gameplay → TITLE_MUSIC
    if (showMenu && isGameplayPhase) {
      return { trackId: TRACKS.TITLE_MUSIC, isReady: isTitleMusicReady };
    }

    // Gameplay phase (menu closed) → GAMEPLAY_MUSIC
    if (isGameplayPhase && !showMenu) {
      return { trackId: TRACKS.GAMEPLAY_MUSIC, isReady: isGameplayMusicReady };
    }

    // Non-gameplay phases → TITLE_MUSIC
    if (isNonGameplayPhase) {
      return { trackId: TRACKS.TITLE_MUSIC, isReady: isTitleMusicReady };
    }

    return { trackId: null, isReady: true };
  };

  const playMusicTrack = async (trackId: MusicTrack) => {
    await playAudio(trackId);
    currentMusicTrack.current = trackId;
  };

  const switchTrack = async (fromTrack: MusicTrack, toTrack: MusicTrack) => {
    stopAudio({
      channel: 'music',
      trackId: fromTrack,
    });

    await playMusicTrack(toTrack);
  };

  // Effect 1: Handle music enable/disable toggle
  useEffect(() => {
    if (!musicEnabled) {
      stopAllMusic();
    } else {
      // Music was just re-enabled, play appropriate track
      const { trackId, isReady } = getDesiredTrack();
      if (trackId && isReady && currentMusicTrack.current !== trackId) {
        playMusicTrack(trackId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicEnabled]);

  // Effect 2: Handle phase transitions
  useEffect(() => {
    if (!musicEnabled) return;

    if (
      phaseKey === 'select_billionaire' &&
      musicChannel &&
      musicChannel.paused &&
      isTitleMusicReady
    ) {
      playMusicTrack(TRACKS.TITLE_MUSIC);
    }

    // Special handling for game_over phase
    if (phaseKey === 'game_over' && previousPhase.current !== 'game_over') {
      // Stop all music when WinnerAnimation starts
      stopAllMusic();
      previousPhase.current = phaseKey;
      return;
    }

    // Start Title Music when GameOver screen appears (during crossfade)
    if (phaseKey === 'game_over' && showGameOverScreen && !currentMusicTrack.current) {
      if (isTitleMusicReady) {
        playMusicTrack(TRACKS.TITLE_MUSIC);
      }
      return;
    }

    const { trackId, isReady } = getDesiredTrack();

    if (!trackId || !isReady) return;

    // Track if we've entered gameplay phase for the first time
    if (isGameplayPhase && !isInGameplayPhase.current) {
      isInGameplayPhase.current = true;
    }

    // If desired track differs from current, switch
    if (trackId !== currentMusicTrack.current) {
      if (currentMusicTrack.current) {
        switchTrack(currentMusicTrack.current, trackId);
      } else {
        playMusicTrack(trackId);
      }
    }

    // Update previous phase
    previousPhase.current = phaseKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, showMenu, showGameOverScreen, musicEnabled, isTitleMusicReady, isGameplayMusicReady]);

  // Effect 3: Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentMusicTrack.current) {
        stopAudio({ channel: 'music' });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    currentTrack: currentMusicTrack.current,
    isGameplayPhase: isInGameplayPhase.current,
  };
}
