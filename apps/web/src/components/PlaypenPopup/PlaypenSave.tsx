'use client';

import { Link } from '@/components/PlaypenPopup/Link.svg';
import type { Action } from '@/types';
import { Button } from '@heroui/react';
import clsx from 'clsx';
import { FC, useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

interface PlaypenSaveProps {
  action: Action;
  /**
   * Applies alternate styling to align with AvatarBentoV2 screens.
   */
  V2?: boolean;
  /**
   * Callback when close button is clicked
   */
  onClose?: () => void;
}

const microcopy = {
  copyLabel: 'Copy Link',
  copySuccessLabel: 'Link Copied',
} as const;

const PlaypenSave: FC<PlaypenSaveProps> = ({ action, V2, onClose }) => {
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
          'pb-[1.25rem]': !V2,
          'pb-[2.375rem]': V2,
        })}
      >
        <p className="text-title-3">{action.content.title}</p>
        <p className="text-lg-custom">{action.content.description}</p>
      </div>
      <div
        className={clsx('relative mx-auto w-full flex justify-center', {
          'pb-[1.75rem]': !V2,
          'pb-[2.375rem]': V2,
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
      <div className="flex flex-col landscape:flex-row landscape:justify-center gap-4 portrait:w-full">
        <Button
          type="button"
          className="portrait:shadow-[0_10px_15px_-3px_rgba(0,_0,_0,_0.10),_0_4px_6px_-4px_rgba(0,_0,_0,_0.10)] portrait:flex-1 portrait:bg-accent portrait:text-charcoal portrait:w-full landscape:px-8 secondary-button group"
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
        {onClose && (
          <Button
            type="button"
            className="portrait:shadow-[0_10px_15px_-3px_rgba(0,_0,_0,_0.10),_0_4px_6px_-4px_rgba(0,_0,_0,_0.10)] portrait:flex-1 portrait:w-full landscape:px-8 secondary-button group"
            onPress={onClose}
          >
            <span className="portrait:hidden bg-[#18181B4D] absolute inset-0 pointer-events-none group-hover:opacity-0" />
            <span className="relative">Close</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlaypenSave;
