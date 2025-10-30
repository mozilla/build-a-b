import { cn } from '@/utils/cn';
import { type FC } from 'react';
import type { SwitchProps } from './types';

export const Switch: FC<SwitchProps> = ({ checked, onChange, className = '' }) => {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'grid w-12 h-7.5 rounded-full items-center transition-colors bg-charcoal border-2 border-common-ash delay-200',
        className,
        checked && 'bg-accent delay-0',
      )}
      role="switch"
      aria-checked={checked}
    >
      <div
        className={cn(
          'ml-0.5 w-5 h-5 bg-charcoal rounded-full transition-transform border-common-ash border-2',
          checked && 'translate-x-full border-charcoal',
        )}
      />
    </button>
  );
};
