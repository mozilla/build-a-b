'use client';

import { FC, PropsWithChildren } from 'react';
import Link from 'next/link';
import { TrackableEvent, trackEvent } from '@/utils/helpers/track-event';

interface LinkButtonProps extends PropsWithChildren {
  href: string;
  title?: string;
  target?: '_self' | '_blank';
  className?: string;
  trackableEvent?: TrackableEvent;
}

const LinkButton: FC<LinkButtonProps> = ({
  href,
  title,
  target,
  className,
  trackableEvent,
  children,
}) => {
  return (
    <Link
      href={href}
      title={title}
      target={target}
      className={className}
      onClick={() => {
        if (trackableEvent) {
          trackEvent({ action: trackableEvent });
        }
      }}
    >
      {children}
    </Link>
  );
};

export default LinkButton;
