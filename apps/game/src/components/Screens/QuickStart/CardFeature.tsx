'use client';
import Text from '@/components/Text';
import { cn } from '@/utils/cn';
import { type FC } from 'react';

export interface CardFeatureProps {
  cardType?: string;
  cardTotalNumber: string;
  cardTitle: string;
  cardImgSrc: string;
  cardDesc: string;
  className?: string;
}

const CardFeature: FC<CardFeatureProps> = ({
  cardType,
  cardTotalNumber,
  cardTitle,
  cardImgSrc,
  cardDesc,
  className = '',
}) => {
  return (
    <div className={cn('flex flex-col gap-6 items-start', className)}>
      <div className="w-[10.875rem] aspect-[174/243] relative shadow-[0_0.25rem_1.75rem_0_rgba(0,0,0,0.35)]">
        <div className="w-full h-full relative">
          <img
            src={cardImgSrc}
            alt={cardTitle}
            className="absolute inset-0 object-cover object-center"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start pl-2 w-full">
        <div>
          <Text variant="body-medium" weight="bold" color="text-common-ash">
            {cardTotalNumber}
          </Text>
        </div>
        <div className="flex flex-col gap-2 items-start w-[10.875rem]">
          <div className="flex flex-col items-start w-full">
            {cardType && (
              <Text variant="body-large" weight="extrabold" color="text-common-ash">
                {cardType}
              </Text>
            )}
            <Text variant="body-large" weight="extrabold" color="text-common-ash">
              {cardTitle}
            </Text>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-start w-[10.875rem]">
          <div className="flex flex-col gap-1 items-start w-full">
            <Text variant="body-medium-semibold" color="text-common-ash">
              <span dangerouslySetInnerHTML={{ __html: cardDesc }}></span>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardFeature;
