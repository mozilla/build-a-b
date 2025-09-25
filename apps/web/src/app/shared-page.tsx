import { evaluateFlag } from '@/app/flags';
import BentoDual from '@/components/BentoDual';
import CountDown from '@/components/CountDown';
import GalleryBentoLarge from '@/components/GalleryBentoLarge';
import GalleryBentoSmall from '@/components/GalleryBentoSmall';
import AvatarBento from '@/components/PrimaryFlow/AvatarBento';
import AvatarBentoV2 from '@/components/PrimaryFlow/AvatarBentoV2';
import Ticker from '@/components/Ticker';
import Window from '@/components/Window';
import type { AvatarData } from '@/types';
import { avatarBentoData } from '@/utils/constants';
import Image from 'next/image';
import Link from 'next/link';

interface TickerItem {
  id?: number;
  text: string;
  emoji?: string;
  hashtag?: string;
  href?: string;
}

const tickerData: TickerItem[] = [
  {
    id: 4,
    text: 'Battle for Data Supremacy!',
    emoji: '🚀',
  },
  {
    id: 5,
    text: 'Join us at TwitchCon',
    emoji: '🪐',
  },
  {
    id: 6,
    text: 'Send Your Billionaire to (Actual) Space',
    emoji: '💰',
  },
];

interface PageProps {
  avatarData?: AvatarData | null;
}

export default async function Home({ avatarData }: PageProps) {
  const showPlaypenButtons = await evaluateFlag('showAvatarPlaypenButtons');
  const showAvatarBentoV2 = await evaluateFlag('showAvatarBentoV2');

  return (
    <>
      <Ticker items={tickerData} />

      <main className="portrait:flex portrait:flex-row portrait:flex-wrap portrait:justify-between landscape:mb-8 landscape:grid landscape:grid-cols-12 landscape:grid-rows-6 landscape:gap-8">
        <div className="portrait:mb-4 portrait:w-full landscape:row-span-3 landscape:row-start-1 landscape:col-span-7">
          {showAvatarBentoV2 ? (
            <AvatarBentoV2 {...avatarBentoData} avatar={avatarData} />
          ) : (
            <AvatarBento {...avatarBentoData} avatarData={avatarData} />
          )}
        </div>
        <div className="portrait:mb-4 portrait:w-full h-[27.3125rem] landscape:h-full landscape:col-span-5 landscape:row-span-3 landscape:col-start-8 landscape:row-start-1">
          <BentoDual
            className="flex w-full h-full"
            back={
              <Window flip>
                <div className="p-4 landscape:p-8">
                  <h3 className="text-2xl-custom landscape:text-3xl-custom text-title-1 pb-4 landscape:pb-8">
                    We&apos;re sending your Billionaires off-world, offline.
                  </h3>
                  <ul className="flex flex-col text-sm-custom landscape:text-regular-custom pr-[1.275rem] landscape:pr-6">
                    <li className="flex flex-row items-center mb-4 landscape:mb-4 gap-6">
                      <span className="rounded-bullet">1</span>
                      <span className="flex-1 ">
                        Share your Billionaire avatar by <strong>Friday, October 10th </strong>
                        with <strong>@firefox</strong> and <strong>#billionaireblastoff</strong>.
                      </span>
                    </li>
                    <li className="flex flex-row items-center mb-4 landscape:mb-4 gap-6">
                      <span className="rounded-bullet">2</span>
                      <span className="flex-1">
                        Keep an eye on your comments and DMs to see if your Billionaire secured a
                        spot on our real rocket.
                      </span>
                    </li>
                    <li className="flex flex-row items-center gap-6">
                      <span className="rounded-bullet">3</span>
                      <span className="flex-1">
                        Tune-in for the launch on <strong>Saturday, October 18th</strong>, streamed
                        at the{' '}
                        <Link href="/twitchcon">
                          <strong className="underline">TwitchCon Block Party</strong>
                        </Link>{' '}
                        and right here on this site.
                      </span>
                    </li>
                  </ul>
                </div>
              </Window>
            }
            effect="flip"
            image="/assets/images/rocket.webp"
            imageSrcPortrait="/assets/images/rocket-portrait.jpg"
            priority
          >
            <h1 className="text-2xl-custom landscape:text-3xl-custom font-extrabold mr-4 landscape:mr-[2.5rem] mt-12 ml-4 landscape:ml-8">
              Rocket your Billionaire into a permanent time-out
            </h1>
            <p className="text-regular-custom landscape:text-lg-custom mt-4 ml-4 landscape:ml-8 mr-[4rem] landscape:mr-[5.375rem]">
              Post content of your Billionaire with <strong>@Firefox</strong> and{' '}
              <strong>#BillionaireBlastOff</strong> for a shot at sending them to actual,
              for-real-real space.
            </p>
          </BentoDual>
        </div>
        <div className="h-[15.625rem] portrait:mb-4 portrait:w-full landscape:h-full landscape:col-span-4 landscape:col-start-1 landscape:row-start-4">
          {/* BBOOWYW Bento */}
          <BentoDual
            className="h-full"
            effect="flip"
            back={
              <div className="h-full w-full p-3 bg-gradient-to-r from-[#ffea80] to-[#ff8a50] text-charcoal relative">
                <Image
                  src="/assets/images/icons/flip.svg"
                  alt="Flip card"
                  width={24}
                  height={24}
                  className="absolute landscape:hidden w-[2.625rem] h-[2.625rem] top-[0.8125rem] right-[0.75rem]"
                />
                <div className="h-full w-full border-2 border-[#00000040] rounded-[0.75rem] p-2 flex flex-col justify-start mb-2">
                  <h2 className="text-title-1 mb-2 text-[2rem]">
                    #Billionaire
                    <br className="landscape:hidden" />
                    BlastOff
                  </h2>
                  <p className="text-regular-custom">
                    With Billionaires permanently off-planet, we can finally browse in peace,
                    indulge our curiosities, and open what we want.
                  </p>
                </div>
                <a href="https://www.mozilla.org/firefox/new/" target="_blank">
                  <Image
                    src="/assets/images/firefox-open.webp"
                    width={120}
                    height={43}
                    alt=""
                    className="absolute portrait:left-[calc(50%-3.75rem)] portrait:bottom-[0.5rem] landscape:right-12 landscape:bottom-1 w-[7.5rem] h-[2.6875rem]"
                  />
                </a>
              </div>
            }
          >
            <div className="h-full w-full px-6 flex flex-col justify-center bg-gradient-to-r from-secondary-blue to-secondary-purple">
              <Image
                src="/assets/images/icons/flip.svg"
                alt="Flip card"
                width={24}
                height={24}
                className="absolute landscape:hidden w-[2.625rem] h-[2.625rem] top-[0.2rem] right-[0.2rem]"
              />
              <h4 className="text-title-1 mb-3">
                #Billionaire
                <br className="landscape:hidden" />
                BlastOff
              </h4>
              <p className="text-body-small">
                Billionaires go to space on rockets fueled by your data. We know a better way.
              </p>
            </div>
          </BentoDual>
        </div>
        <div className="portrait:mb-4 portrait:order-11 portrait:w-full landscape:row-span-2 landscape:col-span-4 landscape:col-start-5 landscape:row-start-4">
          {/* Small Teaser Bento (Data War) */}
          <BentoDual
            className="h-full aspect-square"
            effect="flip"
            image="/assets/images/data-war.webp"
            back={
              <Window flip>
                <div className="p-4 landscape:p-8">
                  <h3 className="text-title-1 pb-4">Play Your Way to Inner Space Dominance</h3>
                  <p>
                    Data War is a game of Billionaire brinksmanship where space is the place, data
                    is the currency, and chaos reigns. Get your copy at TwitchCon!
                  </p>
                  <p className="mt-3">
                    <strong>COMING SOON</strong>
                  </p>
                </div>
              </Window>
            }
          >
            <div className="bg-gradient-to-t from-charcoal to-transparent h-full w-full">
              <div className="absolute bottom-4 left-4 landscape:bottom-8 landscape:left-8">
                <p className="text-nav-item pb-2">DROPPING SOON</p>
                <h2 className="text-title-1">
                  Data War:
                  <br />
                  The Card Game
                </h2>
              </div>
            </div>
          </BentoDual>
        </div>
        <div className="portrait:mb-4 portrait:order-12 portrait:w-full landscape:row-span-2 landscape:col-span-4 landscape:col-start-9 landscape:row-start-4">
          {/* Small Teaser Bento (Twitchcon) */}
          <BentoDual
            className="h-full aspect-square"
            effect="flip"
            image="/assets/images/blast-twitchcon.webp"
            back={
              <Window flip>
                <div className="p-4 landscape:p-8">
                  <h3 className="text-title-1 pb-4">Two Launches in One</h3>
                  <p>
                    We&apos;re launching a new card game, <em>Data War</em>, and launching
                    Billionaires to space, one-way. Join us IRL at TwitchCon or right here on this
                    site to follow along.
                  </p>
                  <Link
                    href="/twitchcon"
                    title="Visit TwitchCon page"
                    className="secondary-button mt-5 bg-[#1373b4] hover:bg-accent"
                  >
                    TwitchCon Details
                  </Link>
                </div>
              </Window>
            }
          >
            <div className="bg-gradient-to-t from-charcoal to-transparent h-full w-full">
              <div className="absolute bottom-4 left-4 landscape:bottom-8 landscape:left-8">
                <p className="text-nav-item pb-2">JOIN US IRL</p>
                <h2 className="text-title-1">
                  Blast off at
                  <br />
                  TwitchCon
                </h2>
              </div>
            </div>
          </BentoDual>
        </div>
        <div
          className={`${showPlaypenButtons ? '' : 'portrait:hidden'} portrait:mb-4 portrait:w-full landscape:row-span-2 landscape:col-span-4 landscape:col-start-1 landscape:row-start-5'`}
        >
          <GalleryBentoLarge className="h-full" disabled />
        </div>
        <div
          className={`${showPlaypenButtons ? '' : 'portrait:hidden'} portrait:mb-4 portrait:w-[48%] landscape:col-span-2 landscape:col-start-5 landscape:row-start-6`}
        >
          <GalleryBentoSmall image="/assets/images/placeholders/diamond.jpg" />
        </div>
        <div
          className={`${showPlaypenButtons ? '' : 'portrait:hidden'} portrait:mb-4 portrait:w-[48%] landscape:col-span-2 landscape:col-start-7 landscape:row-start-6`}
        >
          <GalleryBentoSmall image="/assets/images/placeholders/rocket.jpg" />
        </div>
        <div
          className={`${showPlaypenButtons ? '' : 'portrait:hidden'} portrait:mb-4 portrait:w-[48%] landscape:col-span-2 landscape:col-start-9 landscape:row-start-6`}
        >
          <GalleryBentoSmall image="/assets/images/placeholders/crown.jpg" />
        </div>
        <div
          className={`${showPlaypenButtons ? '' : 'portrait:hidden'} portrait:mb-4 portrait:w-[48%] landscape:col-span-2 landscape:col-start-11 landscape:row-start-6`}
        >
          <GalleryBentoSmall image="/assets/images/placeholders/meteor.jpg" />
        </div>
        <div className="portrait:order-13 landscape:col-span-12">
          <CountDown
            targetDate="2025-10-17T10:00:00-07:00"
            className="landscape:mb-0!"
            cta={
              <Link
                href="/twitchcon"
                title="Learn more about the launch"
                className="secondary-button flex"
              >
                Space Launch Details
              </Link>
            }
          ></CountDown>
        </div>
      </main>
    </>
  );
}
