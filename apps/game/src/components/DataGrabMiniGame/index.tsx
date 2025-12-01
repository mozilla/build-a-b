/**
 * DataGrabMiniGame - Main container for Data Grab mini-game
 * Displays background, grid, cookies, and falling cards
 * All cards fall simultaneously - player must click fast!
 */

import { DATA_GRAB_ASSETS, DATA_GRAB_CONFIG } from '@/config/data-grab-config';
import { GameMachineContext } from '@/providers/GameProvider';
import { useGameStore } from '@/store';
// import { motion } from 'framer-motion';
import { type FC, useMemo, useEffect } from 'react';
import { DataCookie } from './DataCookie';
import { FallingCard } from './FallingCard';

// Board dimensions (in rem)
const BOARD_WIDTH_REM = 25; // 25rem
// const BOARD_HEIGHT_REM = 54; // 54rem
// const CARD_WIDTH_REM = 7.5; // Card width for visibility calculations
// const CARD_HEIGHT_REM = 10.5; // Card height
const EDGE_BUFFER_PERCENT = 0.25; // Keep cards 25% away from left and right edges

interface CardPosition {
  x: number; // X position in rem (ensuring 66% visibility)
  translateX: number; // Random offset in rem (-3.75 to 3.75)
  translateY: number; // Random offset in rem (-6.25 to 6.25)
  rotation: number; // Rotation in degrees (-30 to 30)
  delay: number; // Animation delay in seconds
  duration: number; // Animation duration in seconds (variable speed)
}

/**
 * Generate positions and animation parameters for cards
 * Each card gets random X position (staying 25% away from edges), rotation, and variable speed/delay
 */
const generateCardPositions = (cardCount: number): CardPosition[] => {
  const positions: CardPosition[] = [];
  
  // Calculate safe X position range - 25% from edges, accounting for random offsets
  const edgeBuffer = BOARD_WIDTH_REM * EDGE_BUFFER_PERCENT; // 6.25rem from each edge
  const maxTranslateX = 3.75; // Maximum horizontal offset
  
  // Base X position range that ensures card + offset stays within bounds
  const minX = edgeBuffer + maxTranslateX; // 6.25 + 3.75 = 10rem
  const maxX = BOARD_WIDTH_REM - edgeBuffer - maxTranslateX; // 25 - 6.25 - 3.75 = 15rem
  
  let cumulativeDelay = DATA_GRAB_CONFIG.INITIAL_CARD_DELAY_MS;

  for (let i = 0; i < cardCount; i++) {
    // Random X position within safe zone
    const x = minX + Math.random() * (maxX - minX);
    
    // Random offsets (now guaranteed to keep card within 25% edge buffer)
    const translateX = -maxTranslateX + Math.random() * (maxTranslateX * 2); // -3.75rem to 3.75rem
    const translateY = -6.25 + Math.random() * 12.5; // -6.25rem to 6.25rem
    const rotation = -30 + Math.random() * 60; // -30deg to 30deg
    
    // Variable speed: base duration ±CARD_SPEED_VARIATION_PERCENT
    const speedVariation = 1 + ((Math.random() * 2 - 1) * DATA_GRAB_CONFIG.CARD_SPEED_VARIATION_PERCENT / 100);
    const duration = (DATA_GRAB_CONFIG.CARD_FALL_DURATION_MS * speedVariation) / 1000; // Convert to seconds
    
    positions.push({
      x,
      translateX,
      translateY,
      rotation,
      delay: cumulativeDelay / 1000, // Convert to seconds for Framer Motion
      duration,
    });
    
    // Add random delay increment for next card
    const delayIncrement = 
      DATA_GRAB_CONFIG.CARD_DELAY_INCREMENT_MIN_MS + 
      Math.random() * (DATA_GRAB_CONFIG.CARD_DELAY_INCREMENT_MAX_MS - DATA_GRAB_CONFIG.CARD_DELAY_INCREMENT_MIN_MS);
    cumulativeDelay += delayIncrement;
  }

  return positions;
};

export const DataGrabMiniGame: FC = () => {
  const actorRef = GameMachineContext.useActorRef();
  const dataGrabGameActive = useGameStore((state) => state.dataGrabGameActive);
  const dataGrabCards = useGameStore((state) => state.dataGrabCards);
  const collectDataGrabCard = useGameStore((state) => state.collectDataGrabCard);
  const collectedByPlayer = useGameStore((state) => state.dataGrabCollectedByPlayer);
  const collectedByCPU = useGameStore((state) => state.dataGrabCollectedByCPU);
  const showDataGrabCookies = useGameStore((state) => state.showDataGrabCookies);
  const showMenu = useGameStore((state) => state.showMenu);

  // Generate positions once when cards are loaded
  const cardPositions = useMemo(
    () => generateCardPositions(dataGrabCards.length),
    [dataGrabCards.length],
  );

  // Handle card reaching bottom (uncollected)
  const handleCardReachBottom = (cardId: string) => {
    // Auto-collect for CPU if not already collected
    const isCollected =
      collectedByPlayer.some((pcs) => pcs.card.id === cardId) ||
      collectedByCPU.some((pcs) => pcs.card.id === cardId);
    
    if (!isCollected) {
      collectDataGrabCard(cardId, 'cpu');
    }
  };

  // Check if game should end (all cards collected or reached bottom)
  useEffect(() => {
    if (!dataGrabGameActive) return;

    const totalCollected = collectedByPlayer.length + collectedByCPU.length;
    const allCardsProcessed = totalCollected === dataGrabCards.length;

    if (allCardsProcessed) {
      // End the game when all cards are processed
      useGameStore.getState().setDataGrabGameActive(false);
      // Send event to state machine to immediately show results modal
      actorRef.send({ type: 'DATA_GRAB_GAME_COMPLETE' });
    }
  }, [dataGrabGameActive, collectedByPlayer.length, collectedByCPU.length, dataGrabCards.length, actorRef]);

  // Hide mini game when menu is open (gameplay is paused)
  if (!dataGrabGameActive || showMenu) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-data-grab-game)] flex items-center justify-center">
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

        {/* Falling Cards (Layer 3) - Individual animated cards */}
        <div className="absolute inset-0 z-20">
          {dataGrabCards.map((playedCardState, index) => (
            <FallingCard
              key={playedCardState.card.id}
              playedCardState={playedCardState}
              position={cardPositions[index]}
              onCollect={collectDataGrabCard}
              onReachBottom={handleCardReachBottom}
              collectedByPlayer={collectedByPlayer}
              collectedByCPU={collectedByCPU}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
