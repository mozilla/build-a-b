/**
 * EffectNotificationModal - Modal displaying special card effect details
 */

import { type FC } from 'react';
import { Modal, ModalBody, ModalContent, Button } from '@heroui/react';
import { useGameStore } from '../../store';
import { Text } from '@/components';
import { capitalize } from '@/utils/capitalize';
import CloseIcon from '../../assets/icons/close-icon.svg';

export const EffectNotificationModal: FC = () => {
  const {
    showEffectNotificationModal,
    currentEffectNotification,
    dismissEffectNotification,
  } = useGameStore();

  if (!currentEffectNotification) return null;

  const { card, playedBy, effectName, effectDescription } = currentEffectNotification;

  const isPlayerCard = playedBy === 'player';

  const handleClose = () => {
    dismissEffectNotification();
  };

  return (
    <Modal
      isOpen={showEffectNotificationModal}
      onClose={handleClose}
      size="3xl"
      backdrop="opaque"
      hideCloseButton={true}
      isDismissable={true}
      classNames={{
        wrapper: 'z-[60]',
        backdrop: 'z-[55]',
        base: 'bg-[rgba(0,0,0,0.9)] z-[60]',
        body: 'py-8 px-6',
      }}
    >
      <ModalContent onClick={handleClose} className="cursor-pointer relative">
        {/* Custom Close Button */}
        <Button
          isIconOnly
          onPress={handleClose}
          className="absolute top-4 right-4 z-[65] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close"
        >
          <img src={CloseIcon} alt="Close" />
        </Button>

        <ModalBody className="flex flex-col items-center justify-center gap-10">
          {/* Player Indicator */}
          <div className="flex gap-3">
            <button
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                isPlayerCard
                  ? 'bg-green-400 text-black'
                  : 'bg-transparent border-2 border-white text-white'
              }`}
            >
              Your Play
            </button>
            <button
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                !isPlayerCard
                  ? 'bg-cyan-400 text-black'
                  : 'bg-transparent border-2 border-white text-white'
              }`}
            >
              Opponents' Play
            </button>
          </div>

          {/* Card Display */}
          <div className="relative w-[15.3125rem] h-[21.4375rem] max-w-[245px] max-h-[343px] rounded-lg overflow-hidden shadow-2xl -rotate-6">
            <img
              src={card.imageUrl}
              alt={`${effectName} card`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Effect Details */}
          <div className="text-center max-w-md">
            <Text variant="title-2" className="mb-4 text-white">
              {capitalize(effectName)}
            </Text>
            {effectDescription && (
              <Text variant="title-3" className="text-white/90 font-normal">
                {effectDescription}
              </Text>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
