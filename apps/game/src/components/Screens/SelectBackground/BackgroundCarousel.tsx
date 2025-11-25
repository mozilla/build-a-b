import { useGameStore } from '@/store';
import { type FC, useMemo, useRef, useState } from 'react';
import { A11y, Keyboard } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import type { SwiperOptions } from 'swiper/types';
import { BackgroundCard } from './BackgroundCard';
import { BACKGROUNDS } from './backgrounds';

import { TRACKS } from '@/config/audio-config';
import { QUERIES, useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/utils/cn';
import 'swiper/css';

interface BackgroundCarouselProps {
  onSelect?: (backgroundId: string) => void;
  className?: string;
  variant?: 'menu';
}

/**
 * Convert rem to pixels based on current scaling context
 */
const remToPx = (rem: number): number => {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
};

export const BackgroundCarousel: FC<BackgroundCarouselProps> = ({
  onSelect,
  variant,
  className,
}) => {
  const { selectedBackground, selectBackground, playAudio } = useGameStore();
  const isFramedX = useMediaQuery(QUERIES.framedX);
  const isFramedY = useMediaQuery(QUERIES.framedY);
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const swiperOptions: Partial<SwiperOptions> = useMemo(
    () => ({
      modules: [A11y, Keyboard],
      centeredSlides: true,
      // Convert rem values to pixels based on current scaling
      // 3rem (48px at base) for normal, 2.25rem (36px at base) for menu
      spaceBetween: remToPx(variant !== 'menu' ? 3 : 2.25),
      slidesPerView: 'auto',
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [variant, isFramedX, isFramedY],
  );

  const handleBackgroundSelect = (backgroundId: string) => {
    selectBackground(backgroundId);
    if (onSelect) {
      onSelect?.(backgroundId);
    } else {
      playAudio(TRACKS.OPTION_FOCUS);
    }
  };

  const handleCardClick = (backgroundId: string) => {
    const clickedIndex = BACKGROUNDS.findIndex((bg) => bg.id === backgroundId);
    if (clickedIndex !== -1 && swiperRef.current) {
      swiperRef.current.slideTo(clickedIndex);
    }
  };

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

  // Get initial slide index based on selectedBackground
  const initialSlide = selectedBackground
    ? BACKGROUNDS.findIndex((bg) => bg.id === selectedBackground)
    : 0;

  return (
    <div className={cn('relative', className)}>
      <Swiper
        {...swiperOptions}
        initialSlide={Math.max(0, initialSlide)}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
        onSlideChange={(swiper) => {
          const currentBackground = BACKGROUNDS[swiper.activeIndex];
          if (currentBackground) handleBackgroundSelect(currentBackground.id);
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
        className="w-full"
      >
        {BACKGROUNDS.map((background) => (
          <SwiperSlide
            key={background.id}
            className={cn(variant !== 'menu' ? '!w-[8.75rem] py-18' : '!w-[6.25rem] py-12')}
          >
            <BackgroundCard
              className={cn(variant === 'menu' && 'w-[6.25rem] h-[13.75rem]')}
              imageSrc={background.imageSrc}
              name={background.name}
              isSelected={selectedBackground === background.id}
              onPress={() => handleCardClick(background.id)}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrevClick}
        disabled={isBeginning}
        aria-label="Previous background"
        className={cn(
          'absolute left-[1.53125rem] top-1/2 -translate-y-1/2 z-10',
          'w-[2.125rem] h-[2.125rem] rounded-full',
          'bg-[rgba(24,24,27,0.3)] border-2 border-accent',
          'flex items-center justify-center',
          'transition-opacity duration-200',
          'cursor-pointer hover:bg-[rgba(24,24,27,0.5)]',
          isBeginning && 'opacity-30 cursor-not-allowed',
        )}
      >
        <svg
          width="0.5rem"
          height="0.875rem"
          viewBox="0 0 8 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-accent"
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
        aria-label="Next background"
        className={cn(
          'absolute right-[1.53125rem] top-1/2 -translate-y-1/2 z-10',
          'w-[2.125rem] h-[2.125rem] rounded-full',
          'bg-[rgba(24,24,27,0.3)] border-2 border-accent',
          'flex items-center justify-center',
          'transition-opacity duration-200',
          'cursor-pointer hover:bg-[rgba(24,24,27,0.5)]',
          isEnd && 'opacity-30 cursor-not-allowed',
        )}
      >
        <svg
          width="0.5rem"
          height="0.875rem"
          viewBox="0 0 8 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-accent"
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
