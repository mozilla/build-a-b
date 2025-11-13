/**
 * CardCarousel - Reusable Swiper-based carousel for displaying cards
 * Extracted from OpenWhatYouWantModal for reuse in EffectNotificationModal
 */

import { useMemo } from 'react';
import { A11y, Keyboard } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { SwiperOptions } from 'swiper/types';
import { capitalize } from '@/utils/capitalize';
import { CARD_BACK_IMAGE } from '@/config/game-config';

import 'swiper/css';
import type { CardCarouselProps } from './types';

export const CardCarousel = ({
  cards,
  selectedCard,
  onCardSelect,
  renderCardContent,
  className = '',
  faceDownCardIds,
}: CardCarouselProps) => {
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
    }),
    [],
  );

  // Generate descriptive alt text for card images
  const getCardAltText = (card: typeof cards[0]): string => {
    // Special cards display their name below, so just use type + value
    if (card.specialType) {
      return `${capitalize(card.specialType)} card`;
    }
    // Regular cards need more description
    return `Regular card with value ${card.value}`;
  };

  // Get initial slide index based on selectedCard
  const initialSlide = selectedCard ? cards.findIndex((c) => c.id === selectedCard.id) : 0;

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
        }}
        className="w-full h-[400px]"
      >
        {cards.map((card) => {
          const isFaceDown = faceDownCardIds?.has(card.id) ?? false;
          const cardImage = isFaceDown ? CARD_BACK_IMAGE : card.imageUrl;

          return (
            <SwiperSlide key={card.id}>
              <div
                className="flex flex-col items-center justify-center h-full cursor-pointer transition-transform duration-200 rotate-[-15deg]"
                onClick={() => onCardSelect(card)}
              >
                <div className="relative w-[15.3125rem] h-[21.4375rem] max-w-[245px] max-h-[343px] rounded-lg overflow-hidden shadow-2xl">
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
