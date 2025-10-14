'use client';

import Bento, { type BentoProps } from '@/components/Bento';
import ActionMenu from '@/components/PrimaryFlow/AvatarBentoV2/ActionMenu';
import { useNavigatorShareDetection } from '@/hooks';
import type { AvatarData } from '@/types';
import clsx from 'clsx';
import Image from 'next/image';
import { type FC } from 'react';
import BrowserBento, { type BrowserBentoProps } from '../../BrowserBento';

const microcopy = {
  bioPrefix: 'Meet ',
} as const;

interface PostAvatarViewProps extends BentoProps, BrowserBentoProps {
  avatar: AvatarData;
  playpenButtonsShowing: boolean;
}

/**
 * Client side avatar view to use with the AvatarBento V2.
 */
const PostAvatarView: FC<PostAvatarViewProps> = ({
  avatar,
  playpenButtonsShowing,
  ...bentoProps
}) => {
  const { isNavigatorShareAvailable } = useNavigatorShareDetection();

  return (
    <Bento
      className="bg-gradient-to-r from-secondary-blue to-secondary-purple group h-full landscape:block [&_img]:object-[20%_center] landscape:[&_img]:object-cover"
      {...bentoProps}
      imageSrcLandscape="/assets/images/blue-grid.svg"
      imageSrcPortrait="/assets/images/blue-grid.svg"
      imageClassName="object-cover"
      priority
    >
      <div className="w-full h-full flex items-center landscape:justify-center gap-x-[2.375rem] p-4 portrait:flex-col">
        <Image
          src="/assets/images/grain-main.webp"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="absolute inset-0 z-10 object-cover mix-blend-overlay pointer-events-none"
        />
        <div className="relative portrait:w-full portrait:mb-4 z-10">
          <Bento
            className={clsx(
              'w-full max-w-[29.25rem] mx-auto portrait:h-[33rem] landscape:aspect-square flex justify-center items-end p-3',
              {
                'landscape:max-w-[23rem]': playpenButtonsShowing,
              },
            )}
          >
            <Image
              className="w-full object-contain lamdscape:object-cover landscape:object-center object-top!"
              src={avatar.url}
              alt={avatar.name}
              fill
              sizes="(orientation: portrait) 100vw, 32.45vw"
            />
            <div className="landscape:hidden absolute flex flex-col bottom-0 left-0 right-0">
              <div className="h-[2rem] bg-gradient-to-t from-common-ash to-transparent"></div>
              <div className="h-[13rem] bg-common-ash"></div>
            </div>
            <BrowserBento className="relative w-full" gradient inverseElement="dots">
              <p className="bg-white p-3 text-black">
                {microcopy.bioPrefix}
                <span className="text-secondary-purple font-bold">{avatar.name}</span>, your{' '}
                {avatar.bio}
              </p>
            </BrowserBento>
          </Bento>
        </div>
        <ActionMenu avatar={avatar} navigatorShareAvailable={isNavigatorShareAvailable} />
      </div>
    </Bento>
  );
};

export default PostAvatarView;
