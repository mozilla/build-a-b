import type { FC } from 'react';
import Bento, { type BentoProps } from '@/components/Bento';
import { Button } from '@heroui/button';
import Image from 'next/image';
import MeetAstroBento, { type MeetAstroBentoProps } from '../MeetAstroBento';

interface AvatarData {
  /**
   * The avatar image url.
   */
  url: string;
  /**
   * Avatar name
   */
  name: string;
  /**
   * Avatar attributes.
   */
  attributes: string;
}

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
  avatarData?: AvatarData | null;
}

const actionButtonStyles =
  'min-w-[6.0625rem] px-[0.625rem] border border-[var(--colors-common-teal-500)] font-bold text-[0.875rem] leading-[1.25rem] text-[var(--colors-common-teal-500)] rounded-full h-[2rem] cursor-pointer hover:text-[var(--primary-charcoal)] hover:bg-[var(--colors-common-teal-500)] transition-colors duration-300 gap-[0.375rem] flex items-center justify-center [&:hover_img]:brightness-50';

function hasAvatar(data: AvatarBentoProps['avatarData']): data is AvatarData {
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
        <div className="absolute inset-[1.5rem] flex flex-col gap-[1.5rem] md:flex-row md:items-center z-20">
          <div className="w-full max-w-[23.4375rem] h-[23.4375rem] mx-auto md:mx-0 md:flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={avatarData?.url}
              alt="Avatar"
              width={375}
              height={375}
              className="w-full h-full transition-transform duration-700 ease-in-out group-hover:scale-110 group-hover:rotate-[3deg]"
            />
          </div>
          <div className="flex-1 flex flex-col gap-[1rem]">
            <MeetAstroBento
              defaultContent={defaultContent}
              activeContent={
                hasGeneratedAvatar && avatarData ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-[var(--primary-charcoal)] text-lg font-bold leading-6">
                      Meet <span className="text-[var(--secondary-purple)]">{avatarData.name}</span>
                    </span>
                    <span className="text-[var(--primary-charcoal)] text-base font-normal leading-5">
                      Your <span className="font-bold">{avatarData.attributes}</span> Billionaire
                    </span>
                  </div>
                ) : (
                  activeContent
                )
              }
              active={hasGeneratedAvatar}
            />
            <div className="flex gap-[0.5rem]">
              <Button
                type="button"
                className={actionButtonStyles}
                startContent={
                  <Image
                    src="/assets/images/share-icon.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="w-[1.25rem] h-[1.25rem]"
                  />
                }
              >
                Share
              </Button>
              <Button
                type="button"
                className={actionButtonStyles}
                startContent={
                  <Image
                    src="/assets/images/bookmark-icon.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="w-[1.25rem] h-[1.25rem]"
                  />
                }
              >
                Save
              </Button>
              <Button
                type="button"
                className={actionButtonStyles}
                startContent={
                  <Image
                    src="/assets/images/restart-icon.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="w-[1.25rem] h-[1.25rem]"
                  />
                }
              >
                Restart
              </Button>
            </div>
          </div>
        </div>
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
              <MeetAstroBento
                defaultContent={defaultContent}
                activeContent={activeContent}
                active={hasGeneratedAvatar}
              />
            </div>
          </div>
        </>
      )}
    </Bento>
  );
};

export default AvatarBento;