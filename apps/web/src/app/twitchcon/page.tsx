export const dynamic = 'force-dynamic';

import Bento from '@/components/Bento';
// import CardsSection from '@/components/CardsSection';
import CountDown from '@/components/CountDown';
import Hero from '@/components/Hero';
// import IconCard from '@/components/IconCard';
import ImageGallery from '@/components/ImageGallery';
import LinkButton from '@/components/LinkButton';
// import GetStarted, { type GetStartedProps } from '@/components/PrimaryFlow/GetStarted';
import SocialFeed from '@/components/SocialFeed';
import Window from '@/components/Window';
import { FEED_REF_ID, FEED_SRC } from '@/utils/constants';
import { evaluatePhase2Flag } from '@/utils/helpers/evaluate-phase2-flag';
import { Metadata } from 'next';
import Image from 'next/image';
// import { Suspense } from 'react';
import { evaluateFlag } from '@/app/flags';

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
  const [isPhase2B, isPhase2C, isLaunchCompleted, showSocialFeed, isPhase4] = await Promise.all([
    evaluateFlag('showPhase2bFeatures'),
    evaluateFlag('showPhase2cFeatures'),
    evaluatePhase2Flag('c'),
    evaluateFlag('showSocialFeed'),
    evaluateFlag('showPhase4Features'),
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

  // const holoboxSection = (
  //   <section
  //     className={`mb-4 landscape:mb-8 flex flex-col gap-4 landscape:flex-row landscape:gap-8`}
  //   >
  //     <Bento
  //       image="/assets/images/doll.webp"
  //       imageAlt="Billionaire in a box"
  //       className={`landscape:w-[30%] aspect-[377/275] border-none ${isLaunchCompleted ? 'order-2' : 'order-1'}`}
  //     />
  //     <Bento
  //       className={`border-none h-full landscape:flex-1 landscape:h-auto ${isLaunchCompleted ? 'order-1' : 'order-2'}`}
  //     >
  //       <Window className="bg-common-ash">
  //         <div className="p-4 landscape:p-12 flex flex-col gap-4">
  //           <h2 className="text-title-1 text-charcoal">The Billionaire Holobox</h2>
  //           <p className="text-body-regular text-charcoal">
  //             Use our super futuristic hologram kiosk to build a Billionaire and bust a move.
  //             Can&apos;t make it to the Holobox at TwitchCon? You can still create a Billionaire and
  //             join the party right here!
  //           </p>
  //           {isAnyPhase2 && avatarData && (
  //             <LinkButton
  //               href="/"
  //               title="Generate a selfie"
  //               className="secondary-button w-fit border-charcoal text-charcoal hover:bg-charcoal hover:text-common-ash active:bg-charcoal active:text-common-ash"
  //             >
  //               Take a Space Selfie
  //             </LinkButton>
  //           )}
  //           {isAnyPhase2 && !avatarData && avatarBentoData?.primaryFlowData && (
  //             <Suspense fallback={<div>Loading...</div>}>
  //               <GetStarted
  //                 {...avatarBentoData.primaryFlowData}
  //                 ctaText={!avatarData ? 'Build a Billionaire' : 'Take a Space Selfie'}
  //                 triggerClassNames="secondary-button w-fit border-charcoal text-charcoal hover:bg-charcoal hover:text-common-ash active:bg-charcoal active:text-common-ash"
  //                 trackableEvent="click_build_billionaire_footer"
  //               />
  //             </Suspense>
  //           )}
  //         </div>
  //       </Window>
  //     </Bento>
  //   </section>
  // );

  const holoboxSection2 = (
    <section
      className={`mb-4 landscape:mb-8 flex flex-col gap-4 landscape:flex-row landscape:gap-8`}
    >
      <Bento
        image={isPhase4 ? '/assets/images/holoboxSection3.webp' : '/assets/images/doll.webp'}
        imageAlt="Billionaire in a box"
        className={`landscape:w-[30%] aspect-[377/275] border-none order-2`}
      />
      <Bento className={`border-none h-full landscape:flex-1 landscape:h-auto order-1`}>
        <Window className="bg-common-ash">
          <div className="p-4 landscape:p-12 flex flex-col gap-4">
            <h2 className="text-title-1 text-charcoal">The Billionaire Holobox</h2>
            <p className="text-body-regular text-charcoal">
              Did you miss the chance to build a Billionaire and bust a move with our super
              futuristic hologram kiosk at TwitchCon? Check out the BTS best-of right here.
            </p>
            {isPhase4 && (
              <div className="flex gap-6 items-center">
                <a
                  href="https://www.tiktok.com/@firefox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center transition-opacity hover:opacity-70"
                  aria-label="Follow Firefox on TikTok"
                >
                  <Image
                    src="/assets/images/social/tiktok.svg"
                    alt="TikTok"
                    width={48}
                    height={48}
                    className="w-12 h-12"
                  />
                </a>
                <a
                  href="https://www.instagram.com/firefox/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center transition-opacity hover:opacity-70"
                  aria-label="Follow Firefox on Instagram"
                >
                  <Image
                    src="/assets/images/social/instagram.svg"
                    alt="Instagram"
                    width={48}
                    height={48}
                    className="w-12 h-12"
                  />
                </a>
                <a
                  href="https://www.threads.net/@firefox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center transition-opacity hover:opacity-70"
                  aria-label="Follow Firefox on Threads"
                >
                  <Image
                    src="/assets/images/social/threads.svg"
                    alt="Threads"
                    width={48}
                    height={48}
                    className="w-12 h-12"
                  />
                </a>
                <a
                  href="https://www.youtube.com/firefox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center transition-opacity hover:opacity-70"
                  aria-label="Follow Firefox on YouTube"
                >
                  <Image
                    src="/assets/images/social/youtube.svg"
                    alt="YouTube"
                    width={48}
                    height={48}
                    className="w-12 h-12"
                  />
                </a>
              </div>
            )}
          </div>
        </Window>
      </Bento>
    </section>
  );

  const dataWarDigitalSection = (
    <section
      className={`mb-4 landscape:mb-8 flex flex-col gap-4 landscape:flex-row landscape:gap-8`}
    >
      <Bento
        image="/assets/images/datawar-digital-section.webp"
        imageAlt="Billionaire in a box"
        className={`landscape:w-[30%] aspect-[377/275] border-none ${isLaunchCompleted ? 'order-2' : 'order-1'}`}
      />
      <Bento
        className={`border-none h-full landscape:flex-1 landscape:h-auto ${isLaunchCompleted ? 'order-1' : 'order-2'}`}
      >
        <Window className="bg-common-ash">
          <div className="p-4 landscape:p-12 flex flex-col gap-4">
            <h2 className="text-title-1 text-charcoal">Data War Digital is live!</h2>
            <p className="text-body-regular text-charcoal">
              At TwitchCon, we launched Data War by launching egomaniacal, tantrum-prone little
              Billionaires to space. If you couldn&apos;t join us, you can now play the digital
              version right here in your browser.
            </p>
            <div className="flex flex-wrap gap-4">
              <LinkButton
                href="/datawar/game"
                target="_blank"
                title="Play Now"
                className="secondary-button w-fit border-charcoal text-charcoal hover:bg-charcoal hover:text-common-ash active:bg-charcoal active:text-common-ash flex items-center gap-2"
              >
                <Image
                  src="/assets/images/icons/controller.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                Play Now
              </LinkButton>
              <LinkButton
                href="/datawar"
                title="See Game Details"
                className="secondary-button w-fit border-charcoal text-charcoal hover:bg-charcoal hover:text-common-ash active:bg-charcoal active:text-common-ash"
              >
                See Game Details
              </LinkButton>
            </div>
          </div>
        </Window>
      </Bento>
    </section>
  );

  const countDown = (
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
  );

  return (
    <>
      <Hero
        image="/assets/images/launch.webp"
        imageSrcPortrait="/assets/images/launch-mobile.webp"
        ariaLabel="Hero section - TwitchCon 2025"
      >
        <div
          className="relative landscape:aspect-[164/67] p-4 landscape:p-12
                        bg-gradient-to-t from-black from-[20%] to-transparent
                        landscape:bg-gradient-to-r"
        >
          <div
            className={`h-full flex flex-col gap-6 justify-end landscape:justify-center ${isPhase2C ? 'landscape:max-w-1/2' : ''} `}
          >
            <div className="flex flex-col landscape:flex-row gap-6 landscape:gap-8 items-center">
              <div className="flex-1">
                <h6 className="text-nav-item">THANK YOU, SAN DIEGO!</h6>
                <h1 className="text-title-1 text-5xl-custom landscape:text-6xl-custom py-6">
                  Billionaire Blast Off TwitchCon recap
                </h1>
                <p className="text-body-small">
                  We brought the chaos, the cards, holographic dancing Billionaires, and a rocket
                  countdown. It was a legitimate blast. Did you miss us at TwitchCon? We missed you!
                  Catch up on all of the TwitchCon action right here!
                </p>
              </div>
              {isPhase4 && (
                <div className="w-full landscape:w-[40%]">
                  <div className="w-full aspect-video">
                    {!isPhase4 && (
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/eqUxVAsA80k?playsinline=1&rel=0"
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      ></iframe>
                    )}
                    {isPhase4 && (
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/YMh5jK5MIgM?si=HOkpuaSagilxAUjj?playsinline=1&rel=0"
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      ></iframe>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Hero>

      <ImageGallery images={imagesForGallery} />

      {/* {!isLaunchCompleted && !isPhase4 && (
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
              <h3 className="text-title-3">
                TwitchCon Block Party for the Space Launch screening!
              </h3>
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
      )} */}

      {/* {!isLaunchCompleted && !isPhase4 && holoboxSection} */}

      {isPhase4 && dataWarDigitalSection}

      {/* {!isLaunchCompleted && !isPhase4 && (
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
                Everyone gets an exclusive expansion in the swag bag. Play at our tables for a
                chance to score the full set.
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
          postContent={
            isAnyPhase2 && (
              <div className="flex flex-col landscape:flex-row justify-center items-center p-4 landscape:p-8 mt-4 gap-4 rounded-xl border-charcoal border-2 text-charcoal">
                <figure className="relative w-15 h-15">
                  <Image src="/assets/images/cards.webp" alt="Cards" sizes="10wv" fill />
                </figure>
                <div className="flex-1">
                  <h3 className="text-title-3 mb-2">Go down the rabbit hole</h3>
                  <p className="text-body-regular">
                    Everything you ever wanted to know (or didn&apos;t know you wanted to know)
                    about Data War, the new physical card game made by Firefox.
                  </p>
                </div>

                <div>
                  <LinkButton
                    href="/datawar"
                    title="Learn more about Data War"
                    className="secondary-button border-charcoal text-charcoal hover:bg-charcoal hover:text-common-ash active:bg-charcoal active:text-common-ash"
                  >
                    Jump In
                  </LinkButton>
                </div>
              </div>
            )
          }
        >
          <h2 className="text-title-1 text-charcoal">Cards down. Billionaires up.</h2>
          <p className="text-body-regular text-charcoal">
            Data War is the chaotic-casual card game where players compete to send egomaniacal,
            tantrum-prone little Billionaires on a one way ticket to space. Created by Firefox, and
            only available at TwitchCon.
          </p>
        </CardsSection>
      )} */}

      {/* {!isLaunchCompleted && !isPhase4 && (
        <>
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
                  We&apos;re taking over Gaslamp&apos;s seafood mainstay with cocktails, swag and
                  stacks of Data War.
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
                    You don&apos;t need a one way ticket to space to join
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
                    className="secondary-button border-common-ash text-common-ash hover:bg-common-ash hover:text-charcoal active:bg-common-ash active:text-charcoal"
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
        </>
      )} */}

      {countDown}

      {showSocialFeed && !isPhase4 && (
        <SocialFeed
          refId={FEED_REF_ID}
          src={FEED_SRC}
          title={
            isLaunchCompleted || isPhase4 ? 'TwitchCon highlights' : 'TwitchCon behind the scenes'
          }
        />
      )}

      {/* {!isLaunchCompleted && !isPhase4 && countDown} */}

      {/* {isLaunchCompleted && !isPhase4 && (
        <section
          className={`mb-4 landscape:mb-8 flex flex-col gap-4 landscape:flex-row landscape:gap-8`}
          id="cards-down-billionaires-up"
        >
          <Bento
            image="/assets/images/avatar-cards.webp"
            imageAlt="Cards and Billionaires"
            className={`landscape:w-[30%] aspect-[377/275] border-none`}
          />
          <Bento className={`border-none h-full landscape:flex-1 landscape:h-auto`}>
            <Window className="bg-common-ash">
              <div className="p-4 landscape:p-12 flex flex-col gap-4">
                <h2 className="text-title-1 text-charcoal">Cards down. Billionaires up.</h2>
                <p className="text-body-regular text-charcoal">
                  At TwitchCon we launched Data War, the chaotic-casual card game where players
                  compete to send egomaniacal, tantrum-prone little Billionaires on a one way ticket
                  to space. If you couldn&apos;t join us, you can still download a deck and stay
                  tuned for the digital version, dropping in November!
                </p>
                <LinkButton
                  href="/datawar"
                  title="Learn more about Data War"
                  className="secondary-button w-fit border-charcoal text-charcoal hover:bg-charcoal hover:text-common-ash active:bg-charcoal active:text-common-ash"
                  trackableEvent="click_go_to_datawar"
                >
                  Check out Data War
                </LinkButton>
              </div>
            </Window>
          </Bento>
        </section>
      )} */}

      {/* {holoboxSection2} */}
    </>
  );
}
