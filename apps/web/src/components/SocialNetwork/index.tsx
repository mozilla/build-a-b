import { FC } from 'react';
import LinkButton from '../LinkButton';
import { TrackableEvent } from '@/utils/helpers/track-event';
import SocialIcon from '../SocialIcon';

export interface SocialNetworkProps {
  socials: SocialNetworkItem[];
  isInModal: boolean;
  trackableEvent?: TrackableEvent;
}

export type SocialNetworkItem = {
  type: 'tiktok' | 'instagram' | 'threads' | 'youtube';
  href: string;
  title: string;
};

const SocialNetwork: FC<SocialNetworkProps> = ({ socials, isInModal, trackableEvent }) => {
  const navClass = isInModal
    ? 'social-network flex content-center'
    : 'social-network hidden landscape:flex content-center';

  return (
    <nav className={navClass} aria-label="Social media links">
      <ul className="flex flex-row content-center justify-center items-center gap-x-4">
        {socials.map(({ href, title, type }) => (
          <li key={href}>
            <LinkButton
              href={href}
              target="_blank"
              title={title}
              aria-label={title}
              className="relative inline-flex items-center justify-center
                        rounded-full overflow-hidden
                         text-accent
                         transition-transform duration-300
                         hover:-rotate-30 active:-rotate-30
                         after:content-[''] after:absolute after:inset-0
                         after:bg-gradient-to-br after:from-transparent after:to-secondary-blue
                         after:opacity-0 hover:after:opacity-70 active:after:opacity-70
                         after:transition-opacity after:duration-300"
              trackableEvent={trackableEvent}
              trackablePlatform={type}
            >
              <SocialIcon type={type} className="w-[2.625rem] h-[2.625rem]" />
            </LinkButton>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SocialNetwork;
