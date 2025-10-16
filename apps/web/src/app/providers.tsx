'use client';

import { PrimaryContextProvider } from '@/components/PrimaryFlow/PrimaryFlowContext';
import { VaultContextProvider } from '@/components/Vault/VaultContext';
import { HeroUIProvider } from '@heroui/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <PrimaryContextProvider initialData={null}>
        <VaultContextProvider>{children}</VaultContextProvider>
      </PrimaryContextProvider>
    </HeroUIProvider>
  );
}
