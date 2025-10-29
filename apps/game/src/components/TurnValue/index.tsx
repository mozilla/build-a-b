/**
 * TurnValue - Displays the current turn value with curved text
 */

import { type FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { TurnValueProps } from './types';
import TrackerCircle from '../../assets/icons/tracker-circle.svg';
import BlockerCircle from '../../assets/icons/blocker-circle.svg';
import ValueCircle from '../../assets/icons/value-circle.svg';
import TurnValueText from '../../assets/icons/turn-value.svg';
import PlusIcon from '../../assets/icons/tracker-plus.svg';
import MinusIcon from '../../assets/icons/blocker-minus.svg';

export const TurnValue: FC<TurnValueProps> = ({ value, state = 'normal', className = '' }) => {
  const isTracker = state === 'tracker';
  const isBlocker = state === 'blocker';
  const isNormal = state === 'normal';

  // Size adjustments based on state
  const containerSize = isTracker ? 'w-20 h-20' : 'w-[5.5rem] h-[5.5rem]';
  const circleSize = 'w-[3.75rem] h-[3.75rem]';
  const textSize = isTracker ? 'text-4xl' : 'text-3xl';

  // Track value changes to trigger animation
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    // Skip animation if value is going back to zero
    if (value === 0) {
      return;
    }
    // Trigger animation when value changes
    setAnimationKey((prev) => prev + 1);
  }, [value]);

  return (
    <motion.div
      key={animationKey}
      className={`relative ${containerSize} flex flex-col items-center justify-center ${className}`}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.2, 1.2, 1] }}
      transition={{
        duration: 1.2,
        times: [0, 0.3, 0.65, 1],
        ease: 'easeInOut',
      }}
    >
      {/* Turn Value text - positioned above circle */}
      <div className="w-[4.375rem] h-[1.5rem] -mb-3">
        <img src={TurnValueText} alt="TURN VALUE" className="w-full h-full" />
      </div>

      {/* Background circle */}
      {isTracker && (
        // Tracker state: green glowing circle with SVG background
        <div className={`${circleSize} shrink-0 relative`}>
          <img src={TrackerCircle} alt="" className="w-full h-full" />
          {/* Center value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-bold text-white ${textSize}`}>{value}</span>
          </div>
          {/* Tracker plus icon overlay */}
          <div className="absolute -bottom-2 -right-2 w-8 h-8">
            <img src={PlusIcon} alt="+" className="w-full h-full" />
          </div>
        </div>
      )}

      {isBlocker && (
        // Tracker state: green glowing circle with SVG background
        <div className={`${circleSize} shrink-0 relative`}>
          <img src={BlockerCircle} alt="" className="w-full h-full" />
          {/* Center value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-bold text-white ${textSize}`}>{value}</span>
          </div>
          {/* Tracker plus icon overlay */}
          <div className="absolute -bottom-2 -right-2 w-8 h-8">
            <img src={MinusIcon} alt="+" className="w-full h-full" />
          </div>
        </div>
      )}

      {isNormal && (
        // Normal state: SVG circle with specified styles
        <div className={`${circleSize} shrink-0 relative`}>
          <img src={ValueCircle} alt="" className="w-full h-full" />
          {/* Center value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-bold text-white ${textSize}`}>{value}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};
