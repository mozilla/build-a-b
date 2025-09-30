import PlaypenPopup from '@/components/PlaypenPopup';
import PlaypenRestart from '@/components/PlaypenPopup/PlaypenRestart';
import PlaypenSave from '@/components/PlaypenPopup/PlaypenSave';
import { Trash } from '@/components/PrimaryFlow/AvatarBentoV2/Trash.svg';
import { Bookmark } from '@/components/ShareAvatar/Bookmark.svg';
import { Download } from '@/components/ShareAvatar/Download.svg';
import { Share } from '@/components/ShareAvatar/Share.svg';
import { Instagram } from '@/components/ShareAvatar/Instagram.svg';
import { Threads } from '@/components/ShareAvatar/Threads.svg';
import { useAvatarActions, useNavigatorShareAction } from '@/hooks';
import { AvatarData } from '@/types';
import clsx from 'clsx';
import { FC, useMemo, useState } from 'react';

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

  const actions: Record<ActionMenuActionType, AvatarViewAction> = useMemo(
    () => ({
      restart: {
        onPress: () => setActionType('restart'),
        content: {
          title: 'Ready for a do-over?',
          description:
            'If so, this old billionaire’s empire stays in your gallery, but it’s retired from the launchpad. All new creations blast off with your new billionaire, whoever they may be.',
        },
      },
      save: {
        onPress: () => setActionType('save'),
        content: {
          title: 'Your All Access Pass',
          description:
            'Here’s your portal to everything you’ve created. Use the link or scan this QR code to return to your collection anytime.',
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
            'This is your gallery of billionaire antics. Every cringe, every flex, every pixel of excess—saved for your scrolling pleasure.',
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
            <span className="inline-block w-[3.125rem] landscape:w-[4.375rem] aspect-square text-accent">
              <Trash width="100%" height="100%" role="presentation" />
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
              asset="instagram"
            />
          </PlaypenPopup>
        </li>
        <li>
          <button className="cursor-pointer" onClick={actions.save.onPress}>
            <span className="sr-only">Bookmark</span>
            <span className="inline-block w-[3.125rem] landscape:w-[4.375rem] aspect-square text-accent">
              <Bookmark width="100%" height="100%" role="presentation" />
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
            <span className="inline-block w-[3.125rem] landscape:w-[4.375rem] aspect-square text-accent">
              <Download width="100%" height="100%" role="presentation" />
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
              <span className="inline-block w-[3.125rem] landscape:w-[4.375rem] aspect-square">
                <Share width="100%" height="100%" role="presentation" />
              </span>
            </button>
          </li>
        ) : (
          <>
            <li>
              <a href="https://www.instagram.com" rel="noopener noreferrer" target="_blank">
                <span className="sr-only">Instagram</span>
                <span className="inline-block w-[3.125rem] landscape:w-[4.375rem] aspect-square text-accent">
                  <Instagram width="100%" height="100%" role="presentation" />
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
                <span className="inline-block w-[3.125rem] landscape:w-[4.375rem] aspect-square text-accent">
                  <Threads width="100%" height="100%" role="presentation" />
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
