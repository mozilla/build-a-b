/**
 * DataCookie - Floating data cookie decoration for Data Grab mini-game
 * Displays a cookie icon that floats in a random pattern
 */

import { type FC } from 'react';
import { motion } from 'framer-motion';
import { DATA_GRAB_ASSETS } from '@/config/data-grab-config';

interface DataCookieProps {
  index: number; // Used to offset animation timing
  totalCookies: number; // Total number of cookies for positioning
}

// Deterministic pseudo-random function based on index (always returns same value for same input)
const seededRandom = (seed: number, min: number, max: number): number => {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  const normalized = x - Math.floor(x);
  return min + normalized * (max - min);
};

export const DataCookie: FC<DataCookieProps> = ({ index, totalCookies }) => {
  // Use deterministic values based on index (will always be the same for this index)
  const zoneWidth = 100 / totalCookies;
  const zoneStart = index * zoneWidth;

  // Deterministic "random" values that never change for this index
  const leftPosition = zoneStart + seededRandom(index * 7, 0, zoneWidth * 1.5);
  const topPosition = seededRandom(index * 11, 5, 90);
  const sizeScale = seededRandom(index * 13, 1.0, 1.8);
  const floatDistance = seededRandom(index * 17, 40, 70);
  const horizontalDrift = seededRandom(index * 19, -15, 15);
  const animationDuration = seededRandom(index * 23, 3, 5);
  const animationDelay = index * 0.3;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${leftPosition}%`,
        top: `${topPosition}%`,
        width: `${48 * sizeScale}px`,
        height: `${48 * sizeScale}px`,
      }}
      initial={{ y: 0, x: 0 }}
      animate={{
        y: [0, -floatDistance, 0],
        x: [0, horizontalDrift, 0],
      }}
      transition={{
        duration: animationDuration,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'reverse',
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
