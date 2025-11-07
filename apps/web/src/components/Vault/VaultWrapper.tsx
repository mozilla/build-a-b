'use client';

import { FC } from 'react';
import Vault from '.';
import { useVaultContext } from './VaultContext';

const VaultWrapper: FC = () => {
  const { showVault, setShowVault, vaultInitialImage, isPhase4 } = useVaultContext();

  return (
    <Vault
      initialImage={vaultInitialImage}
      isOpen={showVault}
      onOpenChange={() => {
        setShowVault(false);
      }}
      isPhase4={isPhase4}
    />
  );
};

export default VaultWrapper;
