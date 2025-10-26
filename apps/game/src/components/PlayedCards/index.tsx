import type { FC } from 'react';
import { CARD_BACK_IMAGE } from '../../config/game-config';
import { Card } from '../Card';
import type { PlayedCardsProps } from './types';

const ANIMATION_DELAYS = {
  CARD_ROTATION: 500,
  CARD_SLIDE: 300,
} as const;

export const PlayedCards: FC<PlayedCardsProps> = ({ cards = [] }) => {
  return (
    <div className="h-[10.9375rem] w-[8.125rem] max-w-[125px] max-h-[175px] flex items-center justify-center relative">
      {cards.map((playedCardState, index) => {
        const isTopCard = index === cards.length - 1;
        // Top card stays straight, cards underneath get subtle rotation (-5 to +5)
        const rotations = [
          '-rotate-3',
          'rotate-2',
          '-rotate-1',
          'rotate-3',
          'rotate-1',
          '-rotate-2',
        ];
        const rotationClass = isTopCard
          ? 'rotate-0'
          : rotations[(playedCardState.card.id.charCodeAt(0) + index * 7) % rotations.length];

        // Delay rotation for previous cards when new card lands
        const rotationDelay = isTopCard ? 0 : ANIMATION_DELAYS.CARD_ROTATION; // Rotate after new card's animation

        // Show card back for face-down cards, card front for face-up
        const cardImage = playedCardState.isFaceDown
          ? CARD_BACK_IMAGE
          : playedCardState.card.imageUrl;

        return (
          <div
            key={`${playedCardState.card.id}-${index}`}
            className={`absolute ${isTopCard ? 'animate-slide-from-top' : ''} ${rotationClass}`}
            style={{
              zIndex: index,
              transition: `transform 600ms ease-out ${rotationDelay}ms`,
            }}
          >
            <Card cardFrontSrc={cardImage} state="flipped" />
          </div>
        );
      })}
    </div>
  );
};
