'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import Bento from '../Bento';
import PoweredBy from '../PoweredBy';

export interface CountDownProps {
  targetDate: string; // Format "2025-10-10T23:59:59-05:00"
  className?: string;
  cta?: ReactNode;
  isLaunchCompleted: boolean;
}

const CountDown: FC<CountDownProps> = ({ targetDate, className, cta, isLaunchCompleted }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });

  const isLaunchReady = useMemo(() => Object.values(timeLeft).every((v) => v === 0), [timeLeft]);

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
    <section className={clsx('mb-4 landscape:mb-8', className)}>
      <Bento image="/assets/images/space.webp">
        <div
          className="relative p-4 landscape:p-12 landscape:py-16 bg-gradient-to-r from-black to-transparent
                     flex flex-col landscape:flex-row gap-18 justify-center items-center"
        >
          <div className="flex flex-col gap-4 items-start">
            <h2 className="text-title-1 text-balance">
              {isLaunchCompleted ? (
                <div className="flex flex-col items-left">
                  <span>We already don’t</span>
                  <span> miss you, Billionaires.</span>
                </div>
              ) : (
                'The Countdown is on'
              )}
            </h2>
            <p className="text-body-regular">
              {isLaunchCompleted
                ? 'You know? Watching something as it happens isn’t for everyone. Way to honor your time. (We recorded it if you want.)'
                : `All the Billionaires, all the gameplay, all the satire — it all leads to this. A real rocket, built with Sent Into Space, carrying the absurd creations of a community that refused to play by Big Tech's rules.`}
            </p>
            <div className="hidden landscape:block">{cta}</div>
          </div>
          <div className="w-full flex flex-col items-end relative">
            {isLaunchCompleted && (
              <Image
                src="/assets/images/intro-modal/10.webp"
                alt={`Floating character 10`}
                sizes="(max-width: 768px) 30vw, 20vw"
                width={223}
                height={223}
                className="absolute top-[-7rem] right-[-5rem] rotate-[-18deg] z-10 w-[10rem] h-[10rem]"
              />
            )}
            <div className="relative w-[calc(100%-2rem)] bg-gradient-to-r from-secondary-blue to-secondary-purple rounded-lg p-4 pl-8 landscape:p-6 landscape:w-fit">
              {isLaunchReady && isLaunchCompleted && (
                <p className="title-4 font-extrabold text-center">#BillionaireBlastOff</p>
              )}
              {isLaunchReady && !isLaunchCompleted && (
                <p className="title-4 font-extrabold text-center">Watch the Launch!</p>
              )}
              {!isLaunchReady && (
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
              )}
              <div className="absolute w-[4rem] h-[7rem] landscape:w-[6rem] landscape:h-[10rem] top-[-1.2rem] left-[-2rem] landscape:top-[-2.5rem] landscape:left-[-4rem] rotate-[16deg]">
                <Image src="/assets/images/rocket-countdown.webp" sizes="25vw" alt="Rocket" fill />
              </div>
            </div>
            <PoweredBy />
          </div>
          <div className="landscape:hidden w-full">{cta}</div>
        </div>
      </Bento>
    </section>
  );
};

export default CountDown;
