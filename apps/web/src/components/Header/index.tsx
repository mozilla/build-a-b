'use client';

import Image from 'next/image';
import Bento from '@/components/Bento';
import HeaderMenu from '@/components/HeaderMenu';
import SocialNetwork from '@/components/SocialNetwork';
import MobileMenu from '@/components/MobileMenu';
import { FC } from 'react';
import { floatingImages } from './constants';
import LinkButton from '../LinkButton';

export interface HeaderProps {
  links: {
    href: string;
    label: string;
    title: string;
    trackableEvent: string;
  }[];
  socials: {
    type: 'tiktok' | 'instagram' | 'threads' | 'youtube';
    href: string;
    title: string;
  }[];
  ctaCopy: string;
  ctaLabel: string;
}

const Header: FC<HeaderProps> = ({ links, socials, ctaCopy, ctaLabel }) => {
  return (
    <Bento className="h-[5.875rem] landscape:h-[10.9375rem] mb-4 landscape:mb-8 bg-no-repeat bg-cover bg-[url(/assets/images/night-sky.webp)]">
      <div className="relative header-container flex justify-between h-full pl-3 pr-4 landscape:pl-8 landscape:pr-8">
        <div className="left-side flex flex-row h-full">
          <LinkButton
            href="/"
            tabIndex={0}
            className="flex flex-row items-center"
            trackableEvent="click_bbo_logo_header"
          >
            <Image
              src="/assets/images/billionaire-logo.svg"
              alt="Billionaire Logo"
              width={373}
              height={220}
              className="w-[7.0625rem] landscape:w-[13.125rem] rotate-[-8deg] landscape:rotate-[-3deg]"
            />
          </LinkButton>
        </div>
        <div className="right-side flex flex-row gap-x-3">
          <HeaderMenu links={links} isHorizontal={true} isInModal={false} />
          <SocialNetwork
            socials={socials}
            isInModal={false}
            trackableEvent="click_social_icon_header"
          />
          <MobileMenu links={links} socials={socials} ctaCopy={ctaCopy} ctaLabel={ctaLabel} />
        </div>
      </div>
      <div
        id="header-animations"
        className="portrait:hidden absolute inset-0 pointer-events-none overflow-hidden"
      >
        {floatingImages.map(({ id, className, style }, index) => (
          <div key={index} className={className} style={style}>
            <Image
              src={`/assets/images/intro-modal/${id}.webp`}
              alt={`Floating character ${index + 1}`}
              fill
              sizes="(max-width: 768px) 30vw, 20vw"
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </Bento>
  );
};

export default Header;
