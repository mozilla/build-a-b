'use client';

import { Progress } from '@heroui/react';
import { useEffect, useState } from 'react';
import type { FC } from 'react';

interface ProgressBarProps {
  className?: string;
}

const ProgressBar: FC<ProgressBarProps> = ({ className = '' }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 4000; // 4 seconds

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);

      setValue(progress);

      if (progress < 100) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <Progress
        value={value}
        className="w-[14.625rem] h-[0.75rem] landscape:w-[39rem] landscape:h-[0.75rem]"
        classNames={{
          base: 'max-w-none',
          track: 'bg-common-ash h-full rounded-full',
          indicator: 'bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full',
        }}
        aria-label="Minting progress"
      />
    </div>
  );
};

export default ProgressBar;
