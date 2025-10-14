'use client';

import { FC } from 'react';
import Bento, { BentoProps } from '../Bento';
import { useVaultContext } from '../Vault/VaultContext';

interface GalleryBentoSmallProps extends BentoProps {
  currentIndex?: number;
}

const GalleryBentoSmall: FC<GalleryBentoSmallProps> = ({ image, currentIndex }) => {
  const { setShowVault, setVaultInitialImage } = useVaultContext();
  const onOpenVault = () => {
    setVaultInitialImage(currentIndex);
    setShowVault(true);
  };

  return (
    <Bento
      image={image}
      className="aspect-square group"
      bgEffect
      onClick={typeof currentIndex === 'number' ? onOpenVault : undefined}
    />
  );
};

export default GalleryBentoSmall;
