'use client';

import { choiceGroupMap } from '@/constants/choice-map';
import type { ChoiceGroup } from '@/types';
import Image from 'next/image';
import { type FC } from 'react';
import MeetAstroBento from '../../MeetAstroBento';
import { usePrimaryFlowContext } from '../PrimaryFlowContext';
import { useRouter } from 'next/navigation';

const CompletionScreen: FC = () => {
  const router = useRouter();
  const { userChoices, avatarData } = usePrimaryFlowContext();

  // Get all selected choices in the correct order
  const groupKeys = Object.keys(choiceGroupMap) as ChoiceGroup[];
  const selectedChoices = groupKeys
    .filter((group) => userChoices[group])
    .map((group) => userChoices[group]!);

  return (
    <div className="flex flex-col h-full min-h-screen landscape:min-h-0 justify-center items-center p-4 pb-8 pt-[2rem] landscape:py-10 landscape:px-0 relative">
      {/* Floating Icons */}
      {avatarData ? (
        /* When avatar is loaded, split icons: 3 to the left, 2 to the right (landscape) OR 3 top, 2 bottom (mobile) */
        <>
          {/* Mobile layout - 3 top, 2 bottom with staggered positioning */}
          <div className="landscape:hidden">
            {/* Top 3 icons */}
            <div className="absolute top-[7rem] left-1/2 -translate-x-1/2 flex gap-[2rem]">
              {selectedChoices.slice(0, 3).map((choice, index) => {
                const containerClasses = [
                  'w-[5.75rem] h-[5.75rem] translate-y-0 translate-x-[-0.5rem]',
                  'w-[5.75rem] h-[5.75rem] translate-y-[0.75rem] translate-x-0',
                  'w-[5.75rem] h-[5.75rem] translate-y-0 translate-x-[0.5rem]',
                ];
                const imageClasses = [
                  'w-full h-full object-contain rotate-[-8deg]',
                  'w-full h-full object-contain rotate-[12deg]',
                  'w-full h-full object-contain rotate-[-10deg]',
                ];
                return (
                  <div
                    key={index}
                    className={containerClasses[index]}
                    style={{
                      animation: `float ${3 + index * 0.5}s ease-in-out infinite ${index * 0.3}s`,
                    }}
                  >
                    <Image
                      src={choice.iconWhenConfirmed}
                      alt={choice.id}
                      width={92}
                      height={92}
                      className={imageClasses[index]}
                    />
                  </div>
                );
              })}
            </div>

            {/* Bottom 2 icons */}
            <div className="absolute bottom-[1.5rem] left-1/2 -translate-x-1/2 flex gap-[3rem]">
              {selectedChoices.slice(3, 5).map((choice, index) => {
                const containerClasses = [
                  'w-[5.75rem] h-[5.75rem] translate-y-[0.5rem] translate-x-[-1rem]',
                  'w-[5.75rem] h-[5.75rem] translate-y-[-0.5rem] translate-x-[1rem]',
                ];
                const imageClasses = [
                  'w-full h-full object-contain rotate-[9deg]',
                  'w-full h-full object-contain rotate-[-11deg]',
                ];
                return (
                  <div
                    key={index + 3}
                    className={containerClasses[index]}
                    style={{
                      animation: `float ${4 + index * 0.5}s ease-in-out infinite ${(index + 3) * 0.3}s`,
                    }}
                  >
                    <Image
                      src={choice.iconWhenConfirmed}
                      alt={choice.id}
                      width={92}
                      height={92}
                      className={imageClasses[index]}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Landscape layout - 3 left, 2 right with staggered positioning */}
          <div className="hidden landscape:block">
            {/* Left side icons (first 3) */}
            <div className="absolute left-[3.5rem] top-1/2 -translate-y-1/2">
              {selectedChoices.slice(0, 3).map((choice, index) => {
                const containerClasses = [
                  'w-[5.75rem] h-[5.75rem] absolute top-[-5.75rem] left-0',
                  'w-[5.75rem] h-[5.75rem] absolute top-[0.75rem] left-[7rem]',
                  'w-[5.75rem] h-[5.75rem] absolute top-[4.25rem] left-[3.5rem]',
                ];
                const imageClasses = [
                  'w-full h-full object-contain rotate-[-7deg]',
                  'w-full h-full object-contain rotate-[11deg]',
                  'w-full h-full object-contain rotate-[-9deg]',
                ];
                return (
                  <div
                    key={index}
                    className={containerClasses[index]}
                    style={{
                      animation: `float ${3 + index * 0.5}s ease-in-out infinite ${index * 0.3}s`,
                    }}
                  >
                    <Image
                      src={choice.iconWhenConfirmed}
                      alt={choice.id}
                      width={92}
                      height={92}
                      className={imageClasses[index]}
                    />
                  </div>
                );
              })}
            </div>

            {/* Right side icons (last 2) */}
            <div className="absolute right-[10rem] top-1/2 -translate-y-1/2">
              {selectedChoices.slice(3, 5).map((choice, index) => {
                const containerClasses = [
                  'w-[5.75rem] h-[5.75rem] absolute top-[-3.25rem] left-[3.5rem]',
                  'w-[5.75rem] h-[5.75rem] absolute top-[1.75rem] left-0',
                ];
                const imageClasses = [
                  'w-full h-full object-contain rotate-[8deg]',
                  'w-full h-full object-contain rotate-[-12deg]',
                ];
                return (
                  <div
                    key={index + 3}
                    className={containerClasses[index]}
                    style={{
                      animation: `float ${4 + index * 0.5}s ease-in-out infinite ${(index + 3) * 0.3}s`,
                    }}
                  >
                    <Image
                      src={choice.iconWhenConfirmed}
                      alt={choice.id}
                      width={92}
                      height={92}
                      className={imageClasses[index]}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* When loading, show icons in traditional layout */
        <>
          {/* Mobile layout - 3 top, 2 bottom */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 landscape:hidden">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                {selectedChoices.slice(0, 3).map((choice, index) => (
                  <div
                    key={index}
                    className="w-16 h-16"
                    style={{
                      animation: `float ${3 + index * 0.5}s ease-in-out infinite ${index * 0.3}s`,
                    }}
                  >
                    <Image
                      src={choice.iconWhenConfirmed}
                      alt={choice.id}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4">
                {selectedChoices.slice(3, 5).map((choice, index) => (
                  <div
                    key={index + 3}
                    className="w-16 h-16"
                    style={{
                      animation: `float ${4 + index * 0.5}s ease-in-out infinite ${(index + 3) * 0.3}s`,
                    }}
                  >
                    <Image
                      src={choice.iconWhenConfirmed}
                      alt={choice.id}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Landscape layout - all 5 in a row */}
          <div className="hidden landscape:block absolute top-8 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-6">
              {selectedChoices.map((choice, index) => (
                <div
                  key={index}
                  className="w-20 h-20"
                  style={{
                    animation: `float ${3.5 + index * 0.3}s ease-in-out infinite ${index * 0.25}s`,
                  }}
                >
                  <Image
                    src={choice.iconWhenConfirmed}
                    alt={choice.id}
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Avatar container - centered */}
      <div className="flex flex-col items-center gap-4 z-10 mt-[2.5rem] landscape:mt-0">
        <div className="w-[22.4375rem] h-[28.5rem] landscape:w-[28.6875rem] landscape:h-[28.6875rem] relative overflow-hidden rounded-[0.532rem]">
          {/* Avatar Background Image */}
          {avatarData && (
            <Image
              src={avatarData.url}
              alt="Generated Billionaire Avatar"
              fill
              className="object-cover object-top"
            />
          )}

          {/* MeetAstroBento overlay - for both mobile and landscape */}
          {avatarData && (
            <div className="absolute inset-x-0 bottom-4 px-4">
              <MeetAstroBento
                active={true}
                size="completion"
                activeContent={
                  <div>
                    <div className="text-lg font-bold mb-1">
                      Meet <span className="text-purple-600">{avatarData.name}</span>
                    </div>
                    <div className="text-sm">{avatarData.bio}</div>
                  </div>
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Loading message when no avatar */}
      {!avatarData && (
        <div className="absolute bottom-8 text-center">
          <h1 className="text-mobile-title-2 landscape:text-5xl-custom font-sharp font-bold text-common-ash mb-2">
            We&apos;re Minting Your Billionaire
          </h1>
          <p className="text-lg-custom landscape:text-regular-custom font-sharp font-bold text-common-ash/80 max-w-[20rem] landscape:max-w-[35rem] mx-auto">
            Assembling unchecked wealth...
          </p>
        </div>
      )}

      {/* Continue button - only show when avatar is generated */}
      {avatarData && (
        <button
          className="secondary-button absolute bottom-8 right-8"
          onClick={() => router.push(avatarData.homePath)}
        >
          Continue
        </button>
      )}
    </div>
  );
};

export default CompletionScreen;
