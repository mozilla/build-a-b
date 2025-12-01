import { Icon } from '@/components/Icon';
import { useGameStore } from '@/store';
import { Button } from '@heroui/react';
import { type FC, type PropsWithChildren } from 'react';
import { Frame } from '../Frame';
import type { BoardProps } from './types';

export const Board: FC<PropsWithChildren<BoardProps>> = ({ children, bgSrc }) => {
  const toggleMenu = useGameStore((state) => state.toggleMenu);
  const toggleAllSound = useGameStore((state) => state.toggleAllSound);
  const musicEnabled = useGameStore((state) => state.musicEnabled);
  const soundEffectsEnabled = useGameStore((state) => state.soundEffectsEnabled);

  // Show muted icon only when BOTH music and sound effects are off
  const isAllSoundOff = !musicEnabled && !soundEffectsEnabled;

  return (
    <Frame backgroundSrc={bgSrc} className="px-6 pt-7 pb-4 flex flex-col justify-center">
      <header className="relative w-full bg-transparent flex items-center justify-end gap-4">
        <Button
          onPress={toggleAllSound}
          className="px-0 w-6 h-8"
          aria-label={isAllSoundOff ? 'Unmute all sound' : 'Mute all sound'}
        >
          <Icon name={isAllSoundOff ? 'soundOff' : 'soundOn'} className="w-6 h-8" />
        </Button>
        <Button onPress={toggleMenu} className="px-0 w-6 h-[1.375rem]">
          <Icon name="pause" className="w-6 h-[1.375rem]" />
        </Button>
      </header>
      {children}
    </Frame>
  );
};
