'use client';
import Bento from '@/components/Bento';
import LogoPage from '@/components/LogoPage';
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
                    mb-3 landscape:mb-8
                    bg-no-repeat gap-[30px] bg-cover bg-[url(/assets/images/NightSky.svg)]"
    >
      <div className='header-container flex justify-between h-full pl-4 pr-4 landscape:pl-8 landscape:pr-8'>
        <div className='left-side flex flex-row h-full'>
          <LogoPage/>
        </div>
        <div className='right-side flex flex-row gap-x-3'>
          <HeaderMenu
            links={links}
            isHorizontal={true}
            isInModal={false}
          />
          <SocialNetwork
            socials={socials}
            isInModal={false}
          />
          <MobileMenu
            links={links}
            socials={socials}
            ctaCopy={ctaCopy}
            ctaLabel={ctaLabel}
           />
        </div>
      </div>
    </Bento>
  );
};

export default Header;
