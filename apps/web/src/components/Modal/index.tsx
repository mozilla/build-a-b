import type { FC, PropsWithChildren } from 'react';
import {
  Modal as HeroModal,
  ModalContent,
  ModalBody,
  Button,
  type ModalProps,
} from '@heroui/react';
import Image from 'next/image';
import ThreeDots from '../ThreeDots';

const Modal: FC<PropsWithChildren<ModalProps>> = ({
  children,
  isOpen,
  onOpenChange,
  ...modalProps
}) => {
  return (
    <HeroModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="full"
      placement="center"
      backdrop="opaque"
      classNames={{
        wrapper:
          'p-0 @variant landscape:p-4 z-[999] [--scale-enter:100%] [--scale-exit:100%] [--slide-enter:0px] [--slide-exit:80px] sm:[--scale-enter:100%] sm:[--scale-exit:103%] sm:[--slide-enter:0px] sm:[--slide-exit:0px]',
        base: 'w-full h-full @variant landscape:w-[71.8125rem] @variant landscape:h-[36.5625rem] @variant landscape:rounded-[0.75rem] z-[1000] overflow-hidden',
        backdrop: 'bg-black/50 z-[998] w-screen h-screen fixed inset-0',
      }}
      {...modalProps}
    >
      <ModalContent className="w-full h-full @variant landscape:w-[71.8125rem] @variant landscape:h-[36.5625rem] bg-white rounded-none @variant landscape:rounded-[0.75rem] relative overflow-hidden border-0 @variant landscape:border-2 @variant landscape:border-common-ash">
        {(onClose) => (
          <>
            <Image
              src="/assets/images/night-sky.webp"
              alt="Night Sky Background"
              fill
              className="absolute inset-0 object-cover z-0"
            />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex h-[3rem] px-[1rem] flex-row justify-end @variant landscape:justify-between items-center border-b-0 @variant landscape:border-b-2 @variant landscape:border-common-ash bg-transparent">
                <ThreeDots white className="hidden @variant landscape:flex" />
                <Button
                  onPress={onClose}
                  isIconOnly
                  variant="light"
                  className="flex items-center justify-center w-6 h-6 hover:opacity-70 transition-opacity min-w-6 h-6"
                  aria-label="Close modal"
                >
                  <Image src="/assets/images/close-icon.svg" alt="Close" width={24} height={24} />
                </Button>
              </div>
              <ModalBody>{children}</ModalBody>
            </div>
          </>
        )}
      </ModalContent>
    </HeroModal>
  );
};

export default Modal;
