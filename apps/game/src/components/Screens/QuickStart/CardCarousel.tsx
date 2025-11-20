import { type FC, useMemo } from 'react';
import { A11y, Keyboard } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { SwiperOptions } from 'swiper/types';

import 'swiper/css';

import { TRACKS } from '@/config/audio-config';
import { useGameStore } from '@/store';
import CardFeature from './CardFeature';
import { cardFeatures } from './cardData';

export const CardCarousel: FC = () => {
  const { playAudio } = useGameStore();
  const swiperOptions: Partial<SwiperOptions> = useMemo(
    () => ({
      modules: [A11y, Keyboard],
      centeredSlides: true,
      spaceBetween: 20, // Wider separation (gap-x-8 = 2rem = 32px)
      slidesPerView: 2,
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
    }),
    [],
  );

  return (
    <div className="w-full">
      <Swiper
        {...swiperOptions}
        className="w-full h-auto"
        onSlideChange={() => playAudio(TRACKS.OPTION_FOCUS)}
      >
        {cardFeatures.map((card) => (
          <SwiperSlide key={card.cardTitle}>
            <div className="flex items-center justify-center h-full px-4">
              <CardFeature
                cardTitle={card.cardTitle}
                cardImgSrc={card.cardImgSrc}
                cardDesc={card.cardDesc}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
