'use client';

import { FC, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HeaderMenu from '@/components/HeaderMenu';
import SocialNetwork from '@/components/SocialNetwork';
import { HeaderProps } from '@/components/Header';

const MobileMenu: FC<HeaderProps> = ({ links, socials, ctaCopy, ctaLabel }) => {
  const [open, setOpen] = useState(false);
  const closeIcon = '/assets/images/close-icon.svg';
  const srcIcon = open ? closeIcon : '/assets/images/icons/menu.svg';
  const altText = open ? 'Close Menu' : 'Open Menu';

  return (
    <div className="mobile-menu flex flex-row center-content items-center landscape:hidden">
      <button onClick={() => setOpen(!open)} className="w-6 h-6 cursor-pointer flex justify-end">
        <Image src={srcIcon} width={24} height={24} alt={altText} />
      </button>

      {open && (
        <div
          role="dialog"
          className="fixed top-0 left-0 w-full 
                    bg-white shadow-md border-t h-dvh z-50
                    bg-[url(/assets/images/bg-mobile.webp)]
                    bg-no-repeat bg-center bg-cover p-8"
        >
          <div className="modal-container relative flex flex-col">
            <button onClick={() => setOpen(false)} className="absolute z-60 right-0 cursor-pointer">
              <Image src={closeIcon} width={24} height={24} alt={altText} />
            </button>

            <div className="logo-container">
              <Link href="/" tabIndex={0} className="inline-block">
                <Image
                  src="/assets/images/Billionaire-Logo.svg"
                  alt="Billionaire Logo"
                  width={373}
                  height={220}
                  className="w-45"
                />
              </Link>
            </div>

            <div className="menu-section pt-6">
              <HeaderMenu links={links} isHorizontal={false} isInModal={true} />
            </div>
            <div className="social-media-section pt-6">
              <SocialNetwork socials={socials} isInModal={true} />
            </div>
            <div className="additional-data pt-6 text-[0.75rem]">
              <p className="mb-4">
                {ctaCopy.map((line, inx) => (
                  <span key={inx}>
                    {inx > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </p>
              <Link href="#" className="rounded-button" title="Build an avatar now">
                {ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
