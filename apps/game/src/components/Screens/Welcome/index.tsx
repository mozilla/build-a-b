import { type FC } from 'react';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { PoweredByFirefox } from '@/components/PoweredByFirefox';
import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';

import { cn } from '@/utils/cn';
import { welcomeMicrocopy } from './microcopy';

export const Welcome: FC<BaseScreenProps> = ({ send, className, ...props }) => {
  const handleStartGame = () => {
    send?.({ type: 'START_GAME' });
  };

  return (
    <div className={cn(className)} {...props}>
      {/* Decorative floating billionaires background - simplified for now */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        {/* Background decorative elements would go here */}
      </div>

      {/* Main content container */}
      <div className="w-full relative z-10 flex flex-col items-center justify-center gap-4 px-9 py-8">
        <div className="">
          <Icon name="blastoff" />
        </div>

        {/* Title */}
        <Text as="h1" variant="title-2" align="center" className="text-common-ash w-full">
          {welcomeMicrocopy.title}
        </Text>

        {/* Description */}
        <Text
          variant="body-large-semibold"
          align="center"
          className="text-common-ash max-w-[266px]"
        >
          {welcomeMicrocopy.description.prefix}
          <Text as="span" variant="body-large-semibold" italic weight="bold">
            {welcomeMicrocopy.description.gameTitle}
          </Text>
          {welcomeMicrocopy.description.suffix}
        </Text>

        {/* CTA Button */}
        <div className="mt-4">
          <Button onClick={handleStartGame} variant="primary">
            {welcomeMicrocopy.cta}
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
