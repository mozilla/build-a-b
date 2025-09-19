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
  ctaText: string;
}

const GetStarted: FC<GetStartedProps> = ({ ctaText, ...babFlowData }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    activeGroup,
    showConfirmation,
    userChoices,
    setActiveGroup,
    setShowConfirmation,
    setUserChoices,
    setAvatarData,
  } = usePrimaryFlowContext();

  // Check if all choices are completed
  const totalGroups = Object.keys(choiceGroupMap).length;
  const completedChoices = Object.values(userChoices).filter((choice) => choice !== null).length;
  const allChoicesCompleted = completedChoices >= totalGroups;

  // Only show completion screen if all choices are done AND we're not showing confirmation
  const shouldShowCompletionScreen = allChoicesCompleted && !showConfirmation;

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
    if (!open) {
      // Reset all state when modal is closed
      setActiveGroup(null);
      setShowConfirmation(null);
      setAvatarData(null);
      setUserChoices({
        'core-drive': null,
        'legacy-plan': null,
        'origin-story': null,
        'power-play': null,
        'public-mask': null,
      });
    }
    onOpenChange();
  };

  return (
    <>
      <Button
        onPress={onOpen}
        type="button"
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[9.119deg] landscape:top-auto landscape:left-auto landscape:translate-x-0 landscape:translate-y-0 landscape:bottom-[8.235rem] landscape:left-[7.8125rem] z-20 border border-accent font-bold text-base text-accent rounded-full px-[2.5rem] h-[2.5rem] cursor-pointer hover:text-charcoal hover:bg-accent transition-colors duration-300"
      >
        {ctaText}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={handleModalClose}>
        {/* Screen reader announcements for step changes */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {isOpen && getStepInfo()}
        </div>
        <div className="relative h-full">
          <div className="absolute top-4 left-4 z-40 landscape:hidden">
            <ConfirmSelectionHeaderLogo />
          </div>
          {shouldShowCompletionScreen && <CompletionScreen />}
          {!allChoicesCompleted && !activeGroup && <Intro {...babFlowData} />}
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
