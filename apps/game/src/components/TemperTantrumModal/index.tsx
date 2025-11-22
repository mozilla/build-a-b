/**
 * TemperTantrumModal - Modal for selecting cards to steal when Temper Tantrum effect triggers
 * Shows all cards in play and allows player to select up to 2 cards
 */

import { useState, useEffect, type FC } from 'react';
import { Modal, ModalBody, ModalContent, Button } from '@heroui/react';
import { useGameStore } from '../../store';
import { Text } from '@/components';
import { CardCarousel } from '../CardCarousel';
import type { Card } from '../../types';
import TantrumImage from '../../assets/special-effects/tantrum.webp';

export const TemperTantrumModal: FC = () => {
  const showModal = useGameStore((state) => state.showTemperTantrumModal);
  const availableCards = useGameStore((state) => state.temperTantrumAvailableCards);
  const selectedCards = useGameStore((state) => state.temperTantrumSelectedCards);
  const maxSelections = useGameStore((state) => state.temperTantrumMaxSelections);
  const faceDownCardIds = useGameStore((state) => state.temperTantrumFaceDownCardIds);
  const selectCard = useGameStore((state) => state.selectTemperTantrumCard);
  const confirmSelection = useGameStore((state) => state.confirmTemperTantrumSelection);

  const [highlightedCard, setHighlightedCard] = useState<Card | null>(null);

  // Set the first card as highlighted when modal opens
  useEffect(() => {
    if (showModal && availableCards.length > 0) {
      setHighlightedCard(availableCards[0]);
    } else {
      setHighlightedCard(null);
    }
  }, [showModal, availableCards]);

  // Handle card slide change (scrolling) - just updates highlight, doesn't select
  const handleCardSlideChange = (card: Card) => {
    setHighlightedCard(card);
  };

  const handleConfirm = () => {
    confirmSelection();
  };

  // Button should only appear when exactly max selections are made
  const shouldShowButton = selectedCards.length === maxSelections;

  if (availableCards.length === 0) {
    return null;
  }

  return (
    <Modal
      isOpen={showModal}
      onClose={() => {}} // Prevent closing - must select cards
      size="3xl"
      backdrop="blur"
      hideCloseButton={true}
      isDismissable={false}
      classNames={{
        wrapper: 'overflow-hidden items-center',
        // backdrop: 'frame z-[9998]',
        base: 'frame bg-[rgba(0,0,0,0.8)] overflow-y-auto',
        body: 'py-4 px-0',
      }}
    >
      <ModalContent className="relative">
        <ModalBody className="flex flex-col items-center justify-start gap-6 pt-12">
          {/* Title */}
          <div className="flex justify-between items-center px-10">
            <img src={TantrumImage} width={160} height={160} />
            <Text variant="title-6" className="text-common-ash text-left text-balance">
              Choose 2 cards to steal from the winner's win pile:
            </Text>
          </div>

          {/* Selection Counter */}
          {/* <div className="flex items-center gap-2">
            <Text variant="body-large" className="text-common-ash">
              {selectedCards.length} of {maxSelections} selected
            </Text>
          </div> */}

          {/* Card Carousel */}
          <div className="w-full flex flex-col items-center gap-10">
            <div className="relative w-full">
              <CardCarousel
                cards={availableCards}
                onCardSelect={handleCardSlideChange} // Called on scroll - just highlights
                onCardClick={selectCard} // Called on click - toggles selection
                selectedCard={highlightedCard}
                faceDownCardIds={faceDownCardIds} // Show cards with their board face state
                glowCardIds={new Set(selectedCards.map((c) => c.id))} // Track selected cards
                scaleSelectedCards={false} // Don't scale - use checkbox instead
              />
            </div>

            {/* Card Description with Checkbox - only show for highlighted card */}
            {highlightedCard && !faceDownCardIds.has(highlightedCard.id) && (
              <div className="max-w-md flex items-start gap-4 px-10">
                {/* Checkbox to the left - clickable */}
                <button
                  onClick={() => selectCard(highlightedCard)}
                  className={`w-8 h-8 rounded-[6px] border-2 flex items-center justify-center transition-all flex-shrink-0 mt-1 cursor-pointer hover:bg-accent/10 ${
                    selectedCards.some((c) => c.id === highlightedCard.id)
                      ? 'border-accent bg-transparent'
                      : 'border-accent bg-transparent'
                  }`}
                  aria-label={`${selectedCards.some((c) => c.id === highlightedCard.id) ? 'Deselect' : 'Select'} ${highlightedCard.name}`}
                >
                  {selectedCards.some((c) => c.id === highlightedCard.id) && (
                    <svg
                      className="w-6 h-6 text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>

                {/* Card details */}
                <div className="flex flex-col">
                  <Text variant="card-modal-title" color="text-common-ash" className="mb-2">
                    {highlightedCard.name}
                  </Text>
                  {highlightedCard.specialActionDescription && (
                    <Text variant="title-4" color="text-common-ash" weight="extrabold" align="left">
                      {highlightedCard.specialActionDescription}
                    </Text>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Collect Button - only show when both cards are selected */}
          {shouldShowButton && (
            <Button
              onPress={handleConfirm}
              className="bg-accent text-black font-bold px-12 py-6 text-lg rounded-full hover:bg-accent/90 transition-colors flex items-center border-2 border-accent"
              size="lg"
            >
              Collect Your Cards!
            </Button>
          )}

          {/* Instructions */}
          {/* <Text variant="body-small" className="text-common-ash text-center">
            Scroll through cards and tap to select
          </Text> */}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
