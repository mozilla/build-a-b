/**
 * DeckPile - Displays a deck of cards with card back and counter
 */

import { type FC } from 'react';
import { CARD_BACK_IMAGE } from '../../config/game-config';
import { Card } from '../Card';
import { Tooltip } from '../Tooltip';
import type { DeckPileProps } from './types';
import Text from '../Text';

export const DeckPile: FC<DeckPileProps> = ({
  cardCount,
  owner,
  onClick,
  showTooltip = false,
  tooltipContent,
  activeIndicator = false,
}) => {
  const isPlayer = owner === 'player';

  return (
    <Tooltip
      content={
        <Text variant="body-small" color="text-accent" weight='medium'>
          {tooltipContent}
        </Text>
      }
      isOpen={showTooltip}
    >
      <div className="flex flex-col items-center gap-2">
        {/* Counter for CPU (top) */}
        {!isPlayer && <div className="text-white text-sm font-medium">{cardCount} Cards left</div>}

        {/* Card stack */}
        <div
          className="relative p-2"
          onClick={cardCount > 0 ? onClick : undefined}
          role={cardCount > 0 ? 'button' : undefined}
          tabIndex={cardCount > 0 ? 0 : undefined}
        >
          {/* Show stacked effect if cards > 0 */}
          {cardCount > 0 ? (
            <div className={`relative ${activeIndicator ? 'animate-heartbeat' : ''}`}>
              {/* Back cards for stacking effect - offset to top-left */}
              <div className="absolute -translate-x-2 -translate-y-2 pointer-events-none">
                <Card cardFrontSrc={CARD_BACK_IMAGE} state="initial" />
              </div>
              <div className="absolute -translate-x-1 -translate-y-1 pointer-events-none">
                <Card cardFrontSrc={CARD_BACK_IMAGE} state="initial" />
              </div>
              {/* Top card (main visible card) */}
              <Card cardFrontSrc={CARD_BACK_IMAGE} state="initial" />
            </div>
          ) : (
            /* Empty deck indicator */
            <div className="w-[7.5rem] h-[10.5rem] rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center">
              <span className="text-white/50 text-xs">Empty</span>
            </div>
          )}
        </div>

        {/* Counter for Player (bottom) */}
        {isPlayer && <div className="text-white text-sm font-medium">{cardCount} Cards left</div>}
      </div>
    </Tooltip>
  );
};
