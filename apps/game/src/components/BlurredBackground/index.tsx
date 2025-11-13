/**
 * BlurredBackground - Global singleton component for rendering the blurred background effect
 */

import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import { AnimatePresence, motion } from 'framer-motion';
import { type FC } from 'react';
import { useBlurredBackgroundStore, type BlurredBackgroundState } from './store';

export const BlurredBackground: FC = () => {
  const backgroundSrc = useBlurredBackgroundStore(
    (state: BlurredBackgroundState) => state.backgroundSrc,
  );

  return (
    <AnimatePresence>
      {backgroundSrc && (
        <motion.div
          key={backgroundSrc}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: ANIMATION_DURATIONS.UI_TRANSITION_DELAY / 1000 }}
          className="fixed size-full top-0 left-0 flex items-center justify-center blur-xl pointer-events-none"
        >
          <img
            src={backgroundSrc}
            alt=""
            className="w-full h-full object-cover"
            role="presentation"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
