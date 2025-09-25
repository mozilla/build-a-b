'use client';

import type { AvatarData } from '@/types';
import { useCallback } from 'react';

const AVATAR_FILE_TYPE = 'png';

const microcopy = {
  shareMessage: 'Check out my billionaire avatar,',
} as const;

export interface UseNavigatorShareActionOptions {
  avatar: AvatarData;
}

export interface UseNavigatorShareActionReturn {
  handleNavigatorShare: () => Promise<void>;
}

/**
 * Hook for handling native navigator share functionality with avatar images.
 * Only handles the actual sharing action, not feature detection.
 *
 * @param options
 * @returns Object containing share handler
 */
export const useNavigatorShareAction = ({
  avatar,
}: UseNavigatorShareActionOptions): UseNavigatorShareActionReturn => {
  const handleNavigatorShare = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(avatar.instragramAsset);
      const blob = await response.blob();

      const file = new File([blob], `${avatar.name}.${AVATAR_FILE_TYPE}`, {
        type: `image/${AVATAR_FILE_TYPE}`,
      });

      const sharePayload: ShareData = {
        title: `${microcopy.shareMessage} ${avatar.name} #BillionaireBlastOff`,
        files: [file],
      };

      await navigator.share(sharePayload);
    } catch (e: unknown) {
      const error = e as { name: string };
      /**
       * User cancelled share action - no action needed
       */
      if ('name' in error && error.name === 'AbortError') return;
      console.error('Navigator share error:', e);
    }
  }, [avatar.name, avatar.instragramAsset]);

  return {
    handleNavigatorShare,
  };
};
