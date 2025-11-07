import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import type { FC } from 'react';
import CardBack from '../../assets/cards/card-back.webp';
import type { CardProps } from './types';

export const Card: FC<CardProps> = ({
  cardFrontSrc,
  state = 'initial',
  onBackClick,
  onFrontClick,
  positions,
  fullSize = false,
  ...dataAttributes
}) => {
  const handleClick = () => {
    if (state === 'initial') {
      // Card is in initial state, showing back - call back click handler
      onBackClick?.();
    } else if (state === 'flipped' || state === 'final') {
      // Card is flipped or in final state - call front click handler
      onFrontClick?.();
    }
  };

  const isFrontVisible = state === 'flipped' || state === 'final';
  const currentPosition = positions?.[state] ?? { x: 0, y: 0 };

  // Determine if card should be full size
  const isFullSize = fullSize || isFrontVisible;

  return (
    <motion.div
      {...dataAttributes}
      className={cn(
        'cursor-pointer origin-center perspective-distant',
        isFullSize
          ? 'max-w-[125px] w-[7.8125rem] max-h-[175px] h-[10.9375rem]'
          : 'max-w-[86px] w-[5.375rem] max-h-[120px] h-[7.5rem]',
      )}
      onClick={handleClick}
      animate={{
        x: currentPosition.x,
        y: currentPosition.y,
        scale: isFullSize ? 1 : 0.688,
      }}
      transition={{ duration: ANIMATION_DURATIONS.CARD_FLIP / 1000, ease: 'easeInOut' }}
    >
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d] overflow-visible backface-hidden"
        animate={{
          rotateY: isFrontVisible ? 180 : 0,
        }}
        transition={{ duration: ANIMATION_DURATIONS.CARD_FLIP / 1000, ease: 'easeInOut' }}
      >
        {/* Back face */}
        <div className="absolute w-full h-full backface-hidden overflow-visible">
          <img src={CardBack} alt="Card back" className="w-full h-full object-contain" />
        </div>

        {/* Front face */}
        <div className="absolute w-full h-full backface-hidden overflow-visible [transform:rotateY(180deg)]">
          <img src={cardFrontSrc} alt="Card front" className="w-full h-full object-contain" />
        </div>
      </motion.div>
    </motion.div>
  );
};
