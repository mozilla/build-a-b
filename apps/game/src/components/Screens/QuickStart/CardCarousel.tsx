import { type FC, useMemo, useRef, useState } from 'react';
import { A11y, Keyboard } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType, SwiperOptions } from 'swiper/types';

import 'swiper/css';

import { TRACKS } from '@/config/audio-config';
import { useGameStore } from '@/store';
import { cn } from '@/utils/cn';
import CardFeature from './CardFeature';
import { cardFeatures } from './cardData';

export const CardCarousel: FC = () => {
  const { playAudio } = useGameStore();
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

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

  const handlePrevClick = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
      playAudio(TRACKS.OPTION_FOCUS);
    }
  };

  const handleNextClick = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
      playAudio(TRACKS.OPTION_FOCUS);
    }
  };

  return (
    <div className="relative w-full">
      <Swiper
        {...swiperOptions}
        className="w-full h-auto"
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
        onSlideChange={(swiper) => {
          playAudio(TRACKS.OPTION_FOCUS);
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
      >
        {cardFeatures.map((card) => (
          <SwiperSlide key={card.cardTitle}>
            <div className="flex items-center justify-center h-full px-4">
              <CardFeature
                cardTotalNumber={card.cardTotalNumber}
                cardType={card.cardType}
                cardTitle={card.cardTitle}
                cardImgSrc={card.cardImgSrc}
                cardDesc={card.cardDesc}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrevClick}
        disabled={isBeginning}
        aria-label="Previous card"
        className={cn(
          'absolute left-[1.53125rem] top-32 -translate-y-1/2 z-10',
          'w-[2.125rem] h-[2.125rem] rounded-full',
          'bg-accent',
          'flex items-center justify-center',
          'transition-opacity duration-200',
          'cursor-pointer hover:opacity-90',
          isBeginning && 'opacity-30 cursor-not-allowed',
        )}
      >
        <svg
          width="0.5rem"
          height="0.875rem"
          viewBox="0 0 8 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-black"
        >
          <path
            d="M7 1L1 7L7 13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        onClick={handleNextClick}
        disabled={isEnd}
        aria-label="Next card"
        className={cn(
          'absolute right-[1.53125rem] top-32 -translate-y-1/2 z-10',
          'w-[2.125rem] h-[2.125rem] rounded-full',
          'bg-accent',
          'flex items-center justify-center',
          'transition-opacity duration-200',
          'cursor-pointer hover:opacity-90',
          isEnd && 'opacity-30 cursor-not-allowed',
        )}
      >
        <svg
          width="0.5rem"
          height="0.875rem"
          viewBox="0 0 8 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-black"
        >
          <path
            d="M1 1L7 7L1 13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};
