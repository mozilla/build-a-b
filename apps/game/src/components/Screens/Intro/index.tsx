import { type FC } from 'react';

import { Button } from '@/components/Button';
import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';
import { useGameStore } from '@/store';
import { getBillionaireImage } from '@/utils/selectors';

import { TRACKS } from '@/config/audio-config';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { introMicrocopy } from './microcopy';
import { gtagEvent } from '@/utils/gtag';

export const Intro: FC<BaseScreenProps> = ({ send, className, children, ...props }) => {
  const { selectedBillionaire, playAudio } = useGameStore();

  const handleShowGuide = () => {
    playAudio(TRACKS.WHOOSH);
    send?.({ type: 'SHOW_GUIDE' });
  };

  const handleSkipInstructions = () => {
    send?.({ type: 'SKIP_INSTRUCTIONS' });
    gtagEvent({
      action: 'jump_in_play_click',
      category: 'ui',
      label: 'Jump In and Play button clicked',
    });
  };

  // Get billionaire image using the selector utility
  const billionaireImage =
    getBillionaireImage(selectedBillionaire) || '/assets/characters/default.png';

  return (
    <motion.div
      className={cn('relative flex flex-col mx-auto', className)}
      {...props}
    >
      {/* Main content container */}
      <header className="absolute top-0 landscape:relative w-full mx-auto z-20">
        {children}
      </header>
      <div className="w-full relative z-10 flex flex-col items-center justify-between py-16 h-full">
        {/* Billionaire Avatar - centered at top */}
        <div className="flex items-center justify-center pb-4">
          <div className="w-[12.1875rem] h-[12.1875rem] rounded-full overflow-hidden border-4 border-accent">
            <img
              src={billionaireImage}
              alt="Selected billionaire"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Text Content - centered */}
        <div className="flex flex-col items-center gap-4 px-9 flex-grow justify-center">
          <Text as="h1" variant="title-2" align="center" className="text-common-ash w-full">
            {introMicrocopy.title}
          </Text>

          <Text
            variant="body-large-semibold"
            align="center"
            className="text-common-ash max-w-[19.625rem]"
          >
            {introMicrocopy.description}
          </Text>
        </div>

        {/* Action Buttons - stacked at bottom */}
        <div className="w-full flex flex-col items-center gap-4 pt-4 px-[4.5rem]">
          <Button onPress={handleShowGuide} variant="primary" className="w-full max-w-[15.5rem]">
            {introMicrocopy.quickStartButton}
          </Button>
          <Button
            onPress={handleSkipInstructions}
            variant="primary"
            className="w-full max-w-[15.5rem]"
          >
            {introMicrocopy.jumpInButton}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
