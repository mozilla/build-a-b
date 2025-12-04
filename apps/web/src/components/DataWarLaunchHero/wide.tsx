import Image from 'next/image';
import LinkButton from '@/components/LinkButton';
import Bento from '@/components/Bento';
import type { FC } from 'react';

const DataWarLaunchHeroWide: FC = () => {
  return (
    <Bento className="h-full relative overflow-hidden mb-4 landscape:mb-8">
      {/* Starry space background with gradient overlay */}
      <div className="absolute inset-0">
        {/* Base black background */}
        <div className="absolute inset-0 bg-black" />

        {/* Stars background */}
        <Image
          src="/assets/images/space_407.webp"
          alt="Data War - in space!"
          fill
          className="object-cover"
          priority
        />

        {/* Gradient overlay - left to right, dark to transparent */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent from-[8%] to-black to-[91%]" />
      </div>

      {/* Right side - Phones */}
      <div className="absolute right-0 portrait:h-[30rem] h-[31.875rem] portrait:w-full landscape:w-[24.6875rem] portrait:m-auto landscape:mr-8 portrait:-bottom-16 landscape:top-[-30px]">
        {/* Phone hover image container */}
        <Image
          src="/assets/images/phone_hover_2.webp"
          alt="Data War game screens"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Floating astronauts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Center-bottom astronaut - larger */}
        <div
          className="absolute
                      portrait:bottom-4 portrait:left-0 portrait:w-[7.5rem] portrait:h-[7.5rem]
                      landscape:bottom-[1rem] landscape:left-[47.25rem] landscape:w-[13rem] landscape:h-[13rem]
                      animate-float-tilt z-10"
        >
          <Image src="/assets/images/intro-modal/6.webp" alt="" fill className="object-contain" />
        </div>

        {/* Top right astronaut - smaller */}
        <div
          className="absolute
                      portrait:top-90 portrait:right-12 portrait:w-[5rem] portrait:h-[5rem]
                      landscape:top-[1.875rem] landscape:right-[3.375rem] landscape:w-[7.9375rem] landscape:h-[7.9375rem]
                      animate-float-tilt-right z-10"
          style={{ animationDelay: '1.5s' }}
        >
          <Image src="/assets/images/intro-modal/8.webp" alt="" fill className="object-contain" />
        </div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 h-full p-6 portrait:pb-90 landscape:px-20 landscape:py-14 flex flex-col justify-center">
        {/* Content wrapper */}
        <div className="flex items-end gap-8">
          {/* Left side - Text content */}
          <div className="flex flex-col gap-6 landscape:gap-8 portrait:w-full landscape:w-[41.125rem]">
            <div className="flex flex-col gap-4 landscape:gap-6">
              <p className="text-[0.875rem] leading-[1.25rem] landscape:text-[0.75rem] font-bold tracking-[0.96px] text-ash uppercase">
                PLAY DATA WAR
              </p>
              <h1 className="font-extrabold text-[2.5rem] leading-[3rem] landscape:text-[3.75rem] landscape:leading-[4.25rem] text-ash">
                Data War Digital
                <br />
                is live now!
              </h1>
              <p className="text-[1rem] leading-[1.375rem] landscape:text-[1.125rem] landscape:leading-[1.5rem] font-medium text-ash">
                Billionaires play with our personal data like it&apos;s a game, which, if it were a
                digital card game, would be this game. Make Billionaire moves, upend norms, wreak
                havoc and blast off. Play now!
              </p>
            </div>

            {/* CTA */}
            <div className="flex gap-4 portrait:flex-col portrait:w-full landscape:w-auto">
              <LinkButton
                href="/datawar/game"
                target="_blank"
                className="primary-button border-accent text-charcoal hover:bg-transparent hover:text-accent active:bg-accent active:text-charcoal portrait:w-full landscape:min-w-[9rem]"
                trackableEvent="click_play_datawar_cta"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                >
                  <path
                    d="M0 13.9406C0 13.7438 0 13.5141 0.0328125 13.3172L1.11562 7.05C1.37812 5.40938 2.46094 3.99844 4.06875 3.60469C5.57812 3.21094 7.74375 2.85 10.5 2.85C13.2234 2.85 15.3891 3.21094 16.8984 3.60469C18.5062 3.99844 19.5891 5.40938 19.8516 7.05L20.9344 13.3172C20.9672 13.5141 21 13.7438 21 13.9406V14.0391C21 15.975 19.3922 17.55 17.4562 17.55C15.8156 17.55 14.4047 16.4672 14.0109 14.8922L13.9125 14.4H7.0875L6.95625 14.8922C6.5625 16.4672 5.15156 17.55 3.51094 17.55C1.575 17.55 0 15.975 0 14.0391L0 13.9406ZM14.175 9.4125C13.6828 9.4125 13.2562 9.675 13.0266 10.0688C12.7969 10.4953 12.7969 10.9875 13.0266 11.3813C13.2562 11.8078 13.6828 12.0375 14.175 12.0375C14.6344 12.0375 15.0609 11.8078 15.2906 11.3813C15.5203 10.9875 15.5203 10.4953 15.2906 10.0688C15.0609 9.675 14.6344 9.4125 14.175 9.4125ZM14.9625 7.575C14.9625 8.06719 15.1922 8.49375 15.6187 8.72344C16.0125 8.95313 16.5047 8.95313 16.9312 8.72344C17.325 8.49375 17.5875 8.06719 17.5875 7.575C17.5875 7.11563 17.325 6.68906 16.9312 6.45938C16.5047 6.22969 16.0125 6.22969 15.6187 6.45938C15.1922 6.68906 14.9625 7.11563 14.9625 7.575ZM7.0875 7.3125C7.0875 6.88594 6.72656 6.525 6.3 6.525C5.84062 6.525 5.5125 6.88594 5.5125 7.3125V8.3625H4.4625C4.00312 8.3625 3.675 8.72344 3.675 9.15C3.675 9.60938 4.00312 9.9375 4.4625 9.9375H5.5125V10.9875C5.5125 11.4469 5.84062 11.775 6.3 11.775C6.72656 11.775 7.0875 11.4469 7.0875 10.9875V9.9375H8.1375C8.56406 9.9375 8.925 9.60938 8.925 9.15C8.925 8.72344 8.56406 8.3625 8.1375 8.3625H7.0875V7.3125Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="pl-2">Play Now</span>
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </Bento>
  );
};

export default DataWarLaunchHeroWide;
