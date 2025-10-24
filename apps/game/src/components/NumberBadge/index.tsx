import { type FC } from 'react';
import type { NumberBadgeProps } from './types';

export const NumberBadge: FC<NumberBadgeProps> = ({ number, className = '' }) => {
  return (
    <div
      className={`flex items-center justify-center w-[30px] h-[31px] rounded-full border-2 border-common-ash ${className}`}
    >
      <span className="font-bold body-large leading-10 text-common-ash">{number}</span>
    </div>
  );
};
