import { Icon } from '@/components/Icon';
import { TRACKS } from '@/config/audio-config';
import { useGameLogic } from '@/hooks/use-game-logic';
import { useGameStore } from '@/store';
import { Button } from '@heroui/react';
import { type FC, type PropsWithChildren, useEffect, useRef } from 'react';
import { Frame } from '../Frame';
import type { BoardProps } from './types';

export const Board: FC<PropsWithChildren<BoardProps>> = ({ children, bgSrc }) => {
  const toggleMenu = useGameStore((state) => state.toggleMenu);
  const playAudio = useGameStore((state) => state.playAudio);
  const stopAudio = useGameStore((state) => state.stopAudio);
  const isGameplayMusicReady = useGameStore((state) =>
    state.audioTracksReady.has(TRACKS.GAMEPLAY_MUSIC),
  );
  const isGameplayMusicPlaying = useRef(false);
  // const winner = useGameStore((state) => state.winner);
  const { phase } = useGameLogic();

  // Play gameplay music when Board mounts (entering 'ready' state)
  // Stop it when game ends (winner is determined)
  useEffect(() => {
    if (phase === 'ready' && isGameplayMusicReady && !isGameplayMusicPlaying.current) {
      playAudio(TRACKS.GAMEPLAY_MUSIC, {
        loop: true,
        volume: 0.5,
        fadeIn: 500,
      }).then((isPlaying) => {
        isGameplayMusicPlaying.current = isPlaying;
      });
    } else if (phase === 'game_over' && isGameplayMusicPlaying.current) {
      stopAudio({
        channel: 'music',
        trackId: TRACKS.GAMEPLAY_MUSIC,
        fadeOut: 250,
      });
    }

    return () => {
      if (isGameplayMusicPlaying.current) {
        stopAudio({
          channel: 'music',
          trackId: TRACKS.GAMEPLAY_MUSIC,
          fadeOut: 250,
        });
      }
    };
  }, [phase, isGameplayMusicReady, playAudio, stopAudio]);

  return (
    <Frame backgroundSrc={bgSrc} className="px-6 pt-7 pb-4 flex flex-col justify-center">
      <header className="relative w-full bg-transparent flex items-center justify-end gap-[0.375rem]">
        <Button onPress={toggleMenu} className="px-0 w-6 h-[1.375rem]">
          <Icon name="pause" className="w-6 h-[1.375rem]" />
        </Button>
      </header>
      {children}
    </Frame>
  );
};
