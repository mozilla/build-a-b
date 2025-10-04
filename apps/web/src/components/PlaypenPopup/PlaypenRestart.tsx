'use client';

import Bento from '@/components/Bento';
import { Close } from '@/components/PlaypenPopup/Close.svg';
import { Delete } from '@/components/PlaypenPopup/Delete.svg';
import { AvatarData, type Action } from '@/types';
import { COOKIE_NAME } from '@/utils/constants';
import { getCookie } from '@/utils/helpers/cookies';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import Image from 'next/image';
import { FC, useMemo } from 'react';
import BrowserBento from '../BrowserBento';
import { removeAvatarByUser } from '@/utils/actions/remove-avatar-by-user';
import { usePrimaryFlowContext } from '../PrimaryFlow/PrimaryFlowContext';

interface PlaypenRestartProps {
  action: Action;
  avatar: AvatarData;
  onCancel: () => void;
  asset?: 'riding' | 'instagram';
}

const microcopy = {
  deleteLabelPortrait: 'Delete',
  deleteLabelLandscape: 'Delete and Restart',
  cancelLabel: 'Cancel',
} as const;

const PlaypenRestart: FC<PlaypenRestartProps> = ({ action, avatar, asset, onCancel }) => {
  const { reset } = usePrimaryFlowContext();
  const router = useRouter();

  const selectedAsset = useMemo(() => {
    if (asset === 'instagram') return avatar.instragramAsset;
    if (asset === 'riding') return avatar.originalRidingAsset;
    return avatar.url;
  }, [avatar, asset]);

  const handleRestart = () => {
    const currentUserId = getCookie(COOKIE_NAME);
    if (!currentUserId) return;

    removeAvatarByUser(currentUserId)
      .then(() => {
        // Successfully removed avatar for user ${currentUserId}.
        // Refresh the current page (re-run server components)
        reset();
        router.refresh();
      })
      .catch((e) => {
        console.error(`Error removing billionaire`, e);
      });
  };

  return (
    <div className="mx-auto max-w-[61.4375rem] flex flex-col items-center">
      <div className="text-center max-w-[39.0625rem] mx-auto pb-[1.25rem] flex flex-col gap-y-[0.5rem]">
        <p className="text-title-3">{action.content.title}</p>
        <p className="text-lg-custom">{action.content.description}</p>
      </div>
      <div className="relative mx-auto w-full pb-[1.75rem]">
        <Bento className="w-full max-w-[29.25rem] mx-auto aspect-square flex justify-center items-end p-3">
          <Image
            className="object-cover object-center"
            src={selectedAsset}
            alt={avatar.name}
            fill
            sizes="(orientation: portrait) 100vw, 32.45vw"
          />
          <BrowserBento className="relative w-full" gradient inverseElement="dots">
            <p className="bg-white p-3 text-black">
              Meet <span className="text-secondary-purple font-bold">{avatar.name}</span>, your{' '}
              {avatar.bio}
            </p>
          </BrowserBento>
        </Bento>
      </div>
      <div className="flex portrait:w-full gap-4">
        <Button
          type="button"
          className="portrait:shadow-[0_10px_15px_-3px_rgba(0,_0,_0,_0.10),_0_4px_6px_-4px_rgba(0,_0,_0,_0.10)] portrait:flex-1 portrait:bg-accent portrait:text-charcoal secondary-button group"
          onPress={handleRestart}
        >
          <span className="portrait:hidden bg-[#18181B4D] absolute inset-0 pointer-events-none group-hover:opacity-0" />
          <span className="relative inline-flex gap-x-2 items-center">
            <span className="inline-block w-7 h-7">
              <Delete width="100%" height="100%" role="presentation" />
            </span>
            <span className="landscape:hidden">{microcopy.deleteLabelPortrait}</span>
            <span className="portrait:hidden">{microcopy.deleteLabelLandscape}</span>
          </span>
        </Button>
        <Button
          type="button"
          className="portrait:shadow-[0_10px_15px_-3px_rgba(0,_0,_0,_0.10),_0_4px_6px_-4px_rgba(0,_0,_0,_0.10)] portrait:flex-1 portrait:bg-accent portrait:text-charcoal secondary-button group"
          onPress={onCancel}
        >
          <span className="portrait:hidden bg-[#18181B4D] absolute inset-0 pointer-events-none group-hover:opacity-0" />
          <span className="relative inline-flex gap-x-2 items-center">
            <span className="inline-block w-7 h-7">
              <Close width="100%" height="100%" role="presentation" />
            </span>
            {microcopy.cancelLabel}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default PlaypenRestart;
