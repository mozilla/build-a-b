'use client';

import { useWindowSize } from '@/hooks/useWindowSize';
import { AvatarData } from '@/types';
import { generateAvatarSelfie } from '@/utils/actions/generate-avatar-selfie';
import { Button, useDisclosure } from '@heroui/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FC, startTransition, useMemo, useState, useEffect } from 'react';
import Bento from '../Bento';
import PlaypenPopup from '../PlaypenPopup';
import Carousel from '../PrimaryFlow/Carousel';
import { usePrimaryFlowContext } from '../PrimaryFlow/PrimaryFlowContext';
import ProgressBar from '../ProgressBar';
import ShareAvatar from '../ShareAvatar';

const BentoPlaypenSelfie: FC<{ avatarData?: AvatarData }> = ({ avatarData }) => {
  const router = useRouter();
  const { onOpenChange } = useDisclosure();
  const {
    setShowVault,
    showVault,
    selfieAvailabilityState,
    setAvatarData,
    setSelfieAvailabilityState,
  } = usePrimaryFlowContext();
  const resolution = useWindowSize();
  const [isGeneratingSelfie, setIsGeneratingSelfie] = useState(false);
  const [timerRole, setTimerRole] = useState<'timer' | 'alert'>('timer');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
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

  const handleClose = () => {
    setShowVault(false);
    onOpenChange();
  };

  useEffect(() => {
    if (
      selfieAvailabilityState !== 'COOL_DOWN_PERIOD' ||
      !avatarData?.selfieAvailability?.next_at
    ) {
      return;
    }

    const updateTimer = () => {
      if (!avatarData.selfieAvailability.next_at) return;

      const now = new Date().getTime();
      const nextAt = new Date(avatarData.selfieAvailability.next_at).getTime();
      const distance = nextAt - now;

      if (distance <= 0) {
        setTimeRemaining('00:00:00');
        setTimerRole('alert');
        setSelfieAvailabilityState('AVAILABLE');
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [
    selfieAvailabilityState,
    avatarData?.selfieAvailability?.next_at,
    setSelfieAvailabilityState,
  ]);

  useEffect(() => {
    if (avatarData) {
      setAvatarData(avatarData);
    }
  }, [avatarData, setAvatarData]);

  return (
    <>
      <Bento
        className={`h-full py-8 flex flex-col justify-center items-center gap-2 border-accent! overflow-visible!
                 relative group hover:cursor-pointer
                 ${
                   isGeneratingSelfie
                     ? 'bg-gradient-to-br from-common-ash to-accent'
                     : 'bg-common-ash! hover:bg-gradient-to-br hover:bg-gradient-to-r hover:from-secondary-blue hover:to-secondary-purple'
                 }`}
      >
        <Image
          className="absolute top-[-1.5rem] left-[-1.5rem]"
          alt=""
          src="/assets/images/ribbon.svg"
          width={117}
          height={40}
        />
        <Image
          src="/assets/images/icons/camera.webp"
          width={60}
          height={70}
          className="group-hover:-rotate-5 transition-transform duration-300 h-auto w-auto"
          alt=""
          priority
        />
        {!isGeneratingSelfie ? (
          <>
            {selfieAvailabilityState === 'AVAILABLE' && (
              <Button
                onPress={async () => {
                  try {
                    setIsGeneratingSelfie(true);
                    const selfie = await generateAvatarSelfie();
                    if (!selfie) return;

                    await new Promise((resolve) => setTimeout(resolve, 2000));

                    // Background refresh of the server component tree
                    startTransition(() => router.refresh());

                    setShowVault(true);
                  } catch {
                    // Do nothing.
                  } finally {
                    setIsGeneratingSelfie(false);
                  }
                }}
                className="secondary-button border-charcoal text-charcoal group-hover:bg-accent group-hover:border-accent group-hover:-rotate-5 group-hover:scale-105 transition-transform duration-300 relative"
              >
                Take a space selfie
              </Button>
            )}
            {selfieAvailabilityState === 'COOL_DOWN_PERIOD' && (
              <div className="flex flex-col items-center justify-center relative">
                <span className="text-sm-custom text-charcoal">Next Selfie Available in</span>
                <div
                  role={timerRole}
                  aria-atomic="true"
                  className="flex items-center justify-center text-charcoal "
                >
                  <span className="title-4 font-extrabold">{timeRemaining}</span>
                </div>
              </div>
            )}
            {selfieAvailabilityState === 'REACHED_MAX_LIMIT' && (
              <div className="flex flex-col items-center justify-center relative">
                <span className="text-charcoal mt-2 font-extrabold">Coming soon</span>
              </div>
            )}
          </>
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
                slides={
                  avatarData?.selfies.map(({ asset }, i) => (
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
              <ShareAvatar avatar={avatarData} onBookmarkClick={() => {}} centered />
            )}
          </div>
        </PlaypenPopup>
      </Bento>
    </>
  );
};

export default BentoPlaypenSelfie;
