import Hero from '@/components/Hero';
import Link from 'next/link';

export default async function Page() {
  return (
    <>
      <Hero image="/assets/images/hero-twitchcon.webp">
        <div className="relative flex flex-col p-10 h-full justify-center bg-gradient-to-r from-black to-transparent gap-4 max-w-4xl">
          <h1 className="text-title-1">Catch Billionaire Blastoff at TwitchCon 2025</h1>
          <p className="text-body-regular">
            Build your absurd billionaire avatar. Play the game they don’t want you to win — whether
            you’re in San Diego or tuning in from anywhere.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="primary-button">
              Make Your Avatar →
            </Link>
            <Link href="#" className="secondary-button">
              Countdown to the Launch
            </Link>
          </div>
        </div>
      </Hero>
    </>
  );
}
