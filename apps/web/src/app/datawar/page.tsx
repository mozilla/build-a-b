import { Suspense } from 'react';
import Link from 'next/link';
import CountDown from '@/components/CountDown';
import Hero from '@/components/Hero';
import LinkButton from '@/components/LinkButton';
import GetStarted, { type GetStartedProps } from '@/components/PrimaryFlow/GetStarted';
import { avatarBentoData } from '@/utils/constants';
import { evaluateFlag } from '@/app/flags';
import { notFound } from 'next/navigation';

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
                href="#"
                title="Get your own cards game"
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

      <section className="h-20 flex items-center justify-center pb-8">
        <Link href="/datawar/instructions" className="primary-button">
          Go to DataWar Instructions!
        </Link>
      </section>
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
