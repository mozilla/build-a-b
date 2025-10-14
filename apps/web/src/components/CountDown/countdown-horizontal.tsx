import { FC, ReactNode } from 'react';
import Bento from '../Bento';
import RocketCountdown from './rocket-countdown';

export interface CountDownHorizontalProps {
  targetDate: string; // Format "2025-10-10T23:59:59-05:00"
  cta?: ReactNode;
  isLaunchCompleted: boolean;
}

const CountDownHorizontal: FC<CountDownHorizontalProps> = ({
  targetDate,
  cta,
  isLaunchCompleted,
}) => {
  return (
    <Bento image="/assets/images/space.webp">
      <div
        className="relative p-4 landscape:p-12 landscape:py-16 bg-gradient-to-r from-black to-transparent
                     flex flex-col landscape:flex-row gap-18 justify-center items-center"
      >
        <div className="flex flex-col gap-4 items-start">
          <h2 className="text-title-1 text-balance">
            {isLaunchCompleted ? (
              <div className="flex flex-col items-left">
                <span>We already don&apos;t</span>
                <span> miss you, Billionaires.</span>
              </div>
            ) : (
              'The countdown is on'
            )}
          </h2>
          <p className="text-body-regular">
            {isLaunchCompleted
              ? 'You know? Watching something as it happens isn’t for everyone. Way to honor your time. (We recorded it if you want.)'
              : `All the Billionaires, all the gameplay, all the satire — it all leads to this. A real rocket, built with Sent Into Space, carrying the absurd creations of a community that refused to play by Big Tech's rules.`}
          </p>
          <div className="hidden landscape:block">{cta}</div>
        </div>
        <RocketCountdown targetDate={targetDate} isLaunchCompleted={isLaunchCompleted} />
        <div className="landscape:hidden w-full">{cta}</div>
      </div>
    </Bento>
  );
};

export default CountDownHorizontal;
