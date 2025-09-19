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
    <Bento className="h-16 landscape:h-[10.9375rem] mb-4 landscape:mb-8 bg-no-repeat bg-cover bg-[url(/assets/images/night-sky.webp)]">
      <div className="relative header-container flex justify-between h-full pl-4 pr-4 landscape:pl-8 landscape:pr-8">
        <div className="left-side flex flex-row h-full">
          <Link href="/" tabIndex={0} className="flex flex-row items-center">
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
      <div id="header-animations" className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Fliers - shooting star effect */}
        <Image
          src="/assets/images/header-animations/flier1.svg"
          alt=""
          width={149}
          height={222}
          className="absolute animate-flier-1"
          style={{
            bottom: '10.3125rem',
            left: '12.875rem',
            width: '9.3125rem',
            height: '13.875rem',
          }}
        />
        <Image
          src="/assets/images/header-animations/flier2.svg"
          alt=""
          width={75}
          height={112}
          className="absolute animate-flier-2"
          style={{
            top: '-7rem',
            left: '72.8125rem',
            width: '4.6875rem',
            height: '7rem',
          }}
        />
        <Image
          src="/assets/images/header-animations/flier3.svg"
          alt=""
          width={64}
          height={96}
          className="absolute animate-flier-3"
          style={{
            top: '5.25rem',
            left: '-4.5rem',
            width: '4rem',
            height: '6rem',
          }}
        />

        {/* Floaters - peek in from edges */}
        <Image
          src="/assets/images/header-animations/floater1.svg"
          alt=""
          width={88.3}
          height={134}
          className="absolute animate-floater-1"
          style={{
            bottom: '-15.75rem',
            left: '44.82125rem',
            transform: 'rotate(11.444deg)',
            width: '5.51875rem',
            height: '8.375rem',
          }}
        />
        <Image
          src="/assets/images/header-animations/floater2.svg"
          alt=""
          width={88.3}
          height={134}
          className="absolute animate-floater-2"
          style={{
            bottom: '9.369375rem',
            left: '26.88375rem',
            transform: 'rotate(11.444deg)',
            width: '5.51875rem',
            height: '8.375rem',
          }}
        />
      </div>
    </Bento>
  );
};

export default Header;
