import { choiceGroupMap } from '@/constants/choice-map';
import type { ChoiceGroup } from '@/types';
import Image from 'next/image';
import type { FC } from 'react';
import { usePrimaryFlowContext } from '../PrimaryFlowContext';

const CompletionScreen: FC = () => {
  const { userChoices } = usePrimaryFlowContext();

  // Get all selected choices in the correct order
  const groupKeys = Object.keys(choiceGroupMap) as ChoiceGroup[];
  const selectedChoices = groupKeys
    .filter(group => userChoices[group])
    .map(group => userChoices[group]!);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 pb-8 landscape:py-10 landscape:px-0 landscape:h-full landscape:min-h-0">
      {/* Logo - only show on landscape */}
      <Image
        src="/assets/images/Billionaire-Logo.svg"
        alt="Billionaire Logo"
        width={162}
        height={79}
        className="hidden landscape:block landscape:self-center landscape:w-[10rem] landscape:h-[5rem] landscape:-rotate-[8deg]"
      />

      {/* Mobile layout */}
      <div className="flex flex-col h-full landscape:hidden">
        {/* Icons grid - 3 in first row, 2 in second row */}
        <div className="pt-[2.625rem]">
          <div className="flex flex-col items-center gap-4 mb-8">
            {/* First row - 3 icons */}
            <div className="flex items-center gap-4 justify-center">
              {selectedChoices.slice(0, 3).map((choice, index) => (
                <div
                  key={index}
                  className="w-16 h-16"
                  style={{ animation: `float ${3 + index * 0.5}s ease-in-out infinite ${index * 0.3}s` }}
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
            {/* Second row - 2 icons */}
            <div className="flex items-center gap-4 justify-center">
              {selectedChoices.slice(3, 5).map((choice, index) => (
                <div
                  key={index + 3}
                  className="w-16 h-16"
                  style={{ animation: `float ${4 + index * 0.5}s ease-in-out infinite ${(index + 3) * 0.3}s` }}
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

        {/* Centered text content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-mobile-title-2 font-sharp font-bold text-common-ash">
              We're Minting Your Billionaire
            </h1>
            <p className="text-lg-custom font-sharp font-bold text-common-ash/80 max-w-[20rem] mx-auto">
              Assembling unchecked wealth...
            </p>
          </div>
        </div>
      </div>

      {/* Landscape layout */}
      <div className="hidden landscape:block landscape:w-full">
        {/* Icons row - all 5 in one row */}
        <div className="flex items-center justify-center mt-8 mb-8">
          <div className="flex items-center gap-6">
            {selectedChoices.map((choice, index) => (
              <div
                key={index}
                className="w-20 h-20"
                style={{ animation: `float ${3.5 + index * 0.3}s ease-in-out infinite ${index * 0.25}s` }}
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

        {/* Centered text content */}
        <div className="flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-5xl-custom font-sharp font-bold text-common-ash">
              We're Minting Your Billionaire
            </h1>
            <p className="text-regular-custom font-sharp font-bold text-common-ash/80 max-w-[35rem] mx-auto">
              Assembling unchecked wealth...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionScreen;