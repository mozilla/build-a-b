/**
 * EffectNotificationBadge - Badge showing effect on special cards
 */

import { type FC } from 'react';
import { motion } from 'framer-motion';
import { capitalize } from '@/utils/capitalize';
import RocketIcon from '../../assets/icons/rocket-filled.svg';

interface EffectNotificationBadgeProps {
  effectName: string;
}

export const EffectNotificationBadge: FC<EffectNotificationBadgeProps> = ({ effectName }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      className="flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 bg-gray-800/30 border-white/20"
    >
      {/* Icon */}
      <img src={RocketIcon} alt="" className="w-8 h-8" />

      {/* Effect text */}
      <span className="text-white body-xs font-bold whitespace-nowrap p-2 bg-charcoal rounded-md">
        1 {capitalize(effectName)}
      </span>
    </motion.div>
  );
};
