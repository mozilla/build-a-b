import Bento from '@/components/Bento';
import Image from 'next/image';
import ListItemCard from '@/components/DataWar/ListItemCard';
import { evaluateFlag } from '@/app/flags';
import LinkButton from '@/components/LinkButton';

const BasicInstructions = async () => {
  const isPhase4 = await evaluateFlag('showPhase4Features');

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
            {isPhase4 ? 'Data War: Physical Edition' : 'This is Data War!'}
          </h1>
          <div className="flex flex-row justify-start flex-wrap content-end items-end gap-5 mt-2">
            <div className="border-common-ash border-1 rounded-xl p-2 text-sm-custom">
              <span>Players</span>
              <br />
              <span className="font-bold text-lg-custom">2-4</span>
            </div>
            <div className="border-common-ash border-1 rounded-xl p-2 text-sm-custom">
              <span>Time</span>
              <br />
              <span className="font-bold text-lg-custom">5-15 </span>min
            </div>
          </div>
        </div>

        <div className="block relative w-[15.25rem] h-[auto] order-1 landscape:order-2">
          <Image
            src="/assets/images/data-war/chaz-icons.webp"
            alt="billionaire icon"
            width={308}
            height={266}
            className="block absolute -right-27 -top-15 landscape:-right-16 landscape:-top-18 w-[19.25rem] h-[auto]"
          />
        </div>
      </div>
      <div className="mt-4">
        <p>
          Get ready for the most world-dominating, market-manipulating bonanza of boilerplate
          Billionaire behavior ever packaged in a card game. Read below for full physical edition
          instructions, and play Data War Digital, live now and free to play in your browser!
        </p>
      </div>

      <div className="flex flex-col gap-4 landscape:flex-row justify-between mt-4">
        <div>
          <Bento
            image="/assets/images/data-war/cards.webp"
            imageAlt="Data War cards"
            className="w-[20.5rem] landscape:w-[30.5rem] border-none aspect-square"
          />
        </div>
        <div className="flex flex-col gap-4 justify-between flex-1">
          <ListItemCard
            imageAlt="Infinite icon"
            imageSrc="/assets/images/data-war/infinite-icon.webp"
            text="Like Classic War with infinite twists and drama."
          />
          <ListItemCard
            imageAlt="Fire Dice icon"
            imageSrc="/assets/images/data-war/fire-dice-icon.webp"
            text="Casual and chaotic with chained effects for sudden shifts in power."
          />
          <ListItemCard
            imageAlt="Rocket icon"
            imageSrc="/assets/images/data-war/rocket-icon.webp"
            text="Collect all win conditions and blast your Billionaire off into space!"
          />
        </div>
      </div>

      <div className="border-common-ash rounded-xl border-2 mt-4 landscape:mt-8 landscape:p-6 flex flex-col landscape:flex-row landscape:justify-between gap-4 landscape:gap-12 landscape:items-center">
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
            <h3 className="font-bold text-title-3">Want to play Data War?</h3>
            <p className="text-sm-custom">
              The only way to get a physical copy of Data War was at TwitchCon 2025, but you can
              download your own DIY deck to play at home!
            </p>
          </div>
        </div>
        <div className="landscape:w-1/2 flex portrait:flex-col portrait:gap-4 portrait:p-4 portrait:mb-4 landscape:flex-row landscape:gap-4 landscape:justify-end">
          <LinkButton
            href={process.env.NEXT_PUBLIC_DATAWAR_PDF_URL || ''}
            title="Get your own game cards"
            target="_blank"
            className='secondary-button border-common-ash text-common-ash hover:bg-common-ash hover:text-charcoal landscape:w-fit
                      before:content-[""] before:inline-block before:w-4 before:h-4 before:mr-2
                      before:bg-current before:mask-[url(/assets/images/icons/download.svg)]
                      before:mask-no-repeat before:mask-center before:mask-contain'
            trackableEvent="click_download_deck_datawar_hero"
          >
            Download the Deck!
          </LinkButton>
          <LinkButton
            href="/datawar"
            title="Go to Data War Details"
            className="secondary-button border-common-ash text-common-ash hover:bg-common-ash hover:text-charcoal"
          >
            See Game Details
          </LinkButton>
        </div>
      </div>
    </Bento>
  );
};

export default BasicInstructions;
