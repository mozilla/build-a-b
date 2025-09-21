import CountDown from '@/components/CountDown';
import Hero from '@/components/Hero';
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
    },
    {
      alt: 'Alt Text 2',
      src: '/assets/images/test.webp',
    },
    {
      alt: 'Alt Text 3',
      src: '/assets/images/test.webp',
      href: 'http://mondorobot.com',
      title: 'Learn more',
    },
    {
      alt: 'Alt Text 4',
      src: '/assets/images/test.webp',
    },
  ];

  return (
    <>
      <Hero image="/assets/images/launch.webp" ariaLabel="Hero section - TwitchCon 2025">
        <div className="relative flex flex-col p-4 landscape:p-8 h-full justify-center bg-gradient-to-r from-black to-transparent gap-4 max-w-4xl">
          <h6 className="text-nav-item">October 17-19, 2025</h6>
          <h1 className="text-title-1">Billionaire Blast Off lands at TwitchCon</h1>
          <p className="text-body-regular">
            Make a billionaire. Beat them at their own game. Send them into Space. Find us on the
            floor or follow along online.
          </p>
          <div className="flex flex-col landscape:flex-row gap-4 items-start">
            <Link href="#" className="secondary-button" title="Get your event tickets">
              Get Tickets
            </Link>
          </div>
        </div>
      </Hero>

      <CountDown targetDate="2025-10-17T10:00:00-07:00" />

      <CardsSection
        image="/assets/images/mixed-blue-grid.webp"
        cards={[
          <IconCard
            key="1"
            image="/assets/images/night-sky.webp"
            icon="/assets/images/icons/snake.webp"
          >
            <p className="text-body-regular">Join the party at</p>
            <h4 className="text-title-3">Booth #1234</h4>
          </IconCard>,
          <IconCard
            key="2"
            image="/assets/images/night-sky.webp"
            icon="/assets/images/icons/bulb.webp"
          >
            <p className="text-body-regular">The fun includes</p>
            <h4 className="text-title-3">Hologram dances and Data War: the Game</h4>
          </IconCard>,
          <IconCard
            key="3"
            image="/assets/images/night-sky.webp"
            icon="/assets/images/icons/rocket.webp"
          >
            <p className="text-body-regular">Then, find us at the</p>
            <h4 className="text-title-3">Block party space launch</h4>
          </IconCard>,
        ]}
      >
        <h2 className="text-title-1">[TwitchCon Summary]</h2>
        <p className="text-body-regular">This is copy that introduces the overarching narrative</p>
      </CardsSection>

      <section className="mb-4 landscape:mb-8 flex flex-col gap-4 landscape:flex-row landscape:gap-8">
        <Bento
          image="/assets/images/boxer.webp"
          className="landscape:w-[30%] aspect-[377/267] border-none"
        />
        <Bento className="border-none h-full landscape:flex-1 landscape:h-auto">
          <Window className="bg-common-ash">
            <div className="p-4 landscape:p-8 flex flex-col gap-4">
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
        className="bg-gradient-to-r from-[#ffea80] to-[#ff8a50]"
        cards={[
          <IconCard
            key="1"
            icon="/assets/images/icons/shield.webp"
            className="bg-common-ash border-charcoal! border-solid border-2!"
          >
            <h4 className="text-title-3 text-charcoal">
              Bring your expansion pack and battle against other players
            </h4>
            <p className="text-body-regular text-charcoal">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in
              eros elementum tristique.
            </p>
          </IconCard>,
          <IconCard
            key="2"
            icon="/assets/images/icons/star.webp"
            className="bg-common-ash border-charcoal! border-solid border-2!"
          >
            <h4 className="text-title-3 text-charcoal">
              Featuring appearances by famous gamers like XXX and XXX
            </h4>
            <p className="text-body-regular text-charcoal">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in
              eros elementum tristique.
            </p>
          </IconCard>,
        ]}
      >
        <h2 className="text-title-1 text-charcoal">Play Data War with Us</h2>
        <p className="text-body-regular text-charcoal">Some body copy about the game</p>
        <Link
          href="#"
          title="Read Data War instructions"
          className="secondary-button border-charcoal text-charcoal hover:bg-charcoal hover:text-common-ash w-auto mx-auto"
        >
          Learn Data War: The Game
        </Link>
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

      <section className="mb-4 landscape:mb-8 mt-12">
        <h2 className="text-title-1 text-center mb-8">More of what you want</h2>
        <div className="flex flex-col landscape:flex-row gap-5 landscape:gap-10 justify-between mt-4">
          <Bento image="/assets/images/hero-twitchcon.webp" className="flex-1 aspect-[320/200]">
            <Link
              href="#"
              title="Go to lorem"
              className="block relative bg-gradient-to-tr from-[#33333650] to-transparent h-full w-full"
            >
              <h2 className="absolute bottom-6 left-6 text-title-1">Lorem Ipsum</h2>
            </Link>
          </Bento>
          <Bento image="/assets/images/join-twitchcon.webp" className="flex-1 aspect-[320/200]">
            <Link
              href="#"
              title="Go to adispiscing"
              className="block relative bg-gradient-to-tr from-[#33333650] to-transparent h-full w-full"
            >
              <h2 className="absolute bottom-6 left-6 text-title-1">Adipiscing Elit</h2>
            </Link>
          </Bento>
        </div>
      </section>
    </>
  );
}
