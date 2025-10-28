import { Modal, ModalBody, ModalContent, ModalFooter } from '@heroui/react';
import { useEffect, useMemo, useState } from 'react';
import { A11y, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import OwywImage from '../../assets/special-effects/owyw.webp';
import { useGameMachineActor } from '../../hooks/use-game-machine-actor';
import { useGameStore, useOpenWhatYouWantState } from '../../stores/game-store';
import type { Card } from '../../types';
import { Button, Text } from '@/components';

import 'swiper/css';
import 'swiper/css/navigation';
import type { SwiperOptions } from 'swiper/types';
import { capitalize } from '@/utils/capitalize';

export const OpenWhatYouWantModal = () => {
  const { send } = useGameMachineActor();
  const { cards, showModal, isActive } = useOpenWhatYouWantState();
  const playSelectedCardFromOWYW = useGameStore((state) => state.playSelectedCardFromOWYW);
  const defaultOptions: Partial<SwiperOptions> = useMemo(
    () => ({
      modules: [Navigation, A11y],
      centeredSlides: true,
      allowTouchMove: true,
      spaceBetween: -80,
      slidesPerView: 1,
      navigation: {
        prevEl: '.swiper-button-prev',
        nextEl: '.swiper-button-next',
      },
    }),
    [],
  );
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Set the first card as selected when cards become available
  useEffect(() => {
    if (cards.length > 0 && !selectedCard) {
      setSelectedCard(cards[0]);
    }
  }, [cards, selectedCard]);

  const handleConfirm = () => {
    if (selectedCard && isActive) {
      // Reorder deck: selected card to top, unselected cards to bottom
      // This also closes the modal
      playSelectedCardFromOWYW(selectedCard);

      // Clear OWYW active state AND pre-reveal effects (player flow is complete)
      useGameStore.getState().setOpenWhatYouWantActive(null);
      useGameStore.getState().clearPreRevealEffects();

      // Transition from selecting sub-state to revealing state
      send({ type: 'CARD_SELECTED' });
      setSelectedCard(null);
    }
  };

  return (
    <Modal
      isOpen={showModal}
      size="3xl"
      backdrop="blur"
      classNames={{
        base: 'bg-[rgba(0,0,0,0.8)]',
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
            <div className="w-full">
              <Swiper
                {...defaultOptions}
                onSlideChange={(swiper) => {
                  const currentCard = cards[swiper.activeIndex];
                  setSelectedCard(currentCard);
                }}
                className="w-full h-[400px]"
              >
                {cards.map((card) => (
                  <SwiperSlide key={card.id}>
                    <div
                      className={`flex flex-col items-center justify-center h-full cursor-pointer transition-transform duration-200 rotate-[-15deg]`}
                      onClick={() => setSelectedCard(card)}
                    >
                      <div className="relative w-[15.3125rem] h-[21.4375rem] max-w-[245px] max-h-[343px] rounded-lg overflow-hidden shadow-2xl">
                        <img
                          src={card.imageUrl}
                          alt={`Card ${card.typeId}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
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
