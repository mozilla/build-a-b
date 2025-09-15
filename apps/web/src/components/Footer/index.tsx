'use client';

import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date();

  return (
    <footer className="site-footer">
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
          className="-ml-2 max-w-[230px] landscape:max-w-none"
        />
      </Link>

      <div className="landscape:flex landscape:justify-between landscape:mt-14 landscape:mb-16">
        <nav className="text-accent uppercase font-bold">
          <ul className="flex flex-col items-end landscape:items-start">
            <li>
              <Link href="/" title="Go to home" className="inline-block py-2">
                Home
              </Link>
            </li>
            <li>
              <Link href="/twitchcon" title="Learn about Twitchcon" className="inline-block py-2">
                Twitchcon
              </Link>
            </li>
            <li>
              <Link
                href="/space-launch"
                title="More about Space Launch"
                className="inline-block py-2"
              >
                Space Launch
              </Link>
            </li>
            <li>
              <Link href="/datawar" title="Play our game Data War" className="inline-block py-2">
                Game
              </Link>
            </li>
          </ul>
        </nav>
        <nav className="py-8 landscape:py-0">
          <ul className="flex gap-x-4 justify-end landscape:flex-col landscape:gap-y-6">
            <li>
              <Link href="https://www.tiktok.com/@firefox" target="_blank" title="Visit our TikTok">
                <Image src="/assets/images/social/tiktok.svg" alt="TikTok" width={32} height={32} />
              </Link>
            </li>
            <li>
              <Link
                href="https://www.instagram.com/firefox/"
                target="_blank"
                title="Check our Instagram"
              >
                <Image
                  src="/assets/images/social/instagram.svg"
                  alt="Instagram"
                  width={32}
                  height={32}
                />
              </Link>
            </li>
            <li>
              <Link
                href="https://www.youtube.com/firefoxchannel"
                target="_blank"
                title="Watch our YouTube channel"
              >
                <Image
                  src="/assets/images/social/youtube.svg"
                  alt="Youtube"
                  width={32}
                  height={32}
                />
              </Link>
            </li>
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
