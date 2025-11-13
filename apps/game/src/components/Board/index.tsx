import { Icon } from '@/components/Icon';
import { useGameStore } from '@/store';
import { Button } from '@heroui/react';
import { type FC, type PropsWithChildren } from 'react';
import { Frame } from '../Frame';
import type { BoardProps } from './types';

export const Board: FC<PropsWithChildren<BoardProps>> = ({ children, bgSrc }) => {
  const { toggleMenu } = useGameStore();

  return (
    <Frame backgroundSrc={bgSrc} className="px-[1.625rem] pb-[2.25rem] flex flex-col">
      <header className="h-[3.75rem] w-full bg-transparent flex items-center justify-end gap-[0.375rem]">
        <div className="absolute top-5 right-5">
          <Button onPress={toggleMenu} className="px-0">
            <Icon name="pause" />
          </Button>
        </div>
      </header>
      {children}
    </Frame>
  );
};
