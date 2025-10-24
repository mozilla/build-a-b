import { type FC } from 'react';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { PoweredByFirefox } from '@/components/PoweredByFirefox';
import type { BaseScreenProps } from '@/components/ScreenRenderer';

export const Welcome: FC<BaseScreenProps> = ({ send }) => {
  const handleStartGame = () => {
    send?.({ type: 'START_GAME' });
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Decorative floating billionaires background - simplified for now */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        {/* Background decorative elements would go here */}
      </div>

      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-4 px-9 py-8 max-w-[390px]">
        {/* Title */}
        <h1 className="title-2 text-common-ash text-center w-full">Battle for Data Supremacy!</h1>

        {/* Description */}
        <p className="body-large text-common-ash text-center max-w-[266px]">
          This is the digital version of <span className="font-bold italic">Data War</span>, a game
          of Billionaire brinksmanship where space is the place, data is the currency, and chaos
          reigns.
        </p>

        {/* CTA Button */}
        <div className="mt-4">
          <Button onClick={handleStartGame} variant="primary">
            Start Playing
          </Button>
        </div>
      </div>

      {/* Powered by Firefox - positioned at bottom */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
        <PoweredByFirefox />
      </div>

      {/* Close/Menu Icon - positioned at top right */}
      <div className="absolute top-5 right-4">
        <Icon name="close" />
      </div>
    </div>
  );
};
