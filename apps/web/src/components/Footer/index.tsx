'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const currentYear = new Date();
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home', title: 'Go to home' },
    { href: '/twitchcon', label: 'Twitchcon', title: 'Learn about Twitchcon' },
    { href: '/space-launch', label: 'Space Launch', title: 'More about Space Launch' },
    { href: '/datawar', label: 'Game', title: 'Play our game Data War' },
  ];

  const socials = [
    {
      href: 'https://www.tiktok.com/@firefox',
      title: 'Visit our TikTok',
      alt: 'TikTok',
      src: '/assets/images/social/tiktok.svg',
    },
    {
      href: 'https://www.instagram.com/firefox/',
      title: 'Check our Instagram',
      alt: 'Instagram',
      src: '/assets/images/social/instagram.svg',
    },
    {
      href: 'https://www.youtube.com/firefoxchannel',
      title: 'Watch our YouTube channel',
      alt: 'YouTube',
      src: '/assets/images/social/youtube.svg',
    },
  ];

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
          className="-ml-2 max-w-[14rem] landscape:max-w-[26rem]"
        />
      </Link>

      <div className="landscape:flex landscape:justify-between landscape:mt-14 landscape:mb-16">
        <nav className="text-accent uppercase font-bold" aria-label="Footer navigation">
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
          <ul className="flex gap-x-4 justify-end landscape:flex-col landscape:gap-y-6">
            {socials.map(({ href, title, alt, src }) => (
              <li key={href}>
                <Link
                  href={href}
                  target="_blank"
                  title={title}
                  className="inline-flex items-center justify-center rounded-full transition-transform duration-300 hover:-rotate-30"
                >
                  <Image src={src} alt={alt} width={32} height={32} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="landscape:flex landscape:justify-between">
        <div className="ml-auto text-right mb-20 landscape:ml-0 landscape:mb-0 landscape:text-left">
          <p className="mb-4">
            Big Tech wants to own your orbit.
            <br />
            We say—go launch yourself!
          </p>
          <Link href="#" className="rounded-button" title="Build an avatar now">
            Build a Billionaire
          </Link>
        </div>
        <p className="landscape:self-end">Some kind of messaging goes here. </p>
      </div>

      <div className="flex flex-row justify-between font-medium text-xs10 landscape:text-base mt-2 pt-2 border-t-2 border-common-ash landscape:mt-6 landscape:pt-6">
        <span>@{currentYear.getFullYear()} Mozilla. All rights reserved.</span>
        <span>
          Built by{' '}
          <Link
            href="https://www.mondorobot.com/"
            target="_blank"
            title="Visit MondoRobot website"
            className="underline"
          >
            mondorobot
          </Link>
          .
        </span>
      </div>
    </footer>
  );
};

export default Footer;
