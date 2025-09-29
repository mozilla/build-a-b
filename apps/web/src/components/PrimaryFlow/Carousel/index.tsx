import { Navigation, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { SwiperOptions } from 'swiper/types';

import 'swiper/css';
import 'swiper/css/navigation';
import { useMemo, type FC, type ReactNode } from 'react';

type CarouselProps = {
  slides: ReactNode[];
  slideClassName?: string;
  containerClassName?: string;
  swiperOptions?: Partial<SwiperOptions>;
  withArrowNavigation?: boolean;
};

const Carousel: FC<CarouselProps> = ({
  slides,
  slideClassName,
  containerClassName,
  swiperOptions = {},
  withArrowNavigation,
}) => {
  const defaultOptions: Partial<SwiperOptions> = useMemo(
    () => ({
      modules: [Navigation, A11y],
      centeredSlides: true,
      loop: true,
      navigation: {
        prevEl: '.swiper-button-prev',
        nextEl: '.swiper-button-next',
      },
    }),
    [],
  );

  const mergedOptions = useMemo(
    () => ({ ...defaultOptions, ...swiperOptions }),
    [defaultOptions, swiperOptions],
  );

  return (
    <div className="relative overflow-visible">
      <Swiper {...mergedOptions} className={containerClassName}>
        {slides.map((slide, index) => (
          <SwiperSlide
            key={index}
            className={`${slideClassName}
            !scale-75 !brightness-50 !z-2
            [&.swiper-slide-active]:!z-10 [&.swiper-slide-active]:!scale-100 [&.swiper-slide-active]:!brightness-100
            [&.swiper-slide-next]:!z-8 [&.swiper-slide-next]:!scale-90 [&.swiper-slide-next]:!brightness-75
            [&.swiper-slide-prev]:!z-8 [&.swiper-slide-prev]:!scale-90 [&.swiper-slide-prev]:!brightness-75
            !transition-all !duration-700 ease-out`}
          >
            {slide}
          </SwiperSlide>
        ))}
      </Swiper>

      {withArrowNavigation && (
        <>
          {' '}
          <button
            className="rounded-full swiper-button-prev w-[2.75rem] h-[2.75rem] !left-4 bg-accent p-0"
            aria-label="Show previous slide"
          >
            <span className="w-[1.375rem] h-[1.375rem]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M14.1602 5.22168L8.66016 11.6383L14.1602 18.055"
                  stroke="#333336"
                  strokeWidth="1.65"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </span>
          </button>
          <button
            className="rounded-full swiper-button-next w-[2.75rem] h-[2.75rem] !right-4 bg-accent p-0"
            aria-label="Show next slide"
          >
            <span className="w-[1.375rem] h-[1.375rem]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M8.83887 5.22168L14.3389 11.6383L8.83887 18.055"
                  stroke="#333336"
                  strokeWidth="1.65"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </span>
          </button>
        </>
      )}
    </div>
  );
};

export default Carousel;
