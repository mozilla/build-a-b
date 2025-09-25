export const dynamic = 'force-dynamic';

import CountDown from '@/components/CountDown';
import Hero from '@/components/Hero';
import Image from 'next/image';
import Link from 'next/link';
import IconCard from '@/components/IconCard';
import CardsSection from '@/components/CardsSection';
import Window from '@/components/Window';
import Bento from '@/components/Bento';
import ImageGallery from '@/components/ImageGallery';
import ClientPageWrapper from '@/utils/page.client';
import { getUserAvatar } from '@/utils/actions/get-user-avatar';

export default async function Page() {
  const imagesForGallery = [
    {
      alt: 'Rocket blueprint',
      src: '/assets/images/gallery/1.webp',
      isVideo: false,
    },
    {
      alt: 'Launch planning',
      src: '/assets/images/gallery/2.webp',
      isVideo: false,
    },
    {
      alt: 'Rocket mockup',
      src: '/assets/images/gallery/3.webp',
      isVideo: false,
    },
    {
      alt: 'Launch simulation',
      src: '/assets/images/gallery/4.webp',
      isVideo: false,
    },
  ];

  const avatarData = await getUserAvatar();

  return (
    <ClientPageWrapper avatarData={avatarData}>
      <Hero image="/assets/images/launch.webp" ariaLabel="Hero section - TwitchCon 2025">
        <div className="relative flex flex-col p-4 landscape:p-12 h-full justify-center bg-gradient-to-r from-black to-transparent gap-4 max-w-4xl">
          <h6 className="text-nav-item">October 17-19, 2025</h6>
          <h1 className="text-title-1">Billionaire Blast Off lands at TwitchCon</h1>
          <p className="text-body-regular">
            Make a billionaire. Beat them at their own game. Send them into Space. Find us on the
            floor or follow along online.
          </p>
          <Link
            href="https://www.twitchcon.com/san-diego-2025/tickets/"
            className="secondary-button w-fit"
            title="Get your event tickets"
            target="_blank"
          >
            Get Tickets
          </Link>
        </div>
      </Hero>

      <CardsSection
        image="/assets/images/mixed-blue-grid.webp"
        cards={[
          <IconCard
            key="1"
            image="/assets/images/night-sky.webp"
            icon="/assets/images/icons/chain.webp"
            iconEffect
          >
            <p className="text-body-regular">Booth #2805</p>
            <h4 className="text-title-3">
              We’re not the biggest booth, but we&apos;re the billionaire-iest booth.
            </h4>
          </IconCard>,
          <IconCard
            key="2"
            image="/assets/images/night-sky.webp"
            icon="/assets/images/icons/tshirt.webp"
            iconEffect
          >
            <p className="text-body-regular">What&apos;s on deck</p>
            <h4 className="text-title-3">
              Data War, Build-a-Billionaire, merch drops, and mystery moments.
            </h4>
          </IconCard>,
          <IconCard
            key="3"
            image="/assets/images/night-sky.webp"
            icon="/assets/images/icons/launch.webp"
            iconEffect
          >
            <p className="text-body-regular">Then, find us at the</p>
            <h4 className="text-title-3">TwitchCon Block Party for the space-launch screening.</h4>
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

      <section className="mb-4 landscape:mb-8 flex flex-col gap-4 landscape:flex-row landscape:gap-8">
        <Bento
          image="/assets/images/doll.webp"
          imageAlt="Avatar in a box"
          className="landscape:w-[30%] aspect-[377/315] border-none"
        />
        <Bento className="border-none h-full landscape:flex-1 landscape:h-auto">
          <Window className="bg-common-ash">
            <div className="p-4 landscape:p-12 flex flex-col gap-4">
              <h2 className="text-title-1 text-charcoal">Make your Billionaire dance</h2>
              <p className="text-body-regular text-charcoal">
                It&apos;s your Billionaire. Make them perform for your amusement in 3D for everyone
                to mock and post. Can&apos;t make it to the Holobox at TwitchCon? You can still
                build a Billionaire and join the dance party with the new TikTok Dance Generator,
                dropping TwitchCon weekend!
              </p>
            </div>
          </Window>
        </Bento>
      </section>

      <CardsSection
        className="bg-[url(/assets/images/yellow-grid.webp)] bg-no-repeat bg-center bg-cover flex-warp"
        cards={[
          <IconCard
            key="1"
            icon="/assets/images/icons/deck.webp"
            image="/assets/images/hall.webp"
            className="aspect-[163/128] landscape:aspect-[139/64]"
            wrapperClassName="bg-gradient-to-r from-black to-transparent"
            iconEffect
          >
            <h4 className="text-title-3">Play with a full deck</h4>
            <p className="text-body-regular">
              Everyone gets an exclusive expansion in the swag bag. Play at our tables to score the
              full set.
            </p>
          </IconCard>,
          <IconCard
            key="2"
            icon="/assets/images/icons/hand.webp"
            image="/assets/images/pile.webp"
            className="aspect-[163/128] landscape:aspect-[139/64]"
            wrapperClassName="bg-gradient-to-r from-black to-transparent"
            iconEffect
          >
            <h4 className="text-title-3">Stay and Play</h4>
            <p className="text-body-regular">
              Play a few rounds, float some ideas, chat with creators, and (maybe) walk away with
              more than a free deck.
            </p>
          </IconCard>,
        ]}
      >
        <h2 className="text-title-1 text-charcoal">Cards down. Billionaires up.</h2>
        <p className="text-body-regular text-charcoal">
          Data War is the chaotic-casual card game where players compete to send egomaniacal,
          tantrum-prone little Billionaires on a One-Way Ticket to Space. Created by Firefox,
          presented by Billionaire Blast Off, and only available at TwitchCon.
        </p>
      </CardsSection>

      <ImageGallery images={imagesForGallery} />

      <CardsSection
        image="/assets/images/mixed-blue-grid.webp"
        cards={[
          <IconCard
            key="1"
            image="/assets/images/space-rocket.webp"
            icon="/assets/images/icons/rocket.webp"
            className="aspect-[163/128] landscape:aspect-[139/64]"
            wrapperClassName="bg-gradient-to-r from-black to-transparent"
            iconEffect
          >
            <h4 className="text-title-3">Blast off, Billionaires!</h4>
            <p className="text-body-small max-w-[26.25rem]">
              Watch the for-real-for-real space launch, wave goodbye to the Billionaires, and Open
              What You Want.
            </p>
          </IconCard>,
          <IconCard
            key="2"
            image="/assets/images/pub.webp"
            icon="/assets/images/icons/beer.webp"
            className="aspect-[163/128] landscape:aspect-[139/64]"
            wrapperClassName="bg-gradient-to-r from-black to-transparent"
            iconEffect
          >
            <h4 className="text-title-3">Party at Rockin Baja Lobster</h4>
            <p className="text-body-small max-w-[26.25rem]">
              We&apos;re taking over Gaslamp&apos;s seafood mainstay with cocktails, swag, and
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
              <h4 className="text-title-3 mb-2">
                You don&apos;t need a one-way ticket to space to party
              </h4>
              <p className="text-body-regular">
                But you do need Block Party tickets to join us live. Luckily, they&apos;re right
                here, on the internet.
              </p>
            </div>
            <div>
              <Link
                href="https://www.twitchcon.com/san-diego-2025/tickets/"
                title="Buy your ticket"
                className="secondary-button border-common-ash text-common-ash hover:bg-common-ash hover:text-charcoal"
                target="_blank"
              >
                Learn More
              </Link>
            </div>
          </div>
        }
      >
        <h2 className="text-title-1">Blast off at the Block Party</h2>
        <p className="text-body-small">
          Oct 18, 8:30 PM. Join us after hours as we count down, drink up and send all the
          Billionaires off in style—or stream along right here.
        </p>
      </CardsSection>

      <CountDown targetDate="2025-10-17T10:00:00-07:00" />
    </ClientPageWrapper>
  );
}
