import CountDown from '@/components/CountDown';
import Hero from '@/components/Hero';
import Link from 'next/link';

export default async function Page() {
  return (
    <>
      <CountDown />
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
    </>
  );
}
