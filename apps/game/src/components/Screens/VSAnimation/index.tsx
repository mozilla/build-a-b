import { motion } from 'framer-motion';
import { type FC, useEffect, useMemo, useRef } from 'react';

import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';
import { BILLIONAIRES, DEFAULT_BILLIONAIRE_ID } from '@/config/billionaires';
import { useCpuBillionaire, useGameStore } from '@/store';
import { getCharacterAnimation } from '@/utils/character-animations';
import { cn } from '@/utils/cn';

/**
 * VSAnimation Screen
 *
 * Displays a WebM video animation for the player vs CPU matchup.
 * Falls back to text-based display if no animation exists for the matchup.
 * Auto-transitions to gameplay after animation duration (~2 seconds).
 */
export const VSAnimation: FC<BaseScreenProps> = ({ className, ...props }) => {
  const { selectedBillionaire } = useGameStore();
  const cpuBillionaireId = useCpuBillionaire();
  const videoRef = useRef<HTMLVideoElement>(null);

  const playerBillionaire = useMemo(
    () => BILLIONAIRES.find((b) => b.id === selectedBillionaire),
    [selectedBillionaire],
  );

  // CPU billionaire is randomly selected from remaining billionaires
  const cpuBillionaire = useMemo(
    () => BILLIONAIRES.find((b) => b.id === cpuBillionaireId),
    [cpuBillionaireId],
  );

  // Get the animation for this matchup
  const animationSrc = useMemo(
    () =>
      getCharacterAnimation(
        selectedBillionaire || DEFAULT_BILLIONAIRE_ID,
        cpuBillionaireId || DEFAULT_BILLIONAIRE_ID,
        'vs',
      ),
    [selectedBillionaire, cpuBillionaireId],
  );

  // Auto-play video when component mounts
  useEffect(() => {
    if (videoRef.current && animationSrc) {
      videoRef.current.play().catch((error) => {
        console.error('Failed to play VS animation:', error);
      });
    }
  }, [animationSrc]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('relative flex flex-col items-center justify-center w-full h-full', className)}
      {...props}
    >
      {animationSrc ? (
        // Video animation - fills full board dimensions
        <video
          ref={videoRef}
          src={animationSrc}
          muted
          playsInline
          className="w-full h-full object-cover"
          aria-label={`${playerBillionaire?.name} versus ${cpuBillionaire?.name} animation`}
        />
      ) : (
        // Fallback: Text-based display with padding
        <div className="flex flex-col items-center justify-center gap-8 px-9">
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
        </div>
      )}
    </motion.div>
  );
};
