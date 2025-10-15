'use client';

import { FC, PropsWithChildren } from 'react';
import Link from 'next/link';
import { TrackableEvent, trackEvent } from '@/utils/helpers/track-event';

interface LinkButtonProps extends PropsWithChildren {
  href: string;
  title?: string;
  target?: '_self' | '_blank';
  download?: boolean;
  className?: string;
  tabIndex?: number;
  trackableEvent?: TrackableEvent;
  trackablePlatform?: string;
}

const LinkButton: FC<LinkButtonProps> = ({
  href,
  title,
  download,
  target,
  className,
  tabIndex,
  trackableEvent,
  trackablePlatform,
  children,
}) => {
  return (
    <Link
      href={href}
      title={title}
      download={download}
      target={target}
      className={className}
      tabIndex={tabIndex}
      onClick={() => {
        if (trackableEvent) {
          trackEvent({ action: trackableEvent, platform: trackablePlatform });
        }
      }}
      
    >
      {children}
    </Link>
  );
};

export default LinkButton;
