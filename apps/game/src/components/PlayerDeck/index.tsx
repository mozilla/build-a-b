import { BILLIONAIRES } from '@/config/billionaires';
import { useEffect, useRef, useState, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeckPile } from '../DeckPile';
import { TurnValue } from '../TurnValue';
import type { PlayerDeckProps } from './types';
import { useGameStore, usePlayer } from '@/stores/game-store';
import { Text } from '@/components';

export const PlayerDeck: FC<PlayerDeckProps> = ({
  deckLength,
  handleDeckClick,
  turnValue,
  turnValueState,
  owner,
  tooltipContent,
  billionaireId,
}) => {
  const currentBillionaire = BILLIONAIRES.find((b) => b.id === billionaireId);
  const player = usePlayer();
  const cpu = useGameStore((state) => state.cpu);

  // Get the correct player based on owner prop
  const currentPlayer = owner === 'player' ? player : cpu;
  const prevDeckLength = useRef(currentPlayer.deck.length);
  const [showWinEffect, setShowWinEffect] = useState(false);

  useEffect(() => {
    // Skip animation if this is initial deck setup (deck was empty or very small)
    const isInitialSetup = prevDeckLength.current < 10;

    // This player won the turn if their deck grew by more than 1 card
    if (!isInitialSetup && currentPlayer.deck.length > prevDeckLength.current + 1) {
      // Trigger win animation
      setShowWinEffect(true);

      // Reset after complete animation sequence
      const timer = setTimeout(() => {
        setShowWinEffect(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
    prevDeckLength.current = currentPlayer.deck.length;
  }, [currentPlayer.deck.length]);

  return (
    <div className="grid grid-cols-3 place-items-center w-full">
      {/** Avatar */}
      {currentBillionaire ? (
        <div className="relative w-[6.5rem] h-[6.5rem] max-w-[104px] max-h-[104px] mr-2">
          {/* Avatar with scale animation */}
          <motion.div
            className="w-full h-full rounded-full overflow-hidden border-2 border-transparent"
            animate={{
              scale: showWinEffect ? 1.2 : 1,
            }}
            transition={{
              duration: 0.3,
              ease: 'easeOut',
            }}
          >
            <img
              src={currentBillionaire.imageSrc}
              alt={currentBillionaire.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Win effect overlay */}
          <AnimatePresence>
            {showWinEffect && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-[93%] h-[93%] rounded-full bg-[#f5b727] flex items-center justify-center shadow-lg">
                  <motion.span
                    initial={{ scale: 1 }}
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.5,
                      ease: 'easeInOut',
                    }}
                  >
                    <Text variant='body-medium' className="text-black font-bold">Win!</Text>
                  </motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div />
      )}
      {/** Deck */}
      <DeckPile
        cardCount={deckLength}
        owner={owner}
        onClick={handleDeckClick}
        showTooltip={!!tooltipContent}
        tooltipContent={tooltipContent}
        activeIndicator={!!tooltipContent && owner === 'player'}
      />
      {/** Turn points */}
      <TurnValue value={turnValue} state={turnValueState} />
    </div>
  );
};
