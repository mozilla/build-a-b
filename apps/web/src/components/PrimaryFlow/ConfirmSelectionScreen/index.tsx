import { choiceGroupMap } from '@/constants/choice-map';
import type { ChoiceGroup } from '@/types';
import { generateAvatar } from '@/utils/actions/generate-avatar';
import Image from 'next/image';
import type { FC } from 'react';
import { usePrimaryFlowContext } from '../PrimaryFlowContext';
import SelectedIconsRow from '../SelectedIconsRow';

interface ConfirmSelectionScreenProps {
  activeGroup: ChoiceGroup;
}

const ConfirmSelectionScreen: FC<ConfirmSelectionScreenProps> = ({ activeGroup }) => {
  const { userChoices, setShowConfirmation, setActiveGroup, setAvatarData } =
    usePrimaryFlowContext();
  const selectedConfig = userChoices[activeGroup];

  if (!selectedConfig) return null;

  // Get the next group in the sequence
  const groupKeys = Object.keys(choiceGroupMap) as ChoiceGroup[];
  const currentIndex = groupKeys.indexOf(activeGroup);
  const nextGroup = currentIndex < groupKeys.length - 1 ? groupKeys[currentIndex + 1] : null;
  const choiceName = selectedConfig.id.replace('.', ' ');

  const handleContinue = async () => {
    setShowConfirmation(null);

    if (nextGroup) {
      setActiveGroup(nextGroup);
    } else {
      // This is the last choice, generate avatar before showing completion screen
      const allChoices = groupKeys
        .filter((group) => userChoices[group])
        .map((group) => userChoices[group]!.id);

      try {
        const result = await generateAvatar(allChoices);
        if (result) {
          setAvatarData(result);
        }
      } catch (error) {
        console.error('Error generating avatar:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full p-4 pb-8 landscape:py-2 landscape:px-0 landscape:items-center">
      {/* Logo - only show on landscape in body */}
      <div className="hidden landscape:block">
        <Image
          src="/assets/images/Billionaire-Logo.svg"
          alt="Billionaire Logo"
          width={162}
          height={79}
          className="w-[10rem] h-[5rem] -rotate-[-8deg]"
        />
      </div>

      {/* Mobile layout */}
      <div className="flex flex-col h-full landscape:hidden">
        {/* Icon row */}
        <div className="pt-[2.625rem]">
          <SelectedIconsRow className="mb-6" excludeGroup={activeGroup} />
        </div>

        {/* Text content - appears before icon on mobile */}
        <div className="flex-1 flex flex-col items-center justify-center mt-4">
          <div className="text-center space-y-2 mb-4">
            <h1 className="text-mobile-title-2 font-sharp font-bold text-common-ash capitalize">
              {choiceName}
            </h1>
            <p className="text-lg-custom font-sharp font-bold text-common-ash/80 max-w-[20rem] mx-auto">
              {selectedConfig.phrase}
            </p>
          </div>

          {/* Icon - centered */}
          <div>
            <Image
              src={selectedConfig.iconWhenConfirmed}
              alt={selectedConfig.id}
              width={292}
              height={192}
              className="w-[12rem] h-[18.25rem] object-contain"
            />
          </div>
        </div>

        {/* Button */}
        <div className="pt-4 flex justify-center">
          <button onClick={handleContinue} className="secondary-button">
            Continue
          </button>
        </div>
      </div>

      {/* Landscape layout - keep original structure */}
      <div className="hidden landscape:flex landscape:flex-col landscape:items-center landscape:mt-8 landscape:flex-col-reverse">
        {/* Text content */}
        <div className="text-center space-y-4 mt-4">
          <h1 className="text-5xl-custom font-sharp font-bold text-common-ash capitalize">
            {choiceName}
          </h1>
          <p className="text-regular-custom font-sharp font-bold text-common-ash/80 max-w-[35rem] mx-auto">
            {selectedConfig.phrase}
          </p>

          {/* Button - appears after description on landscape */}
          <div className="pt-4 flex justify-center">
            <button onClick={handleContinue} className="secondary-button">
              Continue
            </button>
          </div>
        </div>

        {/* Icon */}
        <div>
          <Image
            src={selectedConfig.iconWhenConfirmed}
            alt={selectedConfig.id}
            width={292}
            height={192}
            className="w-[5rem] h-[7.375rem] object-contain"
          />
        </div>
      </div>
    </div>
  );
};

// Logo component for mobile header
export const ConfirmSelectionHeaderLogo: FC = () => (
  <Image
    src="/assets/images/Billionaire-Logo.svg"
    alt="Billionaire Logo"
    width={162}
    height={79}
    className="w-[8rem] h-[4rem] -rotate-[-8deg]"
  />
);

export default ConfirmSelectionScreen;
