'use client';

import type { AvatarData } from '@/types';
import { useAvatarDownload } from './useAvatarDownload';
import { useNavigatorShareAction } from './useNavigatorShareAction';
import { useNavigatorShareDetection } from './useNavigatorShareDetection';
import { useSafeClick } from './useSafeClick';
import { useShareUrls } from './useShareUrls';

export interface UseAvatarActionsOptions {
  avatar: AvatarData | null;
}

export interface UseAvatarActionsReturn {
  // Navigator share
  isNavigatorShareAvailable: boolean;
  handleNavigatorShare: () => Promise<void>;

  // Download
  downloadFile: {
    href: string;
    fileName: string;
  };
  isDownloadReady: boolean;

  // Share URLs
  currentHref: string;
  threadsShareUrl: string;
  safeHref: (url: string) => string;

  // Safe click handling
  preventInvalidClick: (e: React.MouseEvent<HTMLElement>, test: boolean, cb?: () => void) => void;
}

/**
 * Comprehensive hook that combines all avatar sharing and downloading functionality.
 * Perfect for components that need full avatar interaction capabilities.
 *
 * Note: This hook is designed for complex components that truly need all functionality.
 * For simpler use cases, prefer individual hooks like useNavigatorShareDetection or useNavigatorShareAction.
 *
 * @param options - Configuration options
 * @returns Object containing all avatar action functionality
 */
export const useAvatarActions = ({ avatar }: UseAvatarActionsOptions): UseAvatarActionsReturn => {
  const { isNavigatorShareAvailable } = useNavigatorShareDetection();
  const { handleNavigatorShare } = useNavigatorShareAction({ avatar });

  const { downloadFile, isDownloadReady } = useAvatarDownload({ avatar });

  const { currentHref, threadsShareUrl, safeHref } = useShareUrls();

  const { preventInvalidClick } = useSafeClick();

  return {
    // Navigator share
    isNavigatorShareAvailable,
    handleNavigatorShare,

    // Download
    downloadFile,
    isDownloadReady,

    // Share URLs
    currentHref,
    threadsShareUrl,
    safeHref,

    // Safe click handling
    preventInvalidClick,
  };
};
