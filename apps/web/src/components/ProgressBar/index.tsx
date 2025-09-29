'use client';

import { Progress } from '@heroui/react';
import { useEffect, useState } from 'react';
import type { FC } from 'react';

interface ProgressBarProps {
  className?: string;
  duration?: number;
}

const ProgressBar: FC<ProgressBarProps> = ({ className = '', duration = 4000 }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);

      setValue(progress);

      if (progress < 100) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [duration]);

  return (
    <div className={`w-full px-4 ${className}`}>
      <Progress
        value={value}
        className="w-full h-[0.75rem]"
        classNames={{
          base: 'max-w-none',
          track: 'bg-common-ash h-full rounded-full border border-common-ash',
          indicator: 'bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full',
        }}
        aria-label="Minting progress"
      />
    </div>
  );
};

export default ProgressBar;
