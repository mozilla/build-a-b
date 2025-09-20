'use client';

import { FC, useEffect, useState } from 'react';
import Bento from '../Bento';
import Image from 'next/image';
import Link from 'next/link';

export interface CountDownProps {
  targetDate: string; // Format "2025-10-10T23:59:59-05:00"
}

const CountDown: FC<CountDownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });

  useEffect(() => {
    const end = new Date(targetDate).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, mins, secs });
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <section className="mb-4 landscape:mb-8">
      <Bento image="/assets/images/space.webp">
        <div className="relative p-4 landscape:p-8 landscape:pt-20 bg-gradient-to-r from-black to-transparent">
          <div className="flex flex-col landscape:flex-row gap-4 items-end">
            <div className="flex flex-col gap-4">
              <h2 className="text-title-1 text-balance">The Countdown is On</h2>
              <p className="text-body-regular">
                All the avatars, all the gameplay, all the satire — it all leads to this. A real
                rocket, built with Sent Into Space, carrying the absurd creations of a community
                that refused to play by Big Tech’s rules.
              </p>
            </div>
            <div className="max-w-full mx-auto landscape:min-w-[25rem] bg-gradient-to-r from-secondary-blue to-secondary-purple rounded-lg py-6 px-6">
              <dl className="flex justify-center gap-7 text-center" aria-live="polite">
                <div
                  className="flex flex-col-reverse relative
                             after:content-[':'] after:absolute after:right-[-1.2rem] after:top-[-0.15rem]
                             after:text-4xl-custom after:font-extrabold"
                >
                  <dt className="text-nav-item">Days</dt>
                  <dd className="tabular-nums text-title-1 text-[1.8rem] landscape:text-[2.25rem]">
                    {String(timeLeft.days).padStart(2, '0')}
                  </dd>
                </div>
                <div
                  className="flex flex-col-reverse relative
                             after:content-[':'] after:absolute after:right-[-1.2rem] after:top-[-0.15rem]
                             after:text-4xl-custom after:font-extrabold"
                >
                  <dt className="text-nav-item">Hours</dt>
                  <dd className="tabular-nums text-title-1 text-[1.8rem] landscape:text-[2.25rem]">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </dd>
                </div>
                <div
                  className="flex flex-col-reverse relative
                             after:content-[':'] after:absolute after:right-[-1.2rem] after:top-[-0.15rem]
                             after:text-4xl-custom after:font-extrabold"
                >
                  <dt className="text-nav-item">Mins</dt>
                  <dd className="tabular-nums text-title-1 text-[1.8rem] landscape:text-[2.25rem]">
                    {String(timeLeft.mins).padStart(2, '0')}
                  </dd>
                </div>
                <div className="flex flex-col-reverse">
                  <dt className="text-nav-item">Secs</dt>
                  <dd className="tabular-nums text-title-1 text-[1.8rem] landscape:text-[2.25rem]">
                    {String(timeLeft.secs).padStart(2, '0')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="flex flex-col landscape:flex-row gap-4 mt-6 p-4 landscape:mt-12 landscape:py-12 pr-12 rounded-lg bg-white border-2 border-foreground">
            <Image
              src="/assets/images/icons/rocket.webp"
              width={144}
              height={144}
              alt=""
              className="relative -ml-4 landscape:ml-auto"
            />
            <div className="flex flex-col gap-4 items-start">
              <p className="text-body-regular text-charcoal">
                Share your Billionaire shenanigans by Friday, October 10th with{' '}
                <strong>@Firefox</strong> and <strong>#BillionaireBlastOff</strong> for a chance to
                board the rocket! Every post gets your Billionaire closer to piercing the
                stratosphere on a rocket with only the noisiest little Billionaire avatars, streamed
                for the world to see, straight from TwitchCon. To the mooooon!
              </p>
              <Link
                href="#"
                title="Generate your own billionaire"
                className="secondary-button border-foreground text-foreground whitespace-nowrap"
              >
                Build a Billionaire
              </Link>
            </div>
          </div>
        </div>
      </Bento>
    </section>
  );
};

export default CountDown;
