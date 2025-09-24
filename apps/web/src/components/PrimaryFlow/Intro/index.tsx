'use client';

import { choiceGroupMap, choiceMap } from '@/constants/choice-map';
import type { ChoiceConfig, ChoiceGroup } from '@/types';
import { generateAvatar } from '@/utils/actions/generate-avatar';
import { Button } from '@heroui/react';
import Image from 'next/image';
import { useCallback, type FC } from 'react';
import { usePrimaryFlowContext } from '../PrimaryFlowContext';
import { floatingImages } from './constants';

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
    <div className="relative p-4 flex flex-col items-center justify-center min-h-screen overflow-hidden landscape:flex-row landscape:gap-32 landscape:px-16 landscape:pt-[6rem] landscape:pb-40 landscape:h-full landscape:min-h-0 landscape:items-stretch landscape:justify-start">
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

      <div className="mb-4 mt-[-4rem] landscape:relative landscape:top-[6rem] mb-2 flex-shrink-0 landscape:mb-0 landscape:flex-1">
        <Image
          src="/assets/images/billionaire-logo.svg"
          alt="Billionaire Logo"
          width={213}
          height={104}
          className="w-[17.187rem] h-[8.5rem] -rotate-[8deg] landscape:block landscape:w-[22.375rem] landscape:h-[11rem] landscape:-rotate-[15deg]"
        />
      </div>
      <div className="flex flex-col items-center text-center landscape:flex-1 landscape:items-start landscape:text-left z-1">
        <h1 className="text-2xl font-extrabold mb-3 landscape:text-4xl-custom landscape:mb-6">
          {title}
        </h1>
        <p className="mb-4 font-sharp font-semibold text-sm leading-[140%] text-[#F8F6F4] landscape:mb-8 landscape:text-lg landscape:w-[24.3125rem]">
          {description}
        </p>

        <div className="flex flex-col items-center w-full gap-6 landscape:items-start landscape:gap-0">
          <Button
            autoFocus
            onPress={() => setActiveGroup('origin-story')}
            type="button"
            className="border-[0.125rem] border-accent font-bold text-sm text-accent rounded-full w-[18.625rem] landscape:w-[24rem] h-10 cursor-pointer hover:text-charcoal bg-charcoal/30 hover:bg-accent transition-colors duration-300 rotate-[2.259deg] landscape:text-base landscape:h-12 landscape:w-[24.3125rem]"
          >
            {createAvatarCtaText}
          </Button>
          <Button
            onPress={generateRandomAvatar}
            type="button"
            className="border-[0.125rem] border-accent font-bold text-sm text-accent rounded-full w-[18.625rem] landscape:w-[24rem] h-10 cursor-pointer hover:text-charcoal bg-charcoal/30 hover:bg-accent transition-colors duration-300 -rotate-[1.772deg] landscape:mt-6 landscape:text-base landscape:h-12 landscape:w-[24.3125rem] landscape:ml-8"
          >
            {randomAvatarCtaText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Intro;
