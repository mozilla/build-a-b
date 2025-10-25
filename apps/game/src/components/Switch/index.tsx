import { type FC } from 'react';
import type { SwitchProps } from './types';

export const Switch: FC<SwitchProps> = ({ checked, onChange, className = '' }) => {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        checked ? 'bg-accent' : 'bg-charcoal'
      } border-2 border-common-ash ${className}`}
      role="switch"
      aria-checked={checked}
    >
      <div
        className={`absolute top-1 w-5 h-5 bg-charcoal rounded-full transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};
