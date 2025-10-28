import { type FC, useState } from 'react';

import { BillionaireCard } from '@/components/BillionaireCard';
import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';
import { useGameStore } from '@/stores/game-store';
import { cn } from '@/utils/cn';

import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import { BILLIONAIRES, type Billionaire } from '@/config/billionaires';
import { motion } from 'framer-motion';
import { Drawer } from './Drawer';
import { selectBillionaireMicrocopy } from './microcopy';

export const SelectBillionaire: FC<BaseScreenProps> = ({ send, className, ...props }) => {
  const { selectedBillionaire, selectBillionaire } = useGameStore();
  const [localSelection, setLocalSelection] = useState(selectedBillionaire);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBillionaireData, setSelectedBillionaireData] = useState<Billionaire | null>(null);

  const handleBillionaireClick = (billionaire: Billionaire) => {
    setLocalSelection(billionaire.id);
    setSelectedBillionaireData(billionaire);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    // Reset selection if not confirmed
    setLocalSelection(selectedBillionaire);
  };

  const handleDrawerConfirm = () => {
    if (selectedBillionaireData) {
      selectBillionaire(selectedBillionaireData.id);
      setIsDrawerOpen(false);

      // Transition to next screen after confirmation
      setTimeout(() => {
        send?.({ type: 'SELECT_BILLIONAIRE', billionaire: selectedBillionaireData.id });
      }, ANIMATION_DURATIONS.UI_TRANSITION_DELAY);
    }
  };

  return (
    <motion.div className={cn(className)} {...props}>
      {/* Main content container */}
      <div className="w-full relative z-10 flex flex-col items-center justify-start gap-8 px-9 py-8 pt-16">
        {/* Title and Description */}
        <div className="flex flex-col items-center gap-4 w-full">
          <Text as="h1" variant="title-2" align="center" className="text-common-ash w-full">
            {selectBillionaireMicrocopy.title}
          </Text>

          <Text
            variant="body-large-semibold"
            align="center"
            className="text-common-ash max-w-[266px]"
          >
            {selectBillionaireMicrocopy.description}
          </Text>
        </div>

        {/* Billionaires Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 mt-4">
          {BILLIONAIRES.map((billionaire) => (
            <BillionaireCard
              key={billionaire.id}
              name={billionaire.name}
              imageSrc={billionaire.imageSrc}
              isSelected={localSelection === billionaire.id}
              onPress={() => handleBillionaireClick(billionaire)}
            />
          ))}
        </div>
      </div>

      {/* Drawer Modal */}
      <Drawer
        isOpen={isDrawerOpen}
        billionaire={selectedBillionaireData}
        onClose={handleDrawerClose}
        onConfirm={handleDrawerConfirm}
      />
    </motion.div>
  );
};
