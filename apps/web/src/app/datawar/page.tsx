import BasicInstructions from "@/components/DataWar/BasicInstructions";
import CountDown from "@/components/CountDown";
import FullInstructions from "@/components/DataWar/FullInstructions";
import LineUp from "@/components/DataWar/LineUp";
import Bento from "@/components/Bento";
import Window from '@/components/Window';
import { Suspense } from 'react';
import GetStarted, { type GetStartedProps } from '@/components/PrimaryFlow/GetStarted';
import { avatarBentoData } from '@/utils/constants';


export default async function Page() {
    return (
        <>
        <BasicInstructions/>

        <LineUp/>

        <FullInstructions />

        <section className="mb-4 landscape:mb-8 flex flex-col gap-4 landscape:flex-row landscape:gap-8">
          <Bento className="border-none h-full landscape:flex-1 landscape:h-auto">
            <Window className="bg-common-ash">
              <div className="p-4 landscape:p-12 flex flex-col gap-4">
                <h2 className="text-title-1 text-charcoal">DIY your own deck</h2>
                <p className="text-body-regular text-charcoal text-sm-custom">
                  Scissors + printer = game night unlocked. Download your own copy of Data War to cut up and blast off with right here.
                </p>
                <div>
                  <a href='#' title='Download the Deck!' className='text-sm-custom secondary-button 
                        border-charcoal text-charcoal hover:border-charcoal 
                        hover:bg-charcoal hover:text-common-ash
                        before:content-[""] before:inline-block before:bg-[url(/assets/images/icons/download-icon.webp)]
                        before:w-4 before:h-4 before:mr-2 before:bg-no-repeat before:bg-center before:bg-cover
                        hover:before:bg-[url(/assets/images/icons/download-icon-hover.webp)]
                  '>Download the Deck!</a>
                </div>
              </div>
            </Window>
          </Bento>
          <Bento
            image="/assets/images/data-war/bag.webp"
            imageAlt="Billionaire in a box"
            className="landscape:w-[30%] aspect-[377/275] border-none"
          />
        </section>
        <CountDown
        targetDate="2025-10-18T10:20:30-07:00"
        cta={
          <Suspense fallback={<div>Loading...</div>}>
            <GetStarted
              {...(avatarBentoData.primaryFlowData as GetStartedProps)}
              ctaText="Build a Billionaire"
              triggerClassNames="secondary-button"
            />
          </Suspense>
        }
      />
        </>
    );
}