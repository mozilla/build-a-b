import type { FC } from 'react';
import Bento, { type BentoProps } from '@/components/Bento';
import { Button } from '@heroui/button';
import Image from 'next/image';
import MeetAstroBento, { type MeetAstroBentoProps } from '../MeetAstroBento';
import AvatarView, { type AvatarViewProps } from './AvatarView';

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
}

function hasAvatar(data?: AvatarViewProps | null): data is AvatarViewProps {
  return Boolean(data?.url);
}

const AvatarBento: FC<AvatarBentoProps> = ({
  ctaText = 'Get Started',
  defaultContent,
  activeContent,
  avatarData,
  ...bentoProps
}) => {
  const hasGeneratedAvatar = hasAvatar(avatarData);

  return (
    <Bento
      className={`${hasGeneratedAvatar ? 'bg-gradient-to-r from-[var(--secondary-blue)] to-[var(--secondary-purple)] group' : 'bg-gray-100'} h-[43.6875rem] @variant landscape:h-[26.4375rem] ${!hasGeneratedAvatar ? 'group hover:[&_img]:scale-110 hover:[&_img]:rotate-[3deg] [&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-in-out' : ''} @variant landscape:block [&_img]:object-[20%_center] @variant landscape:[&_img]:object-cover`}
      {...bentoProps}
      image={hasGeneratedAvatar ? '/assets/images/Blue_Grid.svg' : bentoProps.image}
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
          <Button
            type="button"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[9.119deg] @variant landscape:top-auto @variant landscape:left-auto @variant landscape:translate-x-0 @variant landscape:translate-y-0 @variant landscape:bottom-[8.235rem] @variant landscape:left-[7.8125rem] z-20 border border-[var(--colors-common-teal-500)] font-bold text-base text-[var(--colors-common-teal-500)] rounded-full px-[2.5rem] h-[2.5rem] cursor-pointer hover:text-[var(--primary-charcoal)] hover:bg-[var(--colors-common-teal-500)] transition-colors duration-300"
          >
            {ctaText}
          </Button>

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
