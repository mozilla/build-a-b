import CountDown from '@/components/CountDown';
import Hero from '@/components/Hero';
import Link from 'next/link';
import IconCard from '@/components/IconCard';
import CardsSection from '@/components/CardsSection';

export default async function Page() {
  return (
    <>
      <Hero image="/assets/images/hero-twitchcon.webp" ariaLabel="Hero section - TwitchCon 2025">
        <div className="relative flex flex-col p-10 h-full justify-center bg-gradient-to-r from-black to-transparent gap-4 max-w-4xl">
          <h6 className="text-nav-item">Billionaire Blast Off Presents</h6>
          <h1 className="text-title-1">Catch Billionaire Blastoff at TwitchCon 2025</h1>
          <p className="text-body-regular">
            Build your absurd billionaire avatar. Play the game they don&apos;t want you to win —
            whether you&apos;re in San Diego or tuning in from anywhere.
          </p>
          <div className="flex flex-col landscape:flex-row gap-4 items-start">
            <Link href="#" className="primary-button" title="Build an avatar now">
              Make Your Avatar →
            </Link>
            <Link href="#" className="secondary-button" title="See how the event is approaching">
              Countdown to the Launch
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
    </>
  );
}
