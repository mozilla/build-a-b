import { evaluateFlag } from '@/app/flags';
import type { BentoProps } from '@/components/Bento';
import BentoPlaypenComingSoon from '@/components/BentoPlaypenComingSoon';
import BentoPlaypenSelfie from '@/components/BentoPlaypenSelfie';
import type { AvatarData } from '@/types';
import clsx from 'clsx';
import type { FC } from 'react';
import { type BrowserBentoProps } from '../../BrowserBento';
import { type GetStartedProps } from '../GetStarted';
import PostAvatarView from './PostAvatarView';
import PreAvatarView from './PreAvatarView';

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
  avatar?: AvatarData | null;
  /**
   * Static content to display in the BaB flow init screen.
   */
  primaryFlowData?: GetStartedProps | null;
  // imageProps?: ImageProps;
}

function hasAvatar(data?: AvatarData | null): data is AvatarData {
  return Boolean(data?.url);
}

const AvatarBentoV2: FC<AvatarBentoProps> = async ({
  avatar,
  primaryFlowData,
  imageSrcLandscape,
  imageSrcPortrait,
  ...bentoProps
}) => {
  const hasGeneratedAvatar = hasAvatar(avatar);
  const playpenButtonFlag = await evaluateFlag('showAvatarPlaypenButtons');
  const showPlaypenButtons = hasGeneratedAvatar && playpenButtonFlag;

  return (
    <div className="portrait:flex-col landscape:grid landscape:grid-cols-2 landscape:grid-rows-3 landscape:gap-8 h-full">
      <div
        className={clsx('landscape:col-span-2 landscape:row-span-1 landscape:h-full', {
          'portrait:mb-4 landscape:row-span-2': showPlaypenButtons,
          'landscape:row-span-3': !showPlaypenButtons,
          'h-[38.5625rem]': !hasGeneratedAvatar,
        })}
      >
        {hasGeneratedAvatar ? (
          <PostAvatarView
            avatar={avatar}
            playpenButtonsShowing={showPlaypenButtons}
            {...bentoProps}
          />
        ) : (
          <PreAvatarView
            primaryFlowData={primaryFlowData}
            imageSrcLandscape={imageSrcLandscape}
            imageSrcPortrait={imageSrcPortrait}
            {...bentoProps}
          />
        )}
      </div>
      {showPlaypenButtons && (
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

export default AvatarBentoV2;
