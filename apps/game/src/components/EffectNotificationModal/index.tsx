/**
 * EffectNotificationModal - Modal displaying accumulated special card effects via carousel
 */

import { Frame, Text } from '@/components';
import { TRACKS } from '@/config/audio-config';
import { Button, Modal, ModalBody, ModalContent } from '@heroui/react';
import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import CloseIcon from '../../assets/icons/close-icon.svg';
import { useGameStore } from '../../store';
import type { Card, PlayerType } from '../../types';
import { cn } from '@/utils/cn';
import { CardCarousel } from '../CardCarousel';
import type { CardCarouselRef } from '../CardCarousel/types';
import type { EffectNotificationModalProps } from './types';

export const EffectNotificationModal: FC<EffectNotificationModalProps> = ({
  ownerBadgeClicked,
}) => {
  const { playAudio } = useGameStore();
  const showModal = useGameStore((state) => state.showEffectNotificationModal);
  const closeEffectModal = useGameStore((state) => state.closeEffectModal);
  const playedCardsInHandPlayer = useGameStore((state) => state.player.playedCardsInHand);
  const playedCardsInHandCPU = useGameStore((state) => state.cpu.playedCardsInHand);

  const carouselRef = useRef<CardCarouselRef>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [owner, setOwner] = useState<PlayerType>();
  const [displayOwner, setDisplayOwner] = useState<PlayerType>();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isBeginning, setIsBeginning] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  
  // Snapshot cards when modal opens to prevent premature unmounting
  const [snapshotPlayerCards, setSnapshotPlayerCards] = useState<typeof playedCardsInHandPlayer>([]);
  const [snapshotCPUCards, setSnapshotCPUCards] = useState<typeof playedCardsInHandCPU>([]);

  // Use snapshot cards to prevent modal from closing when playedCardsInHand is cleared during collection
  const thereIsCardsInPlayerHand = snapshotPlayerCards.length > 0;
  const thereIsCardsInCPUHand = snapshotCPUCards.length > 0;
  const indexLastCardInPlayerHand =
    snapshotPlayerCards.length > 0 ? snapshotPlayerCards.length - 1 : 0;
  const indexLastCardInCPUHand =
    snapshotCPUCards.length > 0 ? snapshotCPUCards.length - 1 : 0;

  const playedCards = useMemo(() => {
    if (displayOwner === 'player') {
      return snapshotPlayerCards.map((pcs) => pcs.card);
    }
    return snapshotCPUCards.map((pcs) => pcs.card);
  }, [displayOwner, snapshotPlayerCards, snapshotCPUCards]);

  // Create set of face-down card IDs for the current display owner
  const faceDownCardIds = useMemo(() => {
    const cards = displayOwner === 'player' ? snapshotPlayerCards : snapshotCPUCards;
    return new Set(
      cards.filter((pcs) => pcs.isFaceDown).map((pcs) => pcs.card.id)
    );
  }, [displayOwner, snapshotPlayerCards, snapshotCPUCards]);

  const handleClose = () => {
    playAudio(TRACKS.BUTTON_PRESS);
    playAudio(TRACKS.WHOOSH);
    closeEffectModal();
  };

  const handleCardSelect = (card: Card) => {
    playAudio(TRACKS.OPTION_FOCUS);
    setSelectedCard(card);
    // Sync arrow states when card changes
    if (carouselRef.current) {
      setIsBeginning(carouselRef.current.isBeginning);
      setIsEnd(carouselRef.current.isEnd);
    }
  };

  const handleOwnerChange = (newOwner: PlayerType) => {
    if (newOwner === owner || isTransitioning) return;
    playAudio(TRACKS.BUTTON_PRESS);

    setOwner(newOwner);
    setIsTransitioning(true);

    // Fade out current content
    setTimeout(() => {
      // Switch content at the midpoint
      setDisplayOwner(newOwner);

      // Select appropriate card for new owner (use snapshot)
      if (newOwner === 'player' && thereIsCardsInPlayerHand) {
        setSelectedCard(snapshotPlayerCards[indexLastCardInPlayerHand].card);
      } else if (newOwner === 'cpu' && thereIsCardsInCPUHand) {
        setSelectedCard(snapshotCPUCards[indexLastCardInCPUHand].card);
      }

      // Allow React to render, then fade in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 100);
  };

  const handleOnGoToYourPlay = () => {
    handleOwnerChange('player');
  };

  const handleOnGoToOpponentsPlay = () => {
    handleOwnerChange('cpu');
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

  // Take snapshot of cards when modal opens (prevents premature unmounting during collection)
  useEffect(() => {
    if (showModal) {
      // Only take snapshot if we don't have one yet (modal just opened)
      if (snapshotPlayerCards.length === 0 && playedCardsInHandPlayer.length > 0) {
        setSnapshotPlayerCards(playedCardsInHandPlayer);
      }
      if (snapshotCPUCards.length === 0 && playedCardsInHandCPU.length > 0) {
        setSnapshotCPUCards(playedCardsInHandCPU);
      }
    }
  }, [showModal, playedCardsInHandPlayer, playedCardsInHandCPU, snapshotPlayerCards.length, snapshotCPUCards.length]);

  // Hydrate owner when modal opens and owner is undefined
  useEffect(() => {
    if (showModal && owner === undefined) {
      setOwner(ownerBadgeClicked);
      setDisplayOwner(ownerBadgeClicked);
      setIsTransitioning(false);
    }
  }, [showModal, owner, ownerBadgeClicked]);

  // Reset selected card and snapshots when modal closes
  useEffect(() => {
    if (!showModal) {
      setSelectedCard(null);
      setOwner(undefined);
      setDisplayOwner(undefined);
      setIsTransitioning(false);
      setSnapshotPlayerCards([]);
      setSnapshotCPUCards([]);
      setIsBeginning(false);
      setIsEnd(false);
    }
  }, [showModal]);

  // Select last card played when modal opens (if there is no selected card)
  useEffect(() => {
    if (showModal && !selectedCard) {
      if (owner === 'player' && thereIsCardsInPlayerHand) {
        setSelectedCard(snapshotPlayerCards[indexLastCardInPlayerHand].card);
      } else if (owner === 'cpu' && thereIsCardsInCPUHand) {
        setSelectedCard(snapshotCPUCards[indexLastCardInCPUHand].card);
      }
    }
  }, [
    indexLastCardInCPUHand,
    indexLastCardInPlayerHand,
    owner,
    snapshotCPUCards,
    snapshotPlayerCards,
    selectedCard,
    showModal,
    thereIsCardsInCPUHand,
    thereIsCardsInPlayerHand,
  ]);

  // Sync arrow states when carousel is ready or owner changes
  useEffect(() => {
    if (showModal && selectedCard && carouselRef.current) {
      // Small delay to ensure carousel has initialized
      const timer = setTimeout(() => {
        if (carouselRef.current) {
          setIsBeginning(carouselRef.current.isBeginning);
          setIsEnd(carouselRef.current.isEnd);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showModal, selectedCard, displayOwner, playedCards.length]);

  // Only return null if modal is not shown or if snapshots are empty
  // This prevents premature unmounting when playedCardsInHand is cleared during collection
  if (!showModal || 
    (displayOwner === 'player' && snapshotPlayerCards.length === 0) ||
    (displayOwner === 'cpu' && snapshotCPUCards.length === 0)
  ) {
    return null;
  }

  return (
    <Modal
      isOpen={showModal}
      onClose={handleClose}
      size="3xl"
      backdrop="blur"
      hideCloseButton={true}
      isDismissable={false}
      classNames={{
        wrapper: 'overflow-hidden items-center z-[var(--z-modal-backdrop)]',
        backdrop: 'z-[var(--z-modal-backdrop)]',
        base: 'frame bg-[rgba(0,0,0,0.8)] overflow-y-auto z-[var(--z-modal-content)]',
        body: 'pt-12 pb-8 px-0',
      }}
    >
      <ModalContent className="cursor-pointer relative h-dvh w-screen flex items-center justify-center">
        <Frame variant="scrollable" className="flex flex-col overflow-y-auto h-auto">
          {/* Custom Close Button */}
          <Button
            isIconOnly
            onPress={handleClose}
            className="absolute top-4 right-4 z-65 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <img src={CloseIcon} alt="Close" className="w-10 h-10" />
          </Button>

          <ModalBody className="flex flex-col items-center justify-start gap-10 size-full mt-8">
            {/* Player Indicator - updates with carousel */}
            <div className="flex gap-3 px-6">
              <Button
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                  owner === 'player'
                    ? 'bg-accent border-2 border-accent text-black'
                    : 'bg-transparent border-2 border-white text-white'
                }`}
                onPress={handleOnGoToYourPlay}
                aria-label="Your Play"
              >
                Your Play
              </Button>
              <Button
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                  owner === 'cpu'
                    ? 'bg-accent border-2 border-accent text-black'
                    : 'bg-transparent border-2 border-white text-white'
                }`}
                onPress={handleOnGoToOpponentsPlay}
                aria-label="Opponent's Play"
              >
                Opponent's Play
              </Button>
            </div>

            {/* Card Carousel */}
            <div
              className="transition-opacity duration-100 ease-in-out w-full flex flex-col items-center gap-10"
              style={{ opacity: isTransitioning ? 0 : 1 }}
            >
              <div className="relative w-full">
                <CardCarousel
                  ref={carouselRef}
                  key={displayOwner}
                  cards={playedCards}
                  selectedCard={selectedCard}
                  onCardSelect={handleCardSelect}
                  faceDownCardIds={faceDownCardIds}
                />

                {/* Navigation Arrows - Only show if more than one card */}
                {playedCards.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevClick}
                      disabled={isBeginning}
                      aria-label="Previous card"
                      className={cn(
                        'absolute left-[1.53125rem] top-1/2 -translate-y-1/2 z-10',
                        'w-[2.125rem] h-[2.125rem] rounded-full',
                        'bg-accent border-2 border-accent',
                        'flex items-center justify-center',
                        'transition-opacity duration-200',
                        'cursor-pointer hover:bg-accent/90',
                        isBeginning && 'opacity-30 cursor-not-allowed',
                      )}
                    >
                      <svg
                        width="0.5rem"
                        height="0.875rem"
                        viewBox="0 0 8 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-black"
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
                        'bg-accent border-2 border-accent',
                        'flex items-center justify-center',
                        'transition-opacity duration-200',
                        'cursor-pointer hover:bg-accent/90',
                        isEnd && 'opacity-30 cursor-not-allowed',
                      )}
                    >
                      <svg
                        width="0.5rem"
                        height="0.875rem"
                        viewBox="0 0 8 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-black"
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

              {/* Effect Details for selected card - fixed height to prevent layout shift */}
              {/* Hide title and description for face-down cards */}
              {selectedCard && !faceDownCardIds.has(selectedCard.id) && (
                <div className="max-w-md flex flex-col px-10">
                  <Text variant="card-modal-title" color="text-common-ash" className="mb-4">
                    {selectedCard.name}
                  </Text>
                  {selectedCard.specialActionDescription && (
                    <Text variant="title-4" color="text-common-ash" weight="extrabold" align="left">
                      {selectedCard.specialActionDescription}
                    </Text>
                  )}
                </div>
              )}
            </div>
          </ModalBody>
        </Frame>
      </ModalContent>
    </Modal>
  );
};
