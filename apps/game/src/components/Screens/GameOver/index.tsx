import { motion } from 'framer-motion';
import { type FC, useMemo, useState } from 'react';

// import smokeAnimation from '@/assets/animations/effects/smoke.json';
import blankRocket from '@/assets/special-effects/rocket-blank.webp';
import { Button } from '@/components/Button';
// import { LottieAnimation } from '@/components/LottieAnimation';
import smokeGif from '@/assets/special-effects/smoke.gif';
import { PoweredByFirefox } from '@/components/PoweredByFirefox';
import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';
import { BILLIONAIRES } from '@/config/billionaires';
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
  const [isRocketHovered, setIsRocketHovered] = useState(false);

  // Determine which billionaire won
  const winnerBillionaireId = winner === 'player' ? selectedBillionaire : cpuBillionaireId;

  const winnerBillionaire = useMemo(
    () => BILLIONAIRES.find((b) => b.id === winnerBillionaireId),
    [winnerBillionaireId],
  );

  // Handle share functionality
  const handleShare = async () => {
    const url = window.location.href;

    try {
      // Try native share API first
      if (navigator.share && navigator.canShare({ url })) {
        await navigator.share({
          url,
          title: 'Data War - Billionaire Blast Off',
          text: `I just sent ${winnerBillionaire?.name} to space! Play Data War and launch your billionaire.`,
        });
        return;
      }
    } catch (error) {
      // User cancelled share or share failed
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Share failed:', error);
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
      className={cn('relative flex flex-col items-center justify-between w-full h-full', className)}
      {...props}
    >
      {/* Top section - Rocket with billionaire portrait and smoke */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="relative w-[22.1875rem] aspect-square animate-rocket-float">
          {/* Smoke animation - rotated with hard-light blend */}
          <div className="absolute flex items-center justify-center w-full aspect-square -left-48 top-15 rotate-[253.107deg] mix-blend-hard-light">
            <img
              className="size-full object-cover"
              role="presentation"
              src={smokeGif}
              alt="Smoke animation"
            />
            {/* <LottieAnimation
              animationData={smokeAnimation}
              loop={true}
              autoplay={true}
              className="w-full h-full"
            /> */}
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

      {/* Firefox branding with rocket flyby animation */}
      <motion.div
        onHoverStart={() => setIsRocketHovered(true)}
        onHoverEnd={() => setIsRocketHovered(false)}
        className="relative pb-12"
      >
        <PoweredByFirefox className="relative">
          {/* Rocket flyby animation on hover */}
          {isRocketHovered && (
            <></>
            // <motion.div
            //   initial={{ x: '', y: 20, rotate: -45, opacity: 0 }}
            //   // animate={{ x: 200, y: -20, rotate: 15, opacity: [0, 1, 1, 0] }}
            //   transition={{ duration: 0.8, ease: 'easeInOut' }}
            //   className="absolute top-1/2 right-0 pointer-events-none w-[4.5rem] h-[5.8125rem]"
            //   style={{ zIndex: 1000 }}
            // >
            //   <img
            //     src={zoomRocket}
            //     alt=""
            //     className="object-cover size-full"
            //     aria-hidden="true"
            //     role="presentation"
            //   />
            // </motion.div>
          )}
        </PoweredByFirefox>
      </motion.div>
    </motion.div>
  );
};
