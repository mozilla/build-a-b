/**
 * CardCarousel - Reusable Swiper-based carousel for displaying cards
 * Extracted from OpenWhatYouWantModal for reuse in EffectNotificationModal
 */

import { CARD_BACK_IMAGE } from '@/config/game-config';
import { capitalize } from '@/utils/capitalize';
import { useEffect, useMemo, useRef } from 'react';
import { A11y, Keyboard } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { SwiperOptions, Swiper as SwiperType } from 'swiper/types';

import { TRACKS } from '@/config/audio-config';
import { useGameStore } from '@/store';
import 'swiper/css';
import type { CardCarouselProps } from './types';

export const CardCarousel = ({
  cards,
  selectedCard,
  onCardSelect,
  onCardClick,
  renderCardContent,
  className = '',
  faceDownCardIds,
  glowCardIds,
  scaleSelectedCards = false,
  swiperOptions = {},
  cardClassName,
  cardRotation = 'rotate-[-15deg]',
}: CardCarouselProps) => {
  const { playAudio } = useGameStore();
  const swiperRef = useRef<SwiperType | null>(null);
  const defaultOptions: Partial<SwiperOptions> = useMemo(
    () => ({
      modules: [A11y, Keyboard],
      centeredSlides: true,
      spaceBetween: -80, // Negative spacing creates visual card overlap
      slidesPerView: 1,
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
      ...swiperOptions, // Allow custom options to override defaults
    }),
    [swiperOptions],
  );

  // Generate descriptive alt text for card images
  const getCardAltText = (card: (typeof cards)[0]): string => {
    // Special cards display their name below, so just use type + value
    if (card.specialType) {
      return `${capitalize(card.specialType)} card`;
    }
    // Regular cards need more description
    return `Regular card with value ${card.value}`;
  };

  // Get initial slide index based on selectedCard
  const initialSlide = selectedCard ? cards.findIndex((c) => c.id === selectedCard.id) : 0;

  // Navigate to selected card when it changes externally
  useEffect(() => {
    if (swiperRef.current && selectedCard) {
      const targetIndex = cards.findIndex((c) => c.id === selectedCard.id);
      if (targetIndex !== -1 && targetIndex !== swiperRef.current.activeIndex) {
        swiperRef.current.slideTo(targetIndex);
      }
    }
  }, [selectedCard, cards]);

  return (
    <div className={`w-full ${className}`}>
      <Swiper
        {...defaultOptions}
        initialSlide={Math.max(0, initialSlide)}
        onSlideChange={(swiper) => {
          const currentCard = cards[swiper.activeIndex];
          if (currentCard) {
            onCardSelect(currentCard);
          }
          playAudio(TRACKS.OPTION_FOCUS);
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        className="w-full h-[25rem]"
      >
        {cards.map((card) => {
          const isFaceDown = faceDownCardIds?.has(card.id) ?? false;
          const isSelected = glowCardIds?.has(card.id) ?? false;
          const cardImage = isFaceDown ? CARD_BACK_IMAGE : card.imageUrl;

          return (
            <SwiperSlide key={card.id}>
              <div
                className={`flex flex-col items-center justify-center h-full cursor-pointer transition-transform duration-200 ${cardRotation} ${
                  cardClassName || ''
                } ${scaleSelectedCards ? (isSelected ? 'scale-100' : 'scale-[0.8]') : ''}`}
                onClick={() => (onCardClick ? onCardClick(card) : onCardSelect(card))}
              >
                <div
                  className={`relative w-[15.3125rem] h-[21.4375rem] rounded-lg overflow-hidden shadow-2xl`}
                  style={
                    !scaleSelectedCards && isSelected
                      ? { boxShadow: 'inset 0 0 0 3px #49C1B4, 0 0 0.5rem #49C1B4' }
                      : undefined
                  }
                >
                  <img
                    src={cardImage}
                    alt={isFaceDown ? 'Face-down card' : getCardAltText(card)}
                    className="w-full h-full object-cover"
                  />
                </div>
                {renderCardContent && renderCardContent(card)}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};
