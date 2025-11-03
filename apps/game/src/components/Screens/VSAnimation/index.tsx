import { motion } from 'framer-motion';
import { type FC, useMemo } from 'react';

import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';
import { BILLIONAIRES, DEFAULT_BILLIONAIRE_ID } from '@/config/billionaires';
import { useGameStore } from '@/store';
import { cn } from '@/utils/cn';

/**
 * VSAnimation Screen
 *
 * Placeholder screen for the VS animation phase.
 * Currently shows billionaire names and "VS" text, auto-transitions after 2 seconds.
 *
 * TODO: Implement full VS animation showing:
 * - Player's selected billionaire with image
 * - Animated VS text with effects
 * - CPU opponent with image
 * - Transition animation to gameplay
 */
export const VSAnimation: FC<BaseScreenProps> = ({ className, ...props }) => {
  const { selectedBillionaire } = useGameStore();

  const playerBillionaire = useMemo(
    () => BILLIONAIRES.find((b) => b.id === selectedBillionaire),
    [selectedBillionaire],
  );

  // CPU always uses Chaz (the default billionaire)
  const cpuBillionaire = useMemo(
    () => BILLIONAIRES.find((b) => b.id === DEFAULT_BILLIONAIRE_ID),
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative flex flex-col items-center justify-center gap-8 min-h-full px-9',
        className,
      )}
      {...props}
    >
      {/* Player Name */}
      <Text variant="title-2" align="center" className="text-common-ash">
        {playerBillionaire?.name || 'Player'}
      </Text>

      {/* VS Text */}
      <Text variant="title-1" className="text-common-ash">
        VS
      </Text>

      {/* CPU Name */}
      <Text variant="title-2" align="center" className="text-common-ash">
        {cpuBillionaire?.name || 'Computer'}
      </Text>
    </motion.div>
  );
};
