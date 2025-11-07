'use client';

import { PrimaryContextProvider } from '@/components/PrimaryFlow/PrimaryFlowContext';
import { VaultContextProvider } from '@/components/Vault/VaultContext';
import { HeroUIProvider } from '@heroui/react';

interface ProvidersProps {
  children: React.ReactNode;
  isEasterEggEnabled: boolean;
  isPhase4?: boolean;
  curatedSelfies?: string[];
}

export function Providers({
  children,
  isEasterEggEnabled,
  isPhase4 = false,
  curatedSelfies = [],
}: ProvidersProps) {
  return (
    <HeroUIProvider>
      <PrimaryContextProvider initialData={null} isEasterEggEnabled={isEasterEggEnabled}>
        <VaultContextProvider isPhase4={isPhase4} curatedSelfies={curatedSelfies}>
          {children}
        </VaultContextProvider>
      </PrimaryContextProvider>
    </HeroUIProvider>
  );
}
