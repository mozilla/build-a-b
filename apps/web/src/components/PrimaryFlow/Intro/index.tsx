'use client';

import { choiceGroupMap, choiceMap } from '@/constants/choice-map';
import type { ChoiceConfig, ChoiceGroup } from '@/types';
import { generateAvatar } from '@/utils/actions/generate-avatar';
import { Button } from '@heroui/react';
import Image from 'next/image';
import { useCallback, type FC } from 'react';
import { usePrimaryFlowContext } from '../PrimaryFlowContext';
import { floatingImages } from './constants';
import Scrim from '@/components/Scrim';

export interface IntroProps {
  title: string;
  description: string;
  createAvatarCtaText: string;
  randomAvatarCtaText: string;
}

const Intro: FC<IntroProps> = ({
  title,
  description,
  createAvatarCtaText,
  randomAvatarCtaText,
}) => {
  const { setActiveGroup, setUserChoices, setAvatarData, reset } = usePrimaryFlowContext();

  const generateRandomAvatar = useCallback(() => {
    const randomChoices = {} as Record<ChoiceGroup, ChoiceConfig>;
    const groupKeys = Object.keys(choiceGroupMap) as ChoiceGroup[];

    groupKeys.forEach((group) => {
      const choices = choiceGroupMap[group];
      const randomChoice = choices[Math.floor(Math.random() * choices.length)];
      randomChoices[group] = choiceMap[group][randomChoice];
    });

    setUserChoices(randomChoices);
    generateAvatar(
      groupKeys.filter((group) => randomChoices[group]).map((group) => randomChoices[group]!.id),
    )
      .then((avatarData) => setAvatarData(avatarData))
      .catch(() => {
        reset();
      });
  }, [setUserChoices, setAvatarData, reset]);

  return (
    <div className="relative p-4 flex flex-col items-center min-h-screen overflow-hidden landscape:flex-row landscape:gap-32 landscape:pl-30 landscape:pr-8 landscape:pt-24 landscape:pb-40 landscape:h-full landscape:min-h-0 landscape:items-stretch landscape:justify-start">
      {/* Floating Images */}
      {floatingImages.map(({ id, className, style }, index) => (
        <div key={index} className={className} style={style}>
          <Image
            src={`/assets/images/intro-modal/${id}.webp`}
            alt={`Floating character ${index + 1}`}
            fill
            sizes="(max-width: 768px) 30vw, 20vw"
            className="object-contain"
          />
        </div>
      ))}

      <div className="mb-8 mt-20 z-10 landscape:relative landscape:top-[6rem] flex-shrink-0 landscape:mb-0 landscape:flex-1 landscape:mt-[-3rem]">
        <Image
          src="/assets/images/bbo-logo.svg"
          alt="Billionaire Logo"
          width={341}
          height={166}
          className="w-[17.25rem] h-[8.5rem] -rotate-[8deg] landscape:block landscape:w-[22.375rem] landscape:h-[11rem] landscape:-rotate-[14.168deg]"
        />
      </div>
      <div className="flex flex-col items-center text-center landscape:flex-1 landscape:items-start landscape:text-left z-1">
        <Scrim>
          <h1 className="text-2xl font-extrabold mb-4 landscape:text-4xl-custom landscape:mb-6">
            {title}
          </h1>
          <p className="mb-8 font-sharp font-semibold text-regular-custom text-common-ash landscape:mb-8 landscape:text-regular-custom landscape:w-[30.5rem]">
            {description}
          </p>

          <div className="flex flex-col items-center w-full gap-6 landscape:items-start landscape:gap-0">
            <Button
              autoFocus
              onPress={() => setActiveGroup('origin-story')}
              type="button"
              className="border-[0.125rem] border-accent font-bold text-sm text-accent rounded-full w-[18.625rem] h-10 cursor-pointer hover:text-charcoal bg-charcoal/30 hover:bg-accent transition-colors duration-300 rotate-[1.195deg] landscape:text-regular-custom landscape:h-12 landscape:w-[24rem] landscape:ml-6"
            >
              {createAvatarCtaText}
            </Button>
            <Button
              onPress={generateRandomAvatar}
              type="button"
              className="border-[0.125rem] border-accent font-bold text-sm text-accent rounded-full w-[18.625rem] h-10 cursor-pointer hover:text-charcoal bg-charcoal/30 hover:bg-accent transition-colors duration-300 rotate-[-3.801deg] landscape:mt-6 landscape:text-regular-custom landscape:h-12 landscape:w-[24rem] landscape:ml-16"
            >
              {randomAvatarCtaText}
            </Button>
          </div>
        </Scrim>
      </div>
    </div>
  );
};

export default Intro;
