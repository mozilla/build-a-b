'use client';

import { choiceGroupMap } from '@/constants/choice-map';
import { Button, useDisclosure } from '@heroui/react';
import { type FC } from 'react';
import Modal from '../../Modal';
import ChoiceBento from '../ChoiceBento';
import CompletionScreen from '../CompletionScreen';
import ConfirmSelectionScreen, { ConfirmSelectionHeaderLogo } from '../ConfirmSelectionScreen';
import Intro, { type IntroProps } from '../Intro';
import { usePrimaryFlowContext } from '../PrimaryFlowContext';

export interface GetStartedProps extends IntroProps {
  /**
   * Text to display in the trigger button.
   */
  ctaText: string;
  /**
   * Classes to apply to the trigger button.
   */
  triggerClassNames?: string;
}

const GetStarted: FC<GetStartedProps> = ({ ctaText, triggerClassNames, ...babFlowData }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { activeGroup, showConfirmation, userChoices, reset } = usePrimaryFlowContext();

  // Check if all choices are completed
  const totalGroups = Object.keys(choiceGroupMap).length;
  const completedChoices = Object.values(userChoices).filter((choice) => choice !== null).length;
  const allChoicesCompleted = completedChoices >= totalGroups;

  // Only show completion screen if all choices are done AND we're not showing confirmation
  const shouldShowCompletionScreen = allChoicesCompleted && !showConfirmation;
  const shouldShowIntroScreen = !allChoicesCompleted && !activeGroup;

  // Get current step information for screen reader announcements
  const getStepInfo = () => {
    if (allChoicesCompleted) {
      return 'Final step: Completion Screen';
    }
    if (!activeGroup) {
      return 'Step 1 of 6: Introduction';
    }

    const groupKeys = Object.keys(choiceGroupMap);
    const currentStep = groupKeys.indexOf(activeGroup) + 1;
    const groupTitle = activeGroup.replace('-', '');

    if (showConfirmation) {
      return `Step ${currentStep} of 5: Confirm ${groupTitle} selection`;
    }

    return `Step ${currentStep} of 5: ${groupTitle}`;
  };

  // Reset everything when modal closes
  const handleModalClose = (open: boolean) => {
    if (!open) reset();
    onOpenChange();
  };

  return (
    <>
      <button onClick={onOpen} type="button" className={`secondary-button ${triggerClassNames}`}>
        {ctaText}
      </button>
      <Modal isOpen={isOpen} onOpenChange={handleModalClose}>
        {/* Screen reader announcements for step changes */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {isOpen && getStepInfo()}
        </div>
        <div className="relative h-full">
          {!shouldShowIntroScreen && (
            <div className="absolute top-4 left-4 z-40 landscape:hidden">
              <ConfirmSelectionHeaderLogo />
            </div>
          )}
          {shouldShowCompletionScreen && <CompletionScreen />}
          {shouldShowIntroScreen && <Intro {...babFlowData} />}
          {!allChoicesCompleted && !showConfirmation && activeGroup && (
            <ChoiceBento activeGroup={activeGroup} />
          )}
          {showConfirmation && activeGroup && <ConfirmSelectionScreen activeGroup={activeGroup} />}
        </div>
      </Modal>
    </>
  );
};

export default GetStarted;
