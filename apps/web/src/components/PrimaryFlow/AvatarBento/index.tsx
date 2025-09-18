import Bento, { type BentoProps } from '@/components/Bento';
import Image from 'next/image';
import type { FC } from 'react';
import MeetAstroBento, { type MeetAstroBentoProps } from '../../MeetAstroBento';
import AvatarView, { type AvatarViewProps } from './AvatarView';
import GetStarted, { type GetStartedProps } from '../GetStarted';
import { PrimaryContextProvider } from '../PrimaryFlowContext';
import BentoPlaypenSelfie from '@/components/BentoPlaypenSelfie';
import BentoPlaypenComingSoon from '@/components/BentoPlaypenComingSoon';

export interface AvatarBentoProps extends BentoProps, MeetAstroBentoProps {
  /**
   * Get started CTA text.
   */
  ctaText?: string;
  /**
   * Avatar information.
   * If provided the card will be updated to reflect
   * all options for users with already generated avatars.
   */
  avatarData?: AvatarViewProps | null;
  /**
   * Static content to display in the BaB flow init screen.
   */
  primaryFlowData?: GetStartedProps | null;
}

function hasAvatar(data?: AvatarViewProps | null): data is AvatarViewProps {
  return Boolean(data?.url);
}

const AvatarBento: FC<AvatarBentoProps> = ({
  defaultContent,
  activeContent,
  avatarData,
  primaryFlowData,
  image,
  ...bentoProps
}) => {
  const hasGeneratedAvatar = hasAvatar(avatarData);

  return (
    <div className="portrait:flex-col landscape:grid landscape:grid-cols-2 landscape:grid-rows-3 landscape:gap-8 h-full">
      <div
        className={`portrait:mb-4 landscape:col-span-2 landscape:row-span-1 h-[43.75rem] landscape:h-full ${hasGeneratedAvatar ? 'landscape:row-span-2' : 'landscape:row-span-3'}`}
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
          image={hasGeneratedAvatar ? '/assets/images/Blue_Grid.svg' : image}
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
                <PrimaryContextProvider>
                  <GetStarted {...primaryFlowData} />
                </PrimaryContextProvider>
              )}

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 landscape:bottom-0 landscape:right-0 landscape:left-auto landscape:translate-x-0 landscape:pr-[3rem] landscape:pb-[7rem] z-20">
                <div className="scale-75 landscape:scale-100">
                  <MeetAstroBento defaultContent={defaultContent} activeContent={activeContent} />
                </div>
              </div>
            </>
          )}
        </Bento>
      </div>
      {hasGeneratedAvatar && (
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
