'use client';

import { avatarBentoData } from '@/utils/constants';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, Suspense } from 'react';
import GetStarted from '../PrimaryFlow/GetStarted';
import { floatingImages } from './constants';
import LinkButton from '../LinkButton';
import { TrackableEvent } from '@/utils/helpers/track-event';

export interface FooterProps {
  links: {
    href: string;
    label: string;
    title: string;
    trackableEvent: string;
  }[];
  socials: {
    href: string;
    title: string;
    alt: string;
    src: string;
  }[];
  ctaCopy: string;
  ctaLabel: string;
}

const Footer: FC<FooterProps> = ({ links, socials, ctaCopy, ctaLabel }) => {
  const currentYear = new Date();
  const pathname = usePathname();

  return (
    <footer className="site-footer" aria-label="Site footer">
      <LinkButton
        href="/"
        title="Back to home"
        className="block w-fit landscape:absolute landscape:top-14 landscape:left-1/2 landscape:-translate-x-1/2"
        trackableEvent="click_bbo_logo_footer"
      >
        <Image
          src="/assets/images/billionaire-logo.svg"
          width={373}
          height={220}
          alt="Billionaire Logo"
          className="-ml-2 w-[13.375rem] landscape:w-[21.75rem]"
        />
      </LinkButton>

      <div className="landscape:flex landscape:justify-between landscape:mt-10 landscape:mb-4">
        <nav className="text-accent text-nav-item" aria-label="Footer navigation">
          <ul className="flex flex-col items-end landscape:items-start">
            {links.map(({ href, label, title, trackableEvent }) => (
              <li key={href}>
                <LinkButton
                  href={href}
                  title={title}
                  className="inline-block py-2
                             transform transition-all duration-300
                             origin-left
                             hover:-rotate-3 hover:translate-y-1
                             hover:bg-gradient-to-r hover:from-accent hover:to-secondary-blue
                             hover:bg-clip-text hover:text-transparent"
                  aria-current={pathname === href ? 'page' : undefined}
                  trackableEvent={`${trackableEvent}_footer` as TrackableEvent}
                >
                  {label}
                </LinkButton>
              </li>
            ))}
          </ul>
        </nav>
        <nav className="py-8 landscape:py-0" aria-label="Footer navigation">
          <ul className="flex gap-x-4 justify-end landscape:flex-col landscape:gap-y-4">
            {socials.map(({ href, title, alt, src }) => (
              <li key={href}>
                <LinkButton
                  href={href}
                  target="_blank"
                  title={title}
                  className="relative inline-flex items-center justify-center
                             rounded-full overflow-hidden
                             transition-transform duration-300
                             hover:-rotate-30
                             group"
                  trackableEvent="click_social_icon_footer"
                  trackablePlatform={alt.toLowerCase()}
                >
                  <Image
                    src={src}
                    alt={alt}
                    width={42}
                    height={42}
                    className="w-[2.625rem] landscape:w-10"
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
      </div>

      <div className="landscape:flex landscape:justify-between">
        <div className="ml-auto text-right mb-8 landscape:ml-0 landscape:mb-0 landscape:text-left">
          <p className="mb-4 ml-auto landscape:ml-0w-71 landscape:w-96 text-sm-custom">{ctaCopy}</p>
          {avatarBentoData?.primaryFlowData && (
            <Suspense fallback={<div>Loading...</div>}>
              <GetStarted
                {...avatarBentoData.primaryFlowData}
                ctaText={ctaLabel}
                triggerClassNames="secondary-button"
                trackableEvent="click_build_billionaire_footer"
              />
            </Suspense>
          )}
        </div>
        <p className="self-end">
          <Link
            href="https://www.mozilla.org/privacy/websites/?utm_source=billionaireblastoff.firefox.com&utm_medium=referral&utm_campaign=footer"
            aria-label="Go to Privacy Policy page"
            title="Go to Privacy Policy page"
            className="underline"
            target="_blank"
          >
            Privacy Policy
          </Link>{' '}
          &bull;{' '}
          <Link
            href="https://www.mozilla.org/about/legal/terms/firefox/?utm_source=billionaireblastoff.firefox.com&utm_medium=referral&utm_campaign=footer"
            aria-label="Go to Terms and Conditions page"
            title="Go to Terms and Conditions page"
            className="underline"
            target="_blank"
          >
            Terms & Conditions
          </Link>
        </p>
      </div>

      <div className="flex flex-col landscape:flex-row gap-1 justify-between font-medium text-xs10 landscape:text-base mt-2 pt-2 border-t-2 border-common-ash landscape:mt-6 landscape:pt-6">
        <span>@{currentYear.getFullYear()} Mozilla. All rights reserved.</span>
        <span className="flex gap-x-2 items-center">
          <span className="whitespace-nowrap"></span>
          <LinkButton
            href="https://www.firefox.com/?utm_source=bbomicrosite&utm_medium=referral&utm_campaign=bbo"
            target="_blank"
            title="Go to Firefox website"
            className="flex items-center pr-1 gap-1"
            trackableEvent="click_firefox_footer_logo"
          >
            Powered by
            <span className="inline-block relative w-[4.491rem] h-[1.5rem] landscape:w-[5.389rem] landscape:h-[1.8rem]">
              <Image src="/assets/images/firefox-logo.png" alt="Firefox logo" sizes="10vw" fill />
            </span>
          </LinkButton>
          <span className="font-bold">&bull;</span>{' '}
          <span className="ml-1 whitespace-nowrap">Built by</span>
          <Link
            href="https://www.mondorobot.com/"
            target="_blank"
            title="Visit MondoRobot website"
            className="inline-block relative w-[5.5rem] h-[0.7rem] landscape:w-[8.2rem] landscape:h-[1rem] mb-1"
          >
            <Image
              alt="Mondorobot logo"
              src="/assets/images/mondo-robot-logo.svg"
              sizes="10vw"
              fill
            />
          </Link>
        </span>
      </div>

      <div
        id="footer-animations"
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
    </footer>
  );
};

export default Footer;
