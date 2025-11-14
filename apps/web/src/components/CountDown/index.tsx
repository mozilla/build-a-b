import clsx from 'clsx';
import { FC, ReactNode } from 'react';
import Bento from '../Bento';
import RocketCountdown from './rocket-countdown';

export interface CountDownProps {
  className?: string;
  cta?: ReactNode;
  isPhase2B: boolean;
  isPhase2C: boolean;
  isPhase4: boolean;
}

const CountDown: FC<CountDownProps> = ({ className, cta, isPhase2B, isPhase2C, isPhase4 }) => {
  return (
    <section className={clsx('mb-4 landscape:mb-8', className)}>
      <Bento image="/assets/images/space.webp">
        <div
          className="relative p-4 landscape:p-12 landscape:py-16 bg-gradient-to-r from-black to-transparent
                     flex flex-col landscape:flex-row gap-18 justify-center items-center"
        >
          <div className="flex flex-col gap-4 items-start">
            <h2 className="text-title-1 text-balance">
              <div className="flex flex-col items-left">
                <span>We already don&apos;t</span>
                <span> miss you, Billionaires.</span>
              </div>
            </h2>
            <p className="text-body-regular">
              Even if you didn&apos;t make it IRL or online for the launch, we&apos;ve stashed the
              footage in a super secret place, on our home page, for everyone to see.
            </p>
            {!isPhase4 && <div className="hidden landscape:block">{cta}</div>}
          </div>
          <RocketCountdown isPhase2B={isPhase2B} isPhase2C={isPhase2C} isPhase4={isPhase4} />
          {!isPhase4 && <div className="landscape:hidden w-full">{cta}</div>}
        </div>
      </Bento>
    </section>
  );
};

export default CountDown;
