import { Icon } from '@/components/Icon';
import { useGameStore } from '@/store';
import { Button } from '@heroui/react';
import { type FC, type PropsWithChildren } from 'react';
import type { BoardProps } from './types';

export const Board: FC<PropsWithChildren<BoardProps>> = ({ children, bgSrc }) => {
  const { toggleMenu } = useGameStore();

  return (
    <>
      <div className="absolute size-full top-0 left-0 lg:flex items-center justify-center lg:blur-xl hidden">
        <img src={bgSrc} alt="" className="w-full h-full object-cover" role="presentation" />
      </div>
      <section
        className="h-[100dvh] w-[100vw] max-w-[25rem] max-h-[54rem] bg-cover bg-center bg-no-repeat relative px-[1.625rem] pb-[2.25rem] flex flex-col lg:rounded-xl"
        style={{ backgroundImage: `url(${bgSrc})` }}
      >
        <header className="h-[3.75rem] w-full bg-transparent flex items-center justify-end gap-[0.375rem]">
          <div className="absolute top-5 right-5">
            <Button onPress={toggleMenu} className="px-0">
              <Icon name="pause" />
            </Button>
          </div>
        </header>
        {children}
      </section>
    </>
  );
};
