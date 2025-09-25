'use client';

import { usePrimaryFlowContext } from '@/components/PrimaryFlow/PrimaryFlowContext';
import type { AvatarData } from '@/types';
import { useEffect, type FC, type PropsWithChildren } from 'react';

interface ClientPageWrapperProps extends PropsWithChildren {
  avatarData?: AvatarData | null;
}

const ClientPageWrapper: FC<ClientPageWrapperProps> = ({ avatarData, children }) => {
  const { setAvatarData } = usePrimaryFlowContext();

  useEffect(() => {
    console.log('avatarData', avatarData);
    if (avatarData) {
      setAvatarData(avatarData);
    }
  }, [avatarData, setAvatarData]);

  return <>{children}</>;
};

export default ClientPageWrapper;
