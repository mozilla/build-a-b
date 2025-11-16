import { type FC } from 'react';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { PoweredByFirefox } from '@/components/PoweredByFirefox';
import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';

import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { welcomeMicrocopy } from './microcopy';

export const Welcome: FC<BaseScreenProps> = ({ send, className, children, ...props }) => {
  const handleStartGame = () => {
    send?.({ type: 'START_GAME' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn('relative flex flex-col min-h-full sm:max-w-[25rem] mx-auto', className)}
      {...props}
    >
      {/* Decorative floating billionaires background - simplified for now */}
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        {/* Background decorative elements would go here */}
      </div>
      {children && <header>{children}</header>}

      {/* Main content container - centered with flex-grow */}
      <div className="w-full relative z-10 flex flex-col items-center justify-center gap-4 px-9 py-8 flex-grow">
        <Icon className="max-w-[16.25rem]" name="blastoff" width="100%" />

        {/* Title */}
        <Text as="h1" variant="title-2" align="center" className="text-common-ash w-full">
          {welcomeMicrocopy.title}
        </Text>

        {/* Description */}
        <Text
          variant="body-large-semibold"
          align="center"
          className="text-common-ash max-w-[16.625rem]"
        >
          {welcomeMicrocopy.description.prefix}
          <Text as="span" variant="body-large-semibold" italic weight="bold">
            {welcomeMicrocopy.description.gameTitle}
          </Text>
          {welcomeMicrocopy.description.suffix}
        </Text>

        {/* CTA Button */}
        <div className="w-full mt-4">
          <Button
            className="w-full max-w-[15.5rem] mx-auto"
            onClick={handleStartGame}
            variant="primary"
          >
            {welcomeMicrocopy.cta}
          </Button>
        </div>
      </div>

      {/* Powered by Firefox - in document flow at bottom with padding */}
      <div className="relative z-10 flex justify-center pb-[clamp(1rem,3.79dvh,4rem)] pt-4">
        <PoweredByFirefox />
      </div>
    </motion.div>
  );
};
