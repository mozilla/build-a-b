'use client';

import Image from 'next/image';
import Link from 'next/link';
import Bento from '@/components/Bento';
import HeaderMenu from '@/components/HeaderMenu';
import SocialNetwork from '@/components/SocialNetwork';
import MobileMenu from '@/components/MobileMenu';
import { FC } from 'react';

export interface HeaderProps {
  links: {
    href: string;
    label: string;
    title: string;
  }[];
  socials: {
    href: string;
    title: string;
    alt: string;
    src: string;
  }[];
  ctaCopy: string[];
  ctaLabel: string;
}

const Header: FC<HeaderProps> = ({ links, socials, ctaCopy, ctaLabel }) => {
  return (
    <Bento
      className="h-16 landscape:h-[10.9375rem]
                 mb-3 landscape:mb-2
                 bg-no-repeat gap-[30px] bg-cover bg-[url(/assets/images/night-sky.webp)]"
    >
      <div className="header-container flex justify-between h-full pl-4 pr-4 landscape:pl-8 landscape:pr-8">
        <div className="left-side flex flex-row h-full">
          <Link href="/home" tabIndex={0} className="flex flex-row items-center">
            <Image
              src="/assets/images/Billionaire-Logo.svg"
              alt="Billionaire Logo"
              width={373}
              height={220}
              className="max-w-[4.125rem] landscape:max-w-[14rem]"
            />
          </Link>
        </div>
        <div className="right-side flex flex-row gap-x-3">
          <HeaderMenu links={links} isHorizontal={true} isInModal={false} />
          <SocialNetwork socials={socials} isInModal={false} />
          <MobileMenu links={links} socials={socials} ctaCopy={ctaCopy} ctaLabel={ctaLabel} />
        </div>
      </div>
    </Bento>
  );
};

export default Header;
