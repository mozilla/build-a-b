import PlaypenPopup from '@/components/PlaypenPopup';
import PlaypenRestart from '@/components/PlaypenPopup/PlaypenRestart';
import PlaypenSave from '@/components/PlaypenPopup/PlaypenSave';
import { Trash } from '@/components/PrimaryFlow/AvatarBentoV2/Trash.svg';
import { Bookmark } from '@/components/ShareAvatar/Bookmark.svg';
import { Download } from '@/components/ShareAvatar/Download.svg';
import { Share } from '@/components/ShareAvatar/Share.svg';
import { Instagram } from '@/components/ShareAvatar/Instagram.svg';
import { Threads } from '@/components/ShareAvatar/Threads.svg';
import { useAvatarActions } from '@/hooks';
import { AvatarData } from '@/types';
import clsx from 'clsx';
import { FC, useMemo, useState } from 'react';
import { COOKIE_NAME } from '@/utils/constants';

interface ActionMenuProps {
  avatar: AvatarData;
  navigatorShareAvailable: boolean;
}

export type ActionMenuActionType = 'restart' | 'save' | 'download' | 'share';
export type ActionMenuActionTypeOrNull = ActionMenuActionType | null;

export type AvatarViewAction = {
  onPress: () => void;
  content: {
    title: string;
    description: string;
  };
};

const ActionMenu: FC<ActionMenuProps> = ({ avatar, navigatorShareAvailable }) => {
  const [actionType, setActionType] = useState<ActionMenuActionTypeOrNull>(null);
  const {
    handleNavigatorShare,
    downloadFile,
    isDownloadReady,
    threadsShareUrl,
    safeHref,
    preventInvalidClick,
  } = useAvatarActions({ avatar });

  const handleModalClose = (open: boolean) => {
    if (!open) setActionType(null);
  };

  const setClientCookie = (name: string, value: string, days = 365) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  };

  const actions: Record<ActionMenuActionType, AvatarViewAction> = useMemo(
    () => ({
      restart: {
        onPress: () => setActionType('restart'),
        content: {
          title: 'Ready for a do-over?',
          description:
            'If so, this old Billionaire&apos;s empire stays in your gallery, but it&apos;s retired from the launchpad. All new creations blast off with your new Billionaire, whoever they may be.',
        },
      },
      save: {
        onPress: () => {
          // Save the user's UUID in the cookie when they save/bookmark
          setClientCookie(COOKIE_NAME, avatar.uuid);
          setActionType('save');
        },
        content: {
          title: 'Your All Access Pass',
          description:
            'Here&apos;s your portal to everything you&apos;ve created. Use the link or scan this QR code to return to your collection anytime.',
        },
      },
      download: {
        onPress: () => {},
        content: { title: '', description: '' },
      },
      share: {
        onPress: handleNavigatorShare,
        content: {
          title: 'Your Billionaire Vault',
          description:
            'This is your gallery of Billionaire antics. Every cringe, every flex, every pixel of excess—saved for your scrolling pleasure.',
        },
      },
    }),
    [handleNavigatorShare],
  );

  return (
    <nav className="relative portrait:p-2.5" aria-label="Share billionaire">
      <ul className="flex landscape:flex-col items-center portrait:gap-x-[0.875rem] landscape:gap-y-4">
        <li>
          <button
            type="button"
            className="block cursor-pointer"
            onClick={() => setActionType('restart')}
          >
            <span className="sr-only">Delete and Restart</span>
            <span className="relative inline-block w-[3.125rem] landscape:w-[4.375rem] aspect-square text-accent transition-transform duration-300 hover:-rotate-30 group/icon">
              <Trash width="100%" height="100%" role="presentation" />
              <span
                className="absolute inset-0 rounded-full
                           bg-gradient-to-br from-transparent to-secondary-blue
                           opacity-0 group-hover/icon:opacity-70
                           transition-opacity duration-300"
              />
            </span>
          </button>
          <PlaypenPopup
            title={actions.restart.content.title}
            isOpen={actionType === 'restart'}
            onOpenChange={handleModalClose}
          >
            <PlaypenRestart
              avatar={avatar}
              action={actions.restart}
              onCancel={() => setActionType(null)}
              asset="riding"
            />
          </PlaypenPopup>
        </li>
        <li>
          <button className="cursor-pointer" onClick={actions.save.onPress}>
            <span className="sr-only">Bookmark</span>
            <span className="relative inline-block w-[3.125rem] landscape:w-[4.375rem] aspect-square text-accent transition-transform duration-300 hover:-rotate-30 group/icon">
              <Bookmark width="100%" height="100%" role="presentation" />
              <span
                className="absolute inset-0 rounded-full
                           bg-gradient-to-br from-transparent to-secondary-blue
                           opacity-0 group-hover/icon:opacity-70
                           transition-opacity duration-300"
              />
            </span>
          </button>
          <PlaypenPopup
            title={actions.save.content.title}
            isOpen={actionType === 'save'}
            onOpenChange={handleModalClose}
          >
            <PlaypenSave action={actions.save} V2 />
          </PlaypenPopup>
        </li>
        <li>
          <a
            className="block cursor-pointer"
            href={safeHref(downloadFile.href)}
            onClick={(e) => preventInvalidClick(e, isDownloadReady)}
            download={downloadFile.fileName}
          >
            <span className="sr-only">Download</span>
            <span className="relative inline-block w-[3.125rem] landscape:w-[4.375rem] aspect-square text-accent transition-transform duration-300 hover:-rotate-30 group/icon">
              <Download width="100%" height="100%" role="presentation" />
              <span
                className="absolute inset-0 rounded-full
                           bg-gradient-to-br from-transparent to-secondary-blue
                           opacity-0 group-hover/icon:opacity-70
                           transition-opacity duration-300"
              />
            </span>
          </a>
        </li>
        {navigatorShareAvailable ? (
          <li>
            <button
              className={clsx('duration-300 transition-opacity text-accent cursor-pointer')}
              onClick={actions.share.onPress}
              disabled={!navigatorShareAvailable}
            >
              <span className="sr-only">Share</span>
              <span className="relative inline-block w-[3.125rem] landscape:w-[4.375rem] aspect-square text-accent transition-transform duration-300 hover:-rotate-30 group/icon">
                <Share width="100%" height="100%" role="presentation" />
                <span
                  className="absolute inset-0 rounded-full
                             bg-gradient-to-br from-transparent to-secondary-blue
                             opacity-0 group-hover/icon:opacity-70
                             transition-opacity duration-300"
                />
              </span>
            </button>
          </li>
        ) : (
          <>
            <li>
              <a href="https://www.instagram.com" rel="noopener noreferrer" target="_blank">
                <span className="sr-only">Instagram</span>
                <span className="relative inline-block w-[3.125rem] landscape:w-[4.375rem] aspect-square text-accent transition-transform duration-300 hover:-rotate-30 group/icon">
                  <Instagram width="100%" height="100%" role="presentation" />
                  <span
                    className="absolute inset-0 rounded-full
                               bg-gradient-to-br from-transparent to-secondary-blue
                               opacity-0 group-hover/icon:opacity-70
                               transition-opacity duration-300"
                  />
                </span>
              </a>
            </li>
            <li>
              <a
                className="block cursor-pointer"
                href={safeHref(threadsShareUrl)}
                onClick={(e) => preventInvalidClick(e, threadsShareUrl !== '#')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="sr-only">Share to Threads</span>
                <span className="relative inline-block w-[3.125rem] landscape:w-[4.375rem] aspect-square text-accent transition-transform duration-300 hover:-rotate-30 group/icon [&_svg]:transition-colors [&_svg]:duration-300 group-hover/icon:[&_svg]:fill-secondary-blue">
                  <Threads width="100%" height="100%" role="presentation" />
                  <span
                    className="absolute inset-0 rounded-full
                               bg-gradient-to-br from-transparent to-secondary-blue
                               opacity-0 group-hover/icon:opacity-70
                               transition-opacity duration-300"
                  />
                </span>
              </a>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default ActionMenu;
