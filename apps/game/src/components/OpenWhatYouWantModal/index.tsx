import { Button, Text } from '@/components';
import { TRACKS } from '@/config/audio-config';
import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import {
  SPECIAL_EFFECT_ANIMATIONS,
  getAnimationVideoSrc,
  isAnimationLottie,
} from '@/config/special-effect-animations';
import { capitalize } from '@/utils/capitalize';
import { cn } from '@/utils/cn';
import { Modal, ModalBody, ModalContent, ModalFooter } from '@heroui/react';
import { useEffect, useRef, useState } from 'react';
import { useGameMachineActor } from '../../hooks/use-game-machine-actor';
import { useGameStore, useOpenWhatYouWantState } from '../../store';
import type { Card } from '../../types';
import { CardCarousel } from '../CardCarousel';
import type { CardCarouselRef } from '../CardCarousel/types';
import { SpecialCardAnimation } from '../SpecialCardAnimation';
import OwywImage from '../../assets/special-effects/owyw.webp';

export const OpenWhatYouWantModal = () => {
  const { playAudio, activePlayer } = useGameStore();
  const { send } = useGameMachineActor();
  const { cards, showModal, isActive } = useOpenWhatYouWantState();
  const playSelectedCardFromOWYW = useGameStore((state) => state.playSelectedCardFromOWYW);
  const setOpenWhatYouWantActive = useGameStore((state) => state.setOpenWhatYouWantActive);
  const clearPreRevealEffects = useGameStore((state) => state.clearPreRevealEffects);
  const carouselRef = useRef<CardCarouselRef>(null);
  const [highlightedCard, setHighlightedCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showCardSelection, setShowCardSelection] = useState(false);

  // Set the first card as highlighted when cards become available
  useEffect(() => {
    if (cards.length > 0 && !highlightedCard) {
      setHighlightedCard(cards[0]);
    }
  }, [cards, highlightedCard]);

  // Show animation when modal opens, then show card selection
  useEffect(() => {
    if (showModal) {
      // Start with animation immediately
      setShowAnimation(true);
      setShowCardSelection(false);

      // After animation duration (6 seconds), hide animation and show card selection
      const timer = setTimeout(() => {
        setShowAnimation(false);
        setShowCardSelection(true);
        playAudio(TRACKS.HAND_VIEWER);
      }, ANIMATION_DURATIONS.SPECIAL_EFFECT_DISPLAY);

      return () => clearTimeout(timer);
    } else {
      // Reset when modal closes
      setHighlightedCard(null);
      setSelectedCard(null);
      setIsBeginning(true);
      setIsEnd(false);
      setShowAnimation(false);
      setShowCardSelection(false);
    }
  }, [showModal, playAudio]);

  // Sync arrow states when carousel is ready
  useEffect(() => {
    if (showModal && highlightedCard && carouselRef.current) {
      const timer = setTimeout(() => {
        if (carouselRef.current) {
          setIsBeginning(carouselRef.current.isBeginning);
          setIsEnd(carouselRef.current.isEnd);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showModal, highlightedCard, cards.length]);

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

  // Handle card slide change (scrolling) - just updates highlight, doesn't select
  const handleCardSlideChange = (card: Card) => {
    setHighlightedCard(card);
    // Sync arrow states when card changes
    if (carouselRef.current) {
      setIsBeginning(carouselRef.current.isBeginning);
      setIsEnd(carouselRef.current.isEnd);
    }
  };

  // Handle checkbox click - toggles selection (radio button behavior)
  const handleCheckboxClick = (card: Card) => {
    // Radio button behavior: selecting a new card deselects the previous one
    setSelectedCard(card);
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

  const animation = SPECIAL_EFFECT_ANIMATIONS.open_what_you_want;
  const isPlayerAction = activePlayer === 'player';

  return (
    <>
      {/* Show animation overlay */}
      {showAnimation && (
        <SpecialCardAnimation
          show={true}
          animationSrc={getAnimationVideoSrc(animation, isPlayerAction)}
          isLottie={isAnimationLottie(animation)}
          title={animation.title}
          loop={animation.loop}
        />
      )}

      {/* Show modal with card selection after animation */}
      <Modal
        hideCloseButton
        isOpen={showModal && showCardSelection}
        size="3xl"
        backdrop="blur"
        classNames={{
          wrapper: 'overflow-hidden items-center z-[9999]',
          backdrop: 'z-[9999]',
          base: 'frame bg-[rgba(0,0,0,0.9)] z-[9999]',
          body: 'px-0 pt-6',
        }}
      >
        <ModalContent className="relative">
          <ModalBody className="flex flex-col items-center justify-start gap-4">
          {/* Title */}
          <div className="flex justify-between items-center px-8">
            <img src={OwywImage} width={160} height={160} className="w-40 h-40" />
            <Text variant="title-6" className="text-common-ash text-left text-balance">
              Look at the top 3 cards in your deck and select one to play:
            </Text>
          </div>
          {cards.length > 0 ? (
            <div className="w-full flex flex-col items-center gap-6">
              <div className="relative w-full">
                <CardCarousel
                  ref={carouselRef}
                  cards={cards}
                  onCardSelect={handleCardSlideChange}
                  onCardClick={handleCheckboxClick}
                  selectedCard={highlightedCard}
                  glowCardIds={selectedCard ? new Set([selectedCard.id]) : undefined}
                  scaleSelectedCards={false}
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

              {/* Card Description with Checkbox - show for highlighted card */}
              {highlightedCard && (
                <div className="max-w-md w-full flex items-start gap-4 px-10">
                  {/* Checkbox to the left - clickable */}
                  <button
                    onClick={() => handleCheckboxClick(highlightedCard)}
                    className={`w-8 h-8 rounded-[6px] border-2 flex items-center justify-center transition-all flex-shrink-0 mt-1 cursor-pointer hover:bg-accent/10 ${
                      selectedCard?.id === highlightedCard.id
                        ? 'border-accent bg-transparent'
                        : 'border-accent bg-transparent'
                    }`}
                    aria-label={`${selectedCard?.id === highlightedCard.id ? 'Deselect' : 'Select'} ${highlightedCard.name}`}
                  >
                    {selectedCard?.id === highlightedCard.id && (
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

                  {/* Card details - show for all cards */}
                  <div className="flex flex-col">
                    <Text variant="title-3" color="text-common-ash" className="mb-2">
                      {capitalize(highlightedCard.specialType || highlightedCard.name)}
                    </Text>
                    {highlightedCard.specialActionDescription && (
                      <Text variant="title-5" color="text-common-ash" weight="extrabold" align="left">
                        {highlightedCard.specialActionDescription}
                      </Text>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">No cards available</div>
          )}
        </ModalBody>
        <ModalFooter className="mb-6">
          {/* Play Button - only show when a card is selected */}
          {selectedCard && (
            <Button
              className="w-full max-w-[15.5rem] mx-auto"
              onClick={handleConfirm}
              variant="primary"
            >
              Play this Card
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
    </>
  );
};
