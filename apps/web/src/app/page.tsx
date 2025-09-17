// import { getAllFlags } from '@/app/flags';
import Container from '@/components/Container';
import Header from '@/components/Header';
import Ticker from '@/components/Ticker';
import Footer, { FooterProps } from '@/components/Footer';
import AvatarBento, { type AvatarBentoProps } from '@/components/PrimaryFlow/AvatarBento';
import BentoScale from '@/components/BentoScale';
import BentoSelfie from '@/components/BentoSelfie';
import BentoRotate from '@/components/BentoRotate';
import BentoPlanet from '@/components/BentoPlanet';
import BentoDual from '@/components/BentoDual';
import Window from '@/components/Window';
import Image from 'next/image';

const flags = {
  demoAvatarBento: true,
  demoLargeTeaserBento: true,
  demoActionItems: true,
  demoBBOOWYWBento: true,
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
  avatarData: {
    url: '/assets/images/avatar-mock.webp',
    name: 'Astra Wealthington',
    attributes: 'Trust Fund Baby, Chaos-Loving, Genius, Regulation Capturing, Ocean City-Building',
  },
  primaryFlowData: {
    ctaText: 'Get Started',
    title: 'Make Space a Better Place. Add a Billionaire.',
    description:
      'Why should billionaires be the only ones sending billionaires to space? WE want to send billionaires to space! Build your own and reclaim your data independence!',
    createAvatarCtaText: 'Make a Custom Billionaire',
    randomAvatarCtaText: 'Get a Surprise Billionaire',
  },
  image: '/assets/images/avatar-square.webp',
  imageAlt: '', // Decorative image
  defaultContent: 'Unlimited power.\n Zero accountability. \n What could go wrong?',
  activeContent:
    'Unlike Big Tech billionaires watching your every click, Firefox lets you play (and browse) without being tracked. Build your avatar and see what chaos unfolds when power goes unchecked.',
};

const navigationData: FooterProps = {
  links: [
    { href: '/', label: 'Home', title: 'Go to home' },
    { href: '/twitchcon', label: 'Twitchcon', title: 'Learn about Twitchcon' },
    { href: '/space-launch', label: 'Space Launch', title: 'More about Space Launch' },
    { href: '/datawar', label: 'Game', title: 'Play our game Data War' },
  ],
  socials: [
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
  ],
  ctaCopy: ['Big Tech wants to own your orbit.', 'We say—go launch yourself!'],
  ctaLabel: 'Build a Billionaire',
  message: 'Some kind of messaging goes here.',
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Pass flags via query param temporarily to test different states.
  const params = await searchParams;

  return (
    <Container>
      <Header
        links={navigationData.links}
        socials={navigationData.socials}
        ctaCopy={navigationData.ctaCopy}
        ctaLabel={navigationData.ctaLabel}
      />

      <Ticker items={tickerData} />

      <main className="mt-6 grid grid-cols-12 grid-rows-5 gap-8 landscape:mt-8">
        <div className="col-span-12 row-span-2 landscape:col-span-7 landscape:row-span-2">
          <AvatarBento
            {...avatarBentoData}
            // demoAvatarBento query param = 1 will show the generated avatar UI.
            avatarData={params.demoAvatarBento === '1' ? avatarBentoData.avatarData : null}
          />
        </div>
        <div className="col-span-12 row-span-1 landscape:col-span-5 landscape:row-span-3 landscape:col-start-8 landscape:row-start-1">
          {flags?.demoLargeTeaserBento ? (
            <BentoDual
              className="flex w-full h-full"
              back={
                <Window>
                  <h4 className="text-title-1 pb-4">We don&apos;t say for-real-real lightly.</h4>
                  <p>
                    Every post gets you closer to the stratosphere, which is where we&apos;ll be
                    sending only the noisiest little billionaire avatars aboard a rocket, streamed
                    for the world to see live at the climax of TwitchCon.{' '}
                    <strong>To the mooooon!</strong>
                  </p>
                  <a className="rounded-button mt-6" href="#">
                    Button
                  </a>
                </Window>
              }
              effect="fade"
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
          ) : null}
        </div>
        <div className="col-span-12 row-start-4 landscape:col-span-7 landscape:row-start-3">
          <div className="grid grid-cols-12 grid-rows-1 gap-8 h-full">
            <div className="col-span-12 landscape:col-span-4">
              {flags?.demoActionItems ? <BentoSelfie /> : null}
            </div>
            <div className="col-span-6 landscape:col-span-4">
              {flags?.demoActionItems ? <BentoRotate /> : null}
            </div>
            <div className="col-span-6 landscape:col-span-4">
              {flags?.demoActionItems ? <BentoRotate /> : null}
            </div>
          </div>
        </div>
        <div className="col-span-12 row-start-5 landscape:col-span-4 landscape:row-start-4">
          {/* BBOOWYW Bento */}
          {flags?.demoBBOOWYWBento ? (
            <BentoDual
              className="h-full"
              effect="fade"
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
          ) : null}
        </div>
        <div className="col-span-12 row-span-2 row-start-6 landscape:col-span-4 landscape:col-start-5 landscape:row-start-4">
          {/* Small Teaser Bento (Data War) */}
          {flags?.demoSmallTeaserBento ? (
            <BentoDual
              className="h-full aspect-square"
              effect="flip"
              image="/assets/images/data-war.webp"
              back={
                <Window>
                  <h4 className="text-title-1 pb-4">Play your way to galactic dominance</h4>
                  <p>
                    Ever wonder what it&apos;s like to trade people&apos;s data and manipulate the
                    world so you can build a toy rocket and go into space?
                  </p>
                  <a className="rounded-button mt-6" href="#">
                    Button
                  </a>
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
        <div className="col-span-12 row-span-2 row-start-8 landscape:col-span-4 landscape:col-start-9 landscape:row-start-4">
          {/* Small Teaser Bento (Twitchcon) */}
          {flags?.demoSmallTeaserBento ? (
            <BentoDual
              className="h-full aspect-square"
              effect="flip"
              image="/assets/images/join-twitchcon.webp"
              back={
                <Window>
                  <h4 className="text-title-1 pb-4">Party at the moontower</h4>
                  <p>
                    Join us IRL or right here during TwitchCon to help us send all the billionaires
                    off to space in style!
                  </p>
                  <a className="rounded-button mt-6" href="#">
                    Button
                  </a>
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
        <div className="col-span-12 row-span-2 row-start-10 landscape:col-span-4 landscape:row-start-5">
          {/* Gallery Bento (Large) */}
          {flags?.demoGalleryBento ? <BentoPlanet className="h-full" /> : null}
        </div>
        <div className="col-span-6 row-start-12 landscape:col-span-2 landscape:col-start-5 landscape:row-start-6">
          {/* Gallery Bento (Small) */}
          {flags?.demoGalleryBento ? (
            <BentoScale image="/assets/images/placeholders/diamond.jpg" />
          ) : null}
        </div>
        <div className="col-span-6 col-start-7 row-start-12 landscape:col-span-2 landscape:col-start-7 landscape:row-start-6">
          {/* Gallery Bento (Small) */}
          {flags?.demoGalleryBento ? (
            <BentoScale image="/assets/images/placeholders/rocket.jpg" />
          ) : null}
        </div>
        <div className="col-span-6 row-start-13 landscape:col-span-2 landscape:col-start-9 landscape:row-start-6">
          {/* Gallery Bento (Small) */}
          {flags?.demoGalleryBento ? (
            <BentoScale image="/assets/images/placeholders/crown.jpg" />
          ) : null}
        </div>
        <div className="col-span-6 col-start-7 row-start-13 landscape:col-span-2 landscape:col-start-11 landscape:row-start-6">
          {/* Gallery Bento (Small) */}
          {flags?.demoGalleryBento ? (
            <BentoScale image="/assets/images/placeholders/meteor.jpg" />
          ) : null}
        </div>
      </main>

      <Footer
        links={navigationData.links}
        socials={navigationData.socials}
        ctaCopy={navigationData.ctaCopy}
        ctaLabel={navigationData.ctaLabel}
        message={navigationData.message}
      />
    </Container>
  );
}
