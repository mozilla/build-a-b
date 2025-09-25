import { evaluateFlag } from '@/app/flags';
import Bento, { type BentoProps } from '@/components/Bento';
import BentoPlaypenComingSoon from '@/components/BentoPlaypenComingSoon';
import BentoPlaypenSelfie from '@/components/BentoPlaypenSelfie';
import type { AvatarData } from '@/types';
import Image from 'next/image';
import type { FC } from 'react';
import { Suspense } from 'react';
import BrowserBento, { type BrowserBentoProps } from '../../BrowserBento';
import GetStarted, { type GetStartedProps } from '../GetStarted';
import AvatarView from './AvatarView';

export interface AvatarBentoProps extends BentoProps, BrowserBentoProps {
  /**
   * Get started CTA text.
   */
  ctaText?: string;
  /**
   * Avatar information.
   * If provided the card will be updated to reflect
   * all options for users with already generated avatars.
   */
  avatarData?: AvatarData | null;
  /**
   * Static content to display in the BaB flow init screen.
   */
  primaryFlowData?: GetStartedProps | null;
  // imageProps?: ImageProps;
}

function hasAvatar(data?: AvatarData | null): data is AvatarData {
  return Boolean(data?.url);
}

const AvatarBento: FC<AvatarBentoProps> = async ({
  avatarData,
  primaryFlowData,
  imageSrcLandscape,
  imageSrcPortrait,
  ...bentoProps
}) => {
  const hasGeneratedAvatar = hasAvatar(avatarData);
  const showPlaypenButtons = await evaluateFlag('showAvatarPlaypenButtons');

  return (
    <div className="portrait:flex-col landscape:grid landscape:grid-cols-2 landscape:grid-rows-3 landscape:gap-8 h-full">
      <div
        className={`landscape:col-span-2 landscape:row-span-1 h-[38.5625rem] landscape:h-full ${hasGeneratedAvatar && showPlaypenButtons ? 'portrait:mb-4 landscape:row-span-2' : 'landscape:row-span-3'}`}
      >
        <Bento
          className={`
            ${
              hasGeneratedAvatar
                ? 'bg-gradient-to-r from-secondary-blue to-secondary-purple group'
                : 'bg-gray-100'
            } 
            ${
              !hasGeneratedAvatar
                ? 'group hover:[&_img]:scale-110 hover:[&_img]:rotate-[3deg] [&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-in-out'
                : ''
            } 
            h-full landscape:block [&_img]:object-[20%_center] landscape:[&_img]:object-cover`}
          {...bentoProps}
          imageSrcLandscape={
            hasGeneratedAvatar ? '/assets/images/blue-grid.svg' : imageSrcLandscape
          }
          imageSrcPortrait={hasGeneratedAvatar ? '/assets/images/blue-grid.svg' : imageSrcPortrait}
          imageClassName={hasGeneratedAvatar ? 'object-cover' : 'overflow-visible'}
          imagePropsLandscape={hasGeneratedAvatar ? {} : { objectPosition: '29%' }}
          imagePropsPortrait={hasGeneratedAvatar ? {} : { objectPosition: '18%' }}
          priority
        >
          {hasGeneratedAvatar && (
            <Image
              src="/assets/images/grain-main.webp"
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="absolute inset-0 z-10 object-cover mix-blend-overlay"
            />
          )}

          {hasGeneratedAvatar ? (
            <AvatarView {...avatarData} />
          ) : (
            <>
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
                <div className="relative w-full h-full">
                  <BrowserBento gradient className="absolute h-full">
                    <span className="block text-common-ash text-2xl-custom font-extrabold px-[1.375rem]">
                      Unlimited power. Zero accountability. What could go wrong?
                    </span>
                  </BrowserBento>
                  <BrowserBento
                    inverse
                    className="absolute h-full opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-500"
                  >
                    <span className="text-charcoal text-sm-custom font-semibold p-6">
                      Unlike Big Tech Billionaires watching your every click, Firefox lets you play
                      (and browse) with privacy as the default. So let&apos;s build our own spoiled
                      little Billionaires and send them off-planet for good.
                    </span>
                  </BrowserBento>
                </div>
              </div>
            </>
          )}
        </Bento>
      </div>
      {hasGeneratedAvatar && showPlaypenButtons && (
        <>
          <div className="portrait:mb-4 portrait:h-[11.375rem] landscape:col-span-1 landscape:row-span-1 w-full landscape:h-full">
            <BentoPlaypenSelfie />
          </div>
          <div className="portrait:h-[11.375rem] landscape:col-span-1 landscape:row-span-1 w-full landscape:h-full">
            <BentoPlaypenComingSoon />
          </div>
        </>
      )}
    </div>
  );
};

export default AvatarBento;
