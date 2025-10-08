'use client';

import type { AvatarData } from '@/types';
import { trackEvent } from '@/utils/helpers/track-event';
import { useCallback } from 'react';

const AVATAR_FILE_TYPE = 'png';

const microcopy = {
  shareTitle: 'Just built my very own billionaire… next stop, outer space. #BillionaireBlastOff',
  shareText:
    'Just built my very own billionaire… next stop, outer space. #BillionaireBlastOff \nMake yours here https://billionaireblastoff.firefox.com/',
} as const;

export interface UseNavigatorShareActionOptions {
  avatar: AvatarData | null;
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
    trackEvent({ action: 'click_share_avatar' });

    try {
      if (!avatar?.instragramAsset || !avatar?.name) return;

      const response = await fetch(avatar.instragramAsset);
      const blob = await response.blob();

      const file = new File([blob], `${avatar.name}.${AVATAR_FILE_TYPE}`, {
        type: `image/${AVATAR_FILE_TYPE}`,
      });

      const sharePayload: ShareData = {
        text: microcopy.shareText,
        files: [file],
        // Removed due to duplicated copy when sharing in Whatsapp and iMessage.
        // title: microcopy.shareTitle,
        // url: 'https://billionaireblastoff.firefox.com/',
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
  }, [avatar?.name, avatar?.instragramAsset]);

  return {
    handleNavigatorShare,
  };
};
