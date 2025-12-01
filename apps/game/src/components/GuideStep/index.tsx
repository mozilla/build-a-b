import Text from '@/components/Text';
import { type FC } from 'react';
import { NumberBadge } from '../NumberBadge';
import type { GuideStepProps } from './types';

export const GuideStep: FC<GuideStepProps> = ({ number, title, description, className = '' }) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <NumberBadge number={number} />
        <Text as="h3" variant="title-4" color="text-common-ash">
          {title}
        </Text>
      </div>
      <div className="ml-10">
        <Text variant="body-medium-semibold" color="text-common-ash">
          {description}
        </Text>
      </div>
    </div>
  );
};
