import { type FC } from 'react';
import { NumberBadge } from '../NumberBadge';
import type { GuideStepProps } from './types';

export const GuideStep: FC<GuideStepProps> = ({ number, title, description, className = '' }) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <NumberBadge number={number} />
        <h3 className="title-4 text-common-ash">{title}</h3>
      </div>
      <div className="ml-10">
        <p className="body-regular text-common-ash">{description}</p>
      </div>
    </div>
  );
};
