import { type FC } from 'react';

import { Button } from '@/components/Button';
import { Link } from '@heroui/react';
import { Icon } from '@/components/Icon';
import { PoweredByFirefox } from '@/components/PoweredByFirefox';
import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';

import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { welcomeMicrocopy } from './microcopy';

// Import floating billionaire images
import floater1 from '@/assets/floaters/1.webp';
import floater2 from '@/assets/floaters/2.webp';
import floater3 from '@/assets/floaters/3.webp';
import floater4 from '@/assets/floaters/4.webp';
import floater5 from '@/assets/floaters/5.webp';
import floater6 from '@/assets/floaters/6.webp';

export const Welcome: FC<BaseScreenProps> = ({ send, className, children, ...props }) => {
  const handleStartGame = () => {
    send?.({ type: 'START_GAME' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn('relative flex flex-col min-h-full mx-auto', className)}
      {...props}
    >
      {/* Decorative floating billionaires background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floater 1 - Top left area */}
        <motion.img
          src={floater1}
          alt=""
          className="absolute w-[8.25rem] h-auto"
          style={{
            left: '2.5rem',
            top: '4rem',
          }}
          animate={{
            x: [0, 15, -10, 0],
            y: [0, -25, -15, 0],
            rotate: [0, 8, -5, 0],
          }}
          transition={{
            duration: 8.5,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.3, 0.7, 1],
          }}
        />

        {/* Floater 2 - Top right area */}
        <motion.img
          src={floater2}
          alt=""
          className="absolute w-[6.5rem] h-auto"
          style={{
            right: '3rem',
            top: '1rem',
            rotate: '14deg',
          }}
          animate={{
            x: [0, -20, 10, 0],
            y: [0, -18, -30, 0],
            rotate: [14, 22, 8, 14],
          }}
          transition={{
            duration: 9.2,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.4, 0.75, 1],
            delay: 0.8,
          }}
        />

        {/* Floater 3 - Top center-right */}
        <motion.img
          src={floater3}
          alt=""
          className="absolute w-[9.75rem] h-auto"
          style={{
            right: '-4rem',
            top: '14rem',
            rotate: '-5.717deg',
          }}
          animate={{
            x: [0, 12, -8, 0],
            y: [0, -20, -35, 0],
            rotate: [-5.717, 2, -12, -5.717],
          }}
          transition={{
            duration: 10.5,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.35, 0.65, 1],
            delay: 1.5,
          }}
        />

        {/* Floater 4 - Bottom left */}
        <motion.img
          src={floater4}
          alt=""
          className="absolute w-[8.5rem] h-auto"
          style={{
            left: '-2rem',
            top: '33.1rem',
            rotate: '6.12deg',
          }}
          animate={{
            x: [0, -15, 18, 0],
            y: [0, -22, -12, 0],
            rotate: [6.12, -3, 14, 6.12],
          }}
          transition={{
            duration: 11.3,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.45, 0.8, 1],
            delay: 2.2,
          }}
        />

        {/* Floater 5 - Bottom right */}
        <motion.img
          src={floater5}
          alt=""
          className="absolute w-[6.25rem] h-auto"
          style={{
            right: '1rem',
            top: '42rem',
            rotate: '-9.452deg',
          }}
          animate={{
            x: [0, 22, -12, 0],
            y: [0, -28, -16, 0],
            rotate: [-9.452, 4, -18, -9.452],
          }}
          transition={{
            duration: 9.8,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.38, 0.72, 1],
            delay: 2.8,
          }}
        />

        {/* Floater 6 - Bottom center-left */}
        <motion.img
          src={floater6}
          alt=""
          className="absolute w-[4.5rem] h-auto"
          style={{
            left: '0.6rem',
            top: '47rem',
            rotate: '6.753deg',
          }}
          animate={{
            x: [0, -18, 14, 0],
            y: [0, -24, -10, 0],
            rotate: [6.753, 16, -4, 6.753],
          }}
          transition={{
            duration: 8.7,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.42, 0.78, 1],
            delay: 3.5,
          }}
        />
      </div>
      <header>
        <Link href="/" className="absolute top-5 left-5 z-20">
          <Icon name="return" label="Back" className="w-[2.125rem] h-[2.125rem]" />
        </Link>
        {children}
      </header>

      {/* Main content container - centered with flex-grow */}
      <div className="w-full relative z-10 flex flex-col items-center justify-center gap-4 px-[9.2%] py-8 flex-grow">
        <Icon className="w-[16.25rem] mb-10" name="blastoff" width="100%" />

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
      <div className="relative z-10 flex justify-center pb-[3.79dvh] pt-4">
        <PoweredByFirefox />
      </div>
    </motion.div>
  );
};
