'use client';

import type { AvatarData } from '@/types';
import { useEffect, useState } from 'react';

const AVATAR_FILE_TYPE = 'png';

export interface UseAvatarDownloadOptions {
  avatar: AvatarData | null;
}

export interface UseAvatarDownloadReturn {
  downloadFile: {
    href: string;
    fileName: string;
  };
  isDownloadReady: boolean;
}

/**
 * Hook for handling avatar download functionality.
 * Prepares the download blob and provides the download URL and filename.
 *
 * @param options - Configuration options for the download functionality
 * @returns Object containing download file information and ready status
 */
export const useAvatarDownload = ({
  avatar,
}: UseAvatarDownloadOptions): UseAvatarDownloadReturn => {
  const [downloadFile, setDownloadFile] = useState<{ href: string; fileName: string }>({
    href: '#',
    fileName: `${avatar?.name.replaceAll(' ', '-')}.${AVATAR_FILE_TYPE}`,
  });

  const isDownloadReady = downloadFile.href !== '#';

  useEffect(() => {
    let fileHref = '';

    const prepDownloadFile = async (): Promise<void> => {
      try {
        if (!avatar?.instragramAsset || avatar?.name) return;

        const response = await fetch(avatar.instragramAsset);
        const blob = await response.blob();
        fileHref = URL.createObjectURL(blob);

        setDownloadFile((current) => ({
          ...current,
          href: fileHref,
        }));
      } catch (e) {
        console.error('Download preparation error:', e);
      }
    };

    prepDownloadFile();

    return () => {
      if (fileHref) URL.revokeObjectURL(fileHref);
    };
  }, [avatar?.instragramAsset, avatar?.name]);

  return {
    downloadFile,
    isDownloadReady,
  };
};
