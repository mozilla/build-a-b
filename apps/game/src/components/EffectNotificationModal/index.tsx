/**
 * EffectNotificationModal - Modal displaying accumulated special card effects via carousel
 */

import { Frame, Text } from '@/components';
import { Button, Modal, ModalBody, ModalContent } from '@heroui/react';
import { useEffect, useState, type FC } from 'react';
import CloseIcon from '../../assets/icons/close-icon.svg';
import { useGameStore } from '../../store';
import type { Card } from '../../types';
import { CardCarousel } from '../CardCarousel';

export const EffectNotificationModal: FC = () => {
  const accumulatedEffects = useGameStore((state) => state.accumulatedEffects);
  const showModal = useGameStore((state) => state.showEffectNotificationModal);
  const closeEffectModal = useGameStore((state) => state.closeEffectModal);

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Set the first card as selected when effects become available
  // Reset if current selected card is not in the accumulated effects (stale from previous turn)
  useEffect(() => {
    if (accumulatedEffects.length > 0) {
      const isSelectedCardValid =
        selectedCard && accumulatedEffects.some((effect) => effect.card.id === selectedCard.id);
      if (!isSelectedCardValid) {
        setSelectedCard(accumulatedEffects[0].card);
      }
    }
  }, [accumulatedEffects, selectedCard]);

  // Reset selected card when modal closes
  useEffect(() => {
    if (!showModal) {
      setSelectedCard(null);
    }
  }, [showModal]);

  if (accumulatedEffects.length === 0) return null;

  // Find the effect for the currently selected card
  const selectedEffect = accumulatedEffects.find((effect) => effect.card.id === selectedCard?.id);

  // Find the first cards that the player and the opponent played
  const firstPlayerCard = accumulatedEffects.find((effect) => effect.playedBy === 'player');
  const firstOpponentCard = accumulatedEffects.find((effect) => effect.playedBy === 'cpu');

  if (!selectedEffect) return null;

  const { playedBy, effectName, effectDescription } = selectedEffect;
  const isPlayerCard = playedBy === 'player';

  const handleClose = () => {
    closeEffectModal();
  };

  const handleCardSelect = (card: Card) => {
    setSelectedCard(card);
  };

  const handleOnGoToYourPlay = () => {
    if (firstPlayerCard) {
      setSelectedCard(firstPlayerCard.card);
    }
  }

  const handleOnGoToOpponentsPlay = () => {
    if (firstOpponentCard) {
      setSelectedCard(firstOpponentCard.card);
    }
  }
  

  return (
    <Modal
      isOpen={showModal}
      onClose={handleClose}
      size="3xl"
      backdrop="opaque"
      hideCloseButton={true}
      isDismissable={true}
      classNames={{
        wrapper: 'z-[9999]',
        backdrop: 'z-[9998]',
        base: 'bg-[rgba(0,0,0,0.9)] z-[9999]',
        body: 'pt-12 pb-8 px-0',
      }}
    >
      <ModalContent
        onClick={handleClose}
        className="cursor-pointer relative h-dvh w-screen flex items-center justify-center"
      >
        <Frame variant="scrollable" className="flex flex-col overflow-y-auto h-auto">
          {/* Custom Close Button */}
          <Button
            isIconOnly
            onPress={handleClose}
            className="absolute top-4 right-4 z-65 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <img src={CloseIcon} alt="Close" />
          </Button>

          <ModalBody className="flex flex-col items-center justify-center gap-10 size-full">
            {/* Player Indicator - updates with carousel */}
            <div className="flex gap-3 px-6">
              <Button className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                  isPlayerCard
                    ? 'bg-accent text-black'
                    : 'bg-transparent border-2 border-white text-white'
                }`}
                onPress={handleOnGoToYourPlay}
                aria-label="Your Play">
                Your Play
              </Button>
              <Button className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                  !isPlayerCard
                    ? 'bg-accent text-black'
                    : 'bg-transparent border-2 border-white text-white'
                }`}
                onPress={handleOnGoToOpponentsPlay}
                aria-label="Opponent's Play">
                Opponent's Play
              </Button>
            </div>

            {/* Card Carousel */}
            <CardCarousel
              cards={accumulatedEffects.map((e) => e.card)}
              selectedCard={selectedCard}
              onCardSelect={handleCardSelect}
            />

            {/* Effect Details for selected card - fixed height to prevent layout shift */}
            <div className="max-w-md flex flex-col px-10">
              <Text variant="card-modal-title" color="text-common-ash" className="mb-4">
                {effectName}
              </Text>
              {effectDescription && (
                <Text variant="title-4" color="text-common-ash" weight="extrabold" align="left">
                  {effectDescription}
                </Text>
              )}
            </div>
          </ModalBody>
        </Frame>
      </ModalContent>
    </Modal>
  );
};
