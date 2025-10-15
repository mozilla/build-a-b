import { evaluateFlag } from '@/app/flags';
import Bento from '@/components/Bento';
import CardsSection from '@/components/CardsSection';
import CountDown from '@/components/CountDown';
import Hero from '@/components/Hero';
import IconCard from '@/components/IconCard';
import ImageGallery from '@/components/ImageGallery';
import LinkButton from '@/components/LinkButton';
import PhysicalDeckButton from '@/components/DataWar/PhysicalDeckButton';
import GetStarted, { type GetStartedProps } from '@/components/PrimaryFlow/GetStarted';
import SocialIcon from '@/components/SocialIcon';
import Window from '@/components/Window';
import { avatarBentoData } from '@/utils/constants';
import { evaluatePhase2Flag } from '@/utils/helpers/evaluate-phase2-flag';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { socials } from '@/utils/constants';

export default async function Page() {
  // Check if DataWar feature is enabled
  const [shouldDisplayLaunchCta, isDataWarEnabled, isLaunchCompleted] = await Promise.all([
    evaluatePhase2Flag('a'),
    evaluateFlag('showDataWar'),
    evaluatePhase2Flag('c'),
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
                // trackableEvent="click_get_twitchcon_tickets"
              >
                How to Play
              </LinkButton>
              <LinkButton
                href="https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/assets/datawar-full-game.pdf"
                title="Get your own cards game"
                target="_blank"
                className='secondary-button landscape:w-fit
                           before:content-[""] before:inline-block before:w-4 before:h-4 before:mr-2
                           before:bg-current before:mask-[url(/assets/images/icons/download.svg)]
                           before:mask-no-repeat before:mask-center before:mask-contain'
                // trackableEvent="click_download_datawar_deck"
              >
                Download the Deck!
              </LinkButton>
            </div>
          </div>
        </div>
      </Hero>

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
                target="_blank"
                // trackableEvent="click_data_war_instructions"
              >
                Data War Instructions
              </LinkButton>
            </div>
          </div>
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

      <ImageGallery images={imagesForGallery} />

      {!isLaunchCompleted && (
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
                    href="https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/assets/datawar-full-game.pdf"
                    title="Get your own cards game"
                    target="_blank"
                    className='secondary-button landscape:w-fit
                           border-charcoal text-charcoal hover:border-charcoal
                             hover:bg-charcoal hover:text-common-ash
                             active:border-charcoal active:bg-charcoal active:text-common-ash
                             before:content-[""] before:inline-block before:w-4 before:h-4 before:mr-2
                             before:bg-current before:mask-[url(/assets/images/icons/download.svg)]
                             before:mask-no-repeat before:mask-center before:mask-contain'
                    // trackableEvent="click_download_datawar_deck"
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
      )}

      <section className="mb-4 landscape:mb-8 flex flex-col gap-4 landscape:flex-row landscape:gap-8">
        <Bento
          image="/assets/images/shark-billionaire.webp"
          imageAlt="Billionaire riding a shark"
          className="landscape:w-[30%] aspect-square border-none"
        />
        <Bento className="border-none h-full landscape:flex-1 landscape:h-auto">
          <Window className="bg-common-ash">
            <div className="p-4 landscape:p-12 flex flex-col gap-4">
              <h2 className="text-title-1 text-charcoal">Data War goes digital</h2>
              <p className="text-body-regular text-charcoal">
                From TwitchCon to the world! We&apos;re hard at work on a digital version of Data
                War, launching in November, so follow us for the release date.
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
                      // trackableEvent="click_social_icon_datawar"
                      trackablePlatform={type}
                    >
                      <SocialIcon type={type} className="w-10 h-10" />
                    </LinkButton>
                  </li>
                ))}
              </ul>
            </div>
          </Window>
        </Bento>
      </section>

      {isLaunchCompleted && (
        <section className="mb-4 landscape:mb-8 flex flex-col-reverse gap-4 landscape:flex-row landscape:gap-8">
          <Bento className="border-none h-full landscape:flex-1 landscape:h-auto">
            <Window className="bg-common-ash">
              <div className="p-4 landscape:p-12 flex flex-col gap-4">
                <h2 className="text-title-1 text-charcoal">DIY your own deck</h2>
                <p className="text-body-regular text-charcoal">
                  Scissors + printer = game night unlocked. Download your own copy of Data War to
                  cut up and blast off with right here.
                </p>

                <LinkButton
                  href="https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/assets/datawar-full-game.pdf"
                  title="Get your own cards game"
                  className='secondary-button landscape:w-fit
                           border-charcoal text-charcoal hover:border-charcoal
                             hover:bg-charcoal hover:text-common-ash
                             active:border-charcoal active:bg-charcoal active:text-common-ash
                             before:content-[""] before:inline-block before:w-4 before:h-4 before:mr-2
                             before:bg-current before:mask-[url(/assets/images/icons/download.svg)]
                             before:mask-no-repeat before:mask-center before:mask-contain'
                  // trackableEvent="click_download_datawar_deck"
                >
                  Download the Deck!
                </LinkButton>
              </div>
            </Window>
          </Bento>
          <Bento
            image="/assets/images/data-war/bag.webp"
            imageAlt="Billionaire in a box"
            className="landscape:w-[30%] aspect-square border-none"
          />
        </section>
      )}

      <CountDown
        isLaunchCompleted={isLaunchCompleted}
        cta={
          shouldDisplayLaunchCta ? (
            <LinkButton href="/" className="secondary-button flex">
              Watch the Launch!
            </LinkButton>
          ) : (
            <Suspense fallback={<div>Loading...</div>}>
              <GetStarted
                {...(avatarBentoData.primaryFlowData as GetStartedProps)}
                ctaText="Build a Billionaire"
                triggerClassNames="secondary-button"
              />
            </Suspense>
          )
        }
      />
    </>
  );
}
