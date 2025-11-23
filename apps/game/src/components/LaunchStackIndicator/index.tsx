/**
 * LaunchStackIndicator - Displays rocket indicators for launch stack collection
 */

import { TRACKS } from '@/config/audio-config';
import { useGameStore } from '@/store';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { type FC } from 'react';
import RocketFilled from '../../assets/icons/rocket-filled.svg';
import RocketEmpty from '../../assets/icons/rocket.svg';
import type { LaunchStackIndicatorProps } from './types';

const getTransformClasses = (position: number) => {
  switch (position) {
    case 0:
      // return 'rotate-[-46deg] translate-x-[-1.5rem] translate-y-[1.3rem]';
      return 'translate-y-1/4 rotate-[-25deg]';
    case 1:
      return '';
    case 2:
      return 'rotate-[25deg] translate-y-1/4';
    default:
      return '';
  }
};

export const LaunchStackIndicator: FC<LaunchStackIndicatorProps> = ({
  launchStackCount,
  maxStacks = 3,
  className = '',
  owner,
}) => {
  const { playAudio } = useGameStore();

  // CPU: 180 degrees opposite of player (-17.5deg + 180deg = 162.5deg)
  // Player: -17.5deg rotation
  const rotationClass = owner === 'cpu' ? 'rotate-[162.5deg]' : 'rotate-[-17.5deg]';
  
  // CPU: translate-x-1/4 translate-y-[-12%]
  // Player: -translate-x-1/4 translate-y-[10%]
  const translateClass = owner === 'cpu' ? 'translate-x-1/4 translate-y-[-12%]' : '-translate-x-1/4 translate-y-[10%]';

  return (
    <div
      className={cn(
        'flex justify-between mx-[12.5%]',
        rotationClass,
        translateClass,
        className,
      )}
    >
      {Array.from({ length: maxStacks }).map((_, index) => {
        const isFilled = index < launchStackCount;

        return (
          <div
            key={index}
            className={cn('aspect-square flex-[1_1_19%]', getTransformClasses(index))}
          >
            <AnimatePresence mode="wait">
              {isFilled ? (
                <motion.img
                  key="filled"
                  src={RocketFilled}
                  alt="Launch Stack Collected"
                  className="w-full h-full"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                  onAnimationStart={() => playAudio(TRACKS.CHA_CHING)}
                />
              ) : (
                <motion.img
                  key="empty"
                  src={RocketEmpty}
                  alt="Launch Stack Slot"
                  className="w-full h-full opacity-40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
