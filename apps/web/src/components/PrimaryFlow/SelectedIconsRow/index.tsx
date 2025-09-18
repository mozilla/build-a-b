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
      <div className="flex items-center gap-3 justify-start w-[100vw] px-10">
        {selectedChoices.map((choice, index) => (
          <div key={index} className="w-12 h-12">
            <Image
              src={choice.iconWhenConfirmed}
              alt={choice.id}
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedIconsRow;
