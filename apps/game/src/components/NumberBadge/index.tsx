import Text from '@/components/Text';
import { type FC } from 'react';
import type { NumberBadgeProps } from './types';

export const NumberBadge: FC<NumberBadgeProps> = ({ number, className = '' }) => {
  return (
    <div
      className={`flex items-center justify-center w-[30px] h-[31px] rounded-full border-2 border-common-ash ${className}`}
    >
      <Text as="span" weight="bold" variant="body-large" color="text-common-ash">
        {number}
      </Text>
    </div>
  );
};
