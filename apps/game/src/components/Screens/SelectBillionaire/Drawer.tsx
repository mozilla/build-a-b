import nightSkyBg from '@/assets/backgrounds/color_nightsky.webp';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import type { Billionaire } from '@/config/billionaires';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion, type HTMLMotionProps } from 'framer-motion';
import { type FC } from 'react';

export interface DrawerProps
  extends Omit<
    HTMLMotionProps<'div'>,
    'children' | 'onClick' | 'initial' | 'animate' | 'exit' | 'transition'
  > {
  isOpen: boolean;
  billionaire: Billionaire | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const Drawer: FC<DrawerProps> = ({
  isOpen,
  billionaire,
  onClose,
  onConfirm,
  className,
  ...props
}) => {
  if (!billionaire) return null;

  const description = billionaire.description || 'data-collecting, space-bound';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Scrim/Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-cyan-900/70 z-40"
            onClick={onClose}
          />

          {/* Drawer Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              ease: [0.35, 0, 0.15, 1],
              duration: 0.4,
            }}
            className={cn('absolute bottom-0 left-0 right-0 z-50 w-full mx-auto', className)}
            {...props}
          >
            {/* Drawer Content */}
            <div className="relative w-full bg-[#0a0a15] rounded-tl-[2rem] sm:rounded-tl-[2.5rem] rounded-tr-[2rem] sm:rounded-tr-[2.5rem] overflow-hidden pb-20 sm:pb-8">
              <img
                src={nightSkyBg}
                alt=""
                className="w-full h-full object-cover absolute inset-0"
                role="presentation"
              />
              {/* Inner glow effect */}
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0.5rem_1.875rem_0px_rgba(0,166,249,1)]" />

              {/* Content Container */}
              <div className="relative flex flex-col items-center gap-6 sm:gap-4 md:gap-6 pt-20 sm:pt-16 md:pt-20 px-4 sm:px-6 md:px-8 max-h-[90dvh] overflow-y-auto">
                {/* Billionaire Image */}
                <div className="relative w-[12.1875rem] h-[12.1875rem] flex-shrink-0">
                  <img
                    src={billionaire.imageSrc}
                    alt={billionaire.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                {/* Info Card */}
                <div className="w-full px-3">
                  {/* Card Header with gradient */}
                  <div className="bg-gradient-to-r from-[#00a6f9] to-[#754fe0] rounded-t-[.5625rem] px-2 sm:px-3 py-2 border border-[#00a6f9]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 aspect-square border-[1.5px] rounded-full bg-transparent" />
                      <div className="w-2 aspect-square border-[1.5px] rounded-full bg-transparent" />
                      <div className="w-2 aspect-square border-[1.5px] rounded-full bg-transparent" />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="bg-common-ash rounded-b-[.5625rem] p-4 border-b-2 border-l-2 border-r-2 border-[#00a6f9]">
                    <Text
                      variant="body-large-semibold"
                      className="text-charcoal mb-2"
                      weight="extrabold"
                    >
                      <span className="font-extrabold">Meet </span>
                      <Text
                        as="span"
                        variant="body-large-semibold"
                        weight="extrabold"
                        className="text-[#754fe0]"
                      >
                        {billionaire.name}
                      </Text>
                    </Text>

                    <Text variant="body-medium" className="text-charcoal">
                      <span className="font-medium">Your </span>
                      <Text as="span" variant="body-medium" weight="bold" className="">
                        {description}
                      </Text>
                      <span className="font-medium"> Billionaire.</span>
                    </Text>
                  </div>
                </div>

                {/* Select Button */}
                <div className="w-full px-2 sm:px-4">
                  <Button
                    onClick={onConfirm}
                    variant="primary"
                    className="w-full max-w-[15.5rem] mx-auto block flex"
                  >
                    <Text as="span" variant="body-large-semibold">
                      Select
                    </Text>
                  </Button>
                </div>
              </div>

              {/* Close Button */}
              <Button
                onPress={onClose}
                className="absolute top-5 right-5 cursor-pointer z-10 bg-transparent hover:opacity-70 active:opacity-70 transition-opacity p-0 min-w-0 w-[2.125rem] h-[2.125rem] flex items-center justify-center"
                aria-label="Close drawer"
              >
                <Icon name="close" width={8} height={8} className="w-2 h-2" />
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
