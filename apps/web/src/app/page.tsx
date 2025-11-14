import { evaluateFlag } from '@/app/flags';
import { getUserAvatar } from '@/utils/actions/get-user-avatar';
import {
  avatarBentoData,
  COOKIE_NAME,
  tickerData,
  tickerDataAfterTwitchCon,
  tickerDataPhase4,
} from '@/utils/constants';
import { cookies } from 'next/headers';

import Image from 'next/image';

import BentoDual from '@/components/BentoDual';
import Bento from '@/components/Bento';
import CountDown from '@/components/CountDown';
import GalleryBentoLarge from '@/components/GalleryBentoLarge';
import GalleryBentoSmall from '@/components/GalleryBentoSmall';
import CuratedGalleryLarge from '@/components/GalleryBentoLarge/CuratedGalleryLarge';
import CuratedGallerySmall from '@/components/GalleryBentoSmall/CuratedGallerySmall';
import LinkButton from '@/components/LinkButton';
import AvatarBentoV2 from '@/components/PrimaryFlow/AvatarBentoV2';
import DataWarLaunchHero from '@/components/DataWarLaunchHero';
import Scrim from '@/components/Scrim';
import Ticker from '@/components/Ticker';
import VaultWrapper from '@/components/Vault/VaultWrapper';
import Window from '@/components/Window';
import { evaluatePhase2Flag } from '@/utils/helpers/evaluate-phase2-flag';
import { notFound } from 'next/navigation';
import LaunchRecording from '@/components/LaunchRecording';
import Livestream from '@/components/Livestream';
import {
  getRandomCuratedSelfies,
  getCuratedSelfiesCount,
} from '@/utils/helpers/get-curated-selfies';
import clsx from 'clsx';
import type { FC } from 'react';
import TwitchConRecapBento from '@/components/TwitchConRecapBento';

const OrangeCard: FC<{ isLaunchCompleted?: boolean; isPhase4?: boolean }> = ({
  isLaunchCompleted: _isLaunchCompleted,
  isPhase4,
}) => {
  return (
    <div className="h-full w-full p-3 bg-gradient-to-r from-[#ffea80] to-[#ff8a50] text-charcoal relative rounded-[0.75rem] border-2 border-[#f8f6f4]">
      <div className="h-full w-full border-2 border-[#00000040] rounded-[0.75rem] p-2 flex flex-col justify-center">
        <h2 className="text-[2.125rem] portrait:text-[1.825rem] leading-[2.5rem] font-extrabold">
          #BillionaireBlastOff
        </h2>
        <p className="text-[1.125rem] leading-[1.5rem] font-semibold">
          The Billionaires are in space. The coast is clear. Open What You Want.
        </p>
      </div>
      {!isPhase4 && (
        <LinkButton
          href="https://www.firefox.com/?utm_source=bbomicrosite&utm_medium=referral&utm_campaign=bbo"
          target="_blank"
          trackableEvent="click_firefox_owyw_logo"
        >
          <Image
            src="/assets/images/firefox-open.webp"
            width={120}
            height={43}
            alt=""
            className="absolute portrait:left-[calc(50%-3.75rem)] portrait:bottom-[0.5rem] landscape:right-12 landscape:bottom-1 w-[7.5rem] h-[2.6875rem]"
          />
        </LinkButton>
      )}
    </div>
  );
};

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ id?: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [
    showPlaypenButtons,
    isAtLeastPhase2ALive,
    isPhase2A,
    isPhase2B,
    isPhase2C,
    isLaunchCompleted,
    isPhase4,
  ] = await Promise.all([
    evaluateFlag('showAvatarPlaypenButtons'),
    evaluatePhase2Flag('a'),
    evaluateFlag('showPhase2aFeatures'),
    evaluateFlag('showPhase2bFeatures'),
    evaluateFlag('showPhase2cFeatures'),
    evaluatePhase2Flag('c'),
    evaluateFlag('showPhase4Features'),
  ]);

  const { id: idFromUrl } = await params;

  const queryParams = await searchParams;
  const searchTerm = queryParams.s;

  const cookieStore = await cookies();
  const userCookie = cookieStore.get(COOKIE_NAME);
  const userId = userCookie?.value;

  const effectiveUserId = idFromUrl || userId;
  const avatarData = effectiveUserId && !searchTerm ? await getUserAvatar(effectiveUserId) : null;

  if (idFromUrl && !userId && !avatarData) {
    return notFound();
  }

  // Phase 4: Get curated selfies for gallery
  const curatedSelfiesForGallery = isPhase4 ? getRandomCuratedSelfies(4) : [];
  const totalCuratedSelfiesCount = isPhase4 ? getCuratedSelfiesCount() : 0;
  const remainingCuratedCount = totalCuratedSelfiesCount - 4;

  return (
    <>
      {isPhase2A && !isPhase4 && <CountDown isPhase2B={isPhase2B} isPhase2C={isPhase2C} isPhase4={isPhase4} />}
      {isPhase2B && <Livestream />}
      {isPhase2C && <LaunchRecording />}

      <Ticker
        items={
          isPhase4 ? tickerDataPhase4 : isLaunchCompleted ? tickerDataAfterTwitchCon : tickerData
        }
        isPhase4={isPhase4}
      />

      <main className="portrait:flex portrait:flex-row portrait:flex-wrap portrait:justify-between landscape:mb-8 landscape:grid landscape:grid-cols-12 ${isPhase4 ? 'landscape:grid-rows-5' : 'landscape:grid-rows-6'} landscape:gap-8">
        <div
          className={`portrait:mb-4 portrait:w-full ${isPhase4 ? 'landscape:row-span-2' : 'landscape:row-span-3'} landscape:row-start-1 landscape:col-span-7`}
        >
          {isPhase4 ? (
            <DataWarLaunchHero />
          ) : (
            <AvatarBentoV2
              {...avatarBentoData}
              avatar={avatarData}
              isLaunchCompleted={isLaunchCompleted}
            />
          )}
        </div>
        <div
          className={`portrait:mb-4 portrait:w-full ${isPhase4 ? 'h-full landscape:h-[32rem] landscape:row-span-2' : 'h-[32rem] landscape:h-[39rem] landscape:row-span-3'} landscape:col-span-5 landscape:col-start-8 landscape:row-start-1`}
        >
          {isPhase2A ||
            (isPhase2B && (
              <BentoDual
                className="flex w-full h-full"
                back={
                  <Window flip>
                    <div className="p-4 landscape:p-8">
                      <h3 className="text-2xl-custom landscape:text-3xl-custom text-title-1 pb-4">
                        We&apos;re sending these Billionaires off-world, offline.
                      </h3>
                      <p>
                        On October 18th, a rocket of our own design will carry these little
                        Billionaire creations to the stratosphere, while we celebrate an internet
                        free from their Billionaire antics at the TwitchCon Block Party!
                      </p>
                      <p className="mt-4">
                        Build your own Billionaire to get in on the joke and follow{' '}
                        <strong>@firefox</strong> for updates leading up to the launch!
                      </p>
                    </div>
                  </Window>
                }
                effect="flip"
                image="/assets/images/rocket.webp"
                priority
              >
                <Scrim className="h-65 bg-contain!">
                  <h1 className="text-2xl-custom landscape:text-3xl-custom font-extrabold mr-4 landscape:mr-[2.5rem] mt-12 ml-4 landscape:ml-8">
                    Let&apos;s send these Billionaires to actual, for real-real space.
                  </h1>
                  <p className="text-regular-custom landscape:text-lg-custom mt-4 ml-4 landscape:ml-8 mr-[4rem] landscape:mr-[5.375rem]">
                    Join us during TwitchCon to watch us blast our little Billionaire creations into
                    space on a rocket of our own design.
                  </p>
                </Scrim>
              </BentoDual>
            ))}
          {isPhase2C && (
            <BentoDual
              className="flex w-full h-full"
              back={
                <Window flip>
                  <div className="p-4 landscape:p-8">
                    <h3 className="text-2xl-custom landscape:text-3xl-custom text-title-1 pb-4">
                      Two launches in one
                    </h3>
                    <p>
                      We launched a new card game, Data War, and we launched Billionaires into
                      space. Couldn&apos;t join us IRL at TwitchCon? Quell your FOMO right here.
                    </p>
                    <LinkButton
                      href="/twitchcon"
                      title="Visit TwitchCon page"
                      className="secondary-button mt-5 bg-[#1373b4] hover:bg-accent active:bg-accent"
                      trackableEvent="click_twitchcon_details_cta"
                    >
                      TwitchCon Recap
                    </LinkButton>
                  </div>
                </Window>
              }
              effect="flip"
              image="/assets/images/recap-twitchcon.webp"
              priority
            >
              <div className="bg-gradient-to-b from-black to-transparent h-[50%] w-full p-4 landscape:p-8">
                <p className="text-nav-item text-common-ash mt-4">RECAP</p>
                <h1 className="text-2xl-custom landscape:text-3xl-custom font-extrabold mr-4 landscape:mr-[2.5rem] mt-6">
                  TwitchCon was a blast!
                </h1>
                <p className="text-regular-custom landscape:text-lg-custom mt-4 mr-[4rem] landscape:mr-[5.375rem]">
                  Thanks for everything, San Diego.
                </p>
              </div>
            </BentoDual>
          )}
          {isPhase4 && <TwitchConRecapBento version="phase4" />}
        </div>
        {/* BBOOWYW Bento */}
        <div
          className={`${isPhase4 ? 'h-full aspect-[2/1] landscape:row-start-3' : 'h-[12rem] landscape:row-start-4'} portrait:mb-4 portrait:w-full landscape:col-span-4 landscape:col-start-1`}
        >
          {isPhase4 && <OrangeCard isPhase4 />}
          {isPhase2C && <OrangeCard />}
          {isPhase2A ||
            (isPhase2B && (
              <BentoDual className="h-full" effect="flip" back={<OrangeCard />}>
                <div className="h-full w-full px-6 flex flex-col justify-center bg-gradient-to-r from-secondary-blue to-secondary-purple">
                  <Image
                    src="/assets/images/icons/flip.svg"
                    alt="Flip card"
                    width={24}
                    height={24}
                    className="absolute landscape:hidden w-[2.625rem] h-[2.625rem] top-[0.2rem] right-[0.2rem]"
                  />
                  <h4 className="text-title-1 mb-3">
                    #Billionaire
                    <br className="landscape:hidden" />
                    BlastOff
                  </h4>
                  <p className="text-body-small">
                    Billionaires go to space on rockets fueled by your data. We know a better way.
                  </p>
                </div>
              </BentoDual>
            ))}
        </div>
        {/* Phase 2c: Data War module */}
        {/* Phase 4: Bye Bye Billionaires */}
        <div
          className={`portrait:mb-4 portrait:order-11 portrait:w-full
                      landscape:row-span-2
                      ${isPhase4 ? 'landscape:col-span-8 landscape:col-start-5 landscape:row-start-3' : isLaunchCompleted ? 'landscape:col-span-8 landscape:col-start-5 landscape:row-start-4' : 'landscape:col-span-4 landscape:col-start-5 landscape:row-start-4'}
                      `}
        >
          {isPhase4 ? (
            /* Phase 4: Condensed Bye Bye Billionaires */
            <Bento className="h-full" image="/assets/images/space.webp" imageSizes="100vw">
              <div
                className="relative h-full p-4 landscape:p-10
                              bg-gradient-to-t from-black from-[20%] to-transparent
                              landscape:bg-gradient-to-r flex gap-8 flex-col landscape:flex-row"
              >
                <div className="flex flex-col gap-4 landscape:gap-6 justify-end landscape:justify-center flex-1 pb-40 landscape:pb-0">
                  <h6 className="text-nav-item">Watch The Space Launch</h6>
                  <h1 className="text-title-1 text-3xl-custom landscape:text-4xl-custom">
                    Bye bye, Billionaires!
                  </h1>
                  <div className="w-full aspect-video landscape:hidden">
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/eqUxVAsA80k?playsinline=1&rel=0"
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <p className="text-body-large">
                    We did it, everyone. The Billionaires are now all safely off-planet and out of
                    your personal data. Now go be your quirky, curious, clever, creative selves and
                    Open What You Want.
                  </p>
                  <LinkButton
                    href="https://www.firefox.com/?utm_source=bbomicrosite&utm_medium=referral&utm_campaign=bbo"
                    target="_blank"
                    trackableEvent="click_firefox_owyw_logo"
                    className="relative block w-60 h-22 mx-auto landscape:mx-0"
                  >
                    <Image
                      src="/assets/images/firefox-open-white.webp"
                      fill
                      sizes="50vw"
                      alt=""
                      style={{ objectFit: 'contain' }}
                    />
                  </LinkButton>
                </div>
                <div className="hidden landscape:flex flex-col justify-center w-[40%]">
                  <div className="w-full aspect-video">
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/eqUxVAsA80k?playsinline=1&rel=0"
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none">
                {[
                  {
                    asset: 'animations/floater-footer.webp',
                    classNameMobile:
                      'absolute bottom-0 left-[12rem] h-15 w-15 rotate-[25deg] animate-float-tilt',
                    classNameDesktop:
                      'landscape:top-[4rem] landscape:left-auto landscape:right-[19rem] landscape:h-25 landscape:w-25',
                  },
                  {
                    asset: 'astronaut.webp',
                    classNameMobile:
                      'absolute bottom-[6rem] left-[6rem] h-20 w-20 animate-float-tilt',
                    classNameDesktop:
                      'landscape:bottom-auto landscape:top-[2rem] landscape:left-auto landscape:right-[2rem] landscape:h-30 landscape:w-30',
                  },
                  {
                    asset: 'animations/flier2-header.webp',
                    classNameMobile:
                      'absolute bottom-[5rem] right-0 h-25 w-25 -rotate-[10deg] animate-float-tilt-left',
                    classNameDesktop: 'landscape:right-0',
                  },
                  {
                    asset: 'upside-down.webp',
                    classNameMobile:
                      'absolute bottom-0 left-0 h-25 w-25 -rotate-[10deg] animate-float-tilt',
                    classNameDesktop:
                      'landscape:bottom-0 landscape:left-auto landscape:right-[17rem] landscape:h-40 landscape:w-40',
                  },
                ].map(({ asset, classNameMobile, classNameDesktop }, index) => (
                  <div
                    key={index}
                    className={clsx(classNameMobile, classNameDesktop)}
                    style={{ animationDuration: `${6 + Math.random() * 6}s` }}
                  >
                    <Image
                      src={`/assets/images/${asset}`}
                      alt={`Floating character ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 30vw, 20vw"
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </Bento>
          ) : (
            /* Phase 2c: Data War module */
            <BentoDual
              className="h-full aspect-square landscape:aspect-auto"
              effect="flip"
              image="/assets/images/data-war.webp"
              back={
                <Window flip>
                  <div className="p-4 landscape:p-8">
                    <h3 className="text-title-1 pb-4">Play Your Way to Inner Space Dominance</h3>
                    {!isAtLeastPhase2ALive ? (
                      <>
                        <p>
                          Data War is a game of Billionaire brinksmanship where space is the place,
                          data is the currency, and chaos reigns. Get your copy at TwitchCon!
                        </p>
                        <p className="mt-3">
                          <strong>COMING SOON</strong>
                        </p>
                      </>
                    ) : null}
                    {isAtLeastPhase2ALive && !isLaunchCompleted ? (
                      <>
                        <p>
                          Data War is a game of Billionaire brinksmanship where space is the place,
                          data is the currency, and chaos reigns. Dropping this week at TwitchCon!
                        </p>
                        <LinkButton
                          href="/datawar"
                          title="Learn more about the game"
                          className="secondary-button mt-5 bg-[#1373b4] hover:bg-accent active:bg-accent"
                          trackableEvent="click_go_to_datawar"
                        >
                          Check out Data War
                        </LinkButton>
                      </>
                    ) : null}
                    {isLaunchCompleted ? (
                      <>
                        <p>
                          Data War is a game of Billionaire brinksmanship where space is the place,
                          data is the currency, and chaos reigns. Just dropped at TwitchCon!
                        </p>
                        <LinkButton
                          href="/datawar"
                          title="Learn more about the game"
                          className="secondary-button mt-5 bg-[#1373b4] hover:bg-accent active:bg-accent"
                          trackableEvent="click_go_to_datawar"
                        >
                          Check out Data War
                        </LinkButton>
                      </>
                    ) : null}
                  </div>
                </Window>
              }
            >
              <div className="bg-gradient-to-t from-black to-transparent h-full w-full">
                <div className="absolute bottom-4 left-4 landscape:bottom-8 landscape:left-8">
                  <p className="text-nav-item pb-2">
                    {isAtLeastPhase2ALive ? 'JUST DROPPED!' : 'DROPPING SOON'}
                  </p>
                  <h2 className="text-title-1">
                    Data War:
                    <br />
                    The Card Game
                  </h2>
                </div>
              </div>
            </BentoDual>
          )}
        </div>
        {/* Default: Small Teaser Bento (Twitchcon) */}
        {isPhase2B && (
          <div className="portrait:mb-4 portrait:order-12 portrait:w-full landscape:row-span-2 landscape:col-span-4 landscape:col-start-9 landscape:row-start-4">
            <BentoDual
              className="h-full aspect-square"
              effect="flip"
              image="/assets/images/blast-twitchcon.webp"
              back={
                <Window flip>
                  <div className="p-4 landscape:p-8">
                    <h3 className="text-title-1 pb-4">Two Launches in One</h3>
                    <p>
                      We&apos;re launching a new card game, Data War, and launching Billionaires to
                      space, one way. Join us IRL at TwitchCon or right here on this site to follow
                      along.
                    </p>
                    <LinkButton
                      href="/twitchcon"
                      title="Visit TwitchCon page"
                      className="secondary-button mt-5 bg-[#1373b4] hover:bg-accent active:bg-accent"
                      trackableEvent="click_twitchcon_details_cta"
                    >
                      TwitchCon Details
                    </LinkButton>
                  </div>
                </Window>
              }
            >
              <div className="bg-gradient-to-t from-black to-transparent h-full w-full">
                <div className="absolute bottom-4 left-4 landscape:bottom-8 landscape:left-8">
                  <p className="text-nav-item pb-2">JOIN US IRL</p>
                  <h2 className="text-title-1">
                    Blast off at
                    <br />
                    TwitchCon
                  </h2>
                </div>
              </div>
            </BentoDual>
          </div>
        )}
        {/* Phase 4: Curated selfies gallery */}
        {/* Default: User selfies gallery */}
        {isPhase4 ? (
          <>
            <div
              className={`portrait:mb-4 portrait:w-full landscape:row-span-2 landscape:col-span-4 landscape:col-start-1 landscape:row-start-4 portrait:aspect-square landscape:aspect-square landscape:h-full`}
            >
              <CuratedGalleryLarge className="h-full" image={curatedSelfiesForGallery[0]?.path} />
            </div>
            <div
              className={`aspect-square portrait:mb-4 portrait:w-[48%] landscape:col-span-2 landscape:col-start-5 landscape:row-start-5`}
            >
              <CuratedGallerySmall image={curatedSelfiesForGallery[1]?.path} currentIndex={1} />
            </div>
            <div
              className={`aspect-square portrait:mb-4 portrait:w-[48%] landscape:col-span-2 landscape:col-start-7 landscape:row-start-5`}
            >
              <CuratedGallerySmall image={curatedSelfiesForGallery[2]?.path} currentIndex={2} />
            </div>
            <div
              className={`aspect-square portrait:mb-4 portrait:w-[48%] landscape:col-span-2 landscape:col-start-9 landscape:row-start-5`}
            >
              <CuratedGallerySmall image={curatedSelfiesForGallery[3]?.path} currentIndex={3} />
            </div>
            <div
              className={`aspect-square portrait:mb-4 portrait:w-[48%] landscape:col-span-2 landscape:col-start-11 landscape:row-start-5`}
            >
              <CuratedGallerySmall
                image={curatedSelfiesForGallery[4]?.path}
                currentIndex={4}
                showCount
                count={remainingCuratedCount}
              />
            </div>
          </>
        ) : (
          <>
            <div
              className={`${showPlaypenButtons ? '' : 'portrait:hidden'} portrait:mb-4 portrait:w-full landscape:row-span-2 landscape:col-span-4 landscape:col-start-1 landscape:row-start-5'`}
            >
              <GalleryBentoLarge
                className="h-full"
                disabled={!avatarData || avatarData.selfies?.length > 0}
                image={avatarData?.selfies?.[0]?.asset ?? undefined}
              />
            </div>
            <div
              className={`${showPlaypenButtons ? '' : 'portrait:hidden'} portrait:mb-4 portrait:w-[48%] landscape:col-span-2 landscape:col-start-5 landscape:row-start-6`}
            >
              <GalleryBentoSmall
                image={avatarData?.selfies?.[1]?.asset ?? '/assets/images/placeholders/diamond.jpg'}
                isActive={!!avatarData?.selfies?.[1]?.asset}
                currentIndex={1}
              />
            </div>
            <div
              className={`${showPlaypenButtons ? '' : 'portrait:hidden'} portrait:mb-4 portrait:w-[48%] landscape:col-span-2 landscape:col-start-7 landscape:row-start-6`}
            >
              <GalleryBentoSmall
                image={avatarData?.selfies?.[2]?.asset ?? '/assets/images/placeholders/rocket.jpg'}
                isActive={!!avatarData?.selfies?.[2]?.asset}
                currentIndex={2}
              />
            </div>
            <div
              className={`${showPlaypenButtons ? '' : 'portrait:hidden'} portrait:mb-4 portrait:w-[48%] landscape:col-span-2 landscape:col-start-9 landscape:row-start-6`}
            >
              <GalleryBentoSmall
                image={avatarData?.selfies?.[3]?.asset ?? '/assets/images/placeholders/crown.jpg'}
                isActive={!!avatarData?.selfies?.[3]?.asset}
                currentIndex={3}
              />
            </div>
            <div
              className={`${showPlaypenButtons ? '' : 'portrait:hidden'} portrait:mb-4 portrait:w-[48%] landscape:col-span-2 landscape:col-start-11 landscape:row-start-6`}
            >
              <GalleryBentoSmall
                image={avatarData?.selfies?.[4]?.asset ?? '/assets/images/placeholders/meteor.jpg'}
                isActive={!!avatarData?.selfies?.[4]?.asset}
                currentIndex={4}
              />
            </div>
          </>
        )}
        {/* Default: Countdown */}
        {!isAtLeastPhase2ALive && !isPhase4 && (
          <div className="portrait:order-13 landscape:col-span-12">
            <CountDown
              className="landscape:mb-0!"
              isPhase2B={isPhase2B}
              isPhase2C={isPhase2C}
              isPhase4={isPhase4}
              cta={
                <LinkButton
                  href="/twitchcon"
                  title="Learn more about the launch"
                  className="secondary-button flex"
                  trackableEvent="click_space_launch_details_cta"
                >
                  Space Launch Details
                </LinkButton>
              }
            />
          </div>
        )}
      </main>
      <VaultWrapper />
    </>
  );
}
