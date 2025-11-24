import { type FC } from 'react';

import { Button } from '@/components/Button';
import { GuideStep } from '@/components/GuideStep';
import { Icon } from '@/components/Icon';
import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { CardCarousel } from './CardCarousel';
import { quickStartMicrocopy } from './microcopy';

export const QuickStart: FC<
  Partial<BaseScreenProps> & { fromMenu?: boolean; onContinue: () => void }
> = ({ send, className, fromMenu, onContinue, ...props }) => {
  const handleContinue = () => {
    if (fromMenu) {
      onContinue();
      return;
    }

    send?.({ type: 'SHOW_MISSION' });
  };

  const handleClose = () => {
    if (fromMenu) {
      onContinue();
      return;
    }

    send?.({ type: 'BACK_TO_INTRO' });
  };

  return (
    <motion.div
      className={cn('relative flex flex-col min-h-full items-center', className)}
      {...props}
    >
      {/* Close Button */}
      <header className="mx-auto relative w-full mt-6 h-8">
        <Button
          onPress={handleClose}
          className="absolute top-0 right-6 cursor-pointer z-10 bg-transparent hover:opacity-70 active:opacity-70 transition-opacity p-0 w-7 h-7 flex items-center justify-center"
          aria-label={quickStartMicrocopy.menuCta}
        >
          <Icon name="close" width={8} height={8} className="w-2 h-2" />
        </Button>
      </header>

      {/* Main content container - scrollable */}
      <div className="w-full relative z-10 flex flex-col items-center flex-grow overflow-y-auto">
        {/* Title Section */}
        <div className="w-full mb-8 mt-8 px-6 sm:max-w-[25rem] mx-auto">
          <Text as="h1" variant="title-3" align="left" className="text-common-ash mb-4">
            {quickStartMicrocopy.title}
          </Text>
          <Text variant="body-large" align="left" className="text-common-ash">
            {quickStartMicrocopy.subtitle}
          </Text>
        </div>

        {/* Guide Steps */}
        <div className="w-full flex flex-col gap-6 mb-8 px-6 sm:max-w-[25rem] mx-auto">
          {quickStartMicrocopy.steps.map((step) => (
            <GuideStep
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>

        {/* Card Carousel Section */}
        <div className="w-full mb-8">
          <div className="px-6 mb-8 sm:max-w-[25rem] mx-auto">
            <Text variant="title-3" color="text-common-ash">
              {quickStartMicrocopy.cardCarousel.title}
            </Text>
            <Text variant="body-small" color="text-common-ash">
              <span
                dangerouslySetInnerHTML={{ __html: quickStartMicrocopy.cardCarousel.subtitle }}
              ></span>
            </Text>
          </div>
          <CardCarousel />
        </div>
        {/* CTA Button */}
        <div className="relative z-10 flex justify-center pb-8 pt-4 w-full px-12 sm:max-w-[25rem] mx-auto">
          <Button className="w-full mx-auto" onPress={handleContinue} variant="primary">
            {fromMenu ? quickStartMicrocopy.menuCta : quickStartMicrocopy.cta}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
