import { FC } from 'react';
import Image from 'next/image';
import LinkButton from '../LinkButton';
import { TrackableEvent } from '@/utils/helpers/track-event';

export interface SocialNetworkProps {
  socials: {
    href: string;
    title: string;
    alt: string;
    src: string;
  }[];
  isInModal: boolean;
  trackableEvent?: TrackableEvent;
}

const SocialNetwork: FC<SocialNetworkProps> = ({ socials, isInModal, trackableEvent }) => {
  const navClass = isInModal
    ? 'social-network flex content-center'
    : 'social-network hidden landscape:flex content-center';

  return (
    <nav className={navClass} aria-label="Social media links">
      <ul className="flex flex-row content-center justify-center items-center gap-x-4">
        {socials.map(({ href, title, alt, src }) => (
          <li key={href}>
            <LinkButton
              href={href}
              target="_blank"
              title={title}
              aria-label={title}
              className="relative inline-flex
                         items-center justify-center
                         rounded-full overflow-hidden 
                         transition-transform duration-300
                         hover:-rotate-30 group"
              trackableEvent={trackableEvent}
              trackablePlatform={alt.toLowerCase()}
            >
              <Image
                src={src}
                alt={alt}
                width={42}
                height={42}
                className="w-[2.625rem] h-[2.625rem]"
              />
              <span
                className="absolute inset-0
                           bg-gradient-to-br from-transparent to-secondary-blue
                           opacity-0 group-hover:opacity-70
                           transition-opacity duration-300"
              />
            </LinkButton>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SocialNetwork;
