'use client';

import { TrackableEvent, trackEvent } from '@/utils/helpers/track-event';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, useState } from 'react';

export interface HeaderMenuProps {
  links: {
    href: string;
    label: string;
    title: string;
    trackableEvent: string;
  }[];
  isHorizontal: boolean;
  isInModal: boolean;
  onLinkClick?: () => void;
}

const HeaderMenu: FC<HeaderMenuProps> = ({ links, isHorizontal, isInModal, onLinkClick }) => {
  const pathname = usePathname();
  const [clickedLink, setClickedLink] = useState<string | null>(null);
  const classMenu = isHorizontal
    ? 'flex font-bold gap-3 flex-row content-center justify-end items-center'
    : 'flex font-bold gap-3 flex-col';
  const classNav = isHorizontal
    ? 'text-accent uppercase font-bold flex h-full justify-end'
    : 'text-accent uppercase font-bold flex h-full justify-start';
  const mainClass = isInModal
    ? 'main-navigation font-sharp font-bold uppercase'
    : 'main-navigation font-sharp font-bold uppercase hidden landscape:block';

  return (
    <div className={mainClass}>
      <nav aria-label="Main Navigation" className={classNav}>
        <ul className={classMenu}>
          {links.map(({ href, label, title, trackableEvent }) => {
            const isClicked = clickedLink === href;
            const handleClick = () => {
              if (isInModal) {
                setClickedLink(href);
                onLinkClick?.();
              }
              trackEvent({ action: `${trackableEvent}_header` as TrackableEvent });
            };

            return (
              <li key={href}>
                <Link
                  href={href}
                  title={title}
                  aria-label={title}
                  aria-current={pathname === href ? 'page' : undefined}
                  onClick={handleClick}
                  className={`inline-block ${isHorizontal && 'px-3'} py-2
                             transform transition-all duration-300
                             origin-left text-nav-item
                             hover:-rotate-3 hover:translate-y-1
                             hover:bg-gradient-to-r hover:from-accent hover:to-secondary-blue
                             hover:bg-clip-text
                             hover:text-transparent
                             ${isClicked && isInModal ? 'underline decoration-2 underline-offset-4' : ''}`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default HeaderMenu;
