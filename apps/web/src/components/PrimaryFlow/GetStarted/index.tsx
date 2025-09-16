'use client';

import { Button, useDisclosure } from '@heroui/react';
import type { FC } from 'react';
import Modal from '../../Modal';
import Intro, { type IntroProps } from '../Intro';

export interface GetStartedProps extends IntroProps {
  ctaText: string;
}

const GetStarted: FC<GetStartedProps> = ({ ctaText, ...babFlowData }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button
        onPress={onOpen}
        type="button"
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[9.119deg] @variant landscape:top-auto @variant landscape:left-auto @variant landscape:translate-x-0 @variant landscape:translate-y-0 @variant landscape:bottom-[8.235rem] @variant landscape:left-[7.8125rem] z-20 border border-accent font-bold text-base text-accent rounded-full px-[2.5rem] h-[2.5rem] cursor-pointer hover:text-charcoal hover:bg-accent transition-colors duration-300"
      >
        {ctaText}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Intro {...babFlowData} />
      </Modal>
    </>
  );
};

export default GetStarted;
