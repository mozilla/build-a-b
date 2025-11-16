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

export const TemperTantrumModal: FC = () => {
  const showModal = useGameStore((state) => state.showTemperTantrumModal);
  const availableCards = useGameStore((state) => state.temperTantrumAvailableCards);
  const selectedCards = useGameStore((state) => state.temperTantrumSelectedCards);
  const maxSelections = useGameStore((state) => state.temperTantrumMaxSelections);
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

  // Button is only enabled when exactly max selections are made
  const isButtonEnabled = selectedCards.length === maxSelections;

  if (availableCards.length === 0) {
    return null;
  }

  return (
    <Modal
      isOpen={showModal}
      onClose={() => {}} // Prevent closing - must select cards
      size="3xl"
      backdrop="opaque"
      hideCloseButton={true}
      isDismissable={false}
      classNames={{
        wrapper: 'z-[9999]',
        backdrop: 'z-[9998]',
        base: 'bg-[rgba(0,0,0,0.9)] z-[9999]',
        body: 'py-8 px-6',
      }}
    >
      <ModalContent className="relative">
        <ModalBody className="flex flex-col items-center justify-center gap-6">
          {/* Title */}
          <Text variant="title-2" className="text-common-ash text-center">
            Temper Tantrum - Steal Cards
          </Text>

          {/* Subtitle */}
          <Text variant="body-large" className="text-common-ash text-center">
            Select {maxSelections} {maxSelections === 1 ? 'card' : 'cards'} from the winner's pile
          </Text>

          {/* Selection Counter */}
          <div className="flex items-center gap-2">
            <Text variant="body-large" className="text-common-ash">
              {selectedCards.length} of {maxSelections} selected
            </Text>
          </div>

          {/* Card Carousel */}
          <div className="w-full max-w-2xl">
            <CardCarousel
              cards={availableCards}
              onCardSelect={handleCardSlideChange} // Called on scroll - just highlights
              onCardClick={selectCard} // Called on click - toggles selection
              selectedCard={highlightedCard}
              faceDownCardIds={new Set()} // All cards are face-up
              glowCardIds={new Set(selectedCards.map((c) => c.id))} // Track selected cards
              scaleSelectedCards={true} // Scale selected cards instead of glowing
            />
          </div>

          {/* Collect Button */}
          <Button
            onPress={handleConfirm}
            isDisabled={!isButtonEnabled}
            className="bg-accent text-black font-bold px-12 py-6 text-lg rounded-full hover:bg-accent/90 data-[disabled=true]:bg-gray-500 data-[disabled=true]:text-gray-300 transition-colors flex items-center"
            size="lg"
          >
            Collect {maxSelections === 1 ? 'Card' : 'Cards'}
          </Button>

          {/* Instructions */}
          <Text variant="body-small" className="text-common-ash text-center">
            Scroll through cards and tap to select
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
