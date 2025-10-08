import Bento from '@/components/Bento';
import Image from 'next/image';
import ListItemCard from '@/components/DataWar/ListItemCard';

const BasicInstructions = () => {
  return (
    <Bento
      className="bg-cover bg-[url(/assets/images/nebula-vertical.webp)] landscape:bg-[url(/assets/images/nebula.webp)] 
                        relative portrait:mt-8 mb-4 landscape:mb-8 pl-3 pr-4 pt-4 pb-4 landscape:pl-12 landscape:pr-12
                        landscape:pt-12 landscape:pb-12 overflow-visible"
    >
      <div className="relative flex flex-col landscape:flex-row landscape:justify-between">
        <div className="portrait:mt-40 landscape:order-1 order-2">
          <h6 className="text-nav-item">Data War Instructions</h6>
          <h1 className="text-title-1 landscape:text-5xl-custom landscape:text-6xl-custom">
            This is Data War!
          </h1>
          <div className="flex flex-row justify-start flex-wrap content-end items-end gap-5 mt-2">
            <div className="border-common-ash border-1 rounded-xl p-2 text-sm-custom">
              <span>Payers</span>
              <br />
              <span className="font-bold text-lg-custom">2-4</span>
            </div>
            <div className="border-common-ash border-1 rounded-xl p-2 text-sm-custom">
              <span>Time</span>
              <br />
              <span className="font-bold text-lg-custom">5-15 </span>min
            </div>
            <div className="landscape:ml-10 flex flex-row items-center text-sm-custom">
              <span>Powered By</span>
              <span className="inline-block ml-2 relative w-[4.491rem] h-[1.5rem] landscape:w-[5.389rem] landscape:h-[1.8rem]">
                <Image src="/assets/images/firefox-logo.png" alt="Firefox logo" sizes="10vw" fill />
              </span>
            </div>
          </div>
        </div>

        <div className="block relative w-[15.25rem] h-[auto] order-1 landscape:order-2">
          <Image
            src="/assets/images/data-war/billionaire-icon.webp"
            alt="billionaire icon"
            width={308}
            height={266}
            className="block absolute -right-27 -top-15 landscape:-right-16 landscape:-top-18 w-[19.25rem] h-[auto]"
          />
        </div>
      </div>
      <div className="mt-4">
        <p>
          Get ready for the world-dominating, market-manipulating bonanza of boilerplate Billionaire
          behavior ever packaged in a card game. Read below for full instructions, or go to the Data
          War Detail page to learn how to get your official deck.
        </p>
      </div>

      <div className="flex flex-col gap-4 landscape:flex-row justify-between mt-4">
        <div>
          <Bento
            image="/assets/images/data-war/cards.webp"
            imageAlt="Data war cards"
            className="w-[20.5rem] landscape:w-[30.5rem] border-none aspect-square"
          ></Bento>
        </div>
        <div className="flex flex-col gap-4 justify-between">
          <ListItemCard
            imageAlt="Infinite icon"
            imageSrc="/assets/images/data-war/infinite-icon.webp"
            text="Like Classic War with infinite twists and drama."
            className="text-charcoal"
          />
          <ListItemCard
            imageAlt="Fire Dice icon"
            imageSrc="/assets/images/data-war/fire-dice-icon.webp"
            text="Casual and chaotic with chained effects sudden shifts in power."
            className="text-charcoal"
          />
          <ListItemCard
            imageAlt="Rocket icon"
            imageSrc="/assets/images/data-war/rocket-icon.webp"
            text="Collect all win conditions and blast your Billionaire off into space!"
            className="text-charcoal"
          />
        </div>
      </div>

      <div className="border-common-ash rounded-xl border-2 mt-4 landscape:p-6 flex flex-col landscape:flex-row landscape:justify-between gap-4 landscape:items-center">
        <div className="flex flex-col p-4 landscape:p-0 landscape:flex-row justify-start landscape:justify-between gap-4 landscape:content-center landscape:items-center landscape:w-2/3">
          <div className="w-20 h-20">
            <Image
              src="/assets/images/icons/deck.webp"
              alt="Icon for deck"
              width={80}
              height={80}
              className="w-full h-auto"
            />
          </div>
          <div>
            <h3 className="font-bold text-title-3">Want a deck of your own?</h3>
            <p className="text-sm-custom">
              Right now, the only way to get an official copy of Data War is at TwitchCon 2025, but
              there are other ways to play and new versions dropping soon!
            </p>
          </div>
        </div>
        <div className="landscape:w-1/3 portrait:flex portrait:flex-col portrait:gap-4 portrait:p-4 portrait:mb-4">
          <a
            href="#"
            title="Go to Data War Details"
            className="secondary-button border-common-ash text-common-ash hover:bg-common-ash hover:text-charcoal"
          >
            Data War Details
          </a>
          <a
            href="/twitchcon"
            title="Go to TwitchCon detail page"
            className="landscape:ml-4 secondary-button border-common-ash text-common-ash hover:bg-common-ash hover:text-charcoal"
          >
            TwitchCon Details
          </a>
        </div>
      </div>
    </Bento>
  );
};

export default BasicInstructions;
