import { socials } from '@/utils/constants';
import PoweredBy from '../PoweredBy';
import SocialNetwork from '@/components/SocialNetwork';
import Window from '../Window';
import Bento from '../Bento';

const Livestream = () => {
  return (
    <Bento className="border-none">
      <Window
        className="bg-dark-charcoal"
        wrapperClassName="from-[#FFEA80]! to-[#FF8A50]! bborder-0!"
        headerClassName="border-0!"
        bulletsClassName="bg-[#F7B750]!"
      >
        <div className="p-4 landscape:p-8 w-full">
          <h3 className="text-mobile-title-2 font-extrabold mb-4">
            We have Billionaire Blast Off!
          </h3>
          <p className="text-lg-custom">
            It&apos;s one small step for a Billionaire, but one giant leap for your data freedom!
          </p>

          {/** YouTube Livestream **/}
          <Bento className="my-4 landscape:my-8 aspect-video">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/eqUxVAsA80k?autoplay=1&mute=1&playsinline=1&rel=0"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </Bento>

          {/** Bottom content */}
          <div className="flex flex-col items-start landscape:flex-row gap-4 landscape:justify-between landscape:items-center">
            <PoweredBy className="order-1 landscape:order-3" />
            <div className="flex flex-col landscape:flex-row landscape:items-center gap-4 order-2">
              <SocialNetwork socials={socials} isInModal />
              <div className="font-extrabold landscape:text-left flex flex-col landscape:flex-row landscape:gap-2">
                <span className="mb-2 landscape:mb-0 text-2xl-custom">@firefox</span>
                <span className="hidden landscape:inline text-2xl-custom">•</span>
                <span className="text-2xl-custom">#BillionaireBlastOff</span>
              </div>
            </div>
          </div>
        </div>
      </Window>
    </Bento>
  );
};

export default Livestream;
