import Image from 'next/image';
import Link from 'next/link';

const HeaderBanner = () => {
  return (
    <div
      className="hero-bbo-header flex flex-col relative items-center justify-center w-full h-[196px]
                       rounded-[12px] border-[var(--colors-common-ash)] border-[2px] bg-[var(--primary-charcoal)]
                       py-[32px] px-[32px] mt-[64px]"
    >
      <div className="header-bbo-flip-container group perspective-[10000px] flex items-center justify-center w-[1248px] h-[140px]">
        <div className="relative w-full h-full transition-transform duration-600 transform-3d group-hover:rotate-y-180">
          {/* Front side */}
          <div className="absolute inset-0 backface-hidden flex items-center justify-center">
            <div
              className="text-[123px] font-[family-name:var(--sharp-sans)] font-extrabold
                               bg-gradient-to-r from-[var(--secondary-blue)] to-[var(--secondary-purple)]
                               bg-clip-text text-transparent leading-[127px]"
            >
              <h1>#BillionaireBlastOff</h1>
            </div>
          </div>
          {/*Back side */}
          <div className="absolute inset-0 backface-hidden flex items-center justify-center rotate-y-180">
            <div
              className="text-[115px] font-[family-name:var(--sharp-sans)] font-extrabold
                               bg-gradient-to-r from-[var(--secondary-yellow)] to-[var(--primary-orange)]
                               bg-clip-text text-transparent leading-[127px]"
            >
              <h1>#OpenWhatYouWant</h1>
            </div>
          </div>
        </div>
      </div>

      <span className="powered-by absolute flex w-full justify-end items-center bottom-[27px] right-[33px]">
        <p className="mr-[8px] font-[family-name:var(--sharp-sans)] text-[10px] font-medium tracking-[0.8]">
          Powered by
        </p>
        <Link href="https://www.mozilla.org/firefox/">
          <Image
            src="/hero/Lockup_FullColor-Dark@2x.png"
            width={60}
            height={15}
            alt="Firefox Logo"
          ></Image>
        </Link>
      </span>
    </div>
  );
};

export default HeaderBanner;
