import { Icon } from '@/components/Icon';
import { useMusicManager } from '@/hooks/use-music-manager';
import { useGameStore } from '@/store';
import { Button } from '@heroui/react';
import { type FC, type PropsWithChildren } from 'react';
import { Frame } from '../Frame';
import type { BoardProps } from './types';

export const Board: FC<PropsWithChildren<BoardProps>> = ({ children, bgSrc }) => {
  const toggleMenu = useGameStore((state) => state.toggleMenu);

  // Centralized music management - handles all music transitions
  useMusicManager();

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
