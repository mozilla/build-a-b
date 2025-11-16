import { type FC, useCallback, useEffect, useMemo, useState } from 'react';

import { BillionaireCard } from '@/components/BillionaireCard';
import type { BaseScreenProps } from '@/components/ScreenRenderer';
import { Text } from '@/components/Text';
import { useGameStore } from '@/store';
import { cn } from '@/utils/cn';

import { Drawer } from '@/components/Screens/SelectBillionaire/Drawer';
import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import { BILLIONAIRES, type Billionaire } from '@/config/billionaires';
import { motion } from 'framer-motion';
import { selectBillionaireMicrocopy } from './microcopy';

export const SelectBillionaire: FC<BaseScreenProps> = ({
  send,
  className,
  children,
  drawerOpen,
  setDrawerOpen,
  setDrawerNode,
  isMobile,
  ...props
}) => {
  const { selectedBillionaire, selectBillionaire } = useGameStore();
  const [localSelection, setLocalSelection] = useState(selectedBillionaire);
  const [selectedBillionaireData, setSelectedBillionaireData] = useState<Billionaire | null>(null);

  const handleBillionaireClick = useCallback(
    (billionaire: Billionaire) => {
      setLocalSelection(billionaire.id);
      setSelectedBillionaireData(billionaire);
      setDrawerOpen(true);
    },
    [setDrawerOpen],
  );

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    // Reset selection if not confirmed
    setLocalSelection(selectedBillionaire);
  }, [selectedBillionaire, setDrawerOpen]);

  const handleDrawerConfirm = useCallback(() => {
    if (selectedBillionaireData) {
      selectBillionaire(selectedBillionaireData.id);
      setDrawerOpen(false);

      // Transition to next screen after confirmation
      setTimeout(() => {
        send?.({ type: 'SELECT_BILLIONAIRE', billionaire: selectedBillionaireData.id });
      }, ANIMATION_DURATIONS.UI_TRANSITION_DELAY);
    }
  }, [send, selectedBillionaireData, selectBillionaire, setDrawerOpen]);

  const ConfirmationDrawer = useMemo(
    () => (
      <Drawer
        className="max-w-[25rem] mx-auto"
        isOpen={drawerOpen}
        billionaire={selectedBillionaireData}
        onClose={handleDrawerClose}
        onConfirm={handleDrawerConfirm}
      />
    ),
    [drawerOpen, selectedBillionaireData, handleDrawerClose, handleDrawerConfirm],
  );

  useEffect(() => {
    setDrawerNode(ConfirmationDrawer);
  }, [ConfirmationDrawer, setDrawerNode]);

  return (
    <motion.div className={cn(className)} {...props}>
      <header className="fixed top-0 landscape:relative w-full max-w-[25rem] mx-auto">
        {children}
      </header>
      {/* Main content container */}
      <div className="w-full relative z-10 flex flex-col items-center justify-start gap-y-[clamp(16px,-191.48925px_+_25.5319vh,40px)] px-9 py-8 pt-[clamp(32px,-223.3px_+_34.04vh,64px)] max-w-[25rem] mx-auto h-full">
        {/* Title and Description */}
        <div className="flex flex-col items-center gap-4 w-full">
          <Text as="h1" variant="title-2" align="center" className="text-common-ash w-full">
            {selectBillionaireMicrocopy.title}
          </Text>

          <Text variant="body-large-semibold" align="center" className="text-common-ash">
            {selectBillionaireMicrocopy.description}
          </Text>
        </div>

        {/* Billionaires Grid */}
        <div className="grid grid-cols-2 gap-6 row-3 items-start">
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
      {!isMobile && drawerOpen && <>{ConfirmationDrawer}</>}
    </motion.div>
  );
};
