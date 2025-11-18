import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { type FC, useMemo, useState } from 'react';

import smokeAnimation from '@/assets/animations/effects/smoke.json';
import blankRocket from '@/assets/special-effects/rocket-blank.webp';
import zoomRocket from '@/assets/special-effects/rocket-zoom.webp';
import { Button } from '@/components/Button';
import { LottieAnimation } from '@/components/LottieAnimation';
import { PoweredByFirefox } from '@/components/PoweredByFirefox';
import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';
import { BILLIONAIRES } from '@/config/billionaires';
import { useShare } from '@/hooks/use-share';
import { useCpuBillionaire, useGameStore } from '@/store';
import { cn } from '@/utils/cn';

/**
 * GameOver Screen
 *
 * Displays the final victory screen with:
 * - Animated rocket with winner's portrait
 * - Congratulations message
 * - Play Again and Share buttons
 * - Firefox branding with hover animation
 */
export const GameOver: FC<BaseScreenProps> = ({ className, send, ...props }) => {
  const { selectedBillionaire, winner } = useGameStore();
  const cpuBillionaireId = useCpuBillionaire();
  const [shareButtonText, setShareButtonText] = useState('Share with Friends');
  const [isRocketRevealed, setIsRocketRevealed] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Determine which billionaire won
  const winnerBillionaireId = winner === 'player' ? selectedBillionaire : cpuBillionaireId;

  const winnerBillionaire = useMemo(
    () => BILLIONAIRES.find((b) => b.id === winnerBillionaireId),
    [winnerBillionaireId],
  );

  // Share hook
  const { handleShare: shareNatively, isShareSupported } = useShare({
    shareText: 'Make Earth a better place. Launch a billionaire.',
  });

  // Handle share functionality
  const handleShare = async () => {
    // Prevent multiple simultaneous share attempts
    if (isSharing) {
      return;
    }

    setIsSharing(true);

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
        setShareButtonText('Copied!');

        // Reset button text after 2 seconds
        setTimeout(() => {
          setShareButtonText('Share with Friends');
        }, 2000);
      } catch (error) {
        console.error('Clipboard write failed:', error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Handle play again
  const handlePlayAgain = () => {
    send?.({ type: 'QUIT_GAME' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 3 }}
      className={cn(
        'relative flex flex-col items-center justify-between w-full h-full overflow-x-clip',
        className,
      )}
      {...props}
    >
      {/* Top section - Rocket container */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="relative w-[22.1875rem] aspect-square animate-rocket-float">
          {/* Smoke animation */}
          <div className="absolute flex items-center justify-center w-full aspect-square -left-48 top-15 rotate-[253.107deg] mix-blend-hard-light">
            <LottieAnimation
              animationData={smokeAnimation}
              loop={true}
              autoplay={true}
              className="w-full h-full"
            />
          </div>

          {/* Rocket */}
          <div className="absolute flex items-center justify-center w-[14.5rem] aspect-square left-11 top-13">
            <img src={blankRocket} alt="Rocket" className="w-full h-full object-cover" />
          </div>

          {/* Billionaire portrait */}
          {winnerBillionaire?.imageSrc && (
            <div className="absolute w-16 aspect-square -translate-1/2 left-[55%] top-[42%]">
              <div className="absolute overflow-hidden aspect-square w-full">
                <img
                  src={winnerBillionaire.imageSrc}
                  alt={winnerBillionaire.name}
                  className="absolute object-cover"
                />
              </div>
            </div>
          )}
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
        <div className="flex flex-col gap-4">
          <Button variant="primary" onPress={handlePlayAgain} className="w-full">
            Play again!
          </Button>
          <Button variant="primary" onPress={handleShare} className="w-full">
            {shareButtonText}
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
              {!isRocketRevealed && (
                <motion.div
                  key="powered-by-firefox"
                  style={{ pointerEvents: isRocketRevealed ? 'none' : 'auto' }}
                  initial={{ opacity: 1 }}
                  animate={{
                    opacity: isRocketRevealed ? [1, 0] : 1,
                  }}
                  className="row-span-full col-span-full"
                >
                  <PoweredByFirefox
                    className="relative"
                    href="https://www.firefox.com/en-US/?utm_source=bbomicrosite&utm_medium=data-war-game&utm_campaign=fx-owyw&utm_content=download-button"
                  />
                </motion.div>
              )}
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
                >
                  Download Firefox
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
          {/* Rocket flyby animation on hover */}
          {isRocketRevealed && (
            <motion.div
              initial={{ x: '18rem', y: '-50%', rotate: -15 }}
              animate={{ x: '-15rem', y: '-50%', rotate: 15, opacity: [0, 1, 1, 0] }}
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
    </motion.div>
  );
};
