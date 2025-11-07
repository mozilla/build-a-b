'use client';

import { useWindowSize } from '@/hooks/useWindowSize';
import type { Action } from '@/types';
import { COOKIE_NAME } from '@/utils/constants';
import { setCookie } from '@/utils/helpers/cookies';
import { trackEvent } from '@/utils/helpers/track-event';
import Image from 'next/image';
import { useEffect, useMemo, useState, type FC } from 'react';
import PlaypenPopup from '../PlaypenPopup';
import PlaypenSave from '../PlaypenPopup/PlaypenSave';
import Carousel from '../PrimaryFlow/Carousel';
import { usePrimaryFlowContext } from '../PrimaryFlow/PrimaryFlowContext';
import ShareAvatar from '../ShareAvatar';
import { useVaultContext } from './VaultContext';

interface VaultProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialImage?: number;
  isPhase4?: boolean;
}

const Vault: FC<VaultProps> = ({ isOpen, onOpenChange, initialImage, isPhase4 = false }) => {
  const [showBookmarkScreen, setShowBookmarkScreen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const resolution = useWindowSize();
  const { avatarData } = usePrimaryFlowContext();
  const { curatedSelfies } = useVaultContext();

  const swiperOptions = useMemo(
    () => ({
      spaceBetween: resolution === 'landscape' ? -300 : -80,
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
    // Phase 4: Use curated selfies instead of user selfies
    if (isPhase4 && curatedSelfies && curatedSelfies.length > 0) {
      console.log('[Vault] Phase 4 - Using curated selfies:', curatedSelfies.length);
      const curatedSelfieObjects = curatedSelfies.map((path: string, index: number) => ({
        id: index,
        asset: path,
      }));

      if (typeof initialImage !== 'number') return curatedSelfieObjects;

      // Wrap initialImage to valid index using modulo
      const validIndex = initialImage % curatedSelfieObjects.length;
      // Reorder array starting from initialImage index
      return [
        ...curatedSelfieObjects.slice(validIndex),
        ...curatedSelfieObjects.slice(0, validIndex),
      ];
    }

    // Default: Use user selfies
    if (!avatarData?.selfies || avatarData.selfies.length <= 0) {
      return [];
    }

    if (typeof initialImage !== 'number') return avatarData.selfies;

    // Wrap initialImage to valid index using modulo
    const validIndex = initialImage % avatarData.selfies.length;
    // Reorder array starting from initialImage index
    return [...avatarData.selfies.slice(validIndex), ...avatarData.selfies.slice(0, validIndex)];
  }, [avatarData?.selfies, initialImage, isPhase4, curatedSelfies]);

  // Reset loading state when vault opens or selfies change
  useEffect(() => {
    if (isOpen) {
      setLoadedImages({});
    }
  }, [isOpen, sortedSelfies.length]);

  // Create avatar data with the current selfie's asset for sharing
  const avatarWithCurrentSelfie = useMemo(() => {
    // Phase 4: Create mock avatar data for curated selfies
    if (isPhase4 && sortedSelfies.length > 0 && sortedSelfies[activeSlideIndex]) {
      return {
        uuid: '',
        name: 'Billionaire',
        bio: 'Space Explorer',
        url: sortedSelfies[activeSlideIndex].asset ?? '',
        originalRidingAsset: '',
        instragramAsset: sortedSelfies[activeSlideIndex].asset ?? '',
        selfies: [
          {
            id: 0,
            asset: sortedSelfies[activeSlideIndex].asset ?? '',
            created_at: new Date().toISOString(),
          },
        ],
        selfieAvailability: { selfies_available: 0, next_at: null },
        hasEasterEgg: false,
      };
    }

    // Default: Use actual avatar data
    if (!avatarData || !sortedSelfies[activeSlideIndex]) return avatarData;

    return {
      ...avatarData,
      instragramAsset: sortedSelfies[activeSlideIndex].asset ?? '',
    };
  }, [avatarData, sortedSelfies, activeSlideIndex, isPhase4]);

  const isEasterEgg = useMemo(() => {
    if (!sortedSelfies) return null;
    return sortedSelfies[activeSlideIndex]?.id === -1;
  }, [activeSlideIndex, sortedSelfies]);

  useEffect(() => {
    if (!isOpen) {
      setActiveSlideIndex(0);
    }
  }, [isOpen]);

  return (
    <PlaypenPopup
      title="Your Billionaire vault"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      bodyClass="portrait:p-0"
      scrollBehavior="inside"
    >
      {showBookmarkScreen ? (
        <PlaypenSave action={action} V2 onClose={() => setShowBookmarkScreen(false)} />
      ) : (
        <div className="w-full flex flex-col items-center portrait:py-12 landscape:my-6">
          <h3 className="text-title-3 text-center">
            {isPhase4
              ? 'Billionaire Space Memories'
              : isEasterEgg
                ? 'You just unlocked a data card!'
                : 'Your Billionaire Vault'}
          </h3>
          {isPhase4 ? (
            <p className="text-center max-w-[39.0625rem]">
              Now that our Billionaires are in space, they can happily live out their dream lives,
              while the rest of us can celebrate a healthier internet.
            </p>
          ) : isEasterEgg ? (
            <p className="text-center max-w-[39.0625rem]">
              This isn&apos;t just any Easter Egg - it&apos;s a real card from Data War, our
              upcoming physical and digital card game, rolling out at TwitchCon.
            </p>
          ) : (
            <p className="text-center max-w-[39.0625rem]">
              This is your gallery of everything you and your Billionaire have done together. Every
              selfie, every successful launch into space. You&apos;re always welcome back to
              reminisce.
            </p>
          )}
          <div className="w-full my-6">
            <Carousel
              containerClassName="w-full max-w-[44rem]"
              swiperOptions={swiperOptions}
              withArrowNavigation={resolution === 'landscape'}
              onSlideChange={setActiveSlideIndex}
              slides={
                (sortedSelfies || []).map(({ asset }: { asset: string | null }, i: number) => {
                  const mobileKey = `${i}-mobile`;
                  const landscapeKey = `${i}-landscape`;
                  const isMobileLoaded = loadedImages[mobileKey];
                  const isLandscapeLoaded = loadedImages[landscapeKey];

                  return (
                    <div
                      key={i}
                      className="flex justify-center items-center landscape:min-h-[29.125rem] relative"
                    >
                      {/* Mobile shimmer - only show if mobile image not loaded */}
                      {!isMobileLoaded && (
                        <div className="absolute inset-0 bg-white overflow-hidden rounded-xl w-[18.75rem] h-[18.75rem] landscape:hidden mx-auto">
                          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gray-400 to-transparent animate-shimmer w-full h-full"></div>
                        </div>
                      )}
                      {/* Landscape shimmer - only show if landscape image not loaded */}
                      {!isLandscapeLoaded && (
                        <div className="hidden landscape:block absolute inset-0 bg-white overflow-hidden rounded-xl w-[29.125rem] h-[29.125rem] mx-auto">
                          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gray-400 to-transparent animate-shimmer w-full h-full"></div>
                        </div>
                      )}
                      {/* Mobile Image */}
                      <Image
                        src={asset ?? ''}
                        width={290}
                        height={290}
                        className={`rounded-xl w-[18.125rem] h-[18.125rem] max-w-[18.75rem] landscape:hidden transition-opacity duration-500 ${
                          isMobileLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        alt=""
                        priority
                        onLoad={() => setLoadedImages((prev) => ({ ...prev, [mobileKey]: true }))}
                        onError={() => setLoadedImages((prev) => ({ ...prev, [mobileKey]: true }))}
                      />
                      {/* Landscape Image */}
                      <Image
                        src={asset ?? ''}
                        width={466}
                        height={466}
                        className={`rounded-xl w-[29.125rem] h-[29.125rem] hidden w-auto max-w-[29.125rem] landscape:block transition-opacity duration-500 ${
                          isLandscapeLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        alt=""
                        priority
                        onLoad={() =>
                          setLoadedImages((prev) => ({ ...prev, [landscapeKey]: true }))
                        }
                        onError={() =>
                          setLoadedImages((prev) => ({ ...prev, [landscapeKey]: true }))
                        }
                      />
                    </div>
                  );
                }) || []
              }
            />
          </div>
          {avatarWithCurrentSelfie && (
            <ShareAvatar
              avatar={avatarWithCurrentSelfie}
              centered
              onBookmarkClick={() => setShowBookmarkScreen(true)}
              hideBookmark={isPhase4}
            />
          )}
        </div>
      )}
    </PlaypenPopup>
  );
};

export default Vault;
