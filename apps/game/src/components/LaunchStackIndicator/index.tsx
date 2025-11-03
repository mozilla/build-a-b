/**
 * LaunchStackIndicator - Displays rocket indicators for launch stack collection
 */

import { type FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { LaunchStackIndicatorProps } from './types';
import RocketEmpty from '../../assets/icons/rocket.svg';
import RocketFilled from '../../assets/icons/rocket-filled.svg';

const getTransformClasses = (position: number) => {
  switch (position) {
    case 0:
      return 'rotate-[-46deg] translate-x-[-1.5rem] translate-y-[1.3rem]';
    case 1:
      return 'rotate-[-25deg] translate-x-[-1.6rem] translate-y-[0.5rem]';
    case 2:
      return 'rotate-[-5deg] translate-x-[-1.5rem] translate-y-[0.1rem]';
    default:
      return '';
  }
};

export const LaunchStackIndicator: FC<LaunchStackIndicatorProps> = ({
  launchStackCount,
  maxStacks = 3,
  className = '',
}) => {
  return (
    <div className={`flex justify-center ${className}`}>
      {Array.from({ length: maxStacks }).map((_, index) => {
        const isFilled = index < launchStackCount;

        return (
          <div key={index} className={`w-5 h-5 ${getTransformClasses(index)}`}>
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
