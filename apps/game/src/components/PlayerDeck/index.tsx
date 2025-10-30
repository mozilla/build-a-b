import { Text } from '@/components';
import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import { useGameStore, usePlayer } from '@/store';
import { getBillionaireById } from '@/utils/selectors';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type FC } from 'react';
import { DeckPile } from '../DeckPile';
import { TurnValue } from '../TurnValue';
import type { PlayerDeckProps } from './types';

export const PlayerDeck: FC<PlayerDeckProps> = ({
  deckLength,
  handleDeckClick,
  turnValue,
  turnValueState,
  owner,
  tooltipContent,
  billionaireId,
}) => {
  const currentBillionaire = getBillionaireById(billionaireId);
  const player = usePlayer();
  const cpu = useGameStore((state) => state.cpu);
  const forcedEmpathySwapping = useGameStore((state) => state.forcedEmpathySwapping);
  const decksVisuallySwapped = useGameStore((state) => state.decksVisuallySwapped);

  // Get the correct player based on owner prop
  const currentPlayer = owner === 'player' ? player : cpu;
  const prevDeckLength = useRef(currentPlayer.deck.length);
  const [showWinEffect, setShowWinEffect] = useState(false);
  const isAnimatingRef = useRef(false); // Prevent multiple animations
  const timersRef = useRef<{ show?: number; hide?: number }>({});

  useEffect(() => {
    const currentLength = currentPlayer.deck.length;
    const previousLength = prevDeckLength.current;

    // Skip animation if:
    // - This is initial deck setup (deck was empty or very small)
    // - Deck didn't grow by more than 1 card
    const isInitialSetup = previousLength < 10;
    const deckGrew = currentLength > previousLength + 1;

    // If deck changes while animation is running, cancel current animation
    if (isAnimatingRef.current && currentLength !== previousLength) {
      // Clear any pending timers
      if (timersRef.current.show) clearTimeout(timersRef.current.show);
      if (timersRef.current.hide) clearTimeout(timersRef.current.hide);

      // Reset animation state
      setShowWinEffect(false);
      isAnimatingRef.current = false;
      timersRef.current = {};
    }

    if (!isInitialSetup && deckGrew && !isAnimatingRef.current) {
      // Mark that animation is running
      isAnimatingRef.current = true;

      // Delay before showing win animation (wait for cards to finish collecting)
      timersRef.current.show = setTimeout(() => {
        setShowWinEffect(true);
      }, ANIMATION_DURATIONS.WIN_EFFECT_DELAY);

      // Reset after complete animation sequence (longer duration for better visibility)
      timersRef.current.hide = setTimeout(() => {
        setShowWinEffect(false);
        // Reset the animation flag so it can trigger again next time
        isAnimatingRef.current = false;
        timersRef.current = {};
      }, ANIMATION_DURATIONS.WIN_EFFECT_DURATION);

      // Update the previous deck length only after animation is triggered
      prevDeckLength.current = currentLength;

      return () => {
        if (timersRef.current.show) clearTimeout(timersRef.current.show);
        if (timersRef.current.hide) clearTimeout(timersRef.current.hide);
      };
    }

    // Always update prevDeckLength if we didn't trigger animation
    // This prevents triggering on every small change
    if (!isAnimatingRef.current) {
      prevDeckLength.current = currentLength;
    }
  }, [currentPlayer.deck.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timersRef.current.show) clearTimeout(timersRef.current.show);
      if (timersRef.current.hide) clearTimeout(timersRef.current.hide);
      isAnimatingRef.current = false;
      setShowWinEffect(false);
    };
  }, []);

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
                <div className="w-[93%] h-[93%] rounded-full bg-gradient-to-b from-[#FF6B4A] to-[#FFD54F] flex items-center justify-center shadow-lg">
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
                    <Text variant="body-medium" className="text-black font-bold">
                      Win!
                    </Text>
                  </motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div />
      )}
      {/** Deck - wrapped in motion for swap animation */}
      <DeckPile
        cardCount={deckLength}
        owner={owner}
        onClick={handleDeckClick}
        showTooltip={!!tooltipContent}
        tooltipContent={tooltipContent}
        activeIndicator={!!tooltipContent && owner === 'player'}
        forcedEmpathySwapping={forcedEmpathySwapping}
        decksVisuallySwapped={decksVisuallySwapped}
      />
      {/** Turn points */}
      <TurnValue value={turnValue} state={turnValueState} />
    </div>
  );
};
