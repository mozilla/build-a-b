import { type FC, type PropsWithChildren } from 'react';
import type { BoardProps } from './types';
import HamburguerIcon from '../../assets/icons/hamburguer.svg';
import PauseIcon from '../../assets/icons/pause.svg';

export const Board: FC<PropsWithChildren<BoardProps>> = ({ children, bgSrc }) => {
  return (
    <section
      className="h-[100dvh] w-[100vw] max-w-[25rem] max-h-[54rem] bg-cover bg-center bg-no-repeat relative px-[1.625rem] pb-[2.25rem] flex flex-col"
      style={{ backgroundImage: `url(${bgSrc})` }}
    >
      <header className="h-[3.75rem] w-full bg-transparent flex items-center justify-end gap-[0.375rem]">
        <img src={PauseIcon} alt="Pause" />
        <img src={HamburguerIcon} alt="Menu" />
      </header>
      {children}
    </section>
  );
};
