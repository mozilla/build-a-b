import { Carousel } from '@/components/Carousel';
import { type FC, useRef } from 'react';
import CardFeature from './CardFeature';
import { cardFeatures } from './cardData';

export const CardCarousel: FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <Carousel
      containerRef={scrollContainerRef}
      scrollerAttributes={{
        className: 'pl-[calc(50%-10.875rem)] pr-[calc(50%-5.4375rem)] py-0 items-start gap-x-8',
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
