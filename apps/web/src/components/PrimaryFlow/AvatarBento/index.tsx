import Bento, { type BentoProps } from '@/components/Bento';
import Image from 'next/image';
import type { FC } from 'react';
import MeetAstroBento, { type MeetAstroBentoProps } from '../../MeetAstroBento';
import AvatarView, { type AvatarViewProps } from './AvatarView';
import GetStarted, { type GetStartedProps } from '../GetStarted';

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
    <Bento
      className={`${hasGeneratedAvatar ? 'bg-gradient-to-r from-[var(--secondary-blue)] to-[var(--secondary-purple)] group' : 'bg-gray-100'} h-[43.6875rem] @variant landscape:h-[26.4375rem] ${!hasGeneratedAvatar ? 'group hover:[&_img]:scale-110 hover:[&_img]:rotate-[3deg] [&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-in-out' : ''} @variant landscape:block [&_img]:object-[20%_center] @variant landscape:[&_img]:object-cover`}
      {...bentoProps}
      image={hasGeneratedAvatar ? '/assets/images/Blue_Grid.svg' : image}
      priority
    >
      {hasGeneratedAvatar && (
        <Image
          src="/assets/images/grain-main.svg"
          alt=""
          fill
          sizes="100vw"
          className="absolute inset-0 z-10 object-cover mix-blend-overlay"
        />
      )}

      {hasGeneratedAvatar ? (
        <AvatarView {...avatarData} />
      ) : (
        <>
          {primaryFlowData && <GetStarted {...primaryFlowData} />}

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 @variant landscape:bottom-0 @variant landscape:right-0 @variant landscape:left-auto @variant landscape:translate-x-0 @variant landscape:pr-[3rem] @variant landscape:pb-[7rem] z-20">
            <div className="scale-75 @variant landscape:scale-100">
              <MeetAstroBento defaultContent={defaultContent} activeContent={activeContent} />
            </div>
          </div>
        </>
      )}
    </Bento>
  );
};

export default AvatarBento;
