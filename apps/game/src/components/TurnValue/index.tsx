/**
 * TurnValue - Displays the current turn value with stacked effects
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

export const TurnValue: FC<TurnValueProps> = ({
  value,
  activeEffects = [],
  className = '',
}) => {
  const hasTracker = activeEffects.some((e) => e.type === 'tracker');
  const hasBlocker = activeEffects.some((e) => e.type === 'blocker');

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

  // Get the appropriate circle background for single effect or no effects
  const getCircleBackground = () => {
    if (hasTracker && !hasBlocker) return TrackerCircle;
    if (hasBlocker && !hasTracker) return BlockerCircle;
    return ValueCircle;
  };

  // Get SVG for each effect type
  const getEffectSvg = (effectType: 'tracker' | 'blocker') => {
    return effectType === 'tracker' ? TrackerCircle : BlockerCircle;
  };

  return (
    <motion.div
      key={animationKey}
      className={`relative w-[5.5rem] h-[5.5rem] flex flex-col items-center justify-center ${className}`}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.2, 1.2, 1] }}
      transition={{
        duration: 1.2,
        times: [0, 0.3, 0.65, 1],
        ease: 'easeInOut',
      }}
    >
      {/* Turn Value text */}
      <div className="w-[4.375rem] h-[1.5rem] -mb-3">
        <img src={TurnValueText} alt="TURN VALUE" className="w-full h-full" />
      </div>

      {/* Background circle with layered effect SVGs */}
      <div className="w-[3.75rem] h-[3.75rem] shrink-0 relative">
        {activeEffects.length === 0 ? (
          // No effects - show normal circle
          <img src={ValueCircle} alt="" className="w-full h-full rounded-full" />
        ) : activeEffects.length === 1 ? (
          // Single effect - show corresponding circle
          <img src={getCircleBackground()} alt="" className="w-full h-full rounded-full" />
        ) : (
          // Multiple effects - layer SVGs with scaling (reverse order so first is on top)
          <>
            {[...activeEffects].reverse().map((effect, index) => {
              const actualIndex = activeEffects.length - 1 - index;
              // First effect (index 0) = scale 1.0 (most visible)
              // Second effect (index 1) = scale 1.06 (barely visible border)
              // Third effect (index 2) = scale 1.12, etc.
              const scale = 1 + actualIndex * 0.06;

              return (
                <div
                  key={index}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transform: `scale(${scale})`,
                    zIndex: activeEffects.length - actualIndex,
                  }}
                >
                  <img
                    src={getEffectSvg(effect.type)}
                    alt=""
                    className="w-full h-full rounded-full"
                  />
                </div>
              );
            })}
          </>
        )}

        {/* Center value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-white text-3xl">{value}</span>
        </div>

        {/* Effect icons - side by side with overlap in bottom-right */}
        {activeEffects.length > 0 && (
          <div className="absolute -bottom-2 left-[1.5rem] flex flex-row-reverse z-2">
            {activeEffects.map((effect, index) => (
              <motion.div
                key={index}
                className="w-8 h-8"
                style={{
                  zIndex: activeEffects.length - index,
                }}
                initial={{ scale: 0, rotate: -90, x: 0 }}
                animate={{
                  scale: 1,
                  rotate: 0,
                  x: index > 0 ? index * 16 : 0, // 16px = 1rem
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                  delay: index * 0.1,
                }}
              >
                <img
                  src={effect.type === 'tracker' ? PlusIcon : MinusIcon}
                  alt={effect.type === 'tracker' ? '+' : '-'}
                  className="w-full h-full"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
