'use client';

import { FC, PropsWithChildren } from 'react';
import Link from 'next/link';
import { TrackableEvent, trackEvent } from '@/utils/helpers/track-event';

interface LinkButtonProps extends PropsWithChildren {
  href: string;
  title?: string;
  target?: '_self' | '_blank';
  className?: string;
  tabIndex?: number;
  trackableEvent?: TrackableEvent;
}

const LinkButton: FC<LinkButtonProps> = ({
  href,
  title,
  target,
  className,
  tabIndex,
  trackableEvent,
  children,
}) => {
  return (
    <Link
      href={href}
      title={title}
      target={target}
      className={className}
      tabIndex={tabIndex}
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
