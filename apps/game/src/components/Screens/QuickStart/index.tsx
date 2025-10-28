import { type FC } from 'react';

import { Button } from '@/components/Button';
import { GuideStep } from '@/components/GuideStep';
import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { CardCarousel } from './CardCarousel';
import { quickStartMicrocopy } from './microcopy';

export const QuickStart: FC<BaseScreenProps> = ({ send, className, ...props }) => {
  const handleContinue = () => {
    send?.({ type: 'SHOW_MISSION' });
  };

  return (
    <motion.div className={cn('relative flex flex-col min-h-full', className)} {...props}>
      {/* Main content container - scrollable */}
      <div className="w-full relative z-10 flex flex-col items-center flex-grow overflow-y-auto">
        {/* Title Section */}
        <div className="w-full mb-8 mt-6 px-6">
          <Text as="h1" variant="title-3" align="left" className="text-common-ash mb-4">
            {quickStartMicrocopy.title}
          </Text>
          <Text variant="body-large" align="left" className="text-common-ash">
            {quickStartMicrocopy.subtitle}
          </Text>
        </div>

        {/* Guide Steps */}
        <div className="w-full flex flex-col gap-6 mb-8 px-6">
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
          <div className="px-6 mb-8">
            <Text variant="title-3" className="text-common-ash">
              {quickStartMicrocopy.cardCarousel.title}
            </Text>
            <Text variant="body-small" color="text-common-ash">
              {quickStartMicrocopy.cardCarousel.subtitle}
            </Text>
          </div>
          <CardCarousel />
        </div>
        {/* CTA Button */}
        <div className="relative z-10 flex justify-center pb-8 pt-4 w-full px-12">
          <Button className="w-full mx-auto" onPress={handleContinue} variant="primary">
            {quickStartMicrocopy.cta}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
