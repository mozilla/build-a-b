'use client';

import { PrimaryContextProvider } from '@/components/PrimaryFlow/PrimaryFlowContext';
import { VaultContextProvider } from '@/components/Vault/VaultContext';
import { HeroUIProvider } from '@heroui/react';

interface ProvidersProps {
  children: React.ReactNode;
  isEasterEggEnabled: boolean;
}

export function Providers({ children, isEasterEggEnabled }: ProvidersProps) {
  return (
    <HeroUIProvider>
      <PrimaryContextProvider initialData={null} isEasterEggEnabled={isEasterEggEnabled}>
        <VaultContextProvider>{children}</VaultContextProvider>
      </PrimaryContextProvider>
    </HeroUIProvider>
  );
}
