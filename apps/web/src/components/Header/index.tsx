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
    <Bento className="h-[5.875rem] landscape:h-[10.9375rem] mb-4 landscape:mb-8 bg-no-repeat bg-cover bg-[url(/assets/images/night-sky.webp)]">
      <div className="relative header-container flex justify-between h-full pl-3 pr-4 landscape:pl-8 landscape:pr-8">
        <div className="left-side flex flex-row h-full">
          <Link href="/" tabIndex={0} className="flex flex-row items-center">
            <Image
              src="/assets/images/billionaire-logo.svg"
              alt="Billionaire Logo"
              width={373}
              height={220}
              className="w-[7.0625rem] landscape:w-[13.125rem] rotate-[-8deg] landscape:rotate-[-3deg]"
            />
          </Link>
        </div>
        <div className="right-side flex flex-row gap-x-3">
          <HeaderMenu links={links} isHorizontal={true} isInModal={false} />
          <SocialNetwork socials={socials} isInModal={false} />
          <MobileMenu links={links} socials={socials} ctaCopy={ctaCopy} ctaLabel={ctaLabel} />
        </div>
      </div>
      <div
        id="header-animations"
        className="portrait:hidden absolute inset-0 pointer-events-none overflow-hidden"
      >
        {/* Fliers - shooting star effect */}
        <Image
          src="/assets/images/animations/flier1-header.webp"
          alt=""
          width={185}
          height={222}
          className="absolute animate-flier-1"
          style={{
            bottom: '10.3125rem',
            left: '12.875rem',
            width: '9.885rem',
            height: '11.875rem',
          }}
        />
        <Image
          src="/assets/images/animations/flier2-header.webp"
          alt=""
          width={68}
          height={112}
          className="absolute animate-flier-2"
          style={{
            top: '-7rem',
            left: '72.8125rem',
            width: '4.247rem',
            height: '7rem',
          }}
        />
        <Image
          src="/assets/images/animations/flier3-header.webp"
          alt=""
          width={80}
          height={96}
          className="absolute animate-flier-3"
          style={{
            top: '5.25rem',
            left: '-4.5rem',
            width: '5.021rem',
            height: '6rem',
          }}
        />

        {/* Floaters - peek in from edges */}
        <Image
          src="/assets/images/animations/floater1-header.webp"
          alt=""
          width={127}
          height={134}
          className="absolute animate-floater-1"
          style={{
            bottom: '-15.75rem',
            left: '44.82125rem',
            transform: 'rotate(11.444deg)',
            width: '7.932rem',
            height: '8.375rem',
          }}
        />
        <Image
          src="/assets/images/animations/floater2-header.webp"
          alt=""
          width={127}
          height={134}
          className="absolute animate-floater-2"
          style={{
            bottom: '10.6rem',
            left: '26.88375rem',
            transform: 'rotate(11.444deg)',
            width: '6rem',
            height: '6.321rem',
          }}
        />
      </div>
    </Bento>
  );
};

export default Header;
