'use client';

import { useWindowSize } from '@/hooks/useWindowSize';
import type { Action } from '@/types';
import { COOKIE_NAME } from '@/utils/constants';
import { setCookie } from '@/utils/helpers/cookies';
import { trackEvent } from '@/utils/helpers/track-event';
import Image from 'next/image';
import { useMemo, useState, type FC } from 'react';
import PlaypenPopup from '../PlaypenPopup';
import PlaypenSave from '../PlaypenPopup/PlaypenSave';
import Carousel from '../PrimaryFlow/Carousel';
import { usePrimaryFlowContext } from '../PrimaryFlow/PrimaryFlowContext';
import ShareAvatar from '../ShareAvatar';

interface VaultProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialImage?: number;
}

const Vault: FC<VaultProps> = ({ isOpen, onOpenChange, initialImage }) => {
  const [showBookmarkScreen, setShowBookmarkScreen] = useState(false);
  const resolution = useWindowSize();
  const { avatarData } = usePrimaryFlowContext();
  const swiperOptions = useMemo(
    () => ({
      spaceBetween: resolution === 'landscape' ? -400 : -10,
      slidesPerView: resolution === 'landscape' ? 3 : 1,
      watchSlidesProgress: true,
      speed: 800,
      effect: 'slide',
    }),
    [resolution],
  );

  const action: Action = useMemo(
    () => ({
      onPress: () => {
        if (!avatarData?.uuid) return;

        setCookie(COOKIE_NAME, avatarData?.uuid);
        setShowBookmarkScreen(true);
        trackEvent({ action: 'click_save_avatar' });
      },
      content: {
        title: 'Your All Access Pass',
        description:
          'Here’s your portal to everything you’ve created. Use the link or scan this QR code to return to your collection anytime.',
      },
    }),
    [avatarData?.uuid],
  );

  const sortedSelfies = useMemo(() => {
    if (!avatarData?.selfies || avatarData.selfies.length <= 0) {
      return [];
    }

    if (typeof initialImage !== 'number') return avatarData.selfies;

    // Wrap initialImage to valid index using modulo
    const validIndex = initialImage % avatarData.selfies.length;
    // Reorder array starting from initialImage index
    return [
      ...avatarData.selfies.slice(validIndex),
      ...avatarData.selfies.slice(0, validIndex),
    ];
  }, [avatarData?.selfies, initialImage]);

  return (
    <PlaypenPopup title="Your Billionaire vault" isOpen={isOpen} onOpenChange={onOpenChange}>
      {showBookmarkScreen ? (
        <PlaypenSave action={action} V2 />
      ) : (
        <div className="w-full h-[70vh] flex flex-col items-center justify-center my-6">
          <h3 className="text-title-3 text-center">Your Billionaire Vault</h3>
          <p className="text-center max-w-[625px]">
            This is your gallery of everything you and your Billionaire have done together. Every
            dance, every selfie, every successful launch into space. You’re always welcome back to
            reminisce.
          </p>
          <div className="w-full my-6">
            <Carousel
              containerClassName="w-full max-w-[44rem]"
              swiperOptions={swiperOptions}
              withArrowNavigation={resolution === 'landscape'}
              slides={
                sortedSelfies.map(({ asset }, i) => (
                  <div key={i} className="flex justify-center items-center">
                    <Image
                      src={asset ?? ''}
                      width={300}
                      height={300}
                      className="rounded-xl max-w-[300px] landscape:hidden"
                      alt=""
                      priority
                    />
                    <Image
                      src={asset ?? ''}
                      width={466}
                      height={466}
                      className="rounded-xl hidden w-auto max-w-[466px] landscape:block"
                      alt=""
                      priority
                    />
                  </div>
                )) || []
              }
            />
          </div>
          {avatarData?.selfies && (
            <ShareAvatar
              avatar={avatarData}
              onBookmarkClick={() => setShowBookmarkScreen(true)}
              centered
            />
          )}
        </div>
      )}
    </PlaypenPopup>
  );
};

export default Vault;
