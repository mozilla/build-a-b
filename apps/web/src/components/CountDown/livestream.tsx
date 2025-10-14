import { FC } from 'react';
import { socials } from '@/utils/constants';
import BrowserBento from '../BrowserBento';
import PoweredBy from '../PoweredBy';
import SocialNetwork from '@/components/SocialNetwork';
import RocketCountdown from './rocket-countdown';

export interface LivestreamProps {
  targetDate: string; // Format "2025-10-10T23:59:59-05:00"
  isLaunchCompleted: boolean;
}

const Livestream: FC<LivestreamProps> = ({ targetDate, isLaunchCompleted }) => {
  return (
    <BrowserBento gradient inverseElement="dots" bodyBg="bg-black">
      <div className="p-8 w-full">
        <h3 className="title-2 font-extrabold mb-4">Final launch sequence initiated&hellip;</h3>
        <p>
          On October 18 at TwitchCon, we blast our little Billionaires off-planet for good in an
          actual space launch. Be there… or be here–we’ll be showing it here, too.
        </p>

        {/** Livestream goes here!  **/}
        <RocketCountdown targetDate={targetDate} isLaunchCompleted={isLaunchCompleted} />

        {/** Bottom content */}
        <div className="flex flex-col items-start landscape:flex-row gap-6 landscape:justify-between landscape:items-center">
          <PoweredBy className="order-1 landscape:order-3" />
          <div className="flex flex-col landscape:flex-row landscape:items-center gap-6 order-2">
            <SocialNetwork socials={socials} isInModal />
            <div className="font-extrabold landscape:text-left flex flex-col landscape:flex-row landscape:gap-2">
              <span className="mb-2 landscape:mb-0 title-4">@firefox</span>
              <span className="hidden landscape:inline title-4">•</span>
              <span className="title-4">#BillionaireBlastOff</span>
            </div>
          </div>
        </div>
      </div>
    </BrowserBento>
  );
};

export default Livestream;
