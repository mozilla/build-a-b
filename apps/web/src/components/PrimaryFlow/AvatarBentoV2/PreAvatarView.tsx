import Bento, { type BentoProps } from '@/components/Bento';
import { FC } from 'react';
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
      {primaryFlowData && <GetStarted {...primaryFlowData} />}

      <div
        className="absolute z-20 bottom-0 w-full h-[14.3125rem] px-4 pb-4
                          landscape:bottom-[12.9375rem] landscape:right-[3rem] landscape:px-0 landscape:pb-0
                          landscape:w-[20.5625rem] landscape:h-[12.625rem]"
      >
        <div className="relative w-full h-full">
          <BrowserBento gradient className="absolute h-full">
            <span className="block text-common-ash text-2xl-custom font-extrabold px-[1.375rem]">
              Make space a better place. Add a Billionaire.
            </span>
          </BrowserBento>
          <BrowserBento
            inverse
            className="absolute h-full opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-500"
          >
            <span className="text-charcoal text-sm-custom font-semibold p-6">
              Unlike Big Tech Billionaires watching your every click, Firefox lets you play (and
              browse) with privacy as the default. So let&apos;s build our own spoiled little
              Billionaires and send them off-planet for good.
            </span>
          </BrowserBento>
        </div>
      </div>
    </Bento>
  );
};

export default PreAvatarView;
