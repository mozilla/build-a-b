'use client';

import { generateAvatarSelfie } from '@/utils/actions/generate-avatar-selfie';
import { Button, useDisclosure } from '@heroui/react';
import Image from 'next/image';
import { FC, useMemo, useState } from 'react';
import Bento from '../Bento';
import PlaypenPopup from '../PlaypenPopup';
import Carousel from '../PrimaryFlow/Carousel';
import { usePrimaryFlowContext } from '../PrimaryFlow/PrimaryFlowContext';
import ProgressBar from '../ProgressBar';
import { useAvatarActions } from '@/hooks';
import ShareAvatar from '../ShareAvatar';
import { useWindowSize } from '@/hooks/useWindowSize';

const BentoPlaypenSelfie: FC = () => {
  const { onOpenChange } = useDisclosure();
  const { setAvatarData, setShowVault, showVault, avatarData } = usePrimaryFlowContext();
  const resolution = useWindowSize();
  const { isNavigatorShareAvailable } = useAvatarActions({ avatar: avatarData });
  const [isGeneratingSelfie, setIsGeneratingSelfie] = useState(false);
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

  const vaultImages = useMemo(() => {
    if (!avatarData) return [];

    // TODO: Revisit selfies logic here with the new DB structure.
    // const parsedSelfies = avatarData.selfies.map((s) => s.asset);
    // return [...parsedSelfies, avatarData.url].filter(Boolean) as string[];

    return [];
  }, [avatarData]);

  const handleClose = () => {
    setShowVault(false);
    onOpenChange();
  };

  return (
    <>
      <Bento
        className={`h-full py-8 flex flex-col justify-center items-center gap-2 border-accent!
                 relative group hover:cursor-pointer
                 ${
                   isGeneratingSelfie
                     ? 'bg-gradient-to-br from-common-ash to-accent'
                     : 'bg-common-ash! hover:bg-gradient-to-br hover:bg-gradient-to-r hover:from-secondary-blue hover:to-secondary-purple'
                 }`}
      >
        <Image
          src="/assets/images/icons/camera.webp"
          width={60}
          height={70}
          className="group-hover:-rotate-5 transition-transform duration-300 h-auto w-auto"
          alt=""
          priority
        />
        {!isGeneratingSelfie ? (
          <Button
            onPress={async () => {
              // TODO: Change this to invoke get_selfie_for_user_avatar RPC
              try {
                setIsGeneratingSelfie(true);
                const selfie = await generateAvatarSelfie();
                if (!selfie) return;

                setAvatarData((data) =>
                  !data ? data : { ...data, selfies: [...data.selfies, selfie] },
                );

                setShowVault(true);
              } catch {
                // Do nothing.
              } finally {
                setIsGeneratingSelfie(false);
              }
            }}
            className="secondary-button border-charcoal text-charcoal group-hover:bg-accent group-hover:border-accent group-hover:-rotate-5 group-hover:scale-105 transition-transform duration-300"
          >
            Take a space selfie
          </Button>
        ) : (
          <ProgressBar duration={12000} />
        )}
        <PlaypenPopup title="Your Billionaire vault" isOpen={showVault} onOpenChange={handleClose}>
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
                slides={vaultImages.map((img, i) => (
                  <div key={i} className="flex justify-center items-center">
                    <Image
                      src={img}
                      width={300}
                      height={300}
                      className="rounded-xl max-w-[300px] landscape:hidden"
                      alt=""
                      priority
                    />
                    <Image
                      src={img}
                      width={466}
                      height={466}
                      className="rounded-xl hidden w-auto max-w-[466px] landscape:block"
                      alt=""
                      priority
                    />
                  </div>
                ))}
              />
            </div>
            {avatarData && (
              <ShareAvatar
                avatar={avatarData}
                navigatorShareAvailable={isNavigatorShareAvailable}
                onBookmarkClick={() => {}}
                centered
              />
            )}
          </div>
        </PlaypenPopup>
      </Bento>
    </>
  );
};

export default BentoPlaypenSelfie;
