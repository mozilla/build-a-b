// import { getAllFlags } from '@/app/flags';
import Container from '@/components/Container';
import Header from '@/components/Header';
import Bento from '@/components/Bento';
import Ticker from '@/components/Ticker';
import Footer from '@/components/Footer';
import AvatarBento, { type AvatarBentoProps } from '@/components/PrimaryFlow/AvatarBento';

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
      {/* Ticker */}
      <Ticker items={tickerData} />
      <main className="grid grid-cols-12 grid-rows-6 gap-8 @variant landscape:mt-[2rem] mt-[0.75rem]">
        <div className="col-span-12 row-span-2 @variant landscape:col-span-7 @variant landscape:row-span-2">
          <AvatarBento
            {...avatarBentoData}
            // demoAvatarBento query param = 1 will show the generated avatar UI.
            avatarData={params.demoAvatarBento === '1' ? avatarBentoData.avatarData : null}
          />
        </div>
        <div className="col-span-12 row-span-1 @variant landscape:col-span-5 @variant landscape:row-span-3 @variant landscape:col-start-8 @variant landscape:row-start-1">
          {/* Large Teaser Bento */}
          {flags?.demoLargeTeaserBento ? (
            <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
              <span className="text-gray-500 text-xl">Large Teaser Bento</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-12 row-start-4 @variant landscape:col-span-7 @variant landscape:row-start-3">
          {/* Action Buttons */}
          <div className="grid grid-cols-12 grid-rows-1 gap-8 h-full">
            <div className="col-span-4">
              {flags?.demoActionItems ? (
                <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
                  <span className="text-gray-500 text-xl">Action Item Bento</span>
                </Bento>
              ) : null}
            </div>
            <div className="col-span-4">
              {flags?.demoActionItems ? (
                <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
                  <span className="text-gray-500 text-xl">Action Item Bento</span>
                </Bento>
              ) : null}
            </div>
            <div className="col-span-4">
              {flags?.demoActionItems ? (
                <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
                  <span className="text-gray-500 text-xl">Action Item Bento</span>
                </Bento>
              ) : null}
            </div>
          </div>
        </div>
        <div className="col-span-12 row-start-5 @variant landscape:col-span-4 @variant landscape:row-start-4">
          {/* BBOOWYW Bento */}
          {flags?.demoBBOOWYWBento ? (
            <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
              <span className="text-gray-500 text-xl">BBOOWYWBento</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-12 row-span-2 row-start-6 @variant landscape:col-span-4 @variant landscape:col-start-5 @variant landscape:row-start-4">
          {/* Small Teaser Bento (Data War) */}
          {flags?.demoSmallTeaserBento ? (
            <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
              <span className="text-gray-500 text-xl">Small Teaser Bento</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-12 row-span-2 row-start-8 @variant landscape:col-span-4 @variant landscape:col-start-9 @variant landscape:row-start-4">
          {/* Small Teaser Bento (Twitchcon) */}
          {flags?.demoSmallTeaserBento ? (
            <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
              <span className="text-gray-500 text-xl">Small Teaser Bento</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-12 row-span-2 row-start-10 @variant landscape:col-span-4 @variant landscape:row-start-5">
          {/* Gallery Bento (Large) */}
          {flags?.demoGalleryBento ? (
            <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
              <span className="text-gray-500 text-xl">Gallery Bento (Large)</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-6 row-start-12 @variant landscape:col-span-2 @variant landscape:col-start-5 @variant landscape:row-start-6">
          {/* Gallery Bento (Small) */}
          {flags?.demoGalleryBento ? (
            <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
              <span className="text-gray-500 text-xl">Gallery Bento (Small)</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-6 col-start-7 row-start-12 @variant landscape:col-span-2 @variant landscape:col-start-7 @variant landscape:row-start-6">
          {/* Gallery Bento (Small) */}
          {flags?.demoGalleryBento ? (
            <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
              <span className="text-gray-500 text-xl">Gallery Bento (Small)</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-6 row-start-13 @variant landscape:col-span-2 @variant landscape:col-start-9 @variant landscape:row-start-6">
          {/* Gallery Bento (Small) */}
          {flags?.demoGalleryBento ? (
            <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
              <span className="text-gray-500 text-xl">Gallery Bento (Small)</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-6 col-start-7 row-start-13 @variant landscape:col-span-2 @variant landscape:col-start-11 @variant landscape:row-start-6">
          {/* Gallery Bento (Small) */}
          {flags?.demoGalleryBento ? (
            <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
              <span className="text-gray-500 text-xl">Gallery Bento (Small)</span>
            </Bento>
          ) : null}
        </div>
      </main>
      {/* Ticker */}
      <Ticker aria-label="Social media updates ticker" items={tickerDataHashtag} />
      {/* Footer */}
      <Footer />
    </Container>
  );
}
