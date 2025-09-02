import Image from 'next/image';
import Link from 'next/link';

const HeaderBanner = () => {
  return (
    <div
      className="hero-bbo-header flex flex-col relative items-center justify-center w-full h-[16.25rem]
                 rounded-[12px] border-[var(--colors-common-ash)] border-[2px] bg-[var(--primary-charcoal)]
                 py-[2rem] px-[2rem] mt-[4rem]"
    >
      <div
        className="header-bbo-flip-container group perspective-[10000px] flex items-center justify-center
                   w-[78rem] h-[7.4375rem]"
      >
        <div
          className="relative w-full h-full transition-transform duration-600 transform-3d
                     group-hover:rotate-y-180"
        >
          {/* Front side */}
          <div className="absolute inset-0 backface-hidden flex items-center justify-center">
            <div
              className="text-headline bg-gradient-to-r from-[var(--secondary-blue)] to-[var(--secondary-purple)]
                         bg-clip-text text-transparent"
            >
              <h1 className="main-heading" aria-label="Main heading: Billionaire Blast Off">
                #BillionaireBlastOff
              </h1>
            </div>
          </div>
          {/*Back side */}
          <div className="absolute inset-0 max-w-full backface-hidden flex items-center justify-center rotate-y-180">
            <div
              className="text-headline-back bg-gradient-to-r from-[var(--secondary-yellow)] to-[var(--primary-orange)]
                         bg-clip-text text-transparent"
            >
              <h2 className="flip-heading" aria-label="Alternative heading: Open What You Want">
                #OpenWhatYouWant
              </h2>
            </div>
          </div>
        </div>
      </div>

      <span className="powered-by relative flex w-full justify-end items-center">
        <p className="mr-[8px] font-[family-name:var(--sharp-sans)] text-[10px] font-medium tracking-[0.8] z-20">
          Powered by
        </p>
        <Link
          href="https://www.mozilla.org/firefox/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Firefox. Opens in a new window"
        >
          <Image
            src="/hero/Lockup_FullColor-Dark.png"
            width={3.75 * 16}
            height={1 * 16}
            alt="Firefox Logo"
          ></Image>
        </Link>
      </span>
      <div className="header-bottom flex w-full h-[2.9375rem] px-[0.5rem] py-0 justify-between items-center mt-[18px]">
        <nav
          className="left flex w-[26.75rem] shrink-0 items-start gap-[2rem] text-[12px] uppercase font-bold
                     text-[var(--colors-common-teal-500)] tracking-[0.96px]"
          aria-label="Primary site navigation"
        >
          <Link href="#" aria-label="Home Page">
            Home
          </Link>
          <Link href="#" aria-label="Twitchcon event information">
            Twitchcon
          </Link>
          <Link href="#" aria-label="Space launch information">
            Space Launch
          </Link>
          <Link href="#" aria-label="Card game details">
            Card Game
          </Link>
        </nav>
        <div className="right flex items center">
          <nav className="flex gap-[1rem] items-center justify-center">
            <Link
              href="https://www.twitch.tv/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Twitch channel"
            >
              <Image
                src="/hero/Twitch_black.png"
                width={2 * 16}
                height={2 * 16}
                alt="Twitch Icon"
              />
            </Link>
            <Link
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our YouTube channel"
            >
              <Image
                src="/hero/Youtube_black.png"
                width={2 * 16}
                height={2 * 16}
                alt="YouTube Icon"
              />
            </Link>
            <Link
              href="https://www.tiktok.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our TikTok"
            >
              <Image src="/hero/TikTok.png" width={2 * 16} height={2 * 16} alt="TikTok Icon" />
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit our Instagram"
            >
              <Image
                src="/hero/Instagram.png"
                width={2 * 16}
                height={2 * 16}
                alt="Instagram Icon"
              />
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default HeaderBanner;
