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
  isPhase4: boolean;
  curatedSelfies: string[];
}

interface VaultContextProviderProps extends PropsWithChildren {
  isPhase4?: boolean;
  curatedSelfies?: string[];
}

export const VaultContext = createContext<VaultContextValue | undefined>(undefined);

export const VaultContextProvider: FC<VaultContextProviderProps> = ({
  children,
  isPhase4 = false,
  curatedSelfies = [],
}) => {
  const [showVault, setShowVault] = useState(false);
  const [vaultInitialImage, setVaultInitialImage] = useState<number | undefined>(undefined);

  // Debug logging
  console.log(
    '[VaultContext] isPhase4:',
    isPhase4,
    'curatedSelfies count:',
    curatedSelfies?.length || 0,
  );

  const value = useMemo(
    () => ({
      showVault,
      setShowVault,
      vaultInitialImage,
      setVaultInitialImage,
      isPhase4,
      curatedSelfies,
    }),
    [showVault, setShowVault, vaultInitialImage, setVaultInitialImage, isPhase4, curatedSelfies],
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
