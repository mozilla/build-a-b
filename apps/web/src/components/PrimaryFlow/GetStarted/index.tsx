'use client';

import { choiceGroupMap } from '@/constants/choice-map';
import { useDisclosure } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams } from 'next/navigation';
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
  const pathParams = useParams<{ id?: string }>();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { activeGroup, showConfirmation, userChoices, reset } = usePrimaryFlowContext();

  if (pathParams.id) return null;

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

  // Animation variants for smooth transitions
  const pageVariants = {
    initial: {
      opacity: 0,
      x: 20,
    },
    in: {
      opacity: 1,
      x: 0,
    },
    out: {
      opacity: 0,
      x: -20,
    },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3,
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
        <div className="relative h-full overflow-scroll">
          {!shouldShowIntroScreen && (
            <motion.div
              className="absolute top-4 left-4 z-40 landscape:hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: '2.5rem' }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <ConfirmSelectionHeaderLogo />
            </motion.div>
          )}
          <AnimatePresence mode="wait">
            {shouldShowCompletionScreen && (
              <motion.div
                key="completion"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                className="relative inset-0"
              >
                <CompletionScreen />
              </motion.div>
            )}
            {shouldShowIntroScreen && (
              <motion.div
                key="intro"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                className="absolute inset-0"
              >
                <Intro {...babFlowData} />
              </motion.div>
            )}
            {!allChoicesCompleted && !showConfirmation && activeGroup && (
              <motion.div
                key={`choice-${activeGroup}`}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                className="absolute inset-0"
              >
                <ChoiceBento activeGroup={activeGroup} />
              </motion.div>
            )}
            {showConfirmation && activeGroup && (
              <motion.div
                key={`confirm-${activeGroup}`}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                className="absolute inset-0"
              >
                <ConfirmSelectionScreen activeGroup={activeGroup} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>
    </>
  );
};

export default GetStarted;
