import Image from 'next/image';
import HeaderBanner from '@/components/HeaderBanner';

import Avatar from '@/components/Avatar';

const Hero = () => {
  return (
    <div className="hero-container flex flex-col shrink-0 w-full min-h-screen">
      <div className="hero-grid absolute w-screen min-h-screen top-0 left-0 shrink-0 bg-cover bg-[url(/hero/grid.png)]"></div>
      <div
        className="hero-background absolute left-0 top-0 bg-[url(/hero/grain-main-1440x1024.png)] shrink-0
                   w-screen min-h-screen mix-blend-soft-light"
      ></div>
      <div className="hero-content flex flex-col max-w-[1312px] justify-center">
        <HeaderBanner />
      </div>

      <div className="choice-bento-container flex flex-col w-full h-[593px] mt-[32px]">
        <div
          className="ui-status-bar relative flex items-center justify-center w-full h-[35px] rounded-t-[12px]
                     bg-gradient-to-r from-[var(--secondary-blue)] to-[var(--secondary-purple)]"
        >
          <div className="ui-content flex items-center w-[1277px] h-[32px] rounded-t-[12px] bg-[url(/hero/NightSkyStatusBar.png)]">
            <div className="buttons-status-container flex w-[52px] justify-between ml-[14px]">
              <div className="button h-[11px] w-[11px] rounded-[100px] border-[2px] border-[var(--secondary-blue)]"></div>
              <div className="button h-[11px] w-[11px] rounded-[100px] border-[2px] border-[var(--secondary-blue)]"></div>
              <div className="button h-[11px] w-[11px] rounded-[100px] border-[2px] border-[var(--secondary-blue)]"></div>
            </div>
          </div>
        </div>
        <div
          className="choice-bento-content-container relative flex items-center justify-center w-full h-[558px]
                     rounded-b-[12px] bg-gradient-to-r from-[var(--secondary-blue)] to-[var(--secondary-purple)]"
        >
          <div className="choice-bento-content relative rounded-b-[12px] w-[1277px] h-[554px] bg-[url(/hero/NightSky.png)] bg-cover">
            <Image
              className="-rotate-15 absolute top-[107px] left-[144px]"
              src="/hero/Build-a-Billionaire.png"
              width={416}
              height={200}
              alt="Build a Billionaire"
            />
            <Avatar
              path="/hero/1@4x.png"
              width={149}
              height={222}
              alt="Build a Billionaire Avatar"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

{
  /* <Image
  className="absolute top-[42px] left-[78px] aspect-[49/73] animate-[bounce_2.5s_ease-in_infinite]"
  src="/hero/1@4x.png"
  width={149}
  height={222}
  alt="Build a Billionaire"
/> */
}
