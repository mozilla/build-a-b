'use client';

import { FC, Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HeaderMenu from '@/components/HeaderMenu';
import SocialNetwork from '@/components/SocialNetwork';
import GetStarted from '../PrimaryFlow/GetStarted';
import { HeaderProps } from '@/components/Header';
import { avatarBentoData } from '@/utils/constants';

const MobileMenu: FC<HeaderProps> = ({ links, socials, ctaLabel, ctaCopy }) => {
  const [open, setOpen] = useState(false);
  const closeIcon = '/assets/images/close-icon.svg';
  const srcIcon = open ? closeIcon : '/assets/images/icons/menu.svg';
  const altText = open ? 'Close Menu' : 'Open Menu';

  return (
    <div className="mobile-menu flex flex-row center-content items-center landscape:hidden">
      <button onClick={() => setOpen(!open)} className="w-6 h-6 cursor-pointer flex justify-end">
        <Image
          src={srcIcon}
          width={24}
          height={24}
          alt={altText}
          className="w-[1.5rem] h-[1.5rem]"
        />
      </button>

      {open && (
        <div
          role="dialog"
          className="fixed top-0 bottom-0 left-0 w-full min-h-dvh z-50 overflow-auto
                     bg-[url(/assets/images/bg-mobile.webp)]
                     bg-no-repeat bg-center bg-cover"
        >
          <div className="absolute top-0 left-0 w-full min-h-dvh z-50 p-8 flex flex-col justify-between">
            <button
              onClick={() => setOpen(false)}
              className="absolute z-60 top-12 right-4 cursor-pointer w-8 h-8"
            >
              <Image src={closeIcon} fill alt={altText} className="w-6 h-6" />
            </button>
            <div>
              <Link href="/" tabIndex={0} className="inline-block relative w-45 h-25 mb-6 -ml-4">
                <Image src="/assets/images/billionaire-logo.svg" alt="Billionaire Logo" fill />
              </Link>
              <HeaderMenu
                links={links}
                isHorizontal={false}
                isInModal={true}
                onLinkClick={() => setTimeout(() => setOpen(false), 200)}
              />
            </div>
            <div className="flex flex-col justify-center items-center">
              {avatarBentoData?.primaryFlowData && (
                <Suspense fallback={<div>Loading...</div>}>
                  <GetStarted
                    {...avatarBentoData.primaryFlowData}
                    ctaText={ctaLabel}
                    triggerClassNames="secondary-button w-full"
                  />
                </Suspense>
              )}
              <p className="mt-4 mb-10 text-sm-custom text-center">{ctaCopy}</p>
              <SocialNetwork socials={socials} isInModal={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
