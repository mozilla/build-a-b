import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { type FC, useEffect, useMemo, useRef, useState } from 'react';

import smokeAnimation from '@/assets/animations/effects/smoke.json';
import blankRocket from '@/assets/special-effects/rocket-blank.webp';
import zoomRocket from '@/assets/special-effects/rocket-zoom.webp';
import { Button } from '@/components/Button';
import { LottieAnimation } from '@/components/LottieAnimation';
import { PoweredByFirefox } from '@/components/PoweredByFirefox';
import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';
import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import { TRACKS } from '@/config/audio-config';
import { BILLIONAIRES } from '@/config/billionaires';
import { useShare } from '@/hooks/use-share';
import { useCpuBillionaire, useGameStore } from '@/store';
import { cn } from '@/utils/cn';
import { gtagEvent } from '@/utils/gtag';

/**
 * GameOver Screen
 *
 * Displays the final victory screen with:
 * - Animated rocket with winner's portrait
 * - Congratulations message
 * - Play Again and Share buttons
 * - Firefox branding with hover animation
 */
export const GameOver: FC<BaseScreenProps> = ({ className, isCrossFadeComplete, ...props }) => {
  const { selectedBillionaire, winner, playAudio } = useGameStore();
  const cpuBillionaireId = useCpuBillionaire();
  const [linkCopied, setLinkCopied] = useState(false);
  const [isRocketRevealed, setIsRocketRevealed] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const rocketRevealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine which billionaire won
  const winnerBillionaireId = winner === 'player' ? selectedBillionaire : cpuBillionaireId;

  const winnerBillionaire = useMemo(
    () => BILLIONAIRES.find((b) => b.id === winnerBillionaireId),
    [winnerBillionaireId],
  );

  // Share hook - Detect iOS Firefox for special handling
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const { handleShare: shareNatively, isShareSupported } = useShare({
    // include url in share text to fix issue with threads not showing the url
    // when sharing from iOS mobile consistently.
    shareText: `Make Earth a better place. Launch a billionaire.\n\n${shareUrl}`,
    url: shareUrl,
  });

  useEffect(() => {
    if (!isCrossFadeComplete) return;

    rocketRevealTimeoutRef.current = setTimeout(() => {
      setIsRocketRevealed(true);
    }, ANIMATION_DURATIONS.ROCKET_REVEAL_TIMEOUT);

    return () => {
      if (rocketRevealTimeoutRef.current) {
        clearTimeout(rocketRevealTimeoutRef.current);
      }
    };
  }, [isCrossFadeComplete]);

  useEffect(() => {
    if (!isRocketRevealed) return;
    playAudio(TRACKS.ROCKET_FLYBY);
  }, [isRocketRevealed, playAudio]);

  // Handle share functionality
  const handleShare = async () => {
    // Prevent multiple simultaneous share attempts
    if (isSharing) {
      return;
    }

    setIsSharing(true);

    gtagEvent({
      action: 'share_click',
      category: 'end_sequence',
      label: 'Share button clicked',
    });

    try {
      const url = window.location.href;

      // Try native share first
      if (isShareSupported) {
        const success = await shareNatively();
        if (success) {
          return;
        }
      }

      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setLinkCopied(true);

        // Reset button text after 2 seconds
        setTimeout(() => {
          setLinkCopied(false);
        }, 2000);
      } catch (error) {
        console.error('Clipboard write failed:', error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Handle play again - reload page to ensure complete memory cleanup
  const handlePlayAgain = () => {
    gtagEvent({
      action: 'play_again_click',
      category: 'end_sequence',
      label: 'Play Again button clicked',
    });

    // Force page reload to free all memory
    window.location.reload();
  };

  const handleGoToFirefox = () => {
    gtagEvent({
      action: 'firefox_click',
      category: 'end_sequence',
      label: 'Firefox CTA clicked',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2.5, ease: 'linear' }}
      className={cn('relative flex flex-col items-center justify-between w-full h-full', className)}
      {...props}
    >
      <div className="overflow-clip">
        {/* Top section - Rocket container */}
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="relative w-[22.1875rem] aspect-square animate-rocket-float">
            {/* Rocket */}
            <div className="absolute grid items-center justify-center w-[14.5rem] aspect-square left-11 top-13">
              {/* Smoke animation */}
              <div className="absolute flex items-center justify-center w-full aspect-square -left-34 top-15 rotate-[253.107deg] mix-blend-hard-light">
                <LottieAnimation
                  animationData={smokeAnimation}
                  loop={true}
                  autoplay={true}
                  className="w-full h-full z-1"
                />
              </div>
              <img
                src={blankRocket}
                alt="Rocket"
                className="row-span-full col-span-full object-cover z-2"
              />
              {/* Billionaire portrait */}
              {winnerBillionaire?.imageSrc && (
                <div className="w-16 overflow-hidden aspect-square translate-x-8 -translate-y-4.5 row-span-full col-span-full place-self-center z-3">
                  <img
                    src={winnerBillionaire.imageSrc}
                    alt={winnerBillionaire.name}
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle section - Content */}
        <div className="flex flex-col gap-8 items-center pb-12">
          <div className="flex flex-col gap-4 items-center text-center pt-8 px-9 w-full">
            <Text variant="title-2" color="text-common-ash" className="whitespace-pre-wrap w-full">
              One down, plenty more to go...
            </Text>
            <Text variant="body-large-semibold" color="text-common-ash" className="text-pretty">
              Now that you've sent one billionaire off to space, try your hand at another!
            </Text>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-4" role="region" aria-live="polite">
            <Button variant="primary" onPress={handlePlayAgain} className="w-full">
              Play again!
            </Button>
            <Button variant="primary" onPress={handleShare} className="w-full">
              <span className="grid place-content-center">
                <span
                  className={cn('col-span-full row-span-full', linkCopied && 'opacity-0')}
                  aria-hidden={linkCopied}
                >
                  Share with Friends
                </span>
                {linkCopied && (
                  <span className="col-span-full row-span-full" role="alert">
                    Copied!
                  </span>
                )}
              </span>
            </Button>
          </div>
        </div>
        <MotionConfig transition={{ duration: 1, ease: 'easeInOut' }}>
          {/* Firefox branding with rocket flyby animation */}
          <motion.div
            onMouseEnter={() => setIsRocketRevealed(true)}
            className="relative pb-12 w-full justify-center grid"
          >
            <div className="grid row-span-full col-span-full items-center">
              <AnimatePresence>
                <motion.div
                  key="powered-by-firefox"
                  style={{ pointerEvents: isRocketRevealed ? 'none' : 'auto' }}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: isRocketRevealed ? 0 : 1 }}
                  className="row-span-full col-span-full"
                >
                  <PoweredByFirefox
                    className="relative"
                    href="https://www.firefox.com/en-US/?utm_source=bbomicrosite&utm_medium=data-war-game&utm_campaign=fx-owyw&utm_content=download-button"
                  />
                </motion.div>
                <motion.div
                  key="download-firefox-button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isRocketRevealed ? 1 : 0 }}
                  className={cn(
                    'row-span-full col-span-full',
                    !isRocketRevealed ? 'pointer-events-none' : '',
                  )}
                >
                  <Button
                    as="a"
                    href="https://www.firefox.com/en-US/?utm_source=bbomicrosite&utm_medium=data-war-game&utm_campaign=fx-owyw&utm_content=download-button"
                    variant="primary"
                    target="_blank"
                    onClick={handleGoToFirefox}
                  >
                    Download Firefox
                  </Button>
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Rocket flyby animation on hover/timeout */}
            {isRocketRevealed && (
              <motion.div
                initial={{ x: '20rem', y: '-50%', rotate: -15 }}
                animate={{ x: '-20rem', y: '-50%', rotate: 15 }}
                transition={{ duration: 1.25, ease: 'easeInOut' }}
                className="absolute pointer-events-none w-[4.5rem] h-[5.8125rem] row-span-full col-span-full"
                style={{ zIndex: 1000 }}
              >
                <img
                  src={zoomRocket}
                  alt=""
                  className="object-cover size-full -translate-x-1/2"
                  aria-hidden="true"
                  role="presentation"
                />
              </motion.div>
            )}
          </motion.div>
        </MotionConfig>
      </div>
    </motion.div>
  );
};
