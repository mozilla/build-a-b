'use client';

import Bento from '@/components/Bento';
import { Link } from '@/components/PlaypenPopup/Link.svg';
import { AvatarViewAction } from '@/components/PrimaryFlow/AvatarBento/AvatarView';
import { Button } from '@heroui/react';
import Image from 'next/image';
import { FC, useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

interface PlaypenSaveProps {
  action: AvatarViewAction;
}

const microcopy = {
  copyLabel: 'Copy Link',
  copySuccessLabel: 'Link Copied',
  footer: {
    heading: 'Firefox is the only major browser not run by a Billionaire',
    body: 'Which means no Billionaire funny business. It also means that if you lose this link, we can’t help you find it. Freedom, responsibility, you get it.',
  },
} as const;

const PlaypenSave: FC<PlaypenSaveProps> = ({ action }) => {
  const [currentHref, setCurrentHref] = useState('');
  const [copyButtonLabel, setCopyButtonLabel] = useState<string>(microcopy.copyLabel);

  useEffect(() => {
    setCurrentHref(window.location.href);
  }, [setCurrentHref]);

  const handleLinkCopy = () => {
    navigator.clipboard
      .writeText(currentHref)
      .then(() => setCopyButtonLabel(microcopy.copySuccessLabel));
  };

  return (
    <div className="mx-auto max-w-[61.4375rem] flex flex-col items-center">
      <div className="text-center max-w-[39.0625rem] mx-auto pb-[1.25rem] flex flex-col gap-y-[0.5rem]">
        <p className="text-title-3">{action.content.title}</p>
        <p className="text-lg-custom">{action.content.description}</p>
      </div>
      <div className="relative mx-auto w-full pb-[1.75rem] flex justify-center">
        <div className="inline-flex items-center justify-center p-7 rounded-xl bg-white">
          <QRCode
            size={310}
            value={currentHref}
            style={{ maxWidth: '100%', width: '100%', height: 'auto' }}
          />
        </div>
      </div>
      <Bento className="!border-charcoal bg-white p-4 flex gap-x-2 max-w-[43.75rem] mb-6">
        <Image
          className="portrait:self-start"
          src="/assets/images/firefox.svg"
          alt="Firefox logo"
          width={66}
          height={68}
        />
        <div className="flex flex-col gap-y-2 justify-between text-charcoal">
          <p className="font-bold text-lg-custom">{microcopy.footer.heading}</p>
          <p className="text-regular-custom">{microcopy.footer.body}</p>
        </div>
      </Bento>
      <div className="flex flex-col landscape:flex-row gap-4">
        <Button type="button" className="secondary-button group" onPress={handleLinkCopy}>
          <span className="bg-[#18181B4D] absolute inset-0 pointer-events-none group-hover:opacity-0" />
          <span className="relative inline-flex gap-x-2 items-center">
            <span className="inline-block w-7 h-7">
              <Link width="100%" height="100%" role="presentation" />
            </span>
            {copyButtonLabel}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default PlaypenSave;
