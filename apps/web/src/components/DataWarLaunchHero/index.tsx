import Image from 'next/image';
import LinkButton from '@/components/LinkButton';
import Bento from '@/components/Bento';
import type { FC } from 'react';

const DataWarLaunchHero: FC = () => {
  return (
    <Bento className="h-full relative overflow-hidden">
      {/* Starry space background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0818] via-[#1a0a2e] to-[#0a0a1a]">
        {/* Stars background */}
        <Image
          src="/assets/images/space_407.webp"
          alt="Data War - in space!"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right side - Phones */}
      <div className="absolute right-0 portrait:h-[30rem] h-full portrait:w-full w-100 portrait:m-auto -mr-10 portrait:-bottom-16">
        {/* Phone hover image container */}
        <Image
          src="/assets/images/phone_hover.webp"
          alt="Data War game screens"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Floating astronauts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Bottom left astronaut - larger, rotated */}
        <div
          className="absolute bottom-0 left-[50%] 
                      portrait:bottom-4 portrait:left-0
                      w-[7.5rem] h-[7.5rem] landscape:w-[11rem] landscape:h-[11rem]
                      animate-float-tilt z-10"
        >
          <Image src="/assets/images/intro-modal/6.webp" alt="" fill className="object-contain" />
        </div>

        {/* Top right astronaut - smaller */}
        <div
          className="absolute top-2 right-8
                      portrait:top-90 portrait:right-12
                      w-[80px] h-[80px] landscape:w-[108px] landscape:h-[108px]
                      animate-float-tilt-right z-10"
          style={{ animationDelay: '1.5s' }}
        >
          <Image src="/assets/images/intro-modal/8.webp" alt="" fill className="object-contain" />
        </div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 h-full p-6 landscape:p-10 portrait:pb-90">
        {/* Left side - Content */}
        <div className="flex flex-col gap-6 landscape:gap-8 landscape:w-[24.5rem] justify-center z-20">
          <div className="flex flex-col gap-4">
            <p className="text-[0.875rem] leading-[1.25rem] font-extrabold tracking-wider text-ash uppercase">
              PLAY DATA WAR
            </p>
            <h1 className="font-extrabold text-[2.5rem] landscape:text-[3rem] leading-[2.5rem] landscape:leading-[3rem] text-ash">
              Data War
              <br />
              Digital is here!
            </h1>
            <p className="text-[1rem] landscape:text-[1.125rem] leading-[1.375rem] landscape:leading-[1.5rem] font-semibold text-ash">
              From TwitchCon to the world! Our new card game, Data War, is now free to play right
              here in your browser. Jump in, stack your deck and blast off!
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-4 w-[12rem] portrait:m-auto">
            <LinkButton
              href="/datawar/game"
              target="_blank"
              className="primary-button border-accent text-charcoal hover:bg-transparent hover:text-accent active:bg-accent active:text-charcoal"
              trackableEvent="click_play_datawar_cta"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 21 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-5 pr-2"
              >
                <path
                  d="M0 13.9406C0 13.7438 0 13.5141 0.0328125 13.3172L1.11562 7.05C1.37812 5.40938 2.46094 3.99844 4.06875 3.60469C5.57812 3.21094 7.74375 2.85 10.5 2.85C13.2234 2.85 15.3891 3.21094 16.8984 3.60469C18.5062 3.99844 19.5891 5.40938 19.8516 7.05L20.9344 13.3172C20.9672 13.5141 21 13.7438 21 13.9406V14.0391C21 15.975 19.3922 17.55 17.4562 17.55C15.8156 17.55 14.4047 16.4672 14.0109 14.8922L13.9125 14.4H7.0875L6.95625 14.8922C6.5625 16.4672 5.15156 17.55 3.51094 17.55C1.575 17.55 0 15.975 0 14.0391L0 13.9406ZM14.175 9.4125C13.6828 9.4125 13.2562 9.675 13.0266 10.0688C12.7969 10.4953 12.7969 10.9875 13.0266 11.3813C13.2562 11.8078 13.6828 12.0375 14.175 12.0375C14.6344 12.0375 15.0609 11.8078 15.2906 11.3813C15.5203 10.9875 15.5203 10.4953 15.2906 10.0688C15.0609 9.675 14.6344 9.4125 14.175 9.4125ZM14.9625 7.575C14.9625 8.06719 15.1922 8.49375 15.6187 8.72344C16.0125 8.95313 16.5047 8.95313 16.9312 8.72344C17.325 8.49375 17.5875 8.06719 17.5875 7.575C17.5875 7.11563 17.325 6.68906 16.9312 6.45938C16.5047 6.22969 16.0125 6.22969 15.6187 6.45938C15.1922 6.68906 14.9625 7.11563 14.9625 7.575ZM7.0875 7.3125C7.0875 6.88594 6.72656 6.525 6.3 6.525C5.84062 6.525 5.5125 6.88594 5.5125 7.3125V8.3625H4.4625C4.00312 8.3625 3.675 8.72344 3.675 9.15C3.675 9.60938 4.00312 9.9375 4.4625 9.9375H5.5125V10.9875C5.5125 11.4469 5.84062 11.775 6.3 11.775C6.72656 11.775 7.0875 11.4469 7.0875 10.9875V9.9375H8.1375C8.56406 9.9375 8.925 9.60938 8.925 9.15C8.925 8.72344 8.56406 8.3625 8.1375 8.3625H7.0875V7.3125Z"
                  fill="currentColor"
                />
              </svg>
              <span>Play Now</span>
            </LinkButton>

            <LinkButton
              href="/datawar"
              className="secondary-button border-accent text-accent hover:bg-accent hover:text-charcoal active:bg-accent active:text-charcoal"
              trackableEvent="click_see_game_details_cta"
            >
              See Game Details
            </LinkButton>
          </div>
        </div>
      </div>
    </Bento>
  );
};

export default DataWarLaunchHero;
