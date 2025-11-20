import { useGameStore } from '@/store';
import { type FC, useMemo } from 'react';
import { A11y, Keyboard } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
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

  // Get initial slide index based on selectedBackground
  const initialSlide = selectedBackground
    ? BACKGROUNDS.findIndex((bg) => bg.id === selectedBackground)
    : 0;

  return (
    <div className={className}>
      <Swiper
        {...swiperOptions}
        initialSlide={Math.max(0, initialSlide)}
        onSlideChange={(swiper) => {
          const currentBackground = BACKGROUNDS[swiper.activeIndex];
          if (currentBackground) handleBackgroundSelect(currentBackground.id);
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
              onPress={() => handleBackgroundSelect(background.id)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
