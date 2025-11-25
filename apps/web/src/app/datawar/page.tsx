import { evaluateFlag } from '@/app/flags';
import Bento from '@/components/Bento';
import CardsSection from '@/components/CardsSection';
import CountDown from '@/components/CountDown';
import Hero from '@/components/Hero';
import IconCard from '@/components/IconCard';
import ImageGallery from '@/components/ImageGallery';
import LinkButton from '@/components/LinkButton';
import PhysicalDeckButton from '@/components/DataWar/PhysicalDeckButton';
import SocialIcon from '@/components/SocialIcon';
import SocialFeed from '@/components/SocialFeed';
import Window from '@/components/Window';
import { FEED_REF_ID, FEED_SRC } from '@/utils/constants';
import { evaluatePhase2Flag } from '@/utils/helpers/evaluate-phase2-flag';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { socials } from '@/utils/constants';
import DataWarLaunchHeroWide from '@/components/DataWarLaunchHero/wide';

const DATAWAR_PDF_URL = process.env.NEXT_PUBLIC_DATAWAR_PDF_URL || '';

export default async function Page() {
  // Check if DataWar feature is enabled
  const [isPhase2B, isLaunchCompleted, isDataWarEnabled, showSocialFeed, isPhase2C, isPhase4] =
    await Promise.all([
      evaluateFlag('showPhase2bFeatures'),
      evaluatePhase2Flag('c'),
      evaluateFlag('showDataWar'),
      evaluateFlag('showSocialFeed'),
      evaluateFlag('showPhase2cFeatures'),
      evaluateFlag('showPhase4Features'),
    ]);

  if (!isDataWarEnabled) {
    notFound();
  }

  const imagesForGallery = [
    {
      alt: 'Cards on table',
      src: '/assets/images/galleries/datawar/1.webp',
      isVideo: false,
    },
    {
      alt: 'Cards and computer',
      src: '/assets/images/galleries/datawar/2.webp',
      isVideo: false,
    },
    {
      alt: 'Stack of cards',
      src: '/assets/images/galleries/datawar/3.webp',
      isVideo: false,
    },
    {
      alt: 'Cutting my own cards',
      src: '/assets/images/galleries/datawar/4.webp',
      isVideo: false,
    },
  ];

  return (
    <>
      {isPhase4 ? (
        <DataWarLaunchHeroWide />
      ) : (
        <Hero
          image="/assets/images/card-game.webp"
          imageSrcPortrait="/assets/images/card-game-mobile.webp"
          ariaLabel="Hero section - TwitchCon 2025"
        >
          <div
            className="relative aspect-[179/310] landscape:aspect-[164/67] p-4 landscape:p-12
                          bg-gradient-to-t from-black from-[20%] to-transparent
                          landscape:bg-gradient-to-r"
          >
            <div className="h-full flex flex-col gap-6 justify-end landscape:justify-center landscape:max-w-1/2">
              <h6 className="text-nav-item">Billionaire Blast Off Presents</h6>
              <h1 className="text-title-1 text-5xl-custom landscape:text-6xl-custom">
                Data War:
                <br />
                The Card Game
              </h1>
              <p className="text-body-small">
                Billionaires play with our personal data like it&apos;s a game, which, if it were a
                card game, would be <em>this</em> game. Make Billionaire moves, upend norms, wreak
                havoc and blast off.
              </p>
              <div className="flex flex-col landscape:flex-row gap-4">
                <LinkButton
                  href="datawar/instructions"
                  className="secondary-button landscape:w-fit"
                  title="Read game instructions"
                  trackableEvent="click_go_to_instructions"
                >
                  How to Play
                </LinkButton>
                <LinkButton
                  href={DATAWAR_PDF_URL}
                  title="Get your own game cards"
                  target="_blank"
                  className='secondary-button landscape:w-fit
                            before:content-[""] before:inline-block before:w-4 before:h-4 before:mr-2
                            before:bg-current before:mask-[url(/assets/images/icons/download.svg)]
                            before:mask-no-repeat before:mask-center before:mask-contain'
                  trackableEvent="click_download_deck_datawar_hero"
                >
                  Download the Deck!
                </LinkButton>
              </div>
            </div>
          </div>
        </Hero>
      )}

      <CardsSection
        image="/assets/images/mixed-gray-grid.webp"
        cards={[
          <IconCard
            key="1"
            icon="/assets/images/icons/rabbit.webp"
            iconEffect
            className="bg-gradient-to-r from-[#ffea80] to-[#ff8a50] text-charcoal"
          >
            <h3 className="text-title-3">Short enough to play between 3am rabbit holes</h3>
          </IconCard>,
          <IconCard
            key="2"
            icon="/assets/images/icons/broken-heart.webp"
            iconEffect
            className="bg-gradient-to-r from-[#ffea80] to-[#ff8a50] text-charcoal"
          >
            <h3 className="text-title-3">Messy enough to stir the pot (and spill it everywhere)</h3>
          </IconCard>,
          <IconCard
            key="3"
            icon="/assets/images/icons/snake.webp"
            iconEffect
            className="bg-gradient-to-r from-[#ffea80] to-[#ff8a50] text-charcoal"
          >
            <h3 className="text-title-3">Surprising enough to play out differently every time</h3>
          </IconCard>,
        ]}
        postContent={
          !isPhase4 && (
            <div className="flex flex-col landscape:flex-row justify-center items-start landscape:items-center p-4 landscape:p-8 mt-4 gap-4 rounded-xl border-common-ash border-2">
              <figure className="relative w-15 h-15">
                <Image src="/assets/images/icons/award.webp" alt="Cup" sizes="10wv" fill />
              </figure>
              <div className="flex-1">
                <h3 className="text-title-3 mb-2">Immerse yourself in Data War</h3>
                <p className="text-body-regular">
                  It&apos;s more instructions than you need to start, but all the instructions you
                  need to dominate.
                </p>
              </div>
              <div className="w-full landscape:w-auto">
                <LinkButton
                  href="/datawar/instructions"
                  title="Read instructions now"
                  className="secondary-button w-full border-common-ash text-common-ash hover:bg-common-ash hover:text-charcoal active:bg-common-ash active:text-charcoal"
                  trackableEvent="click_go_to_instructions"
                >
                  Data War Instructions
                </LinkButton>
              </div>
            </div>
          )
        }
      >
        <h2 className="text-title-1">Sow chaos, acquire power and blast off</h2>
        <p className="text-body-regular">
          In Data War, you compete for a One Way Ticket to Space for egomaniacal, tantrum-prone
          little Billionaires. It plays like Classic War, but with the ability to chain effects from
          unique cards, resulting in unpredictable twists and explosive endings that play out
          differently every time!
        </p>
      </CardsSection>

      {!isPhase4 && <ImageGallery images={imagesForGallery} />}

      {/* {!isLaunchCompleted && (
        <section className="mb-4 landscape:mb-8 flex flex-col-reverse gap-4 landscape:flex-row landscape:gap-8">
          <Bento className="border-none h-full landscape:flex-1 landscape:h-auto">
            <Window className="bg-common-ash">
              <div className="p-4 landscape:p-12 flex flex-col gap-4">
                <h2 className="text-title-1 text-charcoal">Dropping at TwitchCon 2025</h2>
                <p className="text-body-regular text-charcoal">
                  Can&apos;t make it to TwitchCon? Don&apos;t worry, you can still check out the
                  game, download a printable copy, and share your gameplay and ideas with{' '}
                  <strong>@firefox!</strong>
                </p>
                <div className="flex flex-col landscape:flex-row gap-4">
                  <LinkButton
                    href={DATAWAR_PDF_URL}
                    title="Get your own game cards"
                    target="_blank"
                    className='secondary-button landscape:w-fit
                           border-charcoal text-charcoal hover:border-charcoal
                             hover:bg-charcoal hover:text-common-ash
                             active:border-charcoal active:bg-charcoal active:text-common-ash
                             before:content-[""] before:inline-block before:w-4 before:h-4 before:mr-2
                             before:bg-current before:mask-[url(/assets/images/icons/download.svg)]
                             before:mask-no-repeat before:mask-center before:mask-contain'
                    trackableEvent="click_download_deck_datawar_twitchcon"
                  >
                    Download the Deck!
                  </LinkButton>
                  <PhysicalDeckButton />
                </div>
              </div>
            </Window>
          </Bento>
          <Bento
            image="/assets/images/data-war/bag.webp"
            imageAlt="Billionaire in a box"
            className="landscape:w-[30%] aspect-square border-none"
          />
        </section>
      )} */}

      <h2 className="text-mobile-title-2 landscape:text-5xl-custom font-extrabold my-4 landscape:mb-8 landscape:mt-6">
        Ways to play
      </h2>

      <section className="mb-4 landscape:mb-8 flex flex-col-reverse gap-4 landscape:flex-row landscape:gap-8">
        <Bento
          image={
            isPhase4 ? '/assets/images/cards-on-table.webp' : '/assets/images/data-war/bag.webp'
          }
          imageAlt="Billionaire in a box"
          className="landscape:w-[30%] aspect-square border-none"
        />
        <Bento className="border-none h-full landscape:flex-1 landscape:h-auto">
          <Window className="bg-common-ash">
            <div className="p-4 landscape:p-12 flex flex-col gap-4">
              <h2 className="text-title-1 text-charcoal">DIY your own deck</h2>
              {isPhase4 ? (
                <p className="text-body-regular text-charcoal">
                  Physical decks of Data War were only available at TwitchCon, but if you didn’t get
                  yours, don’t fret! Scissors + printer = game night unlocked. Download your own
                  copy of Data War to print, play and personalize.
                </p>
              ) : (
                <p className="text-body-regular text-charcoal">
                  Scissors + printer = game night unlocked. Download your own copy of Data War to
                  cut up and blast off with right here.
                </p>
              )}

              <div className="flex flex-col gap-4 landscape:flex-row landscape:gap-4">
                <LinkButton
                  href="/datawar/instructions"
                  title="See Game Details"
                  className="secondary-button landscape:w-fit
                             border-charcoal text-charcoal hover:border-charcoal
                               hover:bg-charcoal hover:text-common-ash
                               active:border-charcoal active:bg-charcoal active:text-common-ash"
                  trackableEvent="click_go_to_instructions"
                >
                  See Instructions
                </LinkButton>

                <LinkButton
                  href={DATAWAR_PDF_URL}
                  title="Get your own game cards"
                  className='secondary-button landscape:w-fit
                             border-charcoal text-charcoal hover:border-charcoal
                               hover:bg-charcoal hover:text-common-ash
                               active:border-charcoal active:bg-charcoal active:text-common-ash
                               before:content-[""] before:inline-block before:w-4 before:h-4 before:mr-2
                               before:bg-current before:mask-[url(/assets/images/icons/download.svg)]
                               before:mask-no-repeat before:mask-center before:mask-contain'
                  trackableEvent="click_download_deck_datawar_diy"
                >
                  Download the Deck!
                </LinkButton>
              </div>
            </div>
          </Window>
        </Bento>
      </section>

      <section className="mb-4 landscape:mb-8 flex flex-col gap-4 landscape:flex-row landscape:gap-8">
        <Bento className="border-none h-full landscape:flex-1 landscape:h-auto">
          <Window className="bg-common-ash">
            <div className="p-4 landscape:p-12 flex flex-col gap-4">
              {isPhase4 ? (
                <>
                  <h2 className="text-title-1 text-charcoal">Play Data War online</h2>
                  <p className="text-body-regular text-charcoal">
                    At TwitchCon, we launched Data War, the physical edition. Now, we’re dropping
                    Data War Digital, a cozy, chaotic, browser-first experience that’s free for
                    everyone to play, available now.
                  </p>
                  <div className="flex gap-4 portrait:flex-col portrait:w-full landscape:w-auto">
                    <LinkButton
                      href="/datawar/game"
                      className="flex items-center justify-center gap-2 h-12 px-4 border-2 border-solid border-charcoal bg-transparent text-charcoal rounded-full hover:bg-charcoal hover:text-white active:bg-charcoal/80 active:text-white transition-colors portrait:w-full landscape:min-w-[10rem]"
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
                      <span className="font-semibold text-lg leading-6">Play Now</span>
                    </LinkButton>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-title-1 text-charcoal">Data War goes digital</h2>
                  <p className="text-body-regular text-charcoal">
                    From TwitchCon to the world! We&apos;re hard at work on a digital version of
                    Data War, launching in November, so follow us for the release date.
                  </p>
                  <ul className="flex flex-row gap-4">
                    {socials.map(({ href, title, type }) => (
                      <li key={href}>
                        <LinkButton
                          href={href}
                          target="_blank"
                          title={title}
                          className="relative inline-flex items-center justify-center
                                    rounded-full overflow-hidden text-charcoal
                                    transition-transform duration-300
                                    hover:-rotate-30 active:-rotate-30"
                          trackableEvent="click_social_icon_datawar"
                          trackablePlatform={type}
                        >
                          <SocialIcon type={type} className="w-10 h-10" />
                        </LinkButton>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </Window>
        </Bento>
        <Bento
          image="/assets/images/shark-billionaire.webp"
          imageAlt="Billionaire riding a shark"
          className="landscape:w-[30%] aspect-square border-none"
        />
      </section>

      {isPhase4 && <ImageGallery images={imagesForGallery} />}

      {!isPhase4 && (
        <section className="mb-4 landscape:mb-8 flex flex-col gap-4 landscape:flex-row landscape:gap-8">
          <Bento
            image="/assets/images/cards-on-table.webp"
            imageAlt="Cards on table"
            className="landscape:w-[30%] aspect-square border-none"
          />
          <Bento className="border-none h-full landscape:flex-1 landscape:h-auto">
            <Window className="bg-common-ash">
              <div className="p-4 landscape:p-12 flex flex-col gap-4">
                <h2 className="text-title-1 text-charcoal">Want more Data War?</h2>
                <p className="text-body-regular text-charcoal">
                  Want the OG real-deal TwitchCon physical card deck? Let us know! You might be the
                  reason it drops. Follow <strong>@firefox</strong> for release news.
                </p>
                <PhysicalDeckButton />
              </div>
            </Window>
          </Bento>
        </section>
      )}

      {showSocialFeed && !isPhase4 && (
        <SocialFeed
          refId={FEED_REF_ID}
          src={FEED_SRC}
          title={isLaunchCompleted ? 'TwitchCon highlights' : 'TwitchCon behind the scenes'}
        />
      )}

      <CountDown
        isPhase2B={isPhase2B}
        isPhase2C={isPhase2C}
        isPhase4={isPhase4}
        cta={
          <LinkButton href="/" className="secondary-button flex">
            Watch the Launch!
          </LinkButton>
        }
      />
    </>
  );
}
