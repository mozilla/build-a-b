/**
 * DataGrabMiniGame - Main container for Data Grab mini-game
 * Displays background, grid, cookies, and falling cards
 * All cards fall simultaneously - player must click fast!
 */

import { DATA_GRAB_ASSETS, DATA_GRAB_CONFIG } from '@/config/data-grab-config';
import { useGameStore } from '@/store';
import { type FC, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FallingCard } from './FallingCard';
import { DataCookie } from './DataCookie';

// Board dimensions (in rem)
const BOARD_WIDTH_REM = 25; // 25rem
const BOARD_HEIGHT_REM = 54; // 54rem
const ROW_SEPARATION_REM = BOARD_HEIGHT_REM * 0.5; // 50% of board height = 27rem
const CARD_HEIGHT_REM = 10.5; // 168px = 10.5rem (used for wrapper height calculation)

interface CardPosition {
  x: number; // Base X position in rem
  y: number; // Y position in rem (relative to wrapper)
  translateX: number; // Random offset in rem (-3.75 to 3.75)
  translateY: number; // Random offset in rem (-6.25 to 6.25)
  rotation: number; // Rotation in degrees (-30 to 30)
}

/**
 * Calculate card rows following the pattern: 1-2-1-2-1-2...
 * First row has 1 card, second row has 2 cards, and so on
 */
const calculateCardRows = <T,>(cards: T[]): T[][] => {
  const rows: T[][] = [];
  let cardIndex = 0;
  let rowIndex = 0;

  while (cardIndex < cards.length) {
    const cardsInRow = rowIndex % 2 === 0 ? 1 : 2; // Alternating 1-2-1-2
    const rowCards = cards.slice(cardIndex, Math.min(cardIndex + cardsInRow, cards.length));
    rows.push(rowCards);
    cardIndex += rowCards.length;
    rowIndex++;
  }

  return rows;
};

/**
 * Generate positions for cards based on row structure
 * Rows alternate between 1 and 2 cards with 50% board height separation
 */
const generateCardPositions = (cardCount: number): CardPosition[] => {
  const positions: CardPosition[] = [];
  const cards = Array.from({ length: cardCount }, (_, i) => i);
  const rows = calculateCardRows(cards);

  rows.forEach((rowCards, rowIndex) => {
    const yPosition = rowIndex * ROW_SEPARATION_REM;
    const cardsInRow = rowCards.length;

    rowCards.forEach((_, cardIndexInRow) => {
      // Base X position
      let baseX: number;
      if (cardsInRow === 1) {
        // 1-card row: centered at 50%
        baseX = BOARD_WIDTH_REM * 0.5;
      } else {
        // 2-card row: positioned at 25% and 75%
        baseX = cardIndexInRow === 0 ? BOARD_WIDTH_REM * 0.25 : BOARD_WIDTH_REM * 0.75;
      }

      // Random offsets
      const translateX = -3.75 + Math.random() * 7.5; // -3.75rem to 3.75rem
      const translateY = -6.25 + Math.random() * 12.5; // -6.25rem to 6.25rem
      const rotation = -30 + Math.random() * 60; // -30deg to 30deg

      positions.push({
        x: baseX,
        y: yPosition,
        translateX,
        translateY,
        rotation,
      });
    });
  });

  return positions;
};

export const DataGrabMiniGame: FC = () => {
  const dataGrabGameActive = useGameStore((state) => state.dataGrabGameActive);
  const dataGrabCards = useGameStore((state) => state.dataGrabCards);
  const collectDataGrabCard = useGameStore((state) => state.collectDataGrabCard);
  const collectedByPlayer = useGameStore((state) => state.dataGrabCollectedByPlayer);
  const collectedByCPU = useGameStore((state) => state.dataGrabCollectedByCPU);
  const showDataGrabCookies = useGameStore((state) => state.showDataGrabCookies);

  // Generate positions once when cards are loaded
  const cardPositions = useMemo(
    () => generateCardPositions(dataGrabCards.length),
    [dataGrabCards.length],
  );

  // Calculate wrapper height and animation parameters
  const animationParams = useMemo(() => {
    const numRows = calculateCardRows(dataGrabCards).length;
    const wrapperHeight = (numRows - 1) * ROW_SEPARATION_REM + CARD_HEIGHT_REM;
    const startY = -(wrapperHeight + CARD_HEIGHT_REM); // Start fully above viewport
    const endY = BOARD_HEIGHT_REM + CARD_HEIGHT_REM; // End fully below viewport

    return {
      wrapperHeight,
      startY,
      endY,
    };
  }, [dataGrabCards.length]);

  if (!dataGrabGameActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Board-sized container matching game board */}
      <div className="relative w-full h-full max-w-[25rem] max-h-[54rem] overflow-hidden">
        {/* Background Image (Static) - Single image covering full area */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${DATA_GRAB_ASSETS.BACKGROUND_IMAGE})`,
          }}
        />

        {/* Grid Overlay (Static) - Repeating pattern */}
        <div
          className="absolute inset-0 bg-repeat bg-cover"
          style={{
            backgroundImage: `url(${DATA_GRAB_ASSETS.GRID_OVERLAY})`,
          }}
        />

        {/* Floating Data Cookies - Controlled by debug toggle */}
        {showDataGrabCookies && (
          <div className="absolute inset-0 z-10">
            {Array.from({ length: DATA_GRAB_CONFIG.COOKIE_COUNT }).map((_, index) => (
              <DataCookie
                key={`cookie-${index}`}
                index={index}
                totalCookies={DATA_GRAB_CONFIG.COOKIE_COUNT}
              />
            ))}
          </div>
        )}

        {/* Falling Cards (Layer 3) - Cards in animated wrapper */}
        <motion.div
          className="absolute z-20"
          style={{
            width: '100%',
            height: `${animationParams.wrapperHeight}rem`,
          }}
          initial={{
            y: `${animationParams.startY}rem`,
          }}
          animate={{
            y: `${animationParams.endY}rem`,
          }}
          transition={{
            duration: DATA_GRAB_CONFIG.CARD_FALL_SPEED / 1000,
            ease: 'linear',
          }}
        >
          {dataGrabCards.map((playedCardState, index) => (
            <FallingCard
              key={playedCardState.card.id}
              playedCardState={playedCardState}
              position={cardPositions[index]}
              onCollect={collectDataGrabCard}
              collectedByPlayer={collectedByPlayer}
              collectedByCPU={collectedByCPU}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};
