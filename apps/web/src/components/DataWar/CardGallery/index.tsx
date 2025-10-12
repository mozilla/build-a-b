'use client';

import { FC, useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import Bento from '@/components/Bento';
import Image from 'next/image';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

export interface CardGalleryProps {
  cards: {
    cardTitle: string;
    cardImgSrc: string;
    cardImgAlt?: string;
    cardDesc: string;
  }[];
  visibleCount?: number;
}

const CardGallery: FC<CardGalleryProps> = ({ cards, visibleCount = 5 }) => {
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [slidesPerView, setSlidesPerView] = useState(5.2); // Show 5 full + 0.2 of 6th card
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.matchMedia('(orientation: portrait)').matches) {
        setSlidesPerView(1);
      } else {
        setSlidesPerView(5.2); // Show 5 full cards + 0.2 of the 6th card
      }
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [visibleCount]);

  const handleSlideChange = (swiper: SwiperType) => {
    setCanPrev(!swiper.isBeginning);
    setCanNext(!swiper.isEnd);
  };

  const handlePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const handleNext = () => {
    swiperRef.current?.slideNext();
  };

  const articleStyle = `shrink-0 p-4 w-full`;

  return (
    <section
      className="w-full relative mt-4"
      aria-roledescription="carousel"
      aria-label="Card Gallery"
    >
      <div className="control-section relative">
        <div className="absolute z-99 top-50 -left-2 landscape:top-40 landscape:-left-10">
          <button
            className="disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition"
            aria-label="Previous"
            disabled={!canPrev}
            onClick={handlePrev}
          >
            <Image
              src="/assets/images/icons/left-button.webp"
              width={44}
              height={44}
              className="object-cover w-11 h-11"
              alt="Previous"
            />
          </button>
        </div>
        <div className="absolute z-99 top-50 -right-2 landscape:top-40 landscape:-right-10">
          <button
            className="disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition"
            aria-label="Next"
            disabled={!canNext}
            onClick={handleNext}
          >
            <Image
              src="/assets/images/icons/right-button.webp"
              width={44}
              height={44}
              className="object-cover w-11 h-11"
              alt="Next"
            />
          </button>
        </div>
      </div>
      <div className="relative container-section">
        <Swiper
          modules={[Navigation]}
          slidesPerView={slidesPerView}
          spaceBetween={0}
          slidesPerGroup={1}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            handleSlideChange(swiper);
          }}
          onSlideChange={handleSlideChange}
          className="section-to-move"
          style={
            {
              '--swiper-navigation-size': '0px', // Hide default navigation
              overflow: 'visible',
            } as React.CSSProperties
          }
        >
          {cards.map(({ cardTitle, cardImgSrc, cardImgAlt, cardDesc }, index) => (
            <SwiperSlide key={index}>
              <article role="listitem" className={articleStyle}>
                <div className="relative w-full shadow">
                  <Bento
                    image={cardImgSrc}
                    imageAlt={cardImgAlt}
                    className="w-full object-cover aspect-[182/248]"
                  />
                  <div className="mt-4">
                    <h4 className="text-lg-custom font-bold">{cardTitle}</h4>
                    <p className="text-sm-custom mt-2">{cardDesc}</p>
                  </div>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default CardGallery;
