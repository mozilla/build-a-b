import { type FC } from 'react';

import { Button } from '@/components/Button';
import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';
import { useGameStore } from '@/store';
import { getBillionaireImage } from '@/utils/selectors';

import { Icon } from '@/components/Icon';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { yourMissionMicrocopy } from './microcopy';

export const YourMission: FC<BaseScreenProps> = ({ send, className, ...props }) => {
  const { selectedBillionaire } = useGameStore();

  const handleContinue = () => {
    send?.({ type: 'START_PLAYING' });
  };

  // Get billionaire image using the selector utility
  const billionaireImage =
    getBillionaireImage(selectedBillionaire) || '/assets/characters/default.png';

  return (
    <motion.div className={cn('relative flex flex-col min-h-full', className)} {...props}>
      {/* Main content container */}
      <div className="w-full relative z-10 flex flex-col items-center justify-between h-full py-5">
        {/* Billionaire Avatar in Porthole - centered at top */}
        <div className="flex items-center justify-center pt-[3.5rem] pb-4">
          <div className="w-[12.1875rem] h-[12.1875rem]">
            <img
              src={billionaireImage}
              alt="Selected billionaire"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Text Content - centered */}
        <div className="flex flex-col items-center gap-4 px-9 flex-grow justify-center pb-8">
          <div className="flex flex-col items-center">
            <Text as="h1" variant="title-2" align="center" className="text-common-ash leading-9">
              {yourMissionMicrocopy.title}
            </Text>
            <Text
              variant="body-large-semibold"
              align="center"
              className="text-common-ash leading-6"
            >
              {yourMissionMicrocopy.subtitle}
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
        <div className="flex items-start justify-center gap-2 pb-8">
          <Icon name="rocket" className="-rotate-z-21 mt-3" />
          <Icon name="rocket" />
          <Icon name="rocket" className="rotate-z-21 mt-3" />
        </div>

        {/* Action Button - at bottom */}
        <div className="w-full flex flex-col items-center pb-8 px-[4.5rem]">
          <Button onPress={handleContinue} variant="primary" className="w-full max-w-[15.5rem]">
            {yourMissionMicrocopy.continueButton}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
