import { type FC, useEffect, useState } from 'react';

import { Button } from '@/components/Button';
import { LottieAnimation } from '@/components/LottieAnimation';
import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';
import { useGameStore } from '@/store';
import { getBillionaireImage } from '@/utils/selectors';

import burstAnimation from '@/assets/animations/effects/burst.json';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { AnimatedRocket } from './AnimatedRocket';
import { yourMissionMicrocopy } from './microcopy';

export const YourMission: FC<BaseScreenProps> = ({ send, className, children, ...props }) => {
  const { selectedBillionaire } = useGameStore();
  const [showConfetti, setShowConfetti] = useState(false);

  // Start confetti after third rocket completes its pulse (1.3s delay + 0.8s duration = 2.1s)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(true);
    }, 2100);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    send?.({ type: 'START_PLAYING' });
  };

  // Get billionaire image using the selector utility
  const billionaireImage =
    getBillionaireImage(selectedBillionaire) || '/assets/characters/default.png';

  return (
    <motion.div className={cn('relative flex flex-col min-h-full', className)} {...props}>
      <header className="absolute top-0 landscape:relative w-full mx-auto z-20">
        {children}
      </header>
      {/* Main content container */}
      <div className="w-full relative z-10 flex flex-col items-center justify-between h-full py-16">
        {/* Billionaire Avatar in Porthole - centered at top */}
        <div className="flex items-center justify-center pb-4">
          <div className="w-[12.1875rem] h-[12.1875rem]">
            <img
              src={billionaireImage}
              alt="Selected billionaire"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Text Content - centered */}
        <div className="flex flex-col items-center gap-4 px-9 flex-grow justify-center">
          <div className="flex flex-col items-center">
            <Text as="h1" variant="title-2" align="center" className="text-common-ash leading-9">
              {yourMissionMicrocopy.title}
            </Text>
          </div>

          <Text
            variant="body-large-semibold"
            align="center"
            className="text-common-ash max-w-[16.625rem]"
          >
            {yourMissionMicrocopy.description}
          </Text>
        </div>

        {/* Launch Stack Icons */}
        <div className="flex flex-grow items-center justify-center gap-2 pb-12 relative">
          {/* Confetti burst animation behind rockets */}
          {showConfetti && (
            <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none -top-8">
              <LottieAnimation
                animationData={burstAnimation}
                loop={true}
                autoplay={true}
                width="12.5rem"
                height="12.5rem"
                className="scale-150"
              />
            </div>
          )}

          <AnimatedRocket
            delay={0.5}
            gradientId="rocket-gradient-1"
            rotation={-21}
            className="w-[3.3125rem] h-[3.3125rem] mt-3"
          />
          <AnimatedRocket
            delay={0.9}
            gradientId="rocket-gradient-2"
            rotation={0}
            className="w-[3.3125rem] h-[3.3125rem]"
          />
          <AnimatedRocket
            delay={1.3}
            gradientId="rocket-gradient-3"
            rotation={21}
            className="w-[3.3125rem] h-[3.3125rem] mt-3"
          />
        </div>

        {/* Action Button - at bottom */}
        <div className="w-full flex flex-col items-center px-[4.5rem]">
          <Button onPress={handleContinue} variant="primary" className="w-full max-w-[15.5rem]">
            {yourMissionMicrocopy.continueButton}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
