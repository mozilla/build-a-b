/**
 * FallingCard - Interactive falling card for Data Grab mini-game
 * Falls from top to bottom, player can tap to collect
 * Any card not tapped goes to CPU automatically
 * Preserves face-up/face-down state from game
 */

import { useState, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LottieAnimation } from '@/components/LottieAnimation';
import { DATA_GRAB_CONFIG } from '@/config/data-grab-config';
import { CARD_BACK_IMAGE } from '@/config/game-config';
import type { PlayedCardState } from '@/types';
import confettiAnimation from '@/assets/animations/effects/win-confetti.json';

interface CardPosition {
  x: number; // Base X position in rem
  y: number; // Y position in rem (relative to wrapper)
  translateX: number; // Random offset in rem (-3.75 to 3.75)
  translateY: number; // Random offset in rem (-6.25 to 6.25)
  rotation: number; // Rotation in degrees (-30 to 30)
}

interface FallingCardProps {
  playedCardState: PlayedCardState;
  position: CardPosition;
  onCollect: (cardId: string, collectedBy: 'player' | 'cpu') => void;
  collectedByPlayer: PlayedCardState[];
  collectedByCPU: PlayedCardState[];
}

export const FallingCard: FC<FallingCardProps> = ({
  playedCardState,
  position,
  onCollect,
  collectedByPlayer,
  collectedByCPU,
}) => {
  const [showPoof, setShowPoof] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

  const { card, isFaceDown } = playedCardState;

  // Check if this card has been collected
  const isCollected =
    collectedByPlayer.some((pcs) => pcs.card.id === card.id) ||
    collectedByCPU.some((pcs) => pcs.card.id === card.id);

  // Determine card image (back or front) based on face-up/down state
  const cardImage = isFaceDown ? CARD_BACK_IMAGE : card.imageUrl;

  // Handle player tap/click
  const handleClick = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isCollected) return;

    console.log('[FallingCard] Card clicked:', card.name, card.id);

    setShowPoof(true);

    // Get click position for poof animation
    const rect = event.currentTarget.getBoundingClientRect();
    setClickPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });

    // Call collect action - player collected
    console.log('[FallingCard] Calling onCollect for player');
    onCollect(card.id, 'player');

    // Hide poof after animation duration
    setTimeout(() => {
      setShowPoof(false);
    }, DATA_GRAB_CONFIG.POOF_DURATION);
  };

  if (isCollected && !showPoof) return null;

  return (
    <>
      {/* Card positioned within wrapper - larger clickable area to account for rotation */}
      <motion.div
        className="absolute cursor-pointer w-[10rem] h-[13rem] flex items-center justify-center origin-center transition-opacity duration-150"
        style={{
          left: `${position.x}rem`,
          top: `${position.y}rem`,
          transform: `translate(calc(${position.translateX}rem - 1.25rem), calc(${position.translateY}rem - 1.25rem)) rotate(${position.rotation}deg)`,
          opacity: isCollected ? 0 : 1,
          pointerEvents: isCollected ? 'none' : 'auto',
        }}
        onClick={handleClick}
        onTouchEnd={handleClick}
      >
        {/* Actual card image - centered within clickable area */}
        <img
          src={cardImage}
          alt={isFaceDown ? 'Face-down card' : card.name}
          className="w-[7.5rem] h-[10.5rem] object-cover rounded-lg shadow-2xl pointer-events-none"
        />
      </motion.div>

      {/* Poof Animation */}
      <AnimatePresence>
        {showPoof && (
          <motion.div
            className="fixed pointer-events-none w-[150px] h-[150px] -translate-x-1/2 -translate-y-1/2 z-30"
            style={{
              left: `${clickPosition.x}px`,
              top: `${clickPosition.y}px`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <LottieAnimation
              animationData={confettiAnimation}
              loop={false}
              autoplay={true}
              width={150}
              height={150}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
