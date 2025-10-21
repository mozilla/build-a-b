import type { FC } from 'react';
import { motion } from 'framer-motion';
import type { CardProps } from './types';
import CardBack from '../../assets/card-back.webp';

export const Card: FC<CardProps> = ({
  cardFrontSrc,
  state = 'initial',
  onBackClick,
  onFrontClick,
  positions,
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

  return (
    <motion.div
      className="cursor-pointer"
      onClick={handleClick}
      animate={{
        x: currentPosition.x,
        y: currentPosition.y,
        width: isFrontVisible ? '7.8125rem' : '5.375rem',
        height: isFrontVisible ? '10.9375rem' : '7.5rem',
      }}
      transition={{
        duration: 0.7,
        ease: 'easeInOut',
      }}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d]"
        animate={{
          rotateY: isFrontVisible ? 180 : 0,
        }}
        transition={{
          duration: 0.7,
          ease: 'easeInOut',
        }}
      >
        {/* Back face */}
        <div className="absolute w-full h-full backface-hidden">
          <img src={CardBack} alt="Card back" className="w-full h-full object-cover rounded-lg" />
        </div>

        {/* Front face */}
        <div className="absolute w-full h-full backface-hidden [transform:rotateY(180deg)]">
          <img
            src={cardFrontSrc}
            alt="Card front"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
