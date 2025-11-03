import { Carousel } from '@/components/Carousel';
import { type FC, useEffect, useRef } from 'react';
import CardFeature from './CardFeature';
import { cardFeatures } from './cardData';

export const CardCarousel: FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to first card on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const firstCard = container.children[0] as HTMLElement;
      if (firstCard) {
        const containerWidth = container.offsetWidth;
        const cardLeft = firstCard.offsetLeft;
        const cardWidth = firstCard.offsetWidth;
        const scrollPosition = cardLeft - containerWidth / 2 + cardWidth / 2;
        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth',
        });
      }
    }
  }, []);

  return (
    <Carousel
      containerRef={scrollContainerRef}
      scrollerAttributes={{
        className: 'px-6 py-0 items-start gap-x-8',
      }}
    >
      {cardFeatures.map((card) => (
        <CardFeature
          key={card.cardTitle}
          cardTitle={card.cardTitle}
          cardImgSrc={card.cardImgSrc}
          cardDesc={card.cardDesc}
          className="snap-center flex-shrink-0"
        />
      ))}
    </Carousel>
  );
};
