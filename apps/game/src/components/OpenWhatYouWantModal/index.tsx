import { Button, Text } from '@/components';
import { TRACKS } from '@/config/audio-config';
import { capitalize } from '@/utils/capitalize';
import { cn } from '@/utils/cn';
import { Modal, ModalBody, ModalContent, ModalFooter } from '@heroui/react';
import { useEffect, useRef, useState } from 'react';
import { useGameMachineActor } from '../../hooks/use-game-machine-actor';
import { useGameStore, useOpenWhatYouWantState } from '../../store';
import type { Card } from '../../types';
import { CardCarousel } from '../CardCarousel';
import type { CardCarouselRef } from '../CardCarousel/types';
import OwywImage from '../../assets/special-effects/owyw.webp';

export const OpenWhatYouWantModal = () => {
  const { playAudio } = useGameStore();
  const { send } = useGameMachineActor();
  const { cards, showModal, isActive } = useOpenWhatYouWantState();
  const playSelectedCardFromOWYW = useGameStore((state) => state.playSelectedCardFromOWYW);
  const setOpenWhatYouWantActive = useGameStore((state) => state.setOpenWhatYouWantActive);
  const clearPreRevealEffects = useGameStore((state) => state.clearPreRevealEffects);
  const carouselRef = useRef<CardCarouselRef>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

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
      setIsBeginning(true);
      setIsEnd(false);
    } else {
      playAudio(TRACKS.HAND_VIEWER);
    }
  }, [showModal, playAudio]);

  // Sync arrow states when carousel is ready
  useEffect(() => {
    if (showModal && selectedCard && carouselRef.current) {
      const timer = setTimeout(() => {
        if (carouselRef.current) {
          setIsBeginning(carouselRef.current.isBeginning);
          setIsEnd(carouselRef.current.isEnd);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showModal, selectedCard, cards.length]);

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
    // Sync arrow states when card changes
    if (carouselRef.current) {
      setIsBeginning(carouselRef.current.isBeginning);
      setIsEnd(carouselRef.current.isEnd);
    }
  };

  const handlePrevClick = () => {
    if (carouselRef.current) {
      carouselRef.current.slidePrev();
      playAudio(TRACKS.OPTION_FOCUS);
      // Update arrow states after navigation
      setTimeout(() => {
        if (carouselRef.current) {
          setIsBeginning(carouselRef.current.isBeginning);
          setIsEnd(carouselRef.current.isEnd);
        }
      }, 50);
    }
  };

  const handleNextClick = () => {
    if (carouselRef.current) {
      carouselRef.current.slideNext();
      playAudio(TRACKS.OPTION_FOCUS);
      // Update arrow states after navigation
      setTimeout(() => {
        if (carouselRef.current) {
          setIsBeginning(carouselRef.current.isBeginning);
          setIsEnd(carouselRef.current.isEnd);
        }
      }, 50);
    }
  };

  return (
    <Modal
      hideCloseButton
      isOpen={showModal}
      size="3xl"
      backdrop="blur"
      classNames={{
        wrapper: 'overflow-hidden items-center',
        base: 'frame bg-[rgba(0,0,0,0.9)]',
        body: 'px-0 pt-6',
      }}
    >
      <ModalContent>
        <ModalBody className="flex flex-col items-center">
          <div className="flex justify-between items-center px-8">
            <img src={OwywImage} width={160} height={160} className="w-40 h-40" />
            <Text variant="title-6" className="text-common-ash text-left text-balance">
              Look at the top 3 cards in your deck and select one to play:
            </Text>
          </div>
          {cards.length > 0 ? (
            <div className="relative w-full">
              <CardCarousel
                ref={carouselRef}
                cards={cards}
                selectedCard={selectedCard}
                onCardSelect={handleCardSelect}
              />

              {/* Navigation Arrows - Only show if more than one card */}
              {cards.length > 1 && (
                <>
                  <button
                    onClick={handlePrevClick}
                    disabled={isBeginning}
                    aria-label="Previous card"
                    className={cn(
                      'absolute left-[1.53125rem] top-1/2 -translate-y-1/2 z-10',
                      'w-[2.125rem] h-[2.125rem] rounded-full',
                      'bg-[rgba(24,24,27,0.3)] border-2 border-accent',
                      'flex items-center justify-center',
                      'transition-opacity duration-200',
                      'cursor-pointer hover:bg-[rgba(24,24,27,0.5)]',
                      isBeginning && 'opacity-30 cursor-not-allowed',
                    )}
                  >
                    <svg
                      width="0.5rem"
                      height="0.875rem"
                      viewBox="0 0 8 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-accent"
                    >
                      <path
                        d="M7 1L1 7L7 13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={handleNextClick}
                    disabled={isEnd}
                    aria-label="Next card"
                    className={cn(
                      'absolute right-[1.53125rem] top-1/2 -translate-y-1/2 z-10',
                      'w-[2.125rem] h-[2.125rem] rounded-full',
                      'bg-[rgba(24,24,27,0.3)] border-2 border-accent',
                      'flex items-center justify-center',
                      'transition-opacity duration-200',
                      'cursor-pointer hover:bg-[rgba(24,24,27,0.5)]',
                      isEnd && 'opacity-30 cursor-not-allowed',
                    )}
                  >
                    <svg
                      width="0.5rem"
                      height="0.875rem"
                      viewBox="0 0 8 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-accent"
                    >
                      <path
                        d="M1 1L7 7L1 13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </>
              )}
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
            className="w-full max-w-[15.5rem] mx-auto"
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
