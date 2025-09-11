// import { getAllFlags } from '@/app/flags';
import Container from '@/components/Container';
import Header from '@/components/Header';
import Bento from '@/components/Bento';
import Ticker from '@/components/Ticker';
import Footer from '@/components/Footer';

// Temporary hardcoded flags for demonstration purposes
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

export default async function Home() {
  // const flags = await getAllFlags();

  return (
    <Container>
      <Header />
      {/* Ticker */}
      <Ticker items={tickerData} />
      <main className="grid grid-cols-12 grid-rows-6 gap-8 @variant landscape:mt-[2rem] mt-[0.75rem]">
        <div className="col-span-7 row-span-2">
          {/* Avatar Bento */}
          {flags?.demoAvatarBento ? (
            <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
              <span className="text-gray-500 text-xl">Avatar Bento</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-5 row-span-3 col-start-8">
          {/* Large Teaser Bento */}
          {flags?.demoLargeTeaserBento ? (
            <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
              <span className="text-gray-500 text-xl">Large Teaser Bento</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-7 row-start-3">
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
        <div className="col-span-4 row-start-4">
          {/* BBOOWYW Bento */}
          {flags?.demoBBOOWYWBento ? (
            <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
              <span className="text-gray-500 text-xl">BBOOWYWBento</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-4 row-span-2 col-start-5 row-start-4">
          {/* Small Teaser Bento (Data War) */}
          {flags?.demoSmallTeaserBento ? (
            <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
              <span className="text-gray-500 text-xl">Small Teaser Bento</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-4 row-span-2 col-start-9 row-start-4">
          {/* Small Teaser Bento (Twitchcon) */}
          {flags?.demoSmallTeaserBento ? (
            <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
              <span className="text-gray-500 text-xl">Small Teaser Bento</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-4 row-span-2 row-start-5">
          {/* Gallery Bento (Large) */}
          {flags?.demoGalleryBento ? (
            <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
              <span className="text-gray-500 text-xl">Gallery Bento (Large)</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-2 col-start-5 row-start-6">
          {/* Gallery Bento (Small) */}
          {flags?.demoGalleryBento ? (
            <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
              <span className="text-gray-500 text-xl">Gallery Bento (Small)</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-2 col-start-7 row-start-6">
          {/* Gallery Bento (Small) */}
          {flags?.demoGalleryBento ? (
            <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
              <span className="text-gray-500 text-xl">Gallery Bento (Small)</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-2 col-start-9 row-start-6">
          {/* Gallery Bento (Small) */}
          {flags?.demoGalleryBento ? (
            <Bento className="bg-gray-100 p-8 flex items-center justify-center h-full">
              <span className="text-gray-500 text-xl">Gallery Bento (Small)</span>
            </Bento>
          ) : null}
        </div>
        <div className="col-span-2 col-start-11 row-start-6">
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
