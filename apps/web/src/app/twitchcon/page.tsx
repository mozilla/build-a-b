import CountDown from '@/components/CountDown';
import Hero from '@/components/Hero';
import Image from 'next/image';
import Link from 'next/link';
import IconCard from '@/components/IconCard';
import CardsSection from '@/components/CardsSection';
import Window from '@/components/Window';
import Bento from '@/components/Bento';
import ImageGallery from '@/components/ImageGallery';

export default async function Page() {
  const imagesForGallery = [
    {
      alt: 'Alt Text 1',
      src: '/assets/images/test.webp',
      href: 'http://www.firefox.com/',
      title: 'Go to Firefox',
      isVideo: false,
    },
    {
      alt: 'Alt Text 2',
      src: '/assets/images/test.webp',
      isVideo: false,
    },
    {
      alt: 'Alt Text 3',
      src: '/assets/images/test.webp',
      href: 'http://mondorobot.com',
      title: 'Learn more',
      isVideo: false,
    },
    {
      alt: 'Video',
      src: '/assets/videos/sample-card-game-clip-640x640.webm',
      isVideo: true,
      videoPosterPath: '/assets/videos/sample-card-game-poster-640x640.png',
    },
  ];

  return (
    <>
      <Hero image="/assets/images/launch.webp" ariaLabel="Hero section - TwitchCon 2025">
        <div className="relative flex flex-col p-4 landscape:p-12 h-full justify-center bg-gradient-to-r from-black to-transparent gap-4 max-w-4xl">
          <h6 className="text-nav-item">October 17-19, 2025</h6>
          <h1 className="text-title-1">Billionaire Blast Off lands at TwitchCon</h1>
          <p className="text-body-regular">
            Make a billionaire. Beat them at their own game. Send them into Space. Find us on the
            floor or follow along online.
          </p>
          <Link href="#" className="secondary-button w-fit" title="Get your event tickets">
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
          image="/assets/images/boxer.webp"
          className="landscape:w-[30%] aspect-[377/267] border-none"
        />
        <Bento className="border-none h-full landscape:flex-1 landscape:h-auto">
          <Window className="bg-common-ash">
            <div className="p-4 landscape:p-12 flex flex-col gap-4">
              <h2 className="text-title-1 text-charcoal">Reclaim your main character energy</h2>
              <p className="text-body-regular text-charcoal">
                Use our super futuristic hologram kiosk to build a Billionaire and make them dance
                till peak cringe.
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
            className="border-none aspect-[139/64] animate-left-card-icon"
            wrapperClassName="bg-gradient-to-r from-black to-transparent"
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
            className="bg-common-ash border-none aspect-[139/64] animate-right-card-icon"
            wrapperClassName="bg-gradient-to-r from-black to-transparent"
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
            image="/assets/images/night-sky.webp"
            icon="/assets/images/icons/star.webp"
          >
            <h4 className="text-title-3">Watch the Space launch</h4>
            <p className="text-body-regular">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in
              eros elementum tristique.
            </p>
          </IconCard>,
          <IconCard
            key="2"
            image="/assets/images/night-sky.webp"
            icon="/assets/images/icons/star.webp"
          >
            <h4 className="text-title-3">Party at the bar</h4>
            <p className="text-body-regular">
              We&apos;re taking over Rockin Baja Lobster in the heart of the Gaslamp district.
            </p>
          </IconCard>,
        ]}
      >
        <h2 className="text-title-1">Block party highlights</h2>
        <p className="text-body-regular">
          On October 18 at 8:30 PM, the launch film premieres... If you&apos;re at TwitchCon, catch
          the secret screening at the Party. If you&apos;re anywhere else, the only place to watch
          is right here.
        </p>
      </CardsSection>

      <CountDown targetDate="2025-10-17T10:00:00-07:00" />
    </>
  );
}
