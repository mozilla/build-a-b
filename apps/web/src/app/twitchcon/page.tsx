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
            Build your absurd billionaire avatar. Play the game they don’t want you to win — whether
            you’re in San Diego or tuning in from anywhere.
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
              eros elementum tristique.{' '}
            </p>
          </IconCard>,
          <IconCard
            key="2"
            image="/assets/images/night-sky.webp"
            icon="/assets/images/icons/star.webp"
          >
            <h4 className="text-title-3">Party at the bar</h4>
            <p className="text-body-regular">
              We’re taking over Rockin Baja Lobster in the heart of the Gaslamp district.{' '}
            </p>
          </IconCard>,
        ]}
      >
        <h2 className="text-title-1">Block party highlights</h2>
        <p className="text-body-regular">
          On October 18 at 8:30 PM, the launch film premieres... If you’re at TwitchCon, catch the
          secret screening at the Party. If you’re anywhere else, the only place to watch is right
          here.
        </p>
      </CardsSection>
    </>
  );
}
