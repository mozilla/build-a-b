'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type FC,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';

interface VaultContextValue {
  showVault: boolean;
  setShowVault: Dispatch<SetStateAction<boolean>>;
  vaultInitialImage: number | undefined;
  setVaultInitialImage: Dispatch<SetStateAction<number | undefined>>;
}

export const VaultContext = createContext<VaultContextValue | undefined>(undefined);

export const VaultContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [showVault, setShowVault] = useState(false);
  const [vaultInitialImage, setVaultInitialImage] = useState<number | undefined>(undefined);

  const value = useMemo(
    () => ({
      showVault,
      setShowVault,
      vaultInitialImage,
      setVaultInitialImage,
    }),
    [showVault, setShowVault, vaultInitialImage, setVaultInitialImage],
  );

  return <VaultContext value={value}>{children}</VaultContext>;
};

export const useVaultContext = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('You must use the VaultContext Provider in order to consume this context.');
  }
  return context;
};
