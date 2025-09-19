'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

export interface FooterProps {
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
  message: string;
}

const Footer: FC<FooterProps> = ({ links, socials, ctaCopy, ctaLabel, message }) => {
  const currentYear = new Date();
  const pathname = usePathname();

  return (
    <footer className="site-footer" aria-label="Site footer">
      <Link
        href="/"
        title="Back to home"
        className="block w-fit landscape:absolute landscape:top-14 landscape:left-1/2 landscape:-translate-x-1/2"
      >
        <Image
          src="/assets/images/billionaire-logo.svg"
          width={373}
          height={220}
          alt="Billionaire Logo"
          className="-ml-2 w-[13.375rem] landscape:w-[21.75rem]"
        />
      </Link>

      <div className="landscape:flex landscape:justify-between landscape:mt-14 landscape:mb-16">
        <nav className="text-accent text-nav-item" aria-label="Footer navigation">
          <ul className="flex flex-col items-end landscape:items-start">
            {links.map(({ href, label, title }) => (
              <li key={href}>
                <Link
                  href={href}
                  title={title}
                  className="inline-block py-2
                             transform transition-all duration-300
                             origin-left
                             hover:-rotate-3 hover:translate-y-1
                             hover:bg-gradient-to-r hover:from-accent hover:to-secondary-blue
                             hover:bg-clip-text hover:text-transparent"
                  aria-current={pathname === href ? 'page' : undefined}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav className="py-8 landscape:py-0" aria-label="Footer navigation">
          <ul className="flex gap-x-4 justify-end landscape:flex-col landscape:gap-y-4">
            {socials.map(({ href, title, alt, src }) => (
              <li key={href}>
                <Link
                  href={href}
                  target="_blank"
                  title={title}
                  className="relative inline-flex items-center justify-center
                             rounded-full overflow-hidden
                             transition-transform duration-300
                             hover:-rotate-30
                             group"
                >
                  <Image
                    src={src}
                    alt={alt}
                    width={42}
                    height={42}
                    className="w-8 landscape:w-10"
                  />
                  <span
                    className="absolute inset-0
                               bg-gradient-to-br from-transparent to-secondary-blue
                               opacity-0 group-hover:opacity-70
                               transition-opacity duration-300"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="landscape:flex landscape:justify-between">
        <div className="ml-auto text-right mb-20 landscape:ml-0 landscape:mb-0 landscape:text-left">
          <p className="mb-4">
            {ctaCopy.map((line, inx) => (
              <span key={inx}>
                {inx > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </p>
          <Link href="#" className="secondary-button" title="Build an avatar now">
            {ctaLabel}
          </Link>
        </div>
        <p className="landscape:self-end">
          <Link
            href="https://www.mozilla.org/about/legal/terms/firefox/?utm_source=billionaireblastoff.firefox.com&utm_medium=referral&utm_campaign=footer"
            aria-label="Go to Privacy Policy page"
            title="Go to Privacy Policy page"
            className="underline"
            target="_blank"
          >
            Privacy Policy
          </Link>{' '}
          &bull;{' '}
          <Link
            href="https://www.mozilla.org/en-US/privacy/websites/?utm_source=billionaireblastoff.firefox.com&utm_medium=referral&utm_campaign=footer"
            aria-label="Go to Terms and Conditions page"
            title="Go to Terms and Conditions page"
            className="underline"
            target="_blank"
          >
            Terms & Conditions
          </Link>
        </p>
      </div>

      <div className="flex flex-row justify-between font-medium text-xs10 landscape:text-base mt-2 pt-2 border-t-2 border-common-ash landscape:mt-6 landscape:pt-6">
        <span>@{currentYear.getFullYear()} Mozilla. All rights reserved.</span>
        <span className="flex gap-x-2 items-center">
          Powered by{' '}
          <span className="font-bold">
            <Link
              href="https://www.firefox.com/"
              target="_blank"
              title="Go to Firefox page"
              className="inline-block -mb-1 pr-1"
            >
              <Image
                src="/assets/images/logo-firefox.webp"
                width={26}
                height={26}
                alt="firefox logo"
              />
            </Link>
            Firefox
          </span>{' '}
          &bull; Built by{' '}
          <Link
            href="https://www.mondorobot.com/"
            target="_blank"
            title="Visit MondoRobot website"
            className="inline-block"
          >
            <Image
              alt="mondorobot logo"
              src="/assets/images/mondo-robot-logo.webp"
              width={128}
              height={14}
            />
          </Link>
        </span>
      </div>

      <div
        id="footer-animations"
        className="portrait:hidden absolute inset-0 pointer-events-none overflow-hidden"
      >
        {/* Floaters - peek in from edges */}
        <Image
          src="/assets/images/header-animations/floater3.svg"
          alt=""
          width={88.3}
          height={134}
          className="absolute animate-floater-3"
          style={{
            top: '-7.5rem',
            left: '67.88375rem',
            transform: 'rotate(11.444deg)',
            width: '5.51875rem',
            height: '8.375rem',
          }}
        />
      </div>
    </footer>
  );
};

export default Footer;
