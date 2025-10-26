import nightSkyBg from '@/assets/backgrounds/color_nightsky.webp';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import type { Billionaire } from '@/config/billionaires';
import { AnimatePresence, motion } from 'framer-motion';
import { type FC } from 'react';

interface DrawerProps {
  isOpen: boolean;
  billionaire: Billionaire | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const Drawer: FC<DrawerProps> = ({ isOpen, billionaire, onClose, onConfirm }) => {
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
            className="fixed inset-0 bg-black/60 z-40"
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
            className="fixed bottom-0 left-0 right-0 z-50 w-full mx-auto"
          >
            {/* Drawer Content */}
            <div className="relative w-full bg-[#0a0a15] rounded-tl-[2rem] sm:rounded-tl-[2.5rem] rounded-tr-[2rem] sm:rounded-tr-[2.5rem] overflow-hidden pb-6 sm:pb-8">
              <img
                src={nightSkyBg}
                alt=""
                className="w-full h-full object-cover absolute inset-0"
                role="presentation"
              />
              {/* Inner glow effect */}
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0.5rem_1.875rem_0px_rgba(0,166,249,0.5)]" />

              {/* Content Container */}
              <div className="relative flex flex-col items-center gap-3 sm:gap-4 md:gap-6 pt-12 sm:pt-16 md:pt-20 px-4 sm:px-6 md:px-8 max-h-[90vh] overflow-y-auto">
                {/* Billionaire Image */}
                <div className="relative w-[8.75rem] h-[8.75rem] sm:w-[10rem] sm:h-[10rem] md:w-[12.1875rem] md:h-[12.1875rem] flex-shrink-0">
                  <img
                    src={billionaire.imageSrc}
                    alt={billionaire.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                {/* Info Card */}
                <div className="w-full max-w-[20.375rem] mx-auto">
                  {/* Card Header with gradient */}
                  <div className="bg-gradient-to-r from-[#00a6f9] to-[#754fe0] rounded-t-[.5625rem] px-2 sm:px-3 py-1.5 sm:py-2 border border-[#00a6f9]">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent" />
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent" />
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent" />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="bg-common-ash rounded-b-[.5625rem] px-3 sm:px-4 py-2.5 sm:py-3 md:py-4 border-b-2 border-l-2 border-r-2 border-[#00a6f9]">
                    <Text
                      variant="body-large-semibold"
                      className="text-charcoal mb-1 sm:mb-2"
                      weight="extrabold"
                    >
                      <span className="text-sm sm:text-base md:text-lg">Meet </span>
                      <Text
                        as="span"
                        variant="body-large-semibold"
                        weight="extrabold"
                        className="text-[#754fe0] text-sm sm:text-base md:text-lg"
                      >
                        {billionaire.name}
                      </Text>
                    </Text>

                    <Text variant="body-medium" className="text-charcoal">
                      <span className="text-xs sm:text-sm md:text-base">Your </span>
                      <Text
                        as="span"
                        variant="body-medium"
                        weight="bold"
                        className="text-xs sm:text-sm md:text-base"
                      >
                        {description}
                      </Text>
                      <span className="text-xs sm:text-sm md:text-base"> Billionaire.</span>
                    </Text>
                  </div>
                </div>

                {/* Select Button */}
                <div className="mt-2 sm:mt-3 md:mt-4 w-full px-2 sm:px-4">
                  <Button
                    onClick={onConfirm}
                    variant="primary"
                    className="w-full max-w-[15.5rem] mx-auto block"
                  >
                    Select
                  </Button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 sm:top-4 md:top-5 right-2 sm:right-3 md:right-4 cursor-pointer z-10"
                aria-label="Close drawer"
              >
                <Icon name="close" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
