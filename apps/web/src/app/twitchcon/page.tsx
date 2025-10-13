export const dynamic = 'force-dynamic';

import Bento from '@/components/Bento';
import CardsSection from '@/components/CardsSection';
import CountDown from '@/components/CountDown';
import Hero from '@/components/Hero';
import IconCard from '@/components/IconCard';
import ImageGallery from '@/components/ImageGallery';
import LinkButton from '@/components/LinkButton';
import GetStarted, { type GetStartedProps } from '@/components/PrimaryFlow/GetStarted';
import SocialFeed from '@/components/SocialFeed';
import Window from '@/components/Window';
import { avatarBentoData, COOKIE_NAME } from '@/utils/constants';
import { evaluatePhase2Flag } from '@/utils/helpers/evaluate-phase2-flag';
import { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import { evaluateFlag } from '@/app/flags';
import { cookies } from 'next/headers';
import { getUserAvatar } from '@/utils/actions/get-user-avatar';

/**
 * SocialEmbed will give you the entire script, but what we really need
 * is the ID and source. Please do not modify these unless you use
 * a different SocialEmbed account.
 */
const FEED_REF_ID = '7081eee2ff9921836e51a9a40ec1e5775a5b4834';
const FEED_SRC = 'https://embedsocial.com/cdn/ht.js';

export const metadata: Metadata = {
  title: 'Firefox Billionaire Blast Off lands at TwitchCon',
  description:
    'Make a Billionaire. Beat them at their own game. Send them into Space. Find us on the floor or follow along online.',
  openGraph: {
    siteName: 'Billionaire Blast Off Powered by Firefox',
    title: 'Firefox Billionaire Blast Off lands at TwitchCon',
    description:
      'Make a Billionaire. Beat them at their own game. Send them into Space. Find us on the floor or follow along online.',
    images: [
      {
        url: '/assets/images/opengraph/twitchcon.jpg',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/assets/images/opengraph/twitchcon.jpg'],
  },
};

export default async function Page() {
  const [isAnyPhase2, isLaunchCompleted] = await Promise.all([
    evaluatePhase2Flag('a'),
    evaluatePhase2Flag('c'),
  ]);

  const imagesForGallery = [
    {
      alt: 'Rocket blueprint',
      src: '/assets/images/galleries/twitchcon/1.webp',
      isVideo: false,
    },
    {
      alt: 'Launch planning',
      src: '/assets/images/galleries/twitchcon/2.webp',
      isVideo: false,
    },
    {
      alt: 'Rocket mockup',
      src: '/assets/images/galleries/twitchcon/3.webp',
      isVideo: false,
    },
    {
      alt: 'Launch simulation',
      src: '/assets/images/galleries/twitchcon/4.webp',
      isVideo: false,
    },
  ];

  const cookieStore = await cookies();
  const userCookie = cookieStore.get(COOKIE_NAME);
  const userId = userCookie?.value;

  const avatarData = userId ? await getUserAvatar(userId) : null;

  const holoboxSection = (
    <section
      className={`mb-4 landscape:mb-8 flex flex-col gap-4 landscape:flex-row landscape:gap-8`}
    >
      <Bento
        image="/assets/images/doll.webp"
        imageAlt="Billionaire in a box"
        className={`landscape:w-[30%] aspect-[377/275] border-none ${isLaunchCompleted ? 'order-2' : 'order-1'}`}
      />
      <Bento
        className={`border-none h-full landscape:flex-1 landscape:h-auto ${isLaunchCompleted ? 'order-1' : 'order-2'}`}
      >
        <Window className="bg-common-ash">
          <div className="p-4 landscape:p-12 flex flex-col gap-4">
            <h2 className="text-title-1 text-charcoal">The Billionaire Holobox</h2>
            {!isAnyPhase2 && (
              <p className="text-body-regular text-charcoal">
                Use our super futuristic hologram kiosk to build a Billionaire and make them bust a
                move.
              </p>
            )}

            {isAnyPhase2 && (
              <>
                <p className="text-body-regular text-charcoal">
                  Use our super futuristic hologram kiosk to build a Billionaire and bust a move.
                  Can&apos;t make it to the Holobox at TwitchCon? You can still create a Billionaire
                  and join the party right here!
                </p>
                {avatarData && (
                  <LinkButton
                    href="/"
                    title="Generate a selfie"
                    className="secondary-button w-fit border-charcoal text-charcoal hover:bg-charcoal hover:text-common-ash"
                  >
                    Take a Space Selfie
                  </LinkButton>
                )}
                {!avatarData && avatarBentoData?.primaryFlowData && (
                  <Suspense fallback={<div>Loading...</div>}>
                    <GetStarted
                      {...avatarBentoData.primaryFlowData}
                      ctaText={!avatarData ? 'Build a Billionaire' : 'Take a Space Selfie'}
                      triggerClassNames="secondary-button w-fit border-charcoal text-charcoal hover:bg-charcoal hover:text-common-ash"
                      trackableEvent="click_build_billionaire_footer"
                    />
                  </Suspense>
                )}
              </>
            )}
          </div>
        </Window>
      </Bento>
    </section>
  );

  return (
    <>
      <Hero
        image="/assets/images/launch.webp"
        imageSrcPortrait="/assets/images/launch-mobile.webp"
        ariaLabel="Hero section - TwitchCon 2025"
      >
        <div
          className="relative aspect-[179/310] landscape:aspect-[164/67] p-4 landscape:p-12
                        bg-gradient-to-t from-black from-[20%] to-transparent
                        landscape:bg-gradient-to-r"
        >
          <div className="h-full flex flex-col gap-6 justify-end landscape:justify-center landscape:max-w-1/2">
            {!isLaunchCompleted && (
              <>
                <h6 className="text-nav-item">October 17-19, 2025</h6>
                <h1 className="text-title-1 text-5xl-custom landscape:text-6xl-custom">
                  Billionaire Blast Off lands at TwitchCon
                </h1>
                <p className="text-body-small">
                  Make a Billionaire. Beat them at their own game. Send them into Space. Find us on
                  the floor or follow along online.
                </p>
                {!isAnyPhase2 && (
                  <LinkButton
                    href="https://www.twitchcon.com/san-diego-2025/tickets/"
                    className="secondary-button landscape:w-fit"
                    title="Get your event tickets"
                    target="_blank"
                    trackableEvent="click_get_twitchcon_tickets"
                  >
                    Get Tickets
                  </LinkButton>
                )}
              </>
            )}
            {isLaunchCompleted && (
              <>
                <h6 className="text-nav-item">THANK YOU, SAN DIEGO!</h6>
                <h1 className="text-title-1 text-5xl-custom landscape:text-6xl-custom">
                  Billionaire Blast Off TwitchCon recap
                </h1>
                <p className="text-body-small">
                  We brought the chaos, the cards, holographic dancing Billionaires, and a rocket
                  countdown. It was a legitimate blast. Did you miss us at TwitchCon? We missed you!
                  Catch up on all of the TwitchCon action right here!
                </p>
              </>
            )}
          </div>
        </div>
      </Hero>

      <CardsSection
        image="/assets/images/mixed-blue-grid.webp"
        cards={[
          <IconCard
            key="1"
            image="/assets/images/night-sky.webp"
            icon="/assets/images/icons/world.webp"
            iconEffect
            addScrim
          >
            <p className="text-body-regular">Where we&apos;ll be</p>
            <h3 className="text-title-3">
              Come by Booth #2805 (near Exhibit Hall F) for all of the Billionaire Blast Off fun!
            </h3>
          </IconCard>,
          <IconCard
            key="2"
            image="/assets/images/night-sky.webp"
            icon="/assets/images/icons/tshirt.webp"
            iconEffect
            addScrim
          >
            <p className="text-body-regular">What&apos;s on deck</p>
            <h3 className="text-title-3">
              Data War, Build-a-Billionaire, merch drops, and a healthy helping of utter chaos.
            </h3>
          </IconCard>,
          <IconCard
            key="3"
            image="/assets/images/night-sky.webp"
            icon="/assets/images/icons/launch.webp"
            iconEffect
            addScrim
          >
            <p className="text-body-regular">Join us at the</p>
            <h3 className="text-title-3">TwitchCon Block Party for the Space Launch screening!</h3>
          </IconCard>,
        ]}
      >
        <figure className="absolute top-4 right-8 w-[8.75rem] h-[8.75rem] hidden landscape:block">
          <Image src="/assets/images/sticker.webp" sizes="25vw" fill alt="Firefox pet sticker" />
        </figure>
        <h2 className="text-title-1">Hello, San Diego</h2>
        <p className="text-body-regular">
          We brought the chaos, cards, and a rocket countdown. Come play with us.
        </p>
      </CardsSection>

      {!isLaunchCompleted && holoboxSection}

      <CardsSection
        className="bg-[url(/assets/images/yellow-grid.webp)] bg-no-repeat bg-center bg-cover flex-warp"
        cards={[
          <IconCard
            key="1"
            icon="/assets/images/icons/deck.webp"
            image="/assets/images/hall.webp"
            className="aspect-[163/128] landscape:aspect-[139/64]"
            wrapperClassName="bg-gradient-to-t from-black from-[25%] landscape:from-[10%] to-transparent"
            iconEffect
          >
            <h3 className="text-title-3">Complete your deck</h3>
            <p className="text-body-regular">
              Everyone gets an exclusive expansion in the swag bag. Play at our tables for a chance
              to score the full set.
            </p>
          </IconCard>,
          <IconCard
            key="2"
            icon="/assets/images/icons/hand.webp"
            image="/assets/images/pile.webp"
            className="aspect-[163/128] landscape:aspect-[139/64]"
            wrapperClassName="bg-gradient-to-t from-black from-[25%] landscape:from-[10%] to-transparent"
            iconEffect
          >
            <h3 className="text-title-3">Stay and Play</h3>
            <p className="text-body-regular">
              Play a few rounds, float some ideas, chat with creators and develop some lifelong
              friendships.
            </p>
          </IconCard>,
        ]}
      >
        <h2 className="text-title-1 text-charcoal">Cards down. Billionaires up.</h2>
        <p className="text-body-regular text-charcoal">
          Data War is the chaotic-casual card game where players compete to send egomaniacal,
          tantrum-prone little Billionaires on a one-way ticket to space. Created by Firefox, and
          only available at TwitchCon.
        </p>
      </CardsSection>

      <ImageGallery images={imagesForGallery} />

      <CardsSection
        image="/assets/images/grid-dots-blue.webp"
        cards={[
          <IconCard
            key="1"
            image="/assets/images/space-rocket.webp"
            icon="/assets/images/icons/launch.webp"
            className="aspect-[163/128] landscape:aspect-[139/64]"
            wrapperClassName="bg-gradient-to-t from-black from-[15%] to-transparent"
            iconEffect
          >
            <h3 className="text-title-3">Blast off, Billionaires!</h3>
            <p className="text-body-small max-w-[27rem]">
              Countdown to launch. Bring your Block Party ticket and your party pants.
            </p>
          </IconCard>,
          <IconCard
            key="2"
            image="/assets/images/pub.webp"
            icon="/assets/images/icons/beer.webp"
            className="aspect-[163/128] landscape:aspect-[139/64]"
            wrapperClassName="bg-gradient-to-t from-black from-[15%] to-transparent"
            iconEffect
          >
            <h3 className="text-title-3">Party at the Rockin&apos; Baja Lobster!!</h3>
            <p className="text-body-small max-w-[27rem]">
              We&apos;re taking over Gaslamp&apos;s seafood mainstay with cocktails, swag and stacks
              of Data War.
            </p>
          </IconCard>,
        ]}
        postContent={
          <div className="flex flex-col landscape:flex-row justify-center items-center p-4 landscape:p-8 mt-4 gap-4 rounded-xl border-common-ash border-2">
            <figure className="relative w-15 h-15">
              <Image src="/assets/images/icons/bitcoin.webp" alt="Bitcoin" sizes="10wv" fill />
            </figure>
            <div className="flex-1">
              <h3 className="text-title-3 mb-2">
                You don&apos;t need a one-way ticket to space to join
              </h3>
              <p className="text-body-regular">
                But you do need Block Party tickets to join us live. Luckily, they&apos;re right
                here.
              </p>
            </div>
            <div>
              <LinkButton
                href="https://www.twitchcon.com/san-diego-2025/tickets/"
                title="Buy your ticket"
                className="secondary-button border-common-ash text-common-ash hover:bg-common-ash hover:text-charcoal"
                target="_blank"
                trackableEvent="click_get_twitchcon_tickets"
              >
                Get Tickets
              </LinkButton>
            </div>
          </div>
        }
      >
        <h2 className="text-title-1">Blast off at the Block Party</h2>
        <p className="text-body-small">
          Oct 18, 8:30 PM. Join us after hours as we count down, drink up and send all the
          Billionaires off in style. (Or stream along right here.)
        </p>
      </CardsSection>
      {isAnyPhase2 && evaluateFlag('showSocialFeed') && (
        <SocialFeed refId={FEED_REF_ID} src={FEED_SRC} />
      )}
      <CountDown
        targetDate="2025-10-18T10:20:30-07:00"
        isLaunchCompleted={isLaunchCompleted}
        cta={
          isAnyPhase2 ? (
            <LinkButton href="/" className="secondary-button flex">
              Watch the Launch!
            </LinkButton>
          ) : (
            <Suspense fallback={<div>Loading...</div>}>
              <GetStarted
                {...(avatarBentoData.primaryFlowData as GetStartedProps)}
                ctaText="Build a Billionaire"
                triggerClassNames="secondary-button"
                trackableEvent="click_build_billionaire_countdown"
              />
            </Suspense>
          )
        }
      />
      {isLaunchCompleted && holoboxSection}
    </>
  );
}
