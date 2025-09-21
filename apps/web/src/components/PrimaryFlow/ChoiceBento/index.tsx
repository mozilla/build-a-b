import { choiceMap, groupDescriptionMap } from '@/constants/choice-map';
import type { ChoiceGroup } from '@/types';
import Image from 'next/image';
import type { FC } from 'react';
import { usePrimaryFlowContext } from '../PrimaryFlowContext';
import SelectedIconsRow from '../SelectedIconsRow';

interface ChoiceBentoProps {
  activeGroup: ChoiceGroup;
}

const ChoiceBento: FC<ChoiceBentoProps> = ({ activeGroup }) => {
  const choiceData = choiceMap[activeGroup];
  const groupContent = groupDescriptionMap[activeGroup];
  const choices = Object.entries(choiceData);
  const { userChoices, setUserChoices, setShowConfirmation } = usePrimaryFlowContext();
  const selectedChoice = userChoices[activeGroup]?.value;

  return (
    <div className="flex flex-col h-full p-2 pb-8 landscape:py-4 landscape:px-0 landscape:items-center">
      {/* Logo - only show on landscape */}
      <Image
        src="/assets/images/billionaire-logo.svg"
        alt="Billionaire Logo"
        width={162}
        height={79}
        className="hidden landscape:block landscape:self-center landscape:w-[10rem] landscape:h-[5rem] landscape:-rotate-[-8deg]"
      />

      {/* Mobile layout */}
      <div className="flex flex-col h-full landscape:hidden">
        {/* Icon row or spacer */}
        <div className="pt-[6rem] mb-4">
          <SelectedIconsRow excludeGroup={activeGroup} />
        </div>

        {/* Centered text content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <h1 className="text-mobile-title-2 font-sharp font-bold text-common-ash">
              {groupContent.title}
            </h1>
            <p className="text-lg-custom font-sharp font-bold text-common-ash/80 max-w-[20rem] mx-auto">
              {groupContent.description}
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-[calc(100vw-2rem)] justify-items-center mx-auto pt-8">
          {choices.map(([choiceKey, choiceConfig], index) => (
            <button
              key={choiceKey}
              onClick={() => {
                setUserChoices((current) => ({ ...current, [activeGroup]: choiceConfig }));
                setShowConfirmation(activeGroup);
              }}
              aria-label={`Select ${choiceKey.replace('.', ' ')}`}
              aria-pressed={selectedChoice === choiceConfig.value}
              className={`bg-common-ash group w-full max-w-[10.6875rem] h-[8.75rem] p-3 rounded-2xl flex flex-col items-center justify-center gap-1 overflow-hidden relative transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                index === choices.length - 1 && choices.length % 2 === 1
                  ? 'col-span-2 justify-self-center'
                  : ''
              }`}
            >
              {/* Gradient overlay for smooth transition */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-[var(--color-secondary-blue)] to-[var(--color-secondary-purple)] rounded-2xl transition-opacity duration-500 ${
                  selectedChoice === choiceConfig.value
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100'
                }`}
              />
              <div className="relative z-10 flex flex-col items-center justify-center gap-0.5">
                <div>
                  <Image
                    src={choiceConfig.icon}
                    alt={choiceKey}
                    width={80}
                    height={80}
                    className="w-[4.4375rem] h-[4.4375rem] object-contain"
                  />
                </div>
                <div
                  className={`bg-transparent text-charcoal font-semibold px-2 py-1 rounded-full text-center capitalize transition-transform duration-500 font-sharp text-xs font-bold leading-tight ${
                    selectedChoice === choiceConfig.value ? '-rotate-12' : 'group-hover:-rotate-12'
                  } ${selectedChoice === choiceConfig.value ? 'text-common-ash' : 'text-charcoal'}`}
                >
                  {choiceKey.replace('.', ' ')}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Landscape layout */}
      <div className="hidden landscape:block landscape:w-full">
        {/* Selected Icons Row */}
        <div className="mt-4 mb-6">
          <SelectedIconsRow excludeGroup={activeGroup} />
        </div>

        {/* Centered text content */}
        <div className="flex items-center justify-center mt-8 mb-8 relative z-10">
          <div className="text-center space-y-4">
            <h1 className="text-5xl-custom font-sharp font-bold text-common-ash">
              {groupContent.title}
            </h1>
            <p className="text-regular-custom font-sharp font-bold text-common-ash/80 max-w-[35rem] mx-auto">
              {groupContent.description}
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="flex flex-row gap-4 justify-center flex-wrap max-w-none justify-items-center mx-auto relative z-10">
          {choices.map(([choiceKey, choiceConfig], index) => (
            <button
              key={choiceKey}
              onClick={() => {
                setUserChoices((current) => ({ ...current, [activeGroup]: choiceConfig }));
                setShowConfirmation(activeGroup);
              }}
              aria-label={`Select ${choiceKey.replace('.', ' ')}`}
              aria-pressed={selectedChoice === choiceConfig.value}
              className={`cursor-pointer bg-common-ash group w-full max-w-[10.6875rem] h-[8.75rem] landscape:w-[12rem] landscape:h-[10.5rem] p-3 landscape:p-4 rounded-2xl flex flex-col items-center justify-center gap-1 landscape:gap-2 overflow-hidden relative transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                index === choices.length - 1 && choices.length % 2 === 1
                  ? 'col-span-2 justify-self-center'
                  : ''
              }`}
            >
              {/* Gradient overlay for smooth transition */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-[var(--color-secondary-blue)] to-[var(--color-secondary-purple)] rounded-2xl transition-opacity duration-500 ${
                  selectedChoice === choiceConfig.value
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100'
                }`}
              />
              <div className="relative z-10 flex flex-col items-center justify-center gap-1 landscape:gap-2">
                <div>
                  <Image
                    src={choiceConfig.icon}
                    alt={choiceKey}
                    width={80}
                    height={80}
                    className="w-[4.4375rem] h-[4.4375rem] landscape:w-20 landscape:h-20 object-contain"
                  />
                </div>
                <div
                  className={`bg-transparent landscape:bg-accent ${selectedChoice === choiceConfig.value ? 'text-common-ash' : 'text-charcoal'} landscape:text-charcoal px-3 py-1.5 landscape:px-6 landscape:py-3 rounded-full text-center capitalize transition-transform duration-500 font-sharp text-xs font-bold leading-tight ${
                    selectedChoice === choiceConfig.value ? '-rotate-12' : 'group-hover:-rotate-12'
                  }`}
                >
                  {choiceKey.replace('.', ' ')}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChoiceBento;
