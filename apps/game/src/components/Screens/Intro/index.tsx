import { type FC } from 'react';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';
import { useGameStore } from '@/stores/game-store';
import { getBillionaireImage } from '@/utils/selectors';

import { cn } from '@/utils/cn';
import { introMicrocopy } from './microcopy';

export const Intro: FC<BaseScreenProps> = ({ send, className, ...props }) => {
  const { selectedBillionaire } = useGameStore();

  const handleShowGuide = () => {
    send?.({ type: 'SHOW_GUIDE' });
  };

  const handleSkipInstructions = () => {
    send?.({ type: 'SKIP_INSTRUCTIONS' });
  };

  // Get billionaire image using the selector utility
  const billionaireImage =
    getBillionaireImage(selectedBillionaire) || '/assets/characters/default.png';

  return (
    <div className={cn('relative flex flex-col min-h-full', className)} {...props}>
      {/* Close/Skip button - top right */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={handleSkipInstructions}
          className="w-[2.125rem] h-[2.125rem] flex items-center justify-center"
          aria-label="Skip instructions"
        >
          <Icon name="close" />
        </button>
      </div>

      {/* Main content container */}
      <div className="w-full relative z-10 flex flex-col items-center justify-between h-full py-8">
        {/* Billionaire Avatar - centered at top */}
        <div className="flex items-center justify-center pt-8 pb-4">
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
        <div className="w-full flex flex-col items-center gap-4 pb-8 px-[4.5rem]">
          <Button onClick={handleShowGuide} variant="primary" className="w-full max-w-[15.5rem]">
            {introMicrocopy.quickStartButton}
          </Button>
          <Button
            onClick={handleSkipInstructions}
            variant="primary"
            className="w-full max-w-[15.5rem]"
          >
            {introMicrocopy.jumpInButton}
          </Button>
        </div>
      </div>
    </div>
  );
};
