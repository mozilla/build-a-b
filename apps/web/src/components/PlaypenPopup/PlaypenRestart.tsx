import Bento from '@/components/Bento';
import { Close } from '@/components/PlaypenPopup/Close.svg';
import { Delete } from '@/components/PlaypenPopup/Delete.svg';
import { AvatarViewAction } from '@/components/PrimaryFlow/AvatarBento/AvatarView';
import { AvatarData } from '@/types';
import { COOKIE_NAME, ID_HISTORY_COOKIE } from '@/utils/constants';
import { deleteCookie, getCookie, parseJsonCookie, setCookie } from '@/utils/helpers/cookies';
import { Button } from '@heroui/react';
import Image from 'next/image';
import { FC } from 'react';

interface PlaypenRestartProps {
  action: AvatarViewAction;
  avatar: AvatarData;
  onCancel: () => void;
}

const microcopy = {
  deleteLabel: 'Delete and Restart',
  cancelLabel: 'Cancel',
} as const;

/**
 * Moves the current `user_id` value to the `id_history` cookie and expires the `user_id` cookie.
 */
export const moveUserIdToHistory = (): void => {
  const currentUserId = getCookie(COOKIE_NAME);
  if (!currentUserId) return;

  const existingHistoryJson = getCookie(ID_HISTORY_COOKIE);
  const existingHistory: string[] = parseJsonCookie<string[]>(existingHistoryJson) || [];

  const updatedHistory = [...existingHistory, currentUserId];
  setCookie(ID_HISTORY_COOKIE, JSON.stringify(updatedHistory), { path: '/' });
  deleteCookie(COOKIE_NAME, { path: '/' });
};

const PlaypenRestart: FC<PlaypenRestartProps> = ({ action, avatar, onCancel }) => {
  const handleRestart = () => {
    moveUserIdToHistory();
    window.location.href = '/';
  };
  return (
    <div className="mx-auto max-w-[61.4375rem] flex flex-col items-center">
      <div className="text-center max-w-[39.0625rem] mx-auto pb-[1.25rem] flex flex-col gap-y-[0.5rem]">
        <p className="text-title-3">{action.content.title}</p>
        <p className="text-lg-custom">{action.content.description}</p>
      </div>
      <div className="relative mx-auto w-full pb-[1.75rem]">
        <Bento className="w-full max-w-[29.25rem] mx-auto portrait:h-[28.5rem] landscape:aspect-square flex justify-center items-end">
          <Image
            className="object-cover object-center"
            src={avatar.url}
            alt={avatar.name}
            fill
            sizes="(orientation: portrait) 100vw, 32.45vw"
          />
        </Bento>
      </div>
      <div className="flex flex-col landscape:flex-row gap-4">
        <Button type="button" className="secondary-button group" onPress={handleRestart}>
          <span className="bg-[#18181B4D] absolute inset-0 pointer-events-none group-hover:opacity-0" />
          <span className="relative inline-flex gap-x-2 items-center">
            <span className="inline-block w-7 h-7">
              <Delete width="100%" height="100%" role="presentation" />
            </span>
            {microcopy.deleteLabel}
          </span>
        </Button>
        <Button type="button" className="secondary-button group" onPress={onCancel}>
          <span className="bg-[#18181B4D] absolute inset-0 pointer-events-none group-hover:opacity-0" />
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
