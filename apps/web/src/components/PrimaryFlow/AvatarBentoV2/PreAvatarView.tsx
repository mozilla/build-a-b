'use client';

import Bento, { type BentoProps } from '@/components/Bento';
import { FC, Suspense, useState } from 'react';
import BrowserBento, { type BrowserBentoProps } from '../../BrowserBento';
import GetStarted, { type GetStartedProps } from '../GetStarted';

interface PreAvatarViewProps extends BentoProps, BrowserBentoProps {
  primaryFlowData?: GetStartedProps | null;
}

const PreAvatarView: FC<PreAvatarViewProps> = ({
  primaryFlowData,
  imageSrcLandscape,
  imageSrcPortrait,
  ...bentoProps
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMouseEnter = () => {
    setIsFlipped(true);
  };

  const handleMouseLeave = () => {
    setIsFlipped(false);
  };
  const styleForCard = !isFlipped ? 'opacity-0' : 'opacity-100';

  return (
    <Bento
      className="bg-gray-100 group hover:[&_img]:scale-110 hover:[&_img]:rotate-[3deg] [&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-in-out h-full landscape:block [&_img]:object-[20%_center] landscape:[&_img]:object-cover"
      {...bentoProps}
      imageSrcLandscape={imageSrcLandscape}
      imageSrcPortrait={imageSrcPortrait}
      imageClassName="overflow-visible"
      imagePropsLandscape={{ objectPosition: '29%' }}
      imagePropsPortrait={{ objectPosition: '18%' }}
      priority
    >
      {primaryFlowData && (
        <Suspense fallback={<div>Loading...</div>}>
          <GetStarted {...primaryFlowData} />
        </Suspense>
      )}

      <div
        className="absolute z-20 bottom-0 w-full h-[14.3125rem] px-4 pb-4
                          landscape:bottom-[12.9375rem] landscape:right-[3rem] landscape:px-0 landscape:pb-0
                          landscape:w-[20.5625rem] landscape:h-[12.625rem]"
      >
        <div
          className="relative w-full h-full"
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <BrowserBento gradient flips className="absolute h-full">
            <span className="block text-common-ash text-2xl-custom font-extrabold px-[1.375rem]">
              Unlimited power. Zero accountability. What could go wrong?
            </span>
          </BrowserBento>
          <BrowserBento
            inverse
            flips
            className={`absolute h-full opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-500 ${styleForCard}`}
          >
            <span className="text-charcoal text-sm-custom font-semibold p-6">
              Unlike Big Tech Billionaires watching your every click, Firefox lets you play (and
              browse) with privacy as the default. So let&apos;s build our own little Billionaires
              and send them off-planet for good.
            </span>
          </BrowserBento>
        </div>
      </div>
    </Bento>
  );
};

export default PreAvatarView;
