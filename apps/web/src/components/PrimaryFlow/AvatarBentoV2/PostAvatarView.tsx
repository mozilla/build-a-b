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
      <div className="w-full h-full flex items-center landscape:justify-center gap-x-[2.375rem] portrait:p-4 portrait:flex-col">
        <Image
          src="/assets/images/grain-main.webp"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="absolute inset-0 z-10 object-cover mix-blend-overlay pointer-events-none"
        />
        <div className="relative portrait:w-full portrait:mb-4">
          <Bento
            className={clsx(
              'w-full max-w-[29.25rem] mx-auto portrait:h-[28.5rem] landscape:aspect-square flex justify-center items-end',
              {
                'landscape:max-w-[23rem]': playpenButtonsShowing,
              },
            )}
          >
            <Image
              className="w-full object-cover object-center"
              src={avatar.url}
              alt={avatar.name}
              fill
              sizes="(orientation: portrait) 100vw, 32.45vw"
            />
            <BrowserBento
              className="portrait:hidden relative w-full max-w-[85.47%] mb-6"
              gradient
              inverseElement="dots"
            >
              <p className="bg-white p-[1.5rem] text-black">
                {microcopy.bioPrefix}
                <span className="text-secondary-purple font-bold">{avatar.name}</span>, {avatar.bio}
              </p>
            </BrowserBento>
          </Bento>
        </div>
        <BrowserBento className="landscape:hidden relative w-full mb-4" white>
          <p className="bg-white p-[1.5rem] text-black">
            {microcopy.bioPrefix}
            <span className="text-secondary-purple font-bold">{avatar.name}</span>, {avatar.bio}
          </p>
        </BrowserBento>
        <ActionMenu avatar={avatar} navigatorShareAvailable={isNavigatorShareAvailable} />
      </div>
    </Bento>
  );
};

export default PostAvatarView;
