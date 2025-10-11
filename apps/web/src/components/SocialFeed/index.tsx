import { socials } from '@/app/layout';
import Script from 'next/script';
import type { FC } from 'react';
import BrowserBento from '../BrowserBento';
import PoweredBy from '../PoweredBy';
import SocialNetwork from '../SocialNetwork';

type SocialFeedProps = {
  refId: string;
  src: string;
};

const SocialFeed: FC<SocialFeedProps> = ({ refId, src }) => {
  return (
    <>
      <Script id="EmbedSocialHashtagScript" src={src} />

      <BrowserBento
        className="relative w-full mb-8"
        gradient
        inverseElement="dots"
        bodyBg="bg-black"
      >
        <div className="p-8 w-full">
          {/** Heading */}
          <h3 className="title-2 font-extrabold mb-4">TwitchCon behind the scenes</h3>
          <p>
            From the heart of TwitchCon straight to your joyscrolling thumbs. Follow for all the
            updates, gameplay, space launch chatter, and more.
          </p>
          {/** EmbedSocial feed */}
          <div className="embedsocial-hashtag" data-ref={refId} />
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
    </>
  );
};

export default SocialFeed;
