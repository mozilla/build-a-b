import type { FC, PropsWithChildren, ReactNode } from 'react';
import {
  Modal as HeroModal,
  ModalContent,
  ModalBody,
  Button,
  type ModalProps,
} from '@heroui/react';
import Image from 'next/image';
import ThreeDots from '../ThreeDots';

interface CustomModalProps extends ModalProps {
  headerContent?: ReactNode;
  modalTitle?: string;
}

const Modal: FC<PropsWithChildren<CustomModalProps>> = ({
  children,
  isOpen,
  onOpenChange,
  headerContent,
  modalTitle = 'Build a Billionaire',
  ...modalProps
}) => {
  return (
    <>
      {/* Screen reader announcements for dialog open/close */}
      <div role="status" aria-live="assertive" aria-atomic="true" className="sr-only">
        {isOpen && `Dialog opened: ${modalTitle}`}
        {!isOpen && `Dialog closed.`}
      </div>

      <HeroModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="full"
        placement="center"
        backdrop="opaque"
        aria-current="page"
        classNames={{
          wrapper:
            'p-0 landscape:p-4 z-[999] [--scale-enter:100%] [--scale-exit:103%] [--slide-enter:0px] [--slide-exit:0px]',
          base: 'w-full h-full landscape:w-[71.8125rem] landscape:h-auto landscape:min-h-[36.5625rem] landscape:rounded-[0.75rem] z-[1000] overflow-hidden',
          backdrop: 'bg-black/50 z-[998] w-screen h-screen fixed inset-0',
        }}
        {...modalProps}
      >
        <ModalContent className="w-full h-full landscape:w-[71.8125rem] landscape:h-[36.5625rem] bg-white rounded-none landscape:rounded-[0.75rem] relative overflow-hidden border-0 landscape:border-2 landscape:border-common-ash">
          {(onClose) => (
            <>
              <Image
                src="/assets/images/night-sky.webp"
                alt="Night Sky Background"
                fill
                sizes="100vw"
                className="absolute inset-0 object-cover z-0"
              />
              <div className="relative z-10 flex flex-col h-full">
                {/* Header - only show on landscape */}
                <div className="hidden landscape:flex h-[3rem] px-[1rem] flex-row justify-between items-center border-b-2 border-common-ash bg-transparent">
                  <div className="flex items-center min-w-0 flex-1">
                    <ThreeDots white />
                  </div>
                  <Button
                    onPress={onClose}
                    isIconOnly
                    variant="light"
                    className="flex items-center justify-center w-6 h-6 hover:opacity-70 transition-opacity min-w-6 h-6"
                    aria-label="Close modal"
                  >
                    <Image
                      src="/assets/images/close-icon.svg"
                      alt="Close"
                      width={24}
                      height={24}
                      className="h-auto"
                    />
                  </Button>
                </div>

                {/* Close button for mobile - absolutely positioned */}
                <Button
                  onPress={onClose}
                  isIconOnly
                  variant="light"
                  className="landscape:hidden absolute top-4 right-4 z-50 flex items-center justify-center w-6 h-6 hover:opacity-70 transition-opacity min-w-6 h-6"
                  aria-label="Close modal"
                >
                  <Image
                    src="/assets/images/close-icon.svg"
                    alt="Close"
                    width={24}
                    height={24}
                    className="h-auto"
                  />
                </Button>
                <ModalBody className="overflow-y-auto flex-1 p-0">{children}</ModalBody>
              </div>
            </>
          )}
        </ModalContent>
      </HeroModal>
    </>
  );
};

export default Modal;
