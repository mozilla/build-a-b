'use client';

import { FC, useEffect, useRef, useState } from 'react';
import Bento from '@/components/Bento';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import Image from 'next/image';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

export interface ImageGalleryProps {
  images: {
    alt: string;
    src: string;
    isVideo: boolean;
    videoThumbnail?: string;
  }[];
}

const ImageGallery: FC<ImageGalleryProps> = ({ images }) => {
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const [slidesPerView, setSlidesPerView] = useState(4);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.matchMedia('(orientation: portrait)').matches) {
        setSlidesPerView(1);
      } else {
        setSlidesPerView(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const items = images.map(({ alt, src, isVideo, videoThumbnail }, index) => {
    const img = (
      <Bento
        image={src}
        imageAlt={alt}
        className={`${images.length <= 4 ? 'w-[10.5rem]' : 'w-full'} landscape:w-[19rem] border-none aspect-square mx-auto`}
      />
    );

    const video = (
      <div
        className={`overflow-hidden ${images.length <= 4 ? 'w-[10.5rem]' : 'w-full'} landscape:w-[19rem] border-none aspect-square relative mx-auto`}
      >
        <video
          src={src}
          poster={videoThumbnail}
          muted
          loop
          playsInline
          controls
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover rounded-[0.75rem]"
        >
          Your browser does not support HTML5 video.
        </video>
      </div>
    );

    return (
      <div key={index} className="relative">
        {isVideo ? video : img}
      </div>
    );
  });

  if (items.length <= 4) {
    return (
      <section className="mb-4 landscape:mb-8 flex flex-row flex-wrap justify-between gap-y-4 landscape:gap-8">
        {items}
      </section>
    );
  }

  return (
    <section className="relative">
      <button
        className="disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition absolute top-[50%] z-2 -left-2 -translate-y-4 landscape:-left-5 landscape:-translate-y-6"
        aria-label="Previous"
        disabled={!canPrev}
        onClick={handlePrev}
      >
        <Image
          src="/assets/images/icons/left-button.webp"
          width={44}
          height={44}
          className="object-cover w-8 h-8 landscape:w-11 landscape:h-11"
          alt="Previous"
        />
      </button>

      <button
        className="disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition absolute top-[50%] z-2 -right-2 -translate-y-4 landscape:-right-5 landscape:-translate-y-6"
        aria-label="Next"
        disabled={!canNext}
        onClick={handleNext}
      >
        <Image
          src="/assets/images/icons/right-button.webp"
          width={44}
          height={44}
          className="object-cover w-8 h-8 landscape:w-11 landscape:h-11"
          alt="Next"
        />
      </button>

      <div className="overflow-hidden">
        <Swiper
          modules={[Navigation]}
          slidesPerView={slidesPerView}
          spaceBetween={15}
          slidesPerGroup={1}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            handleSlideChange(swiper);
          }}
          onSlideChange={handleSlideChange}
        >
          {items.map((item, index) => (
            <SwiperSlide key={index} className="">
              {item}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ImageGallery;
