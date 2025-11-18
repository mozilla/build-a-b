import { useCallback } from 'react';

interface UseShareOptions {
  shareText?: string;
  url?: string;
}

interface UseShareReturn {
  handleShare: () => Promise<boolean>;
  isShareSupported: boolean;
}

/**
 * Hook for sharing using navigator.share API
 * Falls back to returning false if sharing fails or is not supported
 */
export const useShare = ({
  shareText,
  url = window.location.href,
}: UseShareOptions = {}): UseShareReturn => {
  const isShareSupported = typeof navigator !== 'undefined' && 'share' in navigator;

  const handleShare = useCallback(async (): Promise<boolean> => {
    if (!isShareSupported) {
      return false;
    }

    try {
      const sharePayload: ShareData = {
        text: shareText,
        url,
      };

      // Check if we can share
      if (navigator.canShare && !navigator.canShare(sharePayload)) {
        return false;
      }

      await navigator.share(sharePayload);
      return true;
    } catch (error: unknown) {
      // User cancelled share or share failed
      if (error instanceof Error && error.name === 'AbortError') {
        return true; // User cancelled, not an error
      }
      console.error('Share error:', error);
      return false;
    }
  }, [shareText, url, isShareSupported]);

  return {
    handleShare,
    isShareSupported,
  };
};
