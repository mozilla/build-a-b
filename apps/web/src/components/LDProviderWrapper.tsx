'use client';
import React from 'react';
import { LDProvider } from 'launchdarkly-react-client-sdk';

interface LDProviderWrapperProps {
  children: React.ReactNode;
}

export default function LDProviderWrapper({ children }: LDProviderWrapperProps) {
  const clientSideID = process.env.NEXT_PUBLIC_LD_CLIENT_ID;
  if (!clientSideID) {
    return <>{children}</>;
  }
  return (
    <LDProvider clientSideID={clientSideID} user={{ key: 'anonymous' }}>
      {children}
    </LDProvider>
  );
}
