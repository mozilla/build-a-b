import Bento from '@/components/Bento';
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  return (
    <Bento className="h-16 landscape:h-[10.9375rem] bg-no-repeat bg-cover bg-[url(/assets/images/NightSky.svg)]">
      <div className="flex relative justify-between w-full h-full items-center px-[1rem]">
        {/* Mobile Billionaire */}
        <span
          className="flex w-[6.125rem] h-[3rem] @variant landscape:w-[12rem] @variant landscape:h-[6rem] relative
                      landscape:hidden"
        >
          <Image
            src="/assets/images/Billionaire-Header-Logo.svg"
            fill
            alt="Billionaire - Return to homepage"
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
          />
        </span>
        {/* Desktop Billionaire */}
        <span
          className="hidden @variant landscape:flex @variant landscape:w-[13.125rem] @variant landscape:h-[7.4375rem] relative
                       -rotate-10"
        >
          <Image
            src="/assets/images/Billionaire-Logo.svg"
            fill
            alt="Billionaire Header Logo"
            sizes="(max-width: 1340px) 100vw, 50vw"
            className="object-contain"
          />
        </span>
        {/* Mobile Menu */}
        <button
          className="flex relative w-[1.0625rem] h-[0.625rem] shrink-0 @variant landscape:hidden"
          aria-label="Open navigation menu"
          aria-expanded="false"
          aria-controls="mobile-navigation-menu"
          type="button"
        >
          <Image
            src="/assets/images/MobileMenu.svg"
            fill
            alt="Mobile Menu"
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
          />
        </button>
        {/* Desktop Menu */}
        <nav
          className="hidden @variant landscape:flex relative @variant landscape:max-w-[40.75rem] @variant landscape:h-[3.187rem]
                        shrink-0 @variant landscape:items-center @variant landscape:mr-[2.5625rem] text-[var(--colors-common-teal-500)]"
          role="navigation"
          aria-label="Main navigation"
        >
          <ul
            className="flex @variant landscape:w-full @variant landscape:items-center @variant landscape:justify-between gap-[1rem]"
            role="menubar"
            aria-label="Main menu"
          >
            <li
              className="flex w-[4.4375rem] justify-center text-[0.75rem] font-bold tracking-[0.06rem] uppercase"
              role="none"
            >
              <Link
                href="#"
                target="blank"
                rel="noopener noreferrer"
                aria-current="page"
                className="transition-transform duration-200 ease-in-out hover:-rotate-5
                           hover:bg-gradient-to-r from-[var(--colors-common-teal-500)] from-10% via-[var(--colors-common-teal-500)] via-30% to-[var(--secondary-blue)] to-90%
                           hover:bg-clip-text hover:text-transparent"
              >
                Home
              </Link>
            </li>
            <li
              className="flex w-[5.5rem] justify-center text-[0.75rem] font-bold tracking-[0.06rem] uppercase"
              role="none"
            >
              <Link
                href="https://www.twitchcon.com/"
                target="blank"
                rel="noopener noreferrer"
                className="transition-transform duration-200 ease-in-out hover:-rotate-5
                           hover:bg-gradient-to-r from-[var(--colors-common-teal-500)] from-10% via-[var(--colors-common-teal-500)] via-30% to-[var(--secondary-blue)] to-90%
                           hover:bg-clip-text hover:text-transparent"
              >
                Twitchcon
              </Link>
            </li>
            <li
              className="flex w-[7rem] justify-center text-[0.75rem] font-bold tracking-[0.06rem] uppercase"
              role="none"
            >
              <Link
                href="#"
                target="blank"
                rel="noopener noreferrer"
                className="transition-transform duration-200 ease-in-out hover:-rotate-5
                           hover:bg-gradient-to-r from-[var(--colors-common-teal-500)] from-10% via-[var(--colors-common-teal-500)] via-30% to-[var(--secondary-blue)] to-90%
                           hover:bg-clip-text hover:text-transparent"
              >
                Space Launch
              </Link>
            </li>
            <li
              className="flex w-[4.4375rem] justify-center text-[0.75rem] font-bold tracking-[0.06rem] uppercase"
              role="none"
            >
              <Link
                href="#"
                target="blank"
                rel="noopener noreferrer"
                className="transition-transform duration-200 ease-in-out hover:-rotate-5
                           hover:bg-gradient-to-r from-[var(--colors-common-teal-500)] from-10% via-[var(--colors-common-teal-500)] via-30% to-[var(--secondary-blue)] to-90%
                           hover:bg-clip-text hover:text-transparent"
              >
                Data War
              </Link>
            </li>
            <li
              className="flex relative @variant landscape:w-[2.5rem] @variant landscape:h-[2.5rem]"
              role="none"
            >
              <Link
                href="https://tiktok.com"
                target="blank"
                rel="noopener noreferrer"
                role="menuitem"
                aria-label="Visit our TikTok page"
                className="transition-transform duration-300 ease-in-out hover:-rotate-25"
              >
                <Image
                  src="/assets/images/TikTok.svg"
                  alt=""
                  width={2.6 * 16}
                  height={2.6 * 16}
                  sizes="(max-width: 1340px) 100vw, 50vw"
                  className="object-contain relative"
                />
              </Link>
            </li>
            <li className="flex relative @variant landscape:w-[2.5rem] @variant landscape:h-[2.5rem]">
              <Link
                href="https://instagram.com"
                target="blank"
                rel="noopener noreferrer"
                role="menuitem"
                aria-label="Visit our Instagram account"
                className="transition-transform duration-300 ease-in-out hover:-rotate-25"
              >
                <Image
                  src="/assets/images/Instagram.svg"
                  alt="Instagram Icon"
                  width={2.6 * 16}
                  height={2.6 * 16}
                  sizes="(max-width: 1340px) 100vw, 50vw"
                  className="object-contain relative"
                />
              </Link>
            </li>
            <li className="flex relative @variant landscape:w-[2.5rem] @variant landscape:h-[2.5rem]">
              <Link
                href="https://youtube.com"
                target="blank"
                rel="noopener noreferrer"
                role="menuitem"
                aria-label="Visit our YouTube channel"
                className="transition-transform duration-300 ease-in-out hover:-rotate-25"
              >
                <Image
                  src="/assets/images/Youtube_black.svg"
                  alt="YouTube Icon"
                  width={2.6 * 16}
                  height={2.6 * 16}
                  sizes="(max-width: 1340px) 100vw, 50vw"
                  className="object-contain relative"
                />
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </Bento>
  );
};

export default Header;
