import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import type { Card } from '../../types';
import { useGameStore, useOpenWhatYouWantState } from '../../stores/game-store';
import { useGameMachineActor } from '../../hooks/use-game-machine-actor';

import 'swiper/css';
import 'swiper/css/navigation';

export const OpenWhatYouWantModal = () => {
  const { send } = useGameMachineActor();
  const { cards, showModal, isActive } = useOpenWhatYouWantState();
  const setShowOpenWhatYouWantModal = useGameStore((state) => state.setShowOpenWhatYouWantModal);
  const playSelectedCardFromOWYW = useGameStore((state) => state.playSelectedCardFromOWYW);

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  const handleCardSelect = (card: Card, index: number) => {
    setSelectedCard(card);
    // Navigate to the selected slide
    if (swiperInstance) {
      swiperInstance.slideTo(index);
    }
  };

  const handleConfirm = () => {
    if (selectedCard && isActive) {
      console.log('[OWYW Modal] Confirming selection:', selectedCard);

      // Reorder deck: selected card to top, unselected cards to bottom
      // This also closes the modal
      playSelectedCardFromOWYW(selectedCard);
      console.log('[OWYW Modal] Deck reordered, selected card at top');

      // Clear OWYW active state AND pre-reveal effects (player flow is complete)
      useGameStore.getState().setOpenWhatYouWantActive(null);
      useGameStore.getState().clearPreRevealEffects();
      console.log('[OWYW Modal] OWYW state and effects cleared');

      // Transition from selecting sub-state to revealing state
      send({ type: 'CARD_SELECTED' });
      console.log('[OWYW Modal] Sent CARD_SELECTED event');

      setSelectedCard(null);
    }
  };

  const handleClose = () => {
    setShowOpenWhatYouWantModal(false);
    setSelectedCard(null);
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={handleClose}
      size="3xl"
      backdrop="blur"
      classNames={{
        base: 'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700',
        header: 'border-b border-gray-700',
        body: 'py-6',
        footer: 'border-t border-gray-700',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-white">Open What You Want</h2>
          <p className="text-sm text-gray-400">
            Choose one card from the top 3 cards of your deck
          </p>
        </ModalHeader>
        <ModalBody>
          {cards.length > 0 ? (
            <div className="w-full">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                centeredSlides={true}
                navigation
                pagination={{ clickable: true }}
                onSwiper={setSwiperInstance}
                onSlideChange={(swiper) => {
                  const currentCard = cards[swiper.activeIndex];
                  if (currentCard) {
                    setSelectedCard(currentCard);
                  }
                }}
                className="w-full h-[400px]"
              >
                {cards.map((card, index) => (
                  <SwiperSlide key={card.id}>
                    <div
                      className={`flex flex-col items-center justify-center h-full cursor-pointer transition-transform duration-200 ${
                        selectedCard?.id === card.id ? 'scale-105' : 'scale-95'
                      }`}
                      onClick={() => handleCardSelect(card, index)}
                    >
                      <div className="relative w-64 h-80 rounded-lg overflow-hidden shadow-2xl">
                        <img
                          src={card.imageUrl}
                          alt={`Card ${card.typeId}`}
                          className="w-full h-full object-cover"
                        />
                        {selectedCard?.id === card.id && (
                          <div className="absolute inset-0 border-4 border-blue-500 rounded-lg pointer-events-none" />
                        )}
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-white font-semibold text-lg">
                          {card.isSpecial ? card.specialType : `Value: ${card.value}`}
                        </p>
                        {card.isSpecial && (
                          <p className="text-gray-400 text-sm">Special Card</p>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              No cards available
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleConfirm}
            isDisabled={!selectedCard}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Confirm Selection
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
