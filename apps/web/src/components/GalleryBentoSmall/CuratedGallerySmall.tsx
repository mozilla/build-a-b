'use client';

import { FC } from 'react';
import Bento, { BentoProps } from '../Bento';
import { useVaultContext } from '../Vault/VaultContext';
import { trackEvent } from '@/utils/helpers/track-event';

interface CuratedGallerySmallProps extends BentoProps {
  currentIndex?: number;
  showCount?: boolean;
  count?: number;
}

const CuratedGallerySmall: FC<CuratedGallerySmallProps> = ({
  image,
  currentIndex,
  showCount,
  count,
}) => {
  const { setShowVault, setVaultInitialImage } = useVaultContext();

  const onOpenVault = () => {
    setVaultInitialImage(currentIndex);
    setShowVault(true);
    trackEvent({ action: 'click_view_selfie' });
  };

  return (
    <Bento image={image} className="aspect-square group" bgEffect onClick={onOpenVault}>
      {showCount && count !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-secondary-blue to-secondary-purple rounded-[0.75rem]">
          <span className="text-[4rem] landscape:text-[5rem] font-bold text-white">+{count}</span>
        </div>
      )}
    </Bento>
  );
};

export default CuratedGallerySmall;
