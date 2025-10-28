import { type FC, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { Carousel } from '@/components/Carousel';
import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';
import { useGameStore } from '@/stores/game-store';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { BackgroundCard } from './BackgroundCard';
import { BACKGROUNDS } from './backgrounds';
import { selectBackgroundMicrocopy } from './microcopy';

export const SelectBackground: FC<BaseScreenProps> = ({ send, className, ...props }) => {
  const { selectedBackground, selectBackground } = useGameStore();
  const [localSelection, setLocalSelection] = useState(selectedBackground || BACKGROUNDS[0].id);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected background on mount
  useEffect(() => {
    if (scrollContainerRef.current && localSelection) {
      const selectedIndex = BACKGROUNDS.findIndex((bg) => bg.id === localSelection);
      if (selectedIndex !== -1) {
        const container = scrollContainerRef.current;
        const selectedCard = container.children[selectedIndex] as HTMLElement;
        if (selectedCard) {
          // Center the selected card
          const containerWidth = container.offsetWidth;
          const cardLeft = selectedCard.offsetLeft;
          const cardWidth = selectedCard.offsetWidth;
          const scrollPosition = cardLeft - containerWidth / 2 + cardWidth / 2;
          container.scrollTo({
            left: scrollPosition,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [localSelection]);

  const handleBackgroundSelect = (backgroundId: string) => {
    setLocalSelection(backgroundId);
    selectBackground(backgroundId);

    // Scroll to center the selected background
    if (scrollContainerRef.current) {
      const selectedIndex = BACKGROUNDS.findIndex((bg) => bg.id === backgroundId);
      if (selectedIndex !== -1) {
        const container = scrollContainerRef.current;
        const selectedCard = container.children[selectedIndex] as HTMLElement;
        if (selectedCard) {
          const containerWidth = container.offsetWidth;
          const cardLeft = selectedCard.offsetLeft;
          const cardWidth = selectedCard.offsetWidth;
          const scrollPosition = cardLeft - containerWidth / 2 + cardWidth / 2;
          container.scrollTo({
            left: scrollPosition,
            behavior: 'smooth',
          });
        }
      }
    }
  };

  const handleNext = () => {
    if (localSelection) {
      selectBackground(localSelection);
      send?.({ type: 'SELECT_BACKGROUND', background: localSelection });
    }
  };

  return (
    <motion.div className={cn(className)} {...props}>
      {/* Main content container */}
      <div className="w-full relative z-10 flex flex-col items-center justify-between h-full py-8 pt-16">
        {/* Title and Description */}
        <div className="flex flex-col items-center gap-4 w-full px-[2.25rem]">
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
            <Text
              variant="body-large-semibold"
              align="center"
              className="text-common-ash max-w-[16.625rem] text-sm"
            >
              {selectBackgroundMicrocopy.disclaimer}
            </Text>
          </div>
        </div>

        {/* Backgrounds Carousel */}
        <div className="w-full relative py-8">
          <Carousel
            containerRef={scrollContainerRef}
            scrollerAttributes={{ className: 'px-[calc(50%-5.625rem)] gap-8' }}
          >
            {BACKGROUNDS.map((background) => (
              <BackgroundCard
                key={background.id}
                imageSrc={background.imageSrc}
                name={background.name}
                isSelected={localSelection === background.id}
                onPress={() => handleBackgroundSelect(background.id)}
              />
            ))}
          </Carousel>
        </div>

        {/* Next Button */}
        <div className="w-full flex justify-center pb-8 px-[2.25rem]">
          <Button onPress={handleNext} variant="primary" className="min-w-[15.5rem]">
            {selectBackgroundMicrocopy.ctaButton}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
