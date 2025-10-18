'use client';

import { AvatarData } from '@/types';
import { generateAvatarSelfie } from '@/utils/actions/generate-avatar-selfie';
import { storeEasterEgg } from '@/utils/actions/store-easter-egg';
import { Button } from '@heroui/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FC, startTransition, useEffect, useState } from 'react';
import Bento from '../Bento';
import { usePrimaryFlowContext } from '../PrimaryFlow/PrimaryFlowContext';
import ProgressBar from '../ProgressBar';
import { useVaultContext } from '../Vault/VaultContext';
import { MAX_SELFIES } from '@/utils/constants';

interface BentoPlaypenSelfieProps {
  avatarData?: AvatarData;
  isLaunchCompleted?: boolean;
}

const BentoPlaypenSelfie: FC<BentoPlaypenSelfieProps> = ({ avatarData, isLaunchCompleted }) => {
  const router = useRouter();
  const { selfieAvailabilityState, setAvatarData, setSelfieAvailabilityState } =
    usePrimaryFlowContext();
  const { setShowVault, setVaultInitialImage } = useVaultContext();
  const [isGeneratingSelfie, setIsGeneratingSelfie] = useState(false);
  const [timerRole, setTimerRole] = useState<'timer' | 'alert'>('timer');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

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
        setSelfieAvailabilityState(
          avatarData.selfies.length === MAX_SELFIES ? 'EASTER_EGG' : 'AVAILABLE',
        );
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
    avatarData?.selfies?.length,
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
        {!isLaunchCompleted && (
          <Image
            className="absolute top-[-1.5rem] left-[-1.5rem] w-[6.3125rem] h-[3.8rem]"
            alt=""
            src="/assets/images/ribbon.webp"
            width={117}
            height={40}
          />
        )}
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
            {(selfieAvailabilityState === 'AVAILABLE' ||
              selfieAvailabilityState === 'EASTER_EGG') && (
              <Button
                onPress={async () => {
                  try {
                    setIsGeneratingSelfie(true);

                    const selfie =
                      selfieAvailabilityState === 'EASTER_EGG'
                        ? await storeEasterEgg()
                        : await generateAvatarSelfie();
                    if (!selfie) return;

                    await new Promise((resolve) => setTimeout(resolve, 2000));

                    // Calculate the index of the newly generated selfie
                    // Current selfies count (before refresh)
                    const currentSelfiesCount = avatarData?.selfies?.length || 0;

                    // Set vault to show the newly generated selfie first
                    // New selfie will be at the end (index = currentSelfiesCount)
                    setVaultInitialImage(currentSelfiesCount);

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
                  <span className="title-4 font-extrabold tabular-nums">{timeRemaining}</span>
                </div>
              </div>
            )}
            {selfieAvailabilityState === 'COMING_SOON' && (
              <div className="flex flex-col items-center justify-center relative">
                <span className="text-charcoal mt-2 font-extrabold">Coming soon</span>
              </div>
            )}
          </>
        ) : (
          <ProgressBar duration={12000} />
        )}
      </Bento>
    </>
  );
};

export default BentoPlaypenSelfie;
