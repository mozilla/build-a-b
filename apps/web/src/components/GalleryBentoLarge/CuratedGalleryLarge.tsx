'use client';

import { FC } from 'react';
import Bento from '../Bento';
import clsx from 'clsx';
import { useVaultContext } from '../Vault/VaultContext';
import { trackEvent } from '@/utils/helpers/track-event';

export interface CuratedGalleryLargeProps {
  className?: string;
  image: string;
}

const CuratedGalleryLarge: FC<CuratedGalleryLargeProps> = ({ className, image }) => {
  const { setShowVault, setVaultInitialImage } = useVaultContext();

  return (
    <Bento
      className={clsx('group', className)}
      image={image}
      bgEffect
      onClick={() => {
        setVaultInitialImage(0);
        setShowVault(true);
        trackEvent({ action: 'click_view_selfie' });
      }}
    />
  );
};

export default CuratedGalleryLarge;

