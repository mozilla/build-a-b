'use client';

import { FC, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import PoweredBy from '../PoweredBy';
import { fallbackRocketLaunchDate } from '@/utils/constants';

export interface RocketCountdownProps {
  isPhase2B: boolean;
  isPhase2C: boolean;
  isPhase4: boolean;
}

const RocketCountdown: FC<RocketCountdownProps> = ({ isPhase2B, isPhase2C, isPhase4 }) => {
  const targetDate = process.env.NEXT_PUBLIC_ROCKET_LAUNCH_DATE || fallbackRocketLaunchDate;

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
    <div className="w-full flex flex-col items-end relative pr-12">
      <Image
        src="/assets/images/intro-modal/10.webp"
        alt={`Floating character 10`}
        sizes="(max-width: 768px) 30vw, 20vw"
        width={223}
        height={223}
        className="absolute top-[-6rem] right-[-2rem] rotate-[-18deg] z-10 w-[10rem] h-[10rem]"
      />
      <div className="relative w-[calc(100%-2rem)] bg-gradient-to-r from-secondary-blue to-secondary-purple rounded-lg p-4 pl-8 landscape:p-6 landscape:w-fit">
        {/* {(isPhase2B || (isLaunchReady && !isPhase2B && !isPhase2C && !isPhase4)) && (
          <p className="title-4 font-extrabold text-center">Watch the Launch!</p>
        )} */}
        <p className="title-4 font-extrabold text-center">#BillionaireBlastOff</p>
        {/* {!isLaunchReady && !isPhase2B && !isPhase2C && !isPhase4 && (
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
        )} */}
        <div className="absolute w-[4rem] h-[7rem] landscape:w-[6rem] landscape:h-[10rem] top-[-1.2rem] left-[-2rem] landscape:top-[-2.5rem] landscape:left-[-4rem] rotate-[16deg]">
          <Image src="/assets/images/rocket-countdown.webp" sizes="25vw" alt="Rocket" fill />
        </div>
      </div>
      <PoweredBy />
    </div>
  );
};

export default RocketCountdown;
