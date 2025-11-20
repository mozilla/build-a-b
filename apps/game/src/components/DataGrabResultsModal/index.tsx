/**
 * DataGrabResultsModal - Modal displaying results of Data Grab mini-game
 * Shows cards collected by Player vs Opponent in a carousel format
 */

import { Frame, Text } from '@/components';
import { TRACKS } from '@/config/audio-config';
import { Button, Modal, ModalBody, ModalContent } from '@heroui/react';
import { useEffect, useState, type FC } from 'react';
import CloseIcon from '../../assets/icons/close-icon.svg';
import { GameMachineContext } from '../../providers/GameProvider';
import { useGameStore } from '../../store';
import type { Card } from '../../types';
import { CardCarousel } from '../CardCarousel';

type ViewMode = 'player' | 'opponent';

export const DataGrabResultsModal: FC = () => {
  const { playAudio } = useGameStore();
  const actorRef = GameMachineContext.useActorRef();
  const showModal = useGameStore((state) => state.showDataGrabResults);
  const playerCards = useGameStore((state) => state.dataGrabCollectedByPlayer);
  const cpuCards = useGameStore((state) => state.dataGrabCollectedByCPU);
  const setShowDataGrabResults = useGameStore((state) => state.setShowDataGrabResults);

  const [viewMode, setViewMode] = useState<ViewMode>('player');
  const [displayMode, setDisplayMode] = useState<ViewMode>('player');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentCards = displayMode === 'player' ? playerCards : cpuCards;

  // Create a Set of face-down card IDs from current cards
  const faceDownCardIds = new Set(
    currentCards.filter((pcs) => pcs.isFaceDown).map((pcs) => pcs.card.id),
  );

  // Set the first card as selected when cards become available or view mode changes
  useEffect(() => {
    if (currentCards.length > 0) {
      // Extract the Card from PlayedCardState
      setSelectedCard(currentCards[0].card);
    } else {
      setSelectedCard(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayMode, currentCards.length]);

  // Reset to player view when modal opens
  useEffect(() => {
    if (showModal) {
      playAudio(TRACKS.HAND_VIEWER);
      setViewMode('player');
      setDisplayMode('player');
      setIsTransitioning(false);
    }
  }, [showModal, playAudio]);

  const handleClose = () => {
    setShowDataGrabResults(false);
    playAudio(TRACKS.BUTTON_PRESS);
  };

  const handleCardSelect = (card: Card) => {
    setSelectedCard(card);
  };

  const handleCollectCards = () => {
    handleClose();

    // Send CHECK_WIN_CONDITION to continue game flow
    // The state machine will either go to game_over or start a new turn
    actorRef.send({ type: 'CHECK_WIN_CONDITION' });
  };

  const handleViewModeChange = (newMode: ViewMode) => {
    if (newMode === viewMode || isTransitioning) return;
    playAudio(TRACKS.BUTTON_PRESS);

    setViewMode(newMode);
    setIsTransitioning(true);

    // Fade out current content
    setTimeout(() => {
      // Switch content at the midpoint
      setDisplayMode(newMode);

      // Allow React to render, then fade in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 100);
  };

  if (playerCards.length === 0 && cpuCards.length === 0) {
    return null;
  }

  return (
    <Modal
      isOpen={showModal}
      onClose={handleClose}
      size="3xl"
      backdrop="opaque"
      hideCloseButton={true}
      isDismissable={false}
      classNames={{
        wrapper: 'z-[9999]',
        backdrop: 'z-[9998]',
        base: 'bg-[rgba(0,0,0,0.9)] z-[9999]',
        body: 'py-8 px-0',
      }}
    >
      <ModalContent className="relative h-dvh w-screen flex items-center justify-center">
        <Frame className="overflow-y-auto overflow-x-hidden">
          {/* Custom Close Button */}
          <Button
            isIconOnly
            onPress={handleClose}
            className="absolute top-4 right-4 z-65 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex"
            aria-label="Close"
          >
            <img src={CloseIcon} alt="Close" className="w-10 h-10" />
          </Button>

          <ModalBody className="flex flex-col items-center justify-center gap-6 mt-8">
            {/* Title */}
            <Text variant="title-2" className="text-white">
              Data Grabbed!
            </Text>
            <Text variant="body-large" className="text-white">
              Cards added to each deck.
            </Text>

            {/* Player/Opponent Tabs */}
            <div className="flex gap-3 px-6">
              <button
                onClick={() => handleViewModeChange('player')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all cursor-pointer ${
                  viewMode === 'player'
                    ? 'bg-accent border-2 border-accent text-black'
                    : 'bg-transparent border-2 border-white text-white hover:bg-white/10'
                }`}
              >
                Your Cards
              </button>
              <button
                onClick={() => handleViewModeChange('opponent')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all cursor-pointer ${
                  viewMode === 'opponent'
                    ? 'bg-accent border-2 border-accent text-black'
                    : 'bg-transparent border-2 border-white text-white hover:bg-white/10'
                }`}
              >
                Opponent's Cards
              </button>
            </div>

            {/* Card Carousel */}
            <div
              className="transition-opacity duration-100 ease-in-out w-full"
              style={{ opacity: isTransitioning ? 0 : 1 }}
            >
              {currentCards.length > 0 ? (
                <div className="relative w-full">
                  <CardCarousel
                    key={displayMode}
                    cards={currentCards.map((pcs) => pcs.card)}
                    selectedCard={selectedCard}
                    onCardSelect={handleCardSelect}
                    faceDownCardIds={faceDownCardIds}
                  />
                </div>
              ) : (
                <div className="h-[25rem] flex flex-col items-center justify-center">
                  <Text variant="title-2" className="text-common-ash">
                    Nada.Zip.Zilch
                  </Text>
                  <Text variant="body-large" className="text-common-ash">
                    {displayMode === 'player'
                      ? "You didn't collect any data."
                      : 'No data left for them.'}
                  </Text>
                </div>
              )}
            </div>

            {/* Collect Cards Button */}
            <Button
              onPress={handleCollectCards}
              className="bg-accent text-black font-bold px-12 py-6 text-lg rounded-full hover:bg-accent/90 transition-colors flex items-center px-6"
            >
              {playerCards.length > 0 ? 'Collect Cards' : 'Continue'}
            </Button>
          </ModalBody>
        </Frame>
      </ModalContent>
    </Modal>
  );
};
