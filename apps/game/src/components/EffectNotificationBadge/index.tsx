/**
 * EffectNotificationBadge - Badge showing effect on special cards
 */

import { Icon } from '@/components/Icon';
import Text from '@/components/Text';
import { motion } from 'framer-motion';
import { type FC } from 'react';

interface EffectNotificationBadgeProps {
  effectName: string;
}

export const EffectNotificationBadge: FC<EffectNotificationBadgeProps> = () => {
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
      className="max-w-[5.875rem] flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 bg-gray-800/30 border-white/20"
    >
      {/* Icon */}
      <Icon name="effectRocket" size={30} />

      {/* Effect text */}
      <Text
        variant="badge-xs"
        className="whitespace-nowrap p-2 bg-charcoal rounded-md"
        color="text-common-ash"
        weight="extrabold"
      >
        1 Effect
      </Text>
    </motion.div>
  );
};
