'use client';

import { FC } from 'react';
import Bento, { BentoProps } from '../Bento';
import { useVaultContext } from '../Vault/VaultContext';
import { trackEvent } from '@/utils/helpers/track-event';

interface GalleryBentoSmallProps extends BentoProps {
  isActive?: boolean;
  currentIndex?: number;
}

const GalleryBentoSmall: FC<GalleryBentoSmallProps> = ({ image, isActive, currentIndex }) => {
  const { setShowVault, setVaultInitialImage } = useVaultContext();
  const onOpenVault = () => {
    setVaultInitialImage(currentIndex);
    setShowVault(true);
    trackEvent({ action: 'click_view_selfie' });
  };

  return (
    <Bento
      image={image}
      className="aspect-square group"
      bgEffect
      onClick={isActive ? onOpenVault : undefined}
    />
  );
};

export default GalleryBentoSmall;
