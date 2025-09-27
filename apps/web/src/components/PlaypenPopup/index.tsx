import {
  Button,
  Modal as HeroModal,
  ModalBody,
  ModalContent,
  type ModalProps,
} from '@heroui/react';
import clsx from 'clsx';
import Image from 'next/image';
import { FC } from 'react';

interface PlaypenPopupProps extends ModalProps {
  title: string;
}

const microcopy = {
  dialog: {
    openPrefix: 'Dialog opened: ',
    closedLabel: 'Dialog closed.',
  },
} as const;

const PlaypenPopup: FC<PlaypenPopupProps> = ({
  children,
  title,
  isOpen,
  onOpenChange,
  ...modalProps
}) => {
  return (
    <>
      {/* Screen reader announcements for dialog open/close */}
      <div role="status" aria-live="assertive" aria-atomic="true" className="sr-only">
        {isOpen && `${microcopy.dialog.openPrefix}${title}`}
        {!isOpen && microcopy.dialog.closedLabel}
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
          base: 'w-full h-full z-[1000] overflow-hidden landscape:w-[61.4375rem] landscape:h-auto landscape:rounded-[0.75rem]',
          backdrop: 'bg-black/80 z-[998] w-screen h-screen fixed inset-0',
        }}
        {...modalProps}
      >
        <ModalContent className="relative w-full h-full relative overflow-hidden shadow-2xl">
          {(onClose) => (
            <>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary-blue to-secondary-purple">
                <Image
                  role="presentation"
                  src="/assets/images/blue-grid.svg"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={clsx('absolute inset-0 object-cover z-0')}
                />
                <Image
                  src="/assets/images/grain-main.webp"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="absolute inset-0 z-10 object-cover mix-blend-overlay"
                />
              </div>
              <Button
                onPress={onClose}
                isIconOnly
                variant="light"
                className="absolute top-4 right-4 landscape:top-6 landscape:right-6 z-50 w-10 h-10 hover:opacity-70 transition-opacity"
                aria-label="Close modal"
              >
                <div className="flex items-center justify-center w-full h-full">
                  <Image
                    src="/assets/images/close-icon.svg"
                    alt="Close"
                    width={24}
                    height={24}
                    className="w-full h-full"
                  />
                </div>
              </Button>
              <div className="relative z-20 flex flex-col h-full">
                <ModalBody className="overflow-y-auto flex-1 p-[2.5rem]">{children}</ModalBody>
              </div>
            </>
          )}
        </ModalContent>
      </HeroModal>
    </>
  );
};

export default PlaypenPopup;
