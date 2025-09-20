import { choiceGroupMap } from '@/constants/choice-map';
import type { ChoiceGroup } from '@/types';
import Image from 'next/image';
import type { FC } from 'react';
import { usePrimaryFlowContext } from '../PrimaryFlowContext';

interface SelectedIconsRowProps {
  className?: string;
  excludeGroup?: ChoiceGroup;
}

const SelectedIconsRow: FC<SelectedIconsRowProps> = ({ className = '', excludeGroup }) => {
  const { userChoices } = usePrimaryFlowContext();

  // Get all selected choices for icon row, excluding the current active group
  const groupKeys = Object.keys(choiceGroupMap) as ChoiceGroup[];
  const selectedChoices = groupKeys
    .filter((group) => userChoices[group] && group !== excludeGroup)
    .map((group) => userChoices[group]!);
  const hasSelectedChoices = selectedChoices.length > 0;

  if (!hasSelectedChoices) {
    return null;
  }

  return (
    <div className={`flex justify-center ${className}`}>
      {/* Mobile layout */}
      <div className="flex items-center gap-3 justify-start w-[100vw] px-10 landscape:hidden">
        {selectedChoices.map((choice, index) => {
          const rotations = ['rotate-6', '-rotate-3', 'rotate-[8deg]', '-rotate-[4deg]', 'rotate-[5deg]', '-rotate-6'];
          const durations = [2.5, 3, 2.2, 3.5, 2.8, 3.2];
          const delays = [0, 0.8, 0.3, 1.2, 0.5, 1.5];

          const rotation = rotations[index % rotations.length];
          const duration = durations[index % durations.length];
          const delay = delays[index % delays.length];

          return (
            <div
              key={index}
              className={`w-12 h-12 ${rotation}`}
              style={{
                animation: `float ${duration}s ease-in-out infinite`,
                animationDelay: `${delay}s`
              }}
            >
              <Image
                src={choice.iconWhenConfirmed}
                alt={choice.id}
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
          );
        })}
      </div>

      {/* Landscape layout */}
      <div className="hidden landscape:flex absolute top-8 left-0 w-full px-[10.25rem] z-0">
        <div className="flex items-center gap-8 justify-start">
          {selectedChoices.map((choice, index) => {
            const rotations = ['rotate-12', '-rotate-6', 'rotate-[15deg]', '-rotate-[8deg]', 'rotate-[10deg]', '-rotate-12'];
            const durations = [3, 3.5, 2.8, 4, 3.2, 3.8];
            const delays = [0, 1, 0.5, 1.5, 0.3, 2];

            const rotation = rotations[index % rotations.length];
            const duration = durations[index % durations.length];
            const delay = delays[index % delays.length];
            const extraMargin = index === 2 ? 'mr-32' : '';

            return (
              <div
                key={index}
                className={`w-[6rem] h-[9.125rem] ${rotation} ${extraMargin}`}
                style={{
                  animation: `float ${duration}s ease-in-out infinite`,
                  animationDelay: `${delay}s`
                }}
              >
                <Image
                  src={choice.iconWhenConfirmed}
                  alt={choice.id}
                  width={96}
                  height={146}
                  className="w-full h-full object-contain"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelectedIconsRow;
