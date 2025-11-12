/**
 * DataCookie - Floating data cookie decoration for Data Grab mini-game
 * Displays a cookie icon that floats in a random pattern
 */

import { type FC } from 'react';
import { motion } from 'framer-motion';
import { DATA_GRAB_ASSETS, DATA_GRAB_ANIMATIONS } from '@/config/data-grab-config';

interface DataCookieProps {
  index: number; // Used to offset animation timing
  totalCookies: number; // Total number of cookies for positioning
}

export const DataCookie: FC<DataCookieProps> = ({ index, totalCookies }) => {
  // Distribute cookies across the screen width and height
  const leftPosition = (index / totalCookies) * 100;
  const topPosition = Math.random() * 80 + 10; // 10% to 90% from top

  // Random animation delay for visual variety
  const animationDelay = Math.random() * 2;

  // Random size variation (80% to 120% of base size)
  const sizeScale = 0.8 + Math.random() * 0.4;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${leftPosition}%`,
        top: `${topPosition}%`,
        width: `${48 * sizeScale}px`,
        height: `${48 * sizeScale}px`,
      }}
      initial={{ y: 0, opacity: 0.6 }}
      animate={{
        y: [0, -20, 0],
        opacity: [0.6, 0.9, 0.6],
      }}
      transition={{
        duration: parseFloat(DATA_GRAB_ANIMATIONS.COOKIE_FLOAT.duration),
        ease: 'easeInOut', // Framer Motion uses camelCase
        repeat: Infinity,
        repeatType: 'reverse', // alternate = reverse in Framer Motion
        delay: animationDelay,
      }}
    >
      <img
        src={DATA_GRAB_ASSETS.COOKIE_ICON}
        alt="Data cookie"
        className="w-full h-full object-contain"
      />
    </motion.div>
  );
};
