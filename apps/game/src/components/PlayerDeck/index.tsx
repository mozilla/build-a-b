import { SpecialCardAnimation, Text } from '@/components';
import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import { useGameStore, usePlayer } from '@/store';
import type { PlayerType } from '@/types';
import { cn } from '@/utils/cn';
import { getBillionaireById } from '@/utils/selectors';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type FC } from 'react';
import winConfettiAnimation from '../../assets/animations/effects/win-confetti.json';
import { DeckPile } from '../DeckPile';
import { LaunchStackIndicator } from '../LaunchStackIndicator';
import { LottieAnimation } from '../LottieAnimation';
import { TurnValue } from '../TurnValue';
import type { PlayerDeckProps } from './types';
import { SUPABASE_BASE_URL } from '@/config/special-effect-animations';

type Containers = {
  avatar: string;
  deck: string;
  turnValue: string;
  cardCount: string;
};

const gridLayoutMap: Record<PlayerType, Containers> = {
  player: {
    avatar: 'row-4 col-1',
    deck: 'row-4 col-2',
    turnValue: 'row-4 col-3',
    cardCount: 'row-5 col-2 self-center',
  },
  cpu: {
    cardCount: 'row-1 col-2 self-center',
    avatar: 'row-2 col-1',
    deck: 'row-2',
    turnValue: 'row-2 col-3',
  },
};

const launchStackAnimations: Record<PlayerType, string> = {
  player: `${SUPABASE_BASE_URL}won_launchstack_player.webm`,
  cpu: `${SUPABASE_BASE_URL}won_launchstack_cpu.webm`,
};

export const PlayerDeck: FC<PlayerDeckProps> = ({
  deckLength,
  handleDeckClick,
  turnValue,
  turnValueActiveEffects,
  owner,
  tooltipContent,
  billionaireId,
  activeIndicator = false,
}) => {
  const currentBillionaire = getBillionaireById(billionaireId);
  const player = usePlayer();
  const cpu = useGameStore((state) => state.cpu);
  const forcedEmpathySwapping = useGameStore((state) => state.forcedEmpathySwapping);
  const deckSwapCount = useGameStore((state) => state.deckSwapCount);
  const isSwapped = deckSwapCount % 2 === 1;
  // Get the correct player based on owner prop
  const currentPlayer = owner === 'player' ? player : cpu;
  // When swapped, use the opposite owner for grid positioning
  const layoutOwner = isSwapped ? (owner === 'player' ? 'cpu' : 'player') : owner;

  const prevDeckLength = useRef(currentPlayer.deck.length);
  const prevDeckSwapCount = useRef(deckSwapCount);
  const [showWinEffect, setShowWinEffect] = useState(false);
  const isAnimatingRef = useRef(false); // Prevent multiple animations
  const timersRef = useRef<{ show?: number; hide?: number }>({});

  useEffect(() => {
    const currentLength = currentPlayer.deck.length;
    const previousLength = prevDeckLength.current;

    // Detect if a deck swap just happened
    const deckSwapJustHappened = deckSwapCount !== prevDeckSwapCount.current;

    // If deck swap just happened, reset prevDeckLength and skip this render
    if (deckSwapJustHappened) {
      prevDeckLength.current = currentLength;
      prevDeckSwapCount.current = deckSwapCount;
      return;
    }

    // Skip animation if:
    // - This is initial deck setup (deck was empty or very small)
    // - Deck didn't grow by more than 1 card
    // - Decks are currently swapping (Forced Empathy)
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

    if (!isInitialSetup && deckGrew && !isAnimatingRef.current && !forcedEmpathySwapping) {
      // Mark that animation is running
      isAnimatingRef.current = true;

      setShowWinEffect(true);

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
  }, [currentPlayer.deck.length, forcedEmpathySwapping, deckSwapCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timersRef.current.show) clearTimeout(timersRef.current.show);
      if (timersRef.current.hide) clearTimeout(timersRef.current.hide);
      isAnimatingRef.current = false;
      setShowWinEffect(false);
    };
  }, []);

  const [showAnimation, setShowAnimation] = useState(false);
  const [animatedLaunchStackCount, setAnimatedLaunchStackCount] = useState(currentPlayer.launchStackCount);
  const prevLaunchStackCount = useRef(currentPlayer.launchStackCount);
  const animationTimersRef = useRef<number[]>([]);

  useEffect(() => {
    const currentCount = currentPlayer.launchStackCount;
    const previousCount = prevLaunchStackCount.current;
    const wonCount = currentCount - previousCount;

    // Clear any existing animation timers
    animationTimersRef.current.forEach(timer => clearTimeout(timer));
    animationTimersRef.current = [];

    // If Launch Stacks were won, queue up animations
    if (wonCount > 0) {
      const ANIMATION_DURATION = ANIMATION_DURATIONS.LAUNCH_STACK_WON_TOKEN_DURATION;
      const GAP_BETWEEN_ANIMATIONS = 200;

      // Play animations sequentially with 200ms gap between each
      for (let i = 0; i < wonCount; i++) {
        const startDelay = i * (ANIMATION_DURATION + GAP_BETWEEN_ANIMATIONS);

        // Show animation
        const showTimer = setTimeout(() => {
          setShowAnimation(true);
        }, startDelay);
        animationTimersRef.current.push(showTimer);

        // Hide animation and increment animated count
        const hideTimer = setTimeout(() => {
          setShowAnimation(false);
          // Increment the animated count when animation finishes
          setAnimatedLaunchStackCount(prev => prev + 1);
        }, startDelay + ANIMATION_DURATION);
        animationTimersRef.current.push(hideTimer);
      }
    } else if (wonCount < 0) {
      // If Launch Stacks were lost, update animated count immediately (no animation)
      setAnimatedLaunchStackCount(currentCount);
    }

    // Update previous count
    prevLaunchStackCount.current = currentCount;

    // Cleanup timers on unmount or when effect reruns
    return () => {
      animationTimersRef.current.forEach(timer => clearTimeout(timer));
      animationTimersRef.current = [];
    };
  }, [currentPlayer.launchStackCount]);

  return (
    <>
      <SpecialCardAnimation
        removeBlur
        show={showAnimation}
        videoSrc={launchStackAnimations[currentPlayer.id]}
        className="z-1!"
      />
      {/** Avatar with Launch Stack Indicators */}
      {currentBillionaire ? (
        <div className={cn('flex flex-col items-center gap-1', gridLayoutMap[owner].avatar)}>
          {/* Launch Stack Rocket Indicators */}
          <LaunchStackIndicator launchStackCount={animatedLaunchStackCount} />

          {/* Avatar */}
          <div className="relative w-[6.5rem] h-[6.5rem] max-w-[104px] max-h-[104px] z-2">
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
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Confetti animation - full container size */}
                  <div className="absolute inset-0">
                    <LottieAnimation
                      className="-translate-x-20 -translate-y-20"
                      animationData={winConfettiAnimation}
                      autoplay={true}
                      width={250}
                      height={250}
                    />
                  </div>

                  {/* Win text with gradient background */}
                  <div className="w-[93%] h-[93%] rounded-full bg-gradient-to-b from-[#FF6B4A] to-[#FFD54F] flex items-center justify-center shadow-lg relative">
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
        </div>
      ) : (
        <div />
      )}
      {/** Deck - wrapped in motion for swap animation */}
      {owner === 'cpu' && (
        <Text
          className={cn('tracking-[0.08em] text-center', gridLayoutMap[owner].cardCount)}
          color="text-common-ash"
          variant="badge-xs"
          transform="uppercase"
        >
          {deckLength} Cards left
        </Text>
      )}
      <DeckPile
        className={cn('col-2', gridLayoutMap[layoutOwner].deck)}
        cardCount={deckLength}
        owner={owner}
        onClick={handleDeckClick}
        showTooltip={!!tooltipContent}
        tooltipContent={tooltipContent}
        activeIndicator={activeIndicator}
        deckSwapCount={deckSwapCount}
        isRunningWinAnimation={showWinEffect}
        layoutOwner={layoutOwner}
      />
      {/** Turn points */}
      <TurnValue
        className={gridLayoutMap[owner].turnValue}
        value={turnValue}
        activeEffects={turnValueActiveEffects}
      />
      {owner === 'player' && (
        <Text
          className={cn('tracking-[0.08em] text-center', gridLayoutMap[owner].cardCount)}
          color="text-common-ash"
          variant="badge-xs"
          transform="uppercase"
        >
          {deckLength} Cards left
        </Text>
      )}
    </>
  );
};
