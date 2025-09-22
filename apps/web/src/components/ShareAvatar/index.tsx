'use client';

import { Bookmark } from '@/components/ShareAvatar/Bookmark.svg';
import { Download } from '@/components/ShareAvatar/Download.svg';
import { Instagram } from '@/components/ShareAvatar/Instagram.svg';
import { Share } from '@/components/ShareAvatar/Share.svg';
import { Threads } from '@/components/ShareAvatar/Threads.svg';
import { AvatarData } from '@/types';
import { getImageProps } from 'next/image';
import { FC, MouseEvent, useEffect, useState } from 'react';

export interface ShareAvatarProps {
  avatar: AvatarData;
  onBookmarkClick: () => void;
  navigatorShareAvailable: boolean;
}

const AVATAR_FILE_TYPE = 'png';

const microcopy = {
  sharePrefix: 'Share to',
  shareMessage: 'Check out my billionaire avatar,',
  threadsIntentShare: '@firefox #billionaireblastoff',
} as const;

const ShareAvatar: FC<ShareAvatarProps> = ({
  avatar,
  onBookmarkClick,
  navigatorShareAvailable,
}) => {
  const [downloadFile, setDownloadFile] = useState<{ href: string; fileName: string }>({
    href: '#',
    fileName: `${avatar.name.replaceAll(' ', '-')}.${AVATAR_FILE_TYPE}`,
  });
  const [currentHref, setCurrentHref] = useState<string>('');
  const nextOptimzedImage = getImageProps({
    src: avatar.url,
    alt: avatar.name,
    width: 768,
    height: 1224,
  });

  useEffect(() => {
    let fileHref = '';

    const prepDownloadFile = async () => {
      try {
        const response = await fetch(avatar.url);
        const blob = await response.blob();
        fileHref = URL.createObjectURL(blob);

        setDownloadFile((current) => ({
          ...current,
          href: fileHref,
        }));
      } catch (e) {
        console.error(e);
      }
    };
    setCurrentHref(window.location.href);

    prepDownloadFile();

    return () => {
      URL.revokeObjectURL(fileHref);
    };
  }, [setCurrentHref, avatar.url]);

  const safeHref = (url: string) => {
    if (!currentHref) return '#';
    return url;
  };
  /**
   * Safeguards click functionality by calling `preventDefault` when necessary.
   *
   * @param e - MouseEvent
   * @param test - The condition deeming the click invalid.
   * @param cb - An optional callback to invoke once the test passes.
   */
  const preventInvalidClick = (e: MouseEvent, test: boolean, cb?: () => void) => {
    if (!test) e.preventDefault();
    if (cb) cb();
  };

  const handleNavigatorShare = async () => {
    try {
      const response = await fetch(nextOptimzedImage.props.src);
      const blob = await response.blob();

      const file = new File([blob], `${avatar.name}.${AVATAR_FILE_TYPE}`, {
        type: `image/${AVATAR_FILE_TYPE}`,
      });

      const sharePayload: ShareData = {
        title: `${microcopy.shareMessage} ${avatar.name}`,
        files: [file],
      };

      await navigator.share(sharePayload);
    } catch (e: unknown) {
      const error = e as { name: string };
      /**
       * User cancelled share action - no action needed
       */
      if ('name' in error && error.name === 'AbortError') return;
      console.error(e);
    }
  };

  return (
    <nav aria-label="Share billionaire">
      <ul className="flex items-start gap-x-4">
        <li>
          {navigatorShareAvailable ? (
            <button type="button" className="block cursor-pointer" onClick={handleNavigatorShare}>
              <span className="sr-only">Share</span>
              <span className="inline-block w-10 landscape:w-[4.375rem] aspect-square text-accent">
                <Share width="100%" height="100%" role="presentation" />
              </span>
            </button>
          ) : (
            <a href="https://www.instagram.com" rel="noopener noreferrer" target="_blank">
              <span className="sr-only">Instagram</span>
              <span className="inline-block w-10 landscape:w-[4.375rem] aspect-square text-accent">
                <Instagram width="100%" height="100%" role="presentation" />
              </span>
            </a>
          )}
        </li>
        {!navigatorShareAvailable && (
          <li>
            <a
              className="block cursor-pointer"
              href={safeHref(
                `https://threads.net/intent/post?url=${encodeURIComponent(currentHref)}&text=${encodeURIComponent(microcopy.threadsIntentShare)}`,
              )}
              onClick={(e) => preventInvalidClick(e, Boolean(currentHref))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">Share to Threads</span>
              <span className="inline-block w-10 landscape:w-[4.375rem] aspect-square text-accent">
                <Threads width="100%" height="100%" role="presentation" />
              </span>
            </a>
          </li>
        )}
        <li>
          <a
            className="block cursor-pointer"
            href={safeHref(downloadFile.href)}
            onClick={(e) => preventInvalidClick(e, downloadFile.href !== '#')}
            download={downloadFile.fileName}
          >
            <span className="sr-only">Download</span>
            <span className="inline-block w-10 landscape:w-[4.375rem] aspect-square text-accent">
              <Download width="100%" height="100%" role="presentation" />
            </span>
          </a>
        </li>
        <li>
          <button className="cursor-pointer" type="button" onClick={onBookmarkClick}>
            <span className="sr-only">Bookmark</span>
            <span className="inline-block w-10 landscape:w-[4.375rem] aspect-square text-accent">
              <Bookmark width="100%" height="100%" role="presentation" />
            </span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default ShareAvatar;
