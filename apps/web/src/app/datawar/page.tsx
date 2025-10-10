import { Suspense } from 'react';
import Image from 'next/image';
import CountDown from '@/components/CountDown';
import Hero from '@/components/Hero';
import LinkButton from '@/components/LinkButton';
import GetStarted, { type GetStartedProps } from '@/components/PrimaryFlow/GetStarted';
import { avatarBentoData } from '@/utils/constants';
import { evaluateFlag } from '@/app/flags';
import { notFound } from 'next/navigation';
import CardsSection from '@/components/CardsSection';
import IconCard from '@/components/IconCard';

export default async function Page() {
  // Check if DataWar feature is enabled
  const isDataWarEnabled = await evaluateFlag('showDataWar');

  if (!isDataWarEnabled) {
    notFound();
  }
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
                download
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
                className="secondary-button w-full border-common-ash text-common-ash hover:bg-common-ash hover:text-charcoal"
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
          In Data War, you compete for a One-Way Ticket to Space for egomaniacal, tantrum-prone
          little Billionaires. It plays like Classic War, but with the ability to chain effects from
          unique cards, resulting in unpredictable twists and explosive endings that play out
          differently every time!
        </p>
      </CardsSection>

      <CountDown
        targetDate="2025-10-18T10:20:30-07:00"
        cta={
          <Suspense fallback={<div>Loading...</div>}>
            <GetStarted
              {...(avatarBentoData.primaryFlowData as GetStartedProps)}
              ctaText="Build a Billionaire"
              triggerClassNames="secondary-button"
            />
          </Suspense>
        }
      />
    </>
  );
}
