// import { getAllFlags } from '@/app/flags';
import Container from '@/components/Container';
import Header from '@/components/Header';
import Bento from '@/components/Bento';
import Ticker from '@/components/Ticker';
import Footer from '@/components/Footer';
import AvatarBento, { type AvatarBentoProps } from '@/components/PrimaryFlow/AvatarBento';
import BentoScale from '@/components/BentoScale';
import Image from 'next/image';
import BentoSelfie from '@/components/BentoSelfie';

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

const tickerDataHashtag: TickerItem[] = [
  {
    id: 1,
    text: '@POKIMANE',
    emoji: '🚀',
    hashtag: '#BILLIONAIREBLASTOFF',
    href: 'https:twitch.tv/pokimane',
  },
  {
    id: 2,
    emoji: '🪐',
    text: '@CRISPYBEAR',
    hashtag: '#BILLIONAIREBLASTOFF',
    href: 'https:twitch.tv/crispy',
  },
  {
    id: 3,
    emoji: '🚀',
    text: '@GAMEWITCH',
    hashtag: '#BILLIONAIREBLASTOFF',
    href: 'https:twitch.tv/gametwitch',
  },
];

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
    url: '/assets/images/Avatar_Mock.svg',
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
  image: '/assets/images/Avatar_Square.svg',
  imageAlt: '', // Decorative image
  defaultContent: 'Unlimited power.\n Zero accountability. \n What could go wrong?',
  activeContent:
    'Unlike Big Tech billionaires watching your every click, Firefox lets you play (and browse) without being tracked. Build your avatar and see what chaos unfolds when power goes unchecked.',
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
      <Header />

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
            <Bento className="flex w-full h-full">Large Teaser Bento</Bento>
          ) : null}
        </div>
        <div className="col-span-12 row-start-4 landscape:col-span-7 landscape:row-start-3">
          <div className="grid grid-cols-12 grid-rows-1 gap-8 h-full">
            <div className="col-span-4">{flags?.demoActionItems ? <BentoSelfie /> : null}</div>
            <div className="col-span-4">
              {flags?.demoActionItems ? (
                <Bento className="h-full">
                  <span>Action Item Bento</span>
                </Bento>
              ) : null}
            </div>
            <div className="col-span-4">
              {flags?.demoActionItems ? (
                <Bento className="h-full">
                  <span>Action Item Bento</span>
                </Bento>
              ) : null}
            </div>
          </div>
        </div>
        <div className="col-span-12 row-start-5 landscape:col-span-4 landscape:row-start-4">
          {/* BBOOWYW Bento */}
          {flags?.demoBBOOWYWBento ? (
            <Bento className="h-full">
              <span>BBOOWYWBento</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-12 row-span-2 row-start-6 landscape:col-span-4 landscape:col-start-5 landscape:row-start-4">
          {/* Small Teaser Bento (Data War) */}
          {flags?.demoSmallTeaserBento ? (
            <Bento className="h-full">
              <span>Small Teaser Bento</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-12 row-span-2 row-start-8 landscape:col-span-4 landscape:col-start-9 landscape:row-start-4">
          {/* Small Teaser Bento (Twitchcon) */}
          {flags?.demoSmallTeaserBento ? (
            <Bento className="h-full">
              <span>Small Teaser Bento</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-12 row-span-2 row-start-10 landscape:col-span-4 landscape:row-start-5">
          {/* Gallery Bento (Large) */}
          {flags?.demoGalleryBento ? (
            <Bento className="h-full">
              <span>Gallery Bento (Large)</span>
            </Bento>
          ) : null}
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

      <Ticker aria-label="Social media updates ticker" items={tickerDataHashtag} />

      <Footer />
    </Container>
  );
}
