import Ticker from '@/components/Ticker';
import AvatarBento, { type AvatarBentoProps } from '@/components/PrimaryFlow/AvatarBento';
import GalleryBentoSmall from '@/components/GalleryBentoSmall';
import GalleryBentoLarge from '@/components/GalleryBentoLarge';
import BentoDual from '@/components/BentoDual';
import Window from '@/components/Window';
import Image from 'next/image';
import type { AvatarData } from '@/types';

const flags = {
  demoSmallTeaserBento: true,
  demoGalleryBento: true,
};

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
    text: 'SEND YOUR BILLIONAIRE TO SPACE',
    emoji: '🚀',
  },
  {
    id: 5,
    text: 'JOIN US AT TWITCHCON',
    emoji: '🪐',
  },
  {
    id: 6,
    text: 'BATTLE YOUR FRIENDS IN DATA WAR',
    emoji: '💰',
  },
];

const avatarBentoData: AvatarBentoProps = {
  primaryFlowData: {
    triggerClassNames:
      'absolute left-[7rem] landscape:left-[11.5rem] top-[18rem] transition-all duration-600 group-hover:rotate-[-12deg] group-hover:bg-accent group-hover:text-charcoal',
    ctaText: 'Get Started',
    title: 'Make Space a Better Place. Add a Billionaire.',
    description:
      'Why should billionaires be the only ones sending billionaires to space? WE want to send billionaires to space! Build your own and reclaim your data independence!',
    createAvatarCtaText: 'Start Building Your Billionaire',
    randomAvatarCtaText: 'Create a Random Billionaire',
  },
  image: '/assets/images/avatar-square.webp',
  imageAlt: '', // Decorative image
};

interface PageProps {
  avatarData?: AvatarData | null;
}

export default async function Home({ avatarData }: PageProps) {
  return (
    <>
      <Ticker items={tickerData} />

      <main className="portrait:flex portrait:flex-row portrait:flex-wrap portrait:justify-between landscape:mb-8 landscape:grid landscape:grid-cols-12 landscape:grid-rows-6 landscape:gap-8">
        <div className="portrait:mb-4 portrait:w-full landscape:row-span-3 landscape:row-start-1 landscape:col-span-7">
          <AvatarBento {...avatarBentoData} avatarData={avatarData} />
        </div>
        <div className="portrait:mb-4 portrait:order-10 portrait:w-full h-[27.3125rem] landscape:h-full landscape:col-span-5 landscape:row-span-3 landscape:col-start-8 landscape:row-start-1">
          <BentoDual
            className="flex w-full h-full"
            back={
              <Window>
                <div className="p-8">
                  <h4 className="text-title-1 pb-4">We don&apos;t say for-real-real lightly.</h4>
                  <p>
                    Every post gets you closer to the stratosphere, which is where we&apos;ll be
                    sending only the noisiest little billionaire avatars aboard a rocket, streamed
                    for the world to see live at the climax of TwitchCon.{' '}
                    <strong>To the mooooon!</strong>
                  </p>
                  <a className="secondary-button mt-6" href="#">
                    Button
                  </a>
                </div>
              </Window>
            }
            effect="flip"
            image="/assets/images/rocket.webp"
          >
            <h3 className="text-title-1 max-w-sm mt-12 ml-8">
              Send Your Fake Little Billionaires Into Very Real Orbit.
            </h3>
            <p className="max-w-2xs mt-4 ml-8">
              Post content of your billionaire for a shot at sending them to actual, for-real-real
              space.
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
                <div className="h-full w-full border-2 border-[#00000040] rounded-[0.75rem] p-2 flex flex-col justify-center ">
                  <h4 className="text-title-1 mb-2 text-[2rem]">#OpenWhatYouWant</h4>
                  <p className="text-body-small text-[0.9rem]">
                    With all the billionaires permanently off-planet, we can finally browse in
                    peace, indulge our curiosities, and open what we want.
                  </p>
                </div>
                <Image
                  src="/assets/images/firefox-open.webp"
                  width={120}
                  height={43}
                  alt=""
                  className="absolute right-12 bottom-1"
                />
              </div>
            }
          >
            <div className="h-full w-full px-6 flex flex-col justify-center bg-gradient-to-r from-secondary-blue to-secondary-purple">
              <h4 className="text-title-1 mb-3">#BillionaireBlastOff</h4>
              <p className="text-body-regular">
                The go to space on rockets of your data. But there is another way.
              </p>
            </div>
          </BentoDual>
        </div>
        <div className="portrait:mb-4 portrait:order-11 portrait:w-full landscape:row-span-2 landscape:col-span-4 landscape:col-start-5 landscape:row-start-4">
          {/* Small Teaser Bento (Data War) */}
          {flags?.demoSmallTeaserBento ? (
            <BentoDual
              className="h-full aspect-square"
              effect="flip"
              image="/assets/images/data-war.webp"
              back={
                <Window>
                  <div className="p-8">
                    <h4 className="text-title-1 pb-4">Play your way to galactic dominance</h4>
                    <p>
                      Ever wonder what it&apos;s like to trade people&apos;s data and manipulate the
                      world so you can build a toy rocket and go into space?
                    </p>
                    <a className="secondary-button mt-6" href="#">
                      Button
                    </a>
                  </div>
                </Window>
              }
            >
              <div className="bg-gradient-to-tr from-[#33333650] to-transparent h-full w-full">
                <h2 className="absolute bottom-6 left-6 text-title-1">Data War</h2>
              </div>
            </BentoDual>
          ) : null}
        </div>
        <div className="portrait:mb-4 portrait:order-12 portrait:w-full landscape:row-span-2 landscape:col-span-4 landscape:col-start-9 landscape:row-start-4">
          {/* Small Teaser Bento (Twitchcon) */}
          {flags?.demoSmallTeaserBento ? (
            <BentoDual
              className="h-full aspect-square"
              effect="flip"
              image="/assets/images/join-twitchcon.webp"
              back={
                <Window>
                  <div className="p-8">
                    <h4 className="text-title-1 pb-4">Party at the moontower</h4>
                    <p>
                      Join us IRL or right here during TwitchCon to help us send all the
                      billionaires off to space in style!
                    </p>
                    <a className="secondary-button mt-6" href="#">
                      Button
                    </a>
                  </div>
                </Window>
              }
            >
              <div className="bg-gradient-to-tr from-[#33333650] to-transparent h-full w-full">
                <h2 className="absolute bottom-6 left-6 text-title-1">
                  Join us at
                  <br />
                  Twitchcon
                </h2>
              </div>
            </BentoDual>
          ) : null}
        </div>
        <div className="portrait:mb-4 portrait:w-full landscape:row-span-2 landscape:col-span-4 landscape:col-start-1 landscape:row-start-5">
          <GalleryBentoLarge className="h-full" disabled />
        </div>
        <div className="portrait:mb-4 portrait:w-[48%] landscape:col-span-2 landscape:col-start-5 landscape:row-start-6">
          <GalleryBentoSmall image="/assets/images/placeholders/diamond.jpg" />
        </div>
        <div className="portrait:mb-4 portrait:w-[48%] landscape:col-span-2 landscape:col-start-7 landscape:row-start-6">
          <GalleryBentoSmall image="/assets/images/placeholders/rocket.jpg" />
        </div>
        <div className="portrait:mb-4 portrait:w-[48%] landscape:col-span-2 landscape:col-start-9 landscape:row-start-6">
          <GalleryBentoSmall image="/assets/images/placeholders/crown.jpg" />
        </div>
        <div className="portrait:mb-4 portrait:w-[48%] landscape:col-span-2 landscape:col-start-11 landscape:row-start-6">
          <GalleryBentoSmall image="/assets/images/placeholders/meteor.jpg" />
        </div>
      </main>
    </>
  );
}
