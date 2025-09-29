import Bento from '@/components/Bento';
import BrowserBento from '@/components/BrowserBento';
import ShareAvatar from '@/components/ShareAvatar';
import { AvatarData, type Action } from '@/types';
import Image from 'next/image';
import { Dispatch, SetStateAction } from 'react';

const microcopy = {
  bioPrefix: 'Meet ',
} as const;

interface PlaypenShareProps<T = string> {
  action: Action;
  avatar: AvatarData;
  navigatorShareAvailable: boolean;
  setActionType: Dispatch<SetStateAction<T | null>>;
  saveActionValue: T;
}

function PlaypenShare<T = string>({
  action,
  avatar,
  navigatorShareAvailable,
  setActionType,
  saveActionValue,
}: PlaypenShareProps<T>) {
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
          <Image
            className="absolute top-2 right-2 w-auto"
            src="/assets/images/firefox.svg"
            alt=""
            role="presentation"
            width={30}
            height={30}
          />
          <BrowserBento
            className="relative w-full max-w-[85.47%] mb-6"
            gradient
            inverseElement="dots"
          >
            <p className="bg-white p-[1.5rem] text-black">
              {microcopy.bioPrefix}
              <span className="text-secondary-purple font-bold">{avatar.name}</span>, {avatar.bio}
            </p>
          </BrowserBento>
        </Bento>
      </div>
      <div>
        <ShareAvatar
          avatar={avatar}
          navigatorShareAvailable={navigatorShareAvailable}
          onBookmarkClick={() => setActionType(saveActionValue)}
        />
      </div>
    </div>
  );
}

export default PlaypenShare;
