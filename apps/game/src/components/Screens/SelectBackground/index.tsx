import { type FC, useState } from 'react';

import { Button } from '@/components/Button';
import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';
import { useGameStore } from '@/store';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { BackgroundCarousel } from './BackgroundCarousel';
import { BACKGROUNDS } from './backgrounds';
import { selectBackgroundMicrocopy } from './microcopy';

export const SelectBackground: FC<BaseScreenProps> = ({ send, className, children, ...props }) => {
  const { selectedBackground } = useGameStore();
  const [localSelection, setLocalSelection] = useState(selectedBackground || BACKGROUNDS[0].id);

  const handleBackgroundSelect = (backgroundId: string) => {
    setLocalSelection(backgroundId);
  };

  const handleNext = () => {
    if (localSelection) {
      send?.({ type: 'SELECT_BACKGROUND', background: localSelection });
    }
  };

  return (
    <motion.div className={cn(className)} {...props}>
      {/* Main content container */}
      <header className="relative w-full max-w-[25rem] mx-auto">{children}</header>
      <div className="w-full relative z-10 py-8 pt-16 h-full overflow-auto">
        {/* Title and Description */}
        <div className="flex flex-col items-center justify-start gap-4 h-full">
          <div className="flex flex-col items-center gap-4 w-full px-[2.25rem] max-w-[25rem] mx-auto">
            <Text as="h1" variant="title-2" align="center" className="text-common-ash w-full">
              {selectBackgroundMicrocopy.title}
            </Text>

            <div className="flex flex-col items-center gap-1">
              <Text
                variant="body-large-semibold"
                align="center"
                className="text-common-ash max-w-[16.625rem]"
              >
                {selectBackgroundMicrocopy.description}
              </Text>
            </div>
          </div>

          {/* Backgrounds Carousel */}
          <div className="w-full relative py-8">
            <BackgroundCarousel onSelect={handleBackgroundSelect} />
          </div>

          {/* Next Button */}
          <div className="w-full flex justify-center pb-8 px-[2.25rem] max-w-[25rem] mx-auto">
            <Button onPress={handleNext} variant="primary" className="min-w-[15.5rem]">
              {selectBackgroundMicrocopy.ctaButton}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
