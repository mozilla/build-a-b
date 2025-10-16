'use client';

import { FC, startTransition, useState } from 'react';
import BentoDual from '../BentoDual';
import clsx from 'clsx';
import Image from 'next/image';
import { generateAvatarSelfie } from '@/utils/actions/generate-avatar-selfie';
import { useRouter } from 'next/navigation';
import { usePrimaryFlowContext } from '../PrimaryFlow/PrimaryFlowContext';
import { useVaultContext } from '../Vault/VaultContext';
import ProgressBar from '../ProgressBar';
import { trackEvent } from '@/utils/helpers/track-event';

export interface GalleryBentoLargeProps {
  className?: string;
  disabled?: boolean;
  image?: string;
}

const GalleryBentoLarge: FC<GalleryBentoLargeProps> = ({ className, disabled, image }) => {
  const router = useRouter();
  const { selfieAvailabilityState, avatarData } = usePrimaryFlowContext();
  const { setShowVault, setVaultInitialImage } = useVaultContext();
  const [isGeneratingSelfie, setIsGeneratingSelfie] = useState(false);
  const canGenerateSelfie =
    avatarData && selfieAvailabilityState === 'AVAILABLE' && avatarData.selfies.length === 0;

  const back = (
    <div
      className="relative rounded-[0.75rem] w-full h-full"
      onClick={async () => {
        try {
          if (!canGenerateSelfie) return;

          setIsGeneratingSelfie(true);
          const selfie = await generateAvatarSelfie();
          if (!selfie) return;

          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Background refresh of the server component tree
          startTransition(() => router.refresh());

          setVaultInitialImage(0);
          setShowVault(true);
          trackEvent({ action: 'click_view_selfie' });
        } catch {
          // Do nothing.
        } finally {
          setIsGeneratingSelfie(false);
        }
      }}
    >
      <Image
        src="/assets/images/placeholders/planet.jpg"
        alt={''}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="absolute inset-0 z-0 object-cover scale-140"
      />
      <div className="flex flex-col gap-4 p-4 relative rounded-[0.75rem] w-full h-full bg-white/50 justify-center items-center text-center">
        <h2 className="text-charcoal text-title-1">How would your Billionaire live in space?</h2>
        <Image
          src="/assets/images/icons/camera.webp"
          width={60}
          height={70}
          className="h-auto"
          alt=""
        />
        <h2 className="text-charcoal text-xl font-extrabold">
          {isGeneratingSelfie ? 'Generating Space Selfie' : 'Take a Space Selfie'}
        </h2>
        {isGeneratingSelfie && <ProgressBar />}
      </div>
    </div>
  );

  return (
    <>
      <BentoDual
        className={clsx('aspect-square', className)}
        image={image || '/assets/images/placeholders/planet.jpg'}
        effect="flip"
        bgEffect={disabled}
        back={back}
        disabled={!canGenerateSelfie}
        onClick={() => {
          if (image) {
            setVaultInitialImage(0);
            setShowVault(true);
            trackEvent({ action: 'click_view_selfie' });
          }
        }}
      />
    </>
  );
};

export default GalleryBentoLarge;
