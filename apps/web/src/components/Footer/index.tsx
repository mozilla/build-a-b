'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@heroui/react';

const Footer = () => {
  const currentYear = new Date();

  return (
    <footer
      aria-label="Site footer"
      className="
      flex flex-col w-full max-w-[var(--container-width-portrait)] 
      border-[0.125rem] rounded-[0.75rem] border-[var(--colors-common-ash)]
      mt-[0.75rem] bg-[url(/assets/images/Nebula.png)] bg-cover bg-no-repeat
      @variant landscape:max-w-[var(--container-width-landscape)] 
      @variant landscape:grid @variant landscape:grid-cols-3 @variant landscape:gap-8
      @variant landscape:min-h-[20rem] @variant landscape:relative @variant landscape:mt-[2rem]"
    >
      {/* Mobile Logo */}
      <span className="flex absolute w-[13.3125rem] h-[6.493125rem] shrink-0 -rotate-5 mt-[0.9023rem] @variant landscape:hidden">
        <Image
          src="/assets/images/Billionaire-Logo.svg"
          alt="Billionaire Logo"
          fill={true}
          style={{ objectFit: 'contain' }}
        />
      </span>

      {/* Desktop Logo - Center Column */}
      <div
        className="hidden @variant landscape:flex @variant landscape:flex-col @variant landscape:justify-start
                      @variant landscape:col-start-2 @variant landscape:row-span-2"
      >
        <div className="flex @variant landscape:w-[24rem] @variant landscape:h-[10.625rem] @variant landscape:mt-[3.421rem] items-start">
          <Image
            className="@variant landscape:-rotate-8"
            src="/assets/images/Billionaire-Logo.svg"
            alt="Billionaire Logo"
            width={23 * 16}
            height={9.625 * 16}
          />
        </div>
      </div>

      {/* Mobile Content Container */}
      <div className="flex w-full flex-col items-end @variant landscape:hidden">
        {/* Mobile Navigation */}
        <nav
          role="navigation"
          aria-label="Footer navigation"
          className="flex justify-end gap w-[8.75rem] h-[9.75rem] mt-[4rem]"
        >
          <ul
            className="flex flex-col items-end text-[0.75rem] not-italic font-bold tracking-[0.06rem] uppercase
                       text-[var(--colors-common-teal-500)]"
          >
            <li className="flex p-[1rem] items-center justify-center font-(family-name:--font-sharp-sans) h-[2.5rem]">
              <Link href="/home" tabIndex={0}>
                Home
              </Link>
            </li>
            <li className="flex p-[1rem] items-center justify-center font-(family-name:--font-sharp-sans) h-[2.5rem]">
              <Link href="https://www.twitchcon.com/" tabIndex={0}>
                Twitchcon
              </Link>
            </li>
            <li className="flex p-[1rem] items-center justify-center font-(family-name:--font-sharp-sans) h-[2.5rem]">
              <Link href="#" tabIndex={0}>
                Space Launch
              </Link>
            </li>
            <li className="flex p-[1rem] items-center justify-center font-(family-name:--font-sharp-sans) h-[2.5rem]">
              <Link href="#" tabIndex={0}>
                Game
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile Social Icons */}
        <div
          role="region"
          aria-label="Social media links"
          className="inline-flex justify-end w-[8.5rem] h-[3.1875rem] gap-[0.5rem] shrink-0 pr-[1rem] mt-[1.9rem]"
        >
          <ul className="flex w-full items-center justify-between">
            <li className="flex relative w-[2rem] h-[2rem]">
              <Link
                className="flex"
                href="https://www.tiktok.com/"
                aria-label="Follow us on TikTok (opens in new tab)"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  className="shrink-0"
                  alt="TikTok icon"
                  src="assets/images/TikTok.svg"
                  fill={true}
                  style={{ objectFit: 'contain' }}
                />
              </Link>
            </li>
            <li className="flex relative w-[2rem] h-[2rem]">
              <Link
                href="https://www.instagram.com/"
                aria-label="Follow us on Instagram (opens in new tab)"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  className="shrink-0"
                  alt="Instagram icon"
                  src="assets/images/Instagram.svg"
                  fill={true}
                  style={{ objectFit: 'contain' }}
                />
              </Link>
            </li>
            <li className="flex relative w-[2rem] h-[2rem]">
              <Link
                href="https://youtube.com"
                aria-label="Subscribe to our YouTube channel (opens in new tab)"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  className="shrink-0e"
                  alt="Youtube icon"
                  src="assets/images/Youtube_black.svg"
                  fill={true}
                  style={{ objectFit: 'contain' }}
                />
              </Link>
            </li>
          </ul>
        </div>

        {/* Mobile Content */}
        <div
          role="region"
          aria-labelledby="motivational-heading-mobile"
          className="flex flex-col items-end justify-between w-[17.75rem] h-[5.5rem] px-[1rem] mt-[1.4687rem]"
        >
          <div className="flex flex-col items-end w-[15.75rem] h-[2.5rem] text-[0.875rem]">
            <p className="font-semibold font-(family-name:--font-sharp-sans) not-italic font-[var(--colors-common-ash)]">
              Big Tech wants to own your orbit.
            </p>
            <p className="font-semibold font-(family-name:--font-sharp-sans) not-italic font-[var(--colors-common-ash)]">
              We say-go launch yourself.
            </p>
          </div>
          <div className="flex relative w-[9.25rem] h-[2rem]">
            <Button
              aria-label="Build a Billionaire - Learn more about our program"
              aria-describedby="motivational-text-mobile"
              className="w-full bg-transparent border-[0.125rem] rounded-[6.25rem] text-[0.75rem] font-bold
                         text-[var(--colors-common-teal-500)] shadow-lg px-[1.5rem]"
            >
              <span className="font-(family-name:--font-sharp-sans)">Build a Billionaire</span>
            </Button>
          </div>
        </div>

        {/* Mobile Footer Info */}
        <div
          aria-label="Copyright and legal information"
          className="w-[20.375rem] flex flex-col self-center mt-[4.4rem]"
        >
          <span className="flex items center text-[0.875rem]">
            <p className="font-(family-name:--font-sharp-sans) font-semibold text-[var(--colors-common-ash)]">
              Some kind of messaging goes here.
            </p>
          </span>

          <div className="flex w-full min-h-[0.125rem] mt-[1rem] bg-[var(--colors-common-ash)]" />

          <div className="w-full flex justify-between my-[1rem]">
            <span className="text-[0.625rem] not-italic font-medium">
              <p className="font-(family-name:--font-sharp-sans) font-[var(--colors-common-ash)]">
                @{currentYear.getFullYear()} Mozilla. All rights reserved.
              </p>
            </span>
            <span className="flex w-[6.8rem] text-[0.625rem] not-italic font-medium">
              <p className="flex w-full font-(family-name:--font-sharp-sans) font-[var(--colors-common-ash)]">
                Built by
                <span className="flex underline ml-[0.2rem] font-(family-name:--font-sharp-sans) font-[var(--colors-common-ash)]">
                  mondorobot.
                </span>
              </p>
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Left Column - Navigation + Content */}
      <nav
        className="hidden @variant landscape:flex @variant landscape:flex-col @variant landscape:col-start-1
                   @variant landscape:gap-4 @variant landscape:pl-[2rem]"
        role="navigation"
        aria-label="Footer navigation"
      >
        <ul className="flex flex-col text-[0.75rem] uppercase text-[var(--colors-common-teal-500)] mt-[2rem]">
          <li
            role="none"
            className="flex p-[1rem] h-[2.5rem] items-center justify-start @variant landscape:font-bold tracking-[0.06rem]
                      @variant landscape:font-(family-name:--font-sharp-sans)"
          >
            <Link href="/home">Home</Link>
          </li>
          <li
            role="none"
            className="flex p-[1rem] h-[2.5rem] items-center justify-start @variant landscape:font-bold tracking-[0.06rem]
                      @variant landscape:font-(family-name:--font-sharp-sans)"
          >
            <Link
              href="https://www.twitchcon.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitchcon (opens in new tab)"
            >
              Twitchcon
            </Link>
          </li>
          <li
            role="none"
            className="flex p-[1rem] h-[2.5rem] items-center justify-start @variant landscape:font-bold tracking-[0.06rem]
                      @variant landscape:font-(family-name:--font-sharp-sans)"
          >
            <Link href="#" target="_blank" rel="noopener noreferrer">
              Space Launch
            </Link>
          </li>
          <li
            role="none"
            className="flex p-[1rem] h-[2.5rem] items-center justify-start @variant landscape:font-bold
                         tracking-[0.06rem] @variant landscape:font-(family-name:--font-sharp-sans)"
          >
            <Link href="#" tabIndex={3} target="_blank" rel="noopener noreferrer">
              Game
            </Link>
          </li>
        </ul>

        <div
          role="region"
          aria-labelledby="motivational-heading-desktop"
          className="flex flex-col gap-4 mt-6 pl-[1rem]"
        >
          <div
            className="text-sm text-[var(--colors-common-ash)] font-(family-name:--font-sharp-sans)
                       @variant landscape:font-semibold"
          >
            <p className="text-[var(--colors-common-ash)]">Big Tech wants to own your orbit.</p>
            <p className="text-[var(--colors-common-ash)]">We say—go launch yourself!</p>
          </div>
          <Button
            aria-label="Build a Billionaire - Learn more about our program"
            aria-describedby="motivational-text-desktop"
            className="w-[9.25rem] h-[2.25rem] bg-transparent border-[0.125rem] rounded-full text-[0.75rem]
                       text-[var(--colors-common-teal-500)]"
          >
            <span className="@variant landscape:font-bold @variant landscape:font-(family-name:--font-sharp-sans)">
              Build a Billionaire
            </span>
          </Button>
        </div>
      </nav>

      {/* Desktop Right Column - Social Icons + Messaging */}
      <div
        role="region"
        aria-label="Social media links and messaging"
        className="hidden @variant landscape:flex @variant landscape:flex-col @variant landscape:col-start-3
                      @variant landscape:items-end @variant landscape:justify-between @variant landscape:gap-4
                      @variant landscape:mt-[1rem] @variant landscape:pr-[2rem]"
      >
        <ul className="flex flex-col gap-4 mt-[2rem]">
          <li className="flex relative w-[2rem] h-[2rem]">
            <Link
              href="https://www.tiktok.com/"
              aria-label="Follow us on TikTok (opens in new tab)"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="shrink-0"
                alt="TikTok icon"
                src="assets/images/TikTok.svg"
                fill={true}
                style={{ objectFit: 'contain' }}
              />
            </Link>
          </li>
          <li className="flex relative w-[2rem] h-[2rem]">
            <Link
              href="https://www.instagram.com/"
              aria-label="Follow us on Instagram (opens in new tab)"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="shrink-0"
                alt="Instagram icon"
                src="assets/images/Instagram.svg"
                fill={true}
                style={{ objectFit: 'contain' }}
              />
            </Link>
          </li>
          <li className="flex relative w-[2rem] h-[2rem]">
            <Link
              href="https://youtube.com"
              aria-label="Subscribe to our YouTube channel (opens in new tab)"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="shrink-0e"
                alt="Youtube icon"
                src="assets/images/Youtube_black.svg"
                fill={true}
                style={{ objectFit: 'contain' }}
              />
            </Link>
          </li>
        </ul>

        <div className="text-sm font-(family-name:--font-sharp-sans) text-center mt-4">
          <p className="text-[var(--colors-common-ash)] @variant landscape:font-semibold">
            Some kind of messaging goes here.
          </p>
        </div>
      </div>

      {/* Desktop Footer Info */}
      <div
        className="hidden @variant landscape:flex @variant landscape:flex-col @variant landscape:col-span-3 @variant
                   landscape:justify-between @variant landscape:items-center @variant landscape:pt-[0.5rem] 
                   @variant landscape:px-[1rem]"
      >
        <div className="flex @variant landscape:w-full min-h-[0.125rem] bg-[var(--colors-common-ash)]" />
        <div
          className="flex @variant landscape:w-full justify-between my-[1rem]
                        @variant landscape:px-[1rem] font-(family-name:--font-sharp-sans)"
        >
          <span className="text-xs font-(family-name:--font-sharp-sans) font-medium text-[var(--colors-common-ash)]">
            @{currentYear.getFullYear()} Mozilla. All rights reserved.
          </span>
          <span className="flex text-xs font-(family-name:--font-sharp-sans) font-medium text-[var(--colors-common-ash)]">
            Built by
            <span className="flex text-[var(--colors-common-ash)] underline ml-[0.3rem]">
              mondorobot.
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
