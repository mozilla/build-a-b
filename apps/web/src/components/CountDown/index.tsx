'use client';

import clsx from 'clsx';
import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import CountDownHorizontal from './countdown-horizontal';
import Livestream from './livestream';

// Switch to livestream this many minutes before launch
const LIVESTREAM_SWITCH_THRESHOLD_MINUTES = 15;

export interface CountDownProps {
  targetDate: string; // Format "2025-10-10T23:59:59-05:00"
  className?: string;
  cta?: ReactNode;
  isLaunchCompleted: boolean;
  mode?: 'home' | 'twitchcon';
}

const CountDown: FC<CountDownProps> = ({
  targetDate,
  className,
  cta,
  isLaunchCompleted,
  mode = 'twitchcon',
}) => {
  const target = useMemo(() => new Date(targetDate), [targetDate]);
  const [showLivestream, setShowLivestream] = useState(false);

  useEffect(() => {
    const updateView = () => {
      const now = new Date();
      const diffMs = target.getTime() - now.getTime();
      const minsThresholdMs = LIVESTREAM_SWITCH_THRESHOLD_MINUTES * 60 * 1000;

      setShowLivestream(diffMs <= minsThresholdMs);
    };

    // Run immediately to set the initial state
    updateView();

    // Update every 30 seconds (fine-grained enough without wasting CPU)
    const interval = setInterval(updateView, 30_000);

    // Cleanup when unmounted
    return () => clearInterval(interval);
  }, [targetDate, target]);

  // TwitchCon mode always shows countdown
  if (mode === 'twitchcon') {
    return (
      <section className={clsx('mb-4 landscape:mb-8', className)}>
        <CountDownHorizontal
          targetDate={targetDate}
          cta={cta}
          isLaunchCompleted={isLaunchCompleted}
        />
      </section>
    );
  }

  // Home mode — switches dynamically between countdown and livestream
  return (
    <section className={clsx('mb-4 landscape:mb-8', className)}>
      {showLivestream ? (
        <Livestream />
      ) : (
        <CountDownHorizontal
          targetDate={targetDate}
          cta={cta}
          isLaunchCompleted={isLaunchCompleted}
        />
      )}
    </section>
  );
};

export default CountDown;
