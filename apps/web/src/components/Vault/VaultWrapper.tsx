'use client';

import { FC } from 'react';
import Vault from '.';
import { useVaultContext } from './VaultContext';

const VaultWrapper: FC = () => {
  const { showVault, setShowVault, vaultInitialImage } = useVaultContext();

  return (
    <Vault
      initialImage={vaultInitialImage}
      isOpen={showVault}
      onOpenChange={() => {
        setShowVault(false);
      }}
    />
  );
};

export default VaultWrapper;
