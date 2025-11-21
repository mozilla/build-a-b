import { Button, Text } from '@/components';
import { TRACKS } from '@/config/audio-config';
import { capitalize } from '@/utils/capitalize';
import { Modal, ModalBody, ModalContent, ModalFooter } from '@heroui/react';
import { useEffect, useState } from 'react';
import OwywImage from '../../assets/special-effects/owyw.webp';
import { useGameMachineActor } from '../../hooks/use-game-machine-actor';
import { useGameStore, useOpenWhatYouWantState } from '../../store';
import type { Card } from '../../types';
import { CardCarousel } from '../CardCarousel';

export const OpenWhatYouWantModal = () => {
  const { playAudio } = useGameStore();
  const { send } = useGameMachineActor();
  const { cards, showModal, isActive } = useOpenWhatYouWantState();
  const playSelectedCardFromOWYW = useGameStore((state) => state.playSelectedCardFromOWYW);
  const setOpenWhatYouWantActive = useGameStore((state) => state.setOpenWhatYouWantActive);
  const clearPreRevealEffects = useGameStore((state) => state.clearPreRevealEffects);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Set the first card as selected when cards become available
  useEffect(() => {
    if (cards.length > 0 && !selectedCard) {
      setSelectedCard(cards[0]);
    }
  }, [cards, selectedCard]);

  // Reset selected card when modal closes
  useEffect(() => {
    if (!showModal) {
      setSelectedCard(null);
    } else {
      playAudio(TRACKS.HAND_VIEWER);
    }
  }, [showModal, playAudio]);

  const handleConfirm = () => {
    if (selectedCard && isActive) {
      // Reorder deck: selected card to top, unselected cards to bottom
      // This also closes the modal
      playSelectedCardFromOWYW(selectedCard);

      // Clear OWYW active state AND pre-reveal effects (player flow is complete)
      setOpenWhatYouWantActive(null);
      clearPreRevealEffects();

      // Transition from selecting sub-state to revealing state
      send({ type: 'CARD_SELECTED' });
    }
  };

  const handleCardSelect = (card: Card) => {
    setSelectedCard(card);
  };

  return (
    <Modal
      isOpen={showModal}
      size="3xl"
      backdrop="blur"
      classNames={{
        base: 'frame bg-[rgba(0,0,0,0.8)]',
        body: 'py-6',
      }}
    >
      <ModalContent>
        <ModalBody className="flex flex-col items-center">
          <div className="flex justify-between items-center">
            <img src={OwywImage} width={160} height={160} />
            <span className="text-body">
              Look at the top 3 cards of your deck and select one to play:
            </span>
          </div>
          {cards.length > 0 ? (
            <CardCarousel
              cards={cards}
              selectedCard={selectedCard}
              onCardSelect={handleCardSelect}
            />
          ) : (
            <div className="text-center text-gray-400 py-8">No cards available</div>
          )}
          {selectedCard?.specialType && (
            <div className="mt-4 text-left max-w-[16rem]">
              <Text variant="title-2">{capitalize(selectedCard.specialType)}</Text>
              {selectedCard.specialActionDescription && (
                <Text variant="title-3" className="font-bold mt-4">
                  {selectedCard.specialActionDescription}
                </Text>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            className="w-full max-w-[15.5rem] mx-auto mb-12"
            onClick={handleConfirm}
            variant="primary"
          >
            Play this Card
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
