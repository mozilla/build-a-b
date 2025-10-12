'use client';

import { Bookmark } from '@/components/ShareAvatar/Bookmark.svg';
import { Download } from '@/components/ShareAvatar/Download.svg';
import { Instagram } from '@/components/ShareAvatar/Instagram.svg';
import { Share } from '@/components/ShareAvatar/Share.svg';
import { Threads } from '@/components/ShareAvatar/Threads.svg';
import { useAvatarActions } from '@/hooks';
import { AvatarData } from '@/types';
import { FC } from 'react';

export interface ShareAvatarProps {
  avatar: AvatarData;
  onBookmarkClick: () => void;
  navigatorShareAvailable?: boolean;
  centered?: boolean;
}

const ShareAvatar: FC<ShareAvatarProps> = ({
  avatar,
  onBookmarkClick,
  navigatorShareAvailable: externalNavigatorShareAvailable,
  centered,
}) => {
  const {
    isNavigatorShareAvailable,
    handleNavigatorShare,
    downloadFile,
    isDownloadReady,
    threadsShareUrl,
    safeHref,
    preventInvalidClick,
  } = useAvatarActions({ avatar });

  // The external prop takes precedence to avoid visible conditional rendering.
  const navigatorShareAvailable = externalNavigatorShareAvailable ?? isNavigatorShareAvailable;

  return (
    <nav aria-label="Share Billionaire">
      <ul className={`flex items-start gap-x-4 ${centered && 'justify-center'}`}>
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
              href={safeHref(threadsShareUrl)}
              onClick={(e) => preventInvalidClick(e, threadsShareUrl !== '#')}
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
            onClick={(e) => preventInvalidClick(e, isDownloadReady)}
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
