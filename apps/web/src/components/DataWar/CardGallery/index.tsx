'use client';

import { useRef, FC, useState, useCallback, useEffect } from 'react';
import Bento from '@/components/Bento';
import Image from 'next/image';

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
  const [currentIndex, setIndex] = useState(0);
  const [canPrev, setPrev] = useState(false);
  const [canNext, setNext] = useState(true);
  const [maxIndex, setMaxIndex] = useState(Math.max(0, cards.length - visibleCount));
  const [valueToMove, setPercent] = useState(visibleCount);
  const divRef = useRef(null);

  const step = 1;
  const startX = useRef<number | null>(null);
  const deltaX = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    deltaX.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    deltaX.current = e.touches[0].clientX - startX.current;
  };

  const onTouchEnd = () => {
    const threshold = 48; // px
    if (deltaX.current > threshold && canPrev) clampedSetIndex(currentIndex - step);
    if (deltaX.current < -threshold && canNext) clampedSetIndex(currentIndex + step);
    startX.current = null;
    deltaX.current = 0;
  };

  useEffect(() => {
    const handleResize = () => {
      console.log('Resizing');
      if (window.matchMedia('(orientation: portrait)').matches) {
        console.log('Is Mobile');
        setMaxIndex(Math.max(0, cards.length - 1));
        setPercent(1);
      } else {
        setMaxIndex(Math.max(0, cards.length - visibleCount));
        setPercent(visibleCount);
      }
      if (divRef.current) {
        divRef.current.style.transform = 'translate(0%)';
      }
      setIndex(0);
      setNext(true);
      setPrev(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const clampedSetIndex = useCallback(
    (next: number) => {
      console.log('Here!!!!');
      if (window.matchMedia('(orientation: portrait)').matches) {
        console.log('Is Mobile');
        setMaxIndex(Math.max(0, cards.length - 1));
        setPercent(1);
      } else {
        setMaxIndex(Math.max(0, cards.length - visibleCount));
        setPercent(visibleCount);
      }
      setIndex(Math.max(0, Math.min(maxIndex, next)));
      setNext(next < maxIndex);
      setPrev(next > 0);
    },
    [maxIndex],
  );

  const articleStyle = `shrink-0 p-4 portrait:w-full landscape:w-1/5`;

  return (
    <section
      className="w-full relative mt-4"
      aria-roledescription="carousel"
      aria-label="Card Gallery"
    >
      <div className="control-section relative">
        <div className="opacity-70 hidden">
          {currentIndex + 1} - {Math.min(currentIndex + visibleCount, cards.length)} /{' '}
          {cards.length}
        </div>
        <div className="absolute z-99 top-50 -left-2 landscape:top-40 landscape:-left-10">
          <button
            className="disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition"
            aria-label="Previous"
            disabled={!canPrev}
            onClick={() => clampedSetIndex(currentIndex - step)}
          >
            <Image
              src="/assets/images/icons/left-button.webp"
              width={44}
              height={44}
              className="object-cover"
              alt="Previous"
            />
          </button>
        </div>
        <div className="absolute z-99 top-50 -right-2 landscape:top-40 landscape:-right-10">
          <button
            className="disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition"
            aria-label="Next"
            disabled={!canNext}
            onClick={() => clampedSetIndex(currentIndex + step)}
          >
            <Image
              src="/assets/images/icons/right-button.webp"
              width={44}
              height={44}
              className="object-cover"
              alt="Previous"
            />
          </button>
        </div>
      </div>
      <div
        className="relative overflow-hidden container-section"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={divRef}
          className="section-to-move flex gap-0 transition-transform duration-300 ease-out"
          role="list"
          style={{ transform: `translateX(-${currentIndex * (100 / valueToMove)}%)` }}
        >
          {cards.map(({ cardTitle, cardImgSrc, cardImgAlt, cardDesc }, index) => {
            return (
              <article role="listitem" key={index} className={articleStyle}>
                <div className="relative w-full shadow">
                  <Bento
                    image={cardImgSrc}
                    imageAlt={cardImgAlt}
                    className="w-full object-cover aspect-[182/248]"
                  ></Bento>
                  <div className="mt-4">
                    <h4 className="text-lg-custom font-bold">{cardTitle}</h4>
                    <p className="text-sm-custom">{cardDesc}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CardGallery;
