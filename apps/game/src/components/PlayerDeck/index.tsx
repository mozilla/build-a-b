import { SpecialCardAnimation, Text } from '@/components';
import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import { TRACKS } from '@/config/audio-config';
import {
  SPECIAL_EFFECT_ANIMATIONS,
  getAnimationVideoSrc,
} from '@/config/special-effect-animations';
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
    turnValue: 'row-4 col-3 self-center',
    cardCount: 'row-5 col-span-full self-center',
  },
  cpu: {
    cardCount: 'row-1 col-span-full self-center',
    avatar: 'row-2 col-1',
    deck: 'row-2',
    turnValue: 'row-2 col-3 self-center',
  },
};

export const PlayerDeck: FC<PlayerDeckProps> = ({
  deckLength,
  turnValue,
  turnValueActiveEffects,
  owner,
  billionaireId,
  activeIndicator = false,
}) => {
  const currentBillionaire = getBillionaireById(billionaireId);
  const player = usePlayer();
  const cpu = useGameStore((state) => state.cpu);
  const forcedEmpathySwapping = useGameStore((state) => state.forcedEmpathySwapping);
  const deckSwapCount = useGameStore((state) => state.deckSwapCount);
  const showingWinEffect = useGameStore((state) => state.showingWinEffect);
  const { playAudio } = useGameStore();
  const isSwapped = deckSwapCount % 2 === 1;
  // Get the correct player based on owner prop
  const currentPlayer = owner === 'player' ? player : cpu;
  // When swapped, use the opposite owner for grid positioning
  const layoutOwner = isSwapped ? (owner === 'player' ? 'cpu' : 'player') : owner;

  const [showWinEffect, setShowWinEffect] = useState(false);
  const isAnimatingRef = useRef(false); // Prevent multiple animations
  const timersRef = useRef<{ show?: number; hide?: number }>({});

  // Trigger win animation based on showingWinEffect state (BEFORE cards fly to deck)
  useEffect(() => {
    // Check if this player is showing win effect
    const isShowingWin = showingWinEffect === owner;

    if (isShowingWin && !isAnimatingRef.current && !forcedEmpathySwapping) {
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

      return () => {
        if (timersRef.current.show) clearTimeout(timersRef.current.show);
        if (timersRef.current.hide) clearTimeout(timersRef.current.hide);
      };
    }

    // Clear animation if showingWinEffect cleared while animation was running
    if (!isShowingWin && isAnimatingRef.current) {
      if (timersRef.current.show) clearTimeout(timersRef.current.show);
      if (timersRef.current.hide) clearTimeout(timersRef.current.hide);

      setShowWinEffect(false);
      isAnimatingRef.current = false;
      timersRef.current = {};
    }
  }, [showingWinEffect, owner, forcedEmpathySwapping]);

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
  const [animatedLaunchStackCount, setAnimatedLaunchStackCount] = useState(
    currentPlayer.launchStackCount,
  );
  const prevLaunchStackCount = useRef(currentPlayer.launchStackCount);
  const animationTimersRef = useRef<number[]>([]);

  useEffect(() => {
    const currentCount = currentPlayer.launchStackCount;
    const previousCount = prevLaunchStackCount.current;
    const wonCount = currentCount - previousCount;

    // Clear any existing animation timers
    animationTimersRef.current.forEach((timer) => clearTimeout(timer));
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
          setAnimatedLaunchStackCount((prev) => prev + 1);
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
      animationTimersRef.current.forEach((timer) => clearTimeout(timer));
      animationTimersRef.current = [];
    };
  }, [currentPlayer.launchStackCount]);

  useEffect(() => {
    if (!showWinEffect) return;
    if (owner === 'player') playAudio(TRACKS.PLAYER_WIN);
    if (owner === 'cpu') playAudio(TRACKS.OPPONENT_WIN, { volume: 0.5 });
  }, [playAudio, showWinEffect, owner]);

  // Get Launch Stack Won animation from config
  const launchStackWonAnimation = SPECIAL_EFFECT_ANIMATIONS.launch_stack_won;
  const animationVideoSrc = getAnimationVideoSrc(
    launchStackWonAnimation,
    currentPlayer.id === 'player',
  );

  return (
    <>
      <SpecialCardAnimation
        removeBlur
        show={showAnimation}
        videoSrc={animationVideoSrc}
        className="z-1!"
        audioTrack={TRACKS.LAUNCH_STACK_ROCKET}
      />
      {/** Avatar with Launch Stack Indicators */}
      {currentBillionaire ? (
        <div className={cn('flex flex-col items-center gap-1', gridLayoutMap[owner].avatar)}>
          {/* Launch Stack Rocket Indicators */}
          <LaunchStackIndicator launchStackCount={animatedLaunchStackCount} />

          {/* Avatar */}
          <div className="relative aspect-square z-2">
            {/* Avatar with scale animation */}
            <motion.div
              className="w-full h-full rounded-full overflow-hidden"
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
          className={cn('tracking-[0.08em] text-center mb-2', gridLayoutMap[owner].cardCount)}
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
        deckSwapCount={deckSwapCount}
        layoutOwner={layoutOwner}
        activeIndicator={activeIndicator}
      />
      {/** Turn points */}
      <TurnValue
        className={gridLayoutMap[owner].turnValue}
        value={turnValue}
        activeEffects={turnValueActiveEffects}
      />
      {owner === 'player' && (
        <Text
          className={cn('tracking-[0.08em] text-center mt-2', gridLayoutMap[owner].cardCount)}
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
