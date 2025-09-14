'use client';

import { Button, useDisclosure } from '@heroui/react';
import type { FC } from 'react';
import Modal from '../Modal';
import BaBIntro from '../BaBIntro';

interface GetStartedProps {
  ctaText: string;
}

const GetStarted: FC<GetStartedProps> = ({ ctaText }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} body={<BaBIntro />}>
      <Button
        onPress={onOpen}
        type="button"
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[9.119deg] @variant landscape:top-auto @variant landscape:left-auto @variant landscape:translate-x-0 @variant landscape:translate-y-0 @variant landscape:bottom-[8.235rem] @variant landscape:left-[7.8125rem] z-20 border border-[var(--colors-common-teal-500)] font-bold text-base text-[var(--colors-common-teal-500)] rounded-full px-[2.5rem] h-[2.5rem] cursor-pointer hover:text-[var(--primary-charcoal)] hover:bg-[var(--colors-common-teal-500)] transition-colors duration-300"
      >
        {ctaText}
      </Button>
    </Modal>
  );
};

export default GetStarted;
