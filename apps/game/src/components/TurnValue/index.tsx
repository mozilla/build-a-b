/**
 * TurnValue - Displays the current turn value with curved text
 */

import { type FC } from 'react';
import type { TurnValueProps } from './types';
import TrackerCircle from '../../assets/icons/tracker-circle.svg';
import ValueCircle from '../../assets/icons/value-circle.svg';
import TurnValueText from '../../assets/icons/turn-value.svg';
import PlusIcon from '../../assets/icons/plus.svg';

export const TurnValue: FC<TurnValueProps> = ({ value, state = 'normal', className = '' }) => {
  const isTracker = state === 'tracker';

  // Size adjustments based on state
  const containerSize = isTracker ? 'w-20 h-20' : 'w-[5.5rem] h-[5.5rem]';
  const circleSize = 'w-[3.75rem] h-[3.75rem]';
  const textSize = isTracker ? 'text-4xl' : 'text-3xl';

  return (
    <div className={`relative ${containerSize} flex flex-col items-center justify-center ${className}`}>
      {/* Turn Value text - positioned above circle */}
      <div className="w-[4.375rem] h-[1.5rem] -mb-3">
        <img src={TurnValueText} alt="TURN VALUE" className="w-full h-full" />
      </div>

      {/* Background circle */}
      {isTracker ? (
        // Tracker state: green glowing circle with SVG background
        <div className={`${circleSize} shrink-0 relative`}>
          <img src={TrackerCircle} alt="" className="w-full h-full" />
          {/* Center value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-bold text-white ${textSize}`}>{value}</span>
          </div>
          {/* Tracker plus icon overlay */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8">
            <img src={PlusIcon} alt="+" className="w-full h-full" />
          </div>
        </div>
      ) : (
        // Normal state: SVG circle with specified styles
        <div className={`${circleSize} shrink-0 relative`}>
          <img src={ValueCircle} alt="" className="w-full h-full" />
          {/* Center value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-bold text-white ${textSize}`}>{value}</span>
          </div>
        </div>
      )}
    </div>
  );
};
