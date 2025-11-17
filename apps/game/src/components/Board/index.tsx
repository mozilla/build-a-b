import { Icon } from '@/components/Icon';
import { useGameStore } from '@/store';
import { Button } from '@heroui/react';
import { type FC, type PropsWithChildren } from 'react';
import { Frame } from '../Frame';
import type { BoardProps } from './types';

export const Board: FC<PropsWithChildren<BoardProps>> = ({ children, bgSrc }) => {
  const { toggleMenu } = useGameStore();

  return (
    <Frame
      backgroundSrc={bgSrc}
      className="px-6 pt-[clamp(12px,-365.108px+44.681vh,54px)] pb-[0.75rem] flex flex-col justify-center"
    >
      <header className="absolute top-[2.25%] left-0 w-full bg-transparent flex items-center justify-end gap-[0.375rem]">
        <Button onPress={toggleMenu} className="px-0 mr-[5%] sm:mr-5">
          <Icon name="pause" />
        </Button>
      </header>
      {children}
    </Frame>
  );
};
