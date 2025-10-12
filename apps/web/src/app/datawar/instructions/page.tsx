import { evaluateFlag } from '@/app/flags';
import Bento from '@/components/Bento';
import CountDown from '@/components/CountDown';
import BasicInstructions from '@/components/DataWar/BasicInstructions';
import FullInstructions from '@/components/DataWar/FullInstructions';
import LineUp from '@/components/DataWar/LineUp';
import LinkButton from '@/components/LinkButton';
import GetStarted, { type GetStartedProps } from '@/components/PrimaryFlow/GetStarted';
import Window from '@/components/Window';
import { avatarBentoData } from '@/utils/constants';
import { evaluatePhase2Flag } from '@/utils/helpers/evaluate-phase2-flag';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export default async function Page() {
  // Check if DataWar feature is enabled
  const [shouldDisplayLaunchCta, isDataWarEnabled, isLaunchCompleted] = await Promise.all([
    evaluatePhase2Flag('a'),
    evaluateFlag('showDataWar'),
    evaluatePhase2Flag('c'),
  ]);

  if (!isDataWarEnabled) {
    notFound();
  }
  return (
    <>
      <BasicInstructions />

      <LineUp />

      <FullInstructions />

      <section className="mb-4 landscape:mb-8 flex flex-col gap-4 landscape:flex-row landscape:gap-8">
        <Bento className="border-none h-full landscape:flex-1 landscape:h-auto">
          <Window className="bg-common-ash">
            <div className="p-4 landscape:p-12 flex flex-col gap-4">
              <h2 className="text-title-1 text-charcoal">DIY your own deck</h2>
              <p className="text-body-regular text-charcoal">
                Scissors + printer = game night unlocked. Download your own copy of Data War to cut
                up and blast off with right here.
              </p>
              <div>
                <LinkButton
                  href="https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/assets/datawar-full-game.pdf"
                  title="Get your own cards game"
                  download
                  className='secondary-button landscape:w-fit
                           border-charcoal text-charcoal hover:border-charcoal
                             hover:bg-charcoal hover:text-common-ash
                             before:content-[""] before:inline-block before:w-4 before:h-4 before:mr-2
                             before:bg-current before:mask-[url(/assets/images/icons/download.svg)]
                             before:mask-no-repeat before:mask-center before:mask-contain'
                  // trackableEvent="click_download_datawar_deck"
                >
                  Download the Deck!
                </LinkButton>
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
        isLaunchCompleted={isLaunchCompleted}
        cta={
          shouldDisplayLaunchCta ? (
            <LinkButton href="/" className="secondary-button flex">
              Watch the Launch!
            </LinkButton>
          ) : (
            <Suspense fallback={<div>Loading...</div>}>
              <GetStarted
                {...(avatarBentoData.primaryFlowData as GetStartedProps)}
                ctaText="Build a Billionaire"
                triggerClassNames="secondary-button"
              />
            </Suspense>
          )
        }
      />
    </>
  );
}
