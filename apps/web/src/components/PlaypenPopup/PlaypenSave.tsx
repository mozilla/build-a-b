'use client';

import Bento from '@/components/Bento';
import { FirefoxTransparent } from '@/components/PlaypenPopup/FirefoxTransparent.svg';
import { Link } from '@/components/PlaypenPopup/Link.svg';
import { AvatarViewAction } from '@/components/PrimaryFlow/AvatarBento/AvatarView';
import { Button } from '@heroui/react';
import clsx from 'clsx';
import { FC, useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

interface PlaypenSaveProps {
  action: AvatarViewAction;
  v2?: boolean;
}

const microcopy = {
  copyLabel: 'Copy Link',
  copySuccessLabel: 'Link Copied',
  footer: {
    heading: 'Firefox is the only major browser not run by a Billionaire',
    body: 'Which means no Billionaire funny business. It also means that if you lose this link, we can’t help you find it. Freedom, responsibility, you get it.',
  },
} as const;

const PlaypenSave: FC<PlaypenSaveProps> = ({ action, v2 }) => {
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
      <div
        className={clsx('text-center max-w-[39.0625rem] mx-auto flex flex-col gap-y-[0.5rem]', {
          'pb-[1.25rem]': !v2,
          'pb-[2.375rem]': v2,
        })}
      >
        <p className="text-title-3">{action.content.title}</p>
        <p className="text-lg-custom">{action.content.description}</p>
      </div>
      <div
        className={clsx('relative mx-auto w-full flex justify-center', {
          'pb-[1.75rem]': !v2,
          'pb-[2.375rem]': v2,
        })}
      >
        <div className="portrait:w-44 portrait:p-4 inline-flex items-center justify-center p-7 rounded-xl bg-white">
          <QRCode
            size={310}
            value={currentHref}
            style={{ maxWidth: '100%', width: '100%', height: 'auto' }}
          />
        </div>
      </div>
      <Bento className="bg-transparent p-4 flex gap-x-2 max-w-[43.75rem] mb-6 portrait:relative overflow-visible">
        <span className="portrait:absolute portrait:top-0 portrait:right-0 inline-block w-20 h-20 shrink-0 portrait:translate-x-1/3 portrait:-translate-y-1/3">
          <FirefoxTransparent width="100%" height="100%" role="presentation" />
        </span>
        <div className="flex flex-col gap-y-2 justify-between">
          <p className="font-bold text-lg-custom portrait:text-pretty">
            {microcopy.footer.heading}
          </p>
          <p className="text-regular-custom">{microcopy.footer.body}</p>
        </div>
      </Bento>
      <div className="flex flex-col landscape:flex-row gap-4 portrait:w-full">
        <Button
          fullWidth
          type="button"
          className="portrait:shadow-[0_10px_15px_-3px_rgba(0,_0,_0,_0.10),_0_4px_6px_-4px_rgba(0,_0,_0,_0.10)] portrait:flex-1 portrait:bg-accent portrait:text-charcoal secondary-button group"
          onPress={handleLinkCopy}
        >
          <span className="portrait:hidden bg-[#18181B4D] absolute inset-0 pointer-events-none group-hover:opacity-0" />
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
