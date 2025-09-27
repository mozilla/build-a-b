import { evaluateFlag } from '@/app/flags';
import Bento, { type BentoProps } from '@/components/Bento';
import BentoPlaypenComingSoon from '@/components/BentoPlaypenComingSoon';
import BentoPlaypenSelfie from '@/components/BentoPlaypenSelfie';
import type { AvatarData } from '@/types';
import Image from 'next/image';
import type { FC } from 'react';
import { Suspense } from 'react';
import { type BrowserBentoProps } from '../../BrowserBento';
import GetStarted, { type GetStartedProps } from '../GetStarted';
import AvatarView from './AvatarView';
import BrowserBentoDual from '@/components/PrimaryFlow/BrowserBentoDual';

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

              <BrowserBentoDual />
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
