import { Carousel } from '@/components/Carousel';
import { useGameStore } from '@/stores/game-store';
import { type FC, useEffect, useRef } from 'react';
import { BackgroundCard } from './BackgroundCard';
import { BACKGROUNDS } from './backgrounds';

interface BackgroundCarouselProps {
  onSelect?: (backgroundId: string) => void;
  className?: string;
}

export const BackgroundCarousel: FC<BackgroundCarouselProps> = ({ onSelect, className }) => {
  const { selectedBackground, selectBackground } = useGameStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected background on mount
  useEffect(() => {
    if (scrollContainerRef.current && selectedBackground) {
      const selectedIndex = BACKGROUNDS.findIndex((bg) => bg.id === selectedBackground);
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
  }, [selectedBackground]);

  const handleBackgroundSelect = (backgroundId: string) => {
    selectBackground(backgroundId);
    onSelect?.(backgroundId);

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

  return (
    <div className={className}>
      <Carousel
        containerRef={scrollContainerRef}
        scrollerAttributes={{ className: 'px-[calc(50%-5.625rem)] gap-8' }}
      >
        {BACKGROUNDS.map((background) => (
          <BackgroundCard
            key={background.id}
            imageSrc={background.imageSrc}
            name={background.name}
            isSelected={selectedBackground === background.id}
            onPress={() => handleBackgroundSelect(background.id)}
          />
        ))}
      </Carousel>
    </div>
  );
};
