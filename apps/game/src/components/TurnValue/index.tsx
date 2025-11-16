/**
 * TurnValue - Displays the current turn value with stacked effects
 */

import burstAnimation from '@/assets/animations/effects/burst.json';
import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon/registry';
import { LottieAnimation } from '@/components/LottieAnimation';
import Text from '@/components/Text';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { type FC, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import TurnValueText from '../../assets/icons/turn-value.svg';
import type { TurnValueProps } from './types';

// Map effect types to icon names (only tracker and blocker affect turn values)
const EFFECT_ICON_MAP: Record<string, IconName> = {
  tracker: 'trackerIcon',
  blocker: 'blockerIcon',
};

export const TurnValue: FC<TurnValueProps> = ({ value, activeEffects = [], className = '' }) => {
  // Track value changes to trigger animation
  const [animationKey, setAnimationKey] = useState(0);
  const [showBurst, setShowBurst] = useState(false);
  const [burstPosition, setBurstPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip animation if value is going back to zero
    if (value === 0) {
      return;
    }

    // Get the position of the turn value component
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setBurstPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
      setShowBurst(true);

      // Hide burst after animation duration (1200ms to match scale animation)
      setTimeout(() => {
        setShowBurst(false);
      }, 1200);
    }

    // Trigger animation when value changes
    setAnimationKey((prev) => prev + 1);
  }, [value]);

  return (
    <>
      <motion.div
        ref={containerRef}
        key={animationKey}
        className={cn(
          'isolate relative aspect-square w-[88px] sm:w-[5.5rem] sm:h-[5.5rem] flex flex-col items-center justify-center',
          className,
        )}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.2, 1.2, 1] }}
        transition={{
          duration: 1.2,
          times: [0, 0.3, 0.65, 1],
          ease: 'easeInOut',
        }}
      >
        {/* Turn Value text */}
        <div className="w-[79.545%] h-[27.272%] sm:w-[4.375rem] sm:h-[1.5rem] mb-[-13.636%] sm:-mb-3">
          <img src={TurnValueText} alt="TURN VALUE" className="w-full h-full" />
        </div>

        {/* Background circle with layered effect circles */}
        <div className="w-[68.181%] aspect-square sm:w-[3.75rem] sm:h-[3.75rem] shrink-0 relative">
          {activeEffects.length === 0 ? (
            // No effects - show neutral circle with glow animation
            <motion.div
              className="w-full h-full rounded-full bg-[rgba(255,255,255,0.1)] border-2 border-[rgba(255,255,255,0.3)]"
              initial={{ filter: 'drop-shadow(0 0 0px rgba(255, 255, 255, 0))' }}
              animate={{
                filter: [
                  'drop-shadow(0 0 0px rgba(255, 255, 255, 0))',
                  'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))',
                  'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))',
                  'drop-shadow(0 0 0px rgba(255, 255, 255, 0))',
                ],
              }}
              transition={{
                duration: 1.2,
                times: [0, 0.3, 0.65, 1],
                ease: 'easeInOut',
              }}
            />
          ) : activeEffects.length === 1 ? (
            // Single effect - show corresponding circle with glow animation
            <motion.div
              className={cn(
                'w-full h-full rounded-full border-6',
                activeEffects[0].type === 'tracker' && 'bg-[rgba(73,193,180,0.3)] border-[#49C1B4]',
                activeEffects[0].type === 'blocker' &&
                  'bg-[rgba(252,233,120,0.3)] border-[#FCE978]',
              )}
              initial={{ filter: 'drop-shadow(0 0 0px rgba(255, 255, 255, 0))' }}
              animate={{
                filter: [
                  'drop-shadow(0 0 0px rgba(255, 255, 255, 0))',
                  'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))',
                  'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))',
                  'drop-shadow(0 0 0px rgba(255, 255, 255, 0))',
                ],
              }}
              transition={{
                duration: 1.2,
                times: [0, 0.3, 0.65, 1],
                ease: 'easeInOut',
              }}
            />
          ) : (
            // Multiple effects - layer circles with scaling (reverse order so first is on top)
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
                    <div
                      className={cn(
                        'w-full h-full rounded-full border-6',
                        effect.type === 'tracker' && 'bg-[rgba(73,193,180,0.3)] border-[#49C1B4]',
                        effect.type === 'blocker' && 'bg-[rgba(252,233,120,0.3)] border-[#FCE978]',
                      )}
                    />
                  </div>
                );
              })}
            </>
          )}

          {/* Center value */}
          <div className="absolute inset-0 flex items-center justify-center z-2">
            <Text as="span" variant="badge-xl" color="text-common-ash">
              {value}
            </Text>
          </div>

          {/* Effect icons - side by side with overlap in bottom-right */}
          {activeEffects.length > 0 && (
            <div
              className="absolute -bottom-2 flex flex-row-reverse z-2 isolate"
              style={{
                right: `${-1 * 4 + 4 * (activeEffects.length - 1)}px`,
              }}
            >
              {activeEffects.map((effect, index) => (
                <motion.div
                  key={`${effect.type}-${index}`}
                  className="w-[32px] sm:w-8 aspect-square shrink-0"
                  style={{
                    zIndex: activeEffects.length - index,
                    color: 'initial', // Prevent color inheritance
                  }}
                  initial={{ scale: 0, rotate: -90, x: 0 }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                    x: index > 0 ? index * 16 : 0, // 16px offset per icon
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    delay: index * 0.1,
                  }}
                >
                  <Icon
                    name={EFFECT_ICON_MAP[effect.type]}
                    size={32}
                    aria-label={`${effect.type} effect`}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Burst Animation - Rendered via Portal to appear on top */}
      {typeof window !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {showBurst && (
              <motion.div
                className="fixed pointer-events-none w-[200px] h-[200px] -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${burstPosition.x}px`,
                  top: `${burstPosition.y}px`,
                }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 1, opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              >
                <LottieAnimation
                  animationData={burstAnimation}
                  loop={false}
                  autoplay={true}
                  width={200}
                  height={200}
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};
