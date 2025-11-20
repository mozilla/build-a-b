/**
 * EffectNotificationModal - Modal displaying accumulated special card effects via carousel
 */

import { Frame, Text } from '@/components';
import { Button, Modal, ModalBody, ModalContent } from '@heroui/react';
import { useEffect, useMemo, useState, type FC } from 'react';
import CloseIcon from '../../assets/icons/close-icon.svg';
import { useGameStore } from '../../store';
import type { Card, PlayerType } from '../../types';
import { CardCarousel } from '../CardCarousel';
import type { EffectNotificationModalProps } from './types';

export const EffectNotificationModal: FC<EffectNotificationModalProps> = ({
  ownerBadgeClicked,
}) => {
  const showModal = useGameStore((state) => state.showEffectNotificationModal);
  const closeEffectModal = useGameStore((state) => state.closeEffectModal);
  const playedCardsInHandPlayer = useGameStore((state) => state.player.playedCardsInHand);
  const playedCardsInHandCPU = useGameStore((state) => state.cpu.playedCardsInHand);

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [owner, setOwner] = useState<PlayerType>();
  const [displayOwner, setDisplayOwner] = useState<PlayerType>();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const thereIsCardsInPlayerHand = playedCardsInHandPlayer.length > 0;
  const thereIsCardsInCPUHand = playedCardsInHandCPU.length > 0;
  const indexLastCardInPlayerHand =
    playedCardsInHandPlayer.length > 0 ? playedCardsInHandPlayer.length - 1 : 0;
  const indexLastCardInCPUHand =
    playedCardsInHandCPU.length > 0 ? playedCardsInHandCPU.length - 1 : 0;

  const playedCards = useMemo(() => {
    if (displayOwner === 'player') {
      return playedCardsInHandPlayer.map((card) => card.card);
    }
    return playedCardsInHandCPU.map((card) => card.card);
  }, [displayOwner, playedCardsInHandPlayer, playedCardsInHandCPU]);

  const handleClose = () => {
    closeEffectModal();
  };

  const handleCardSelect = (card: Card) => {
    setSelectedCard(card);
  };

  const handleOwnerChange = (newOwner: PlayerType) => {
    if (newOwner === owner || isTransitioning) return;

    setOwner(newOwner);
    setIsTransitioning(true);

    // Fade out current content
    setTimeout(() => {
      // Switch content at the midpoint
      setDisplayOwner(newOwner);

      // Select appropriate card for new owner
      if (newOwner === 'player' && thereIsCardsInPlayerHand) {
        setSelectedCard(playedCardsInHandPlayer[indexLastCardInPlayerHand].card);
      } else if (newOwner === 'cpu' && thereIsCardsInCPUHand) {
        setSelectedCard(playedCardsInHandCPU[indexLastCardInCPUHand].card);
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

  // Hydrate owner when modal opens and owner is undefined
  useEffect(() => {
    if (showModal && owner === undefined) {
      setOwner(ownerBadgeClicked);
      setDisplayOwner(ownerBadgeClicked);
      setIsTransitioning(false);
    }
  }, [showModal, owner, ownerBadgeClicked]);

  // Reset selected card when modal closes
  useEffect(() => {
    if (!showModal) {
      setSelectedCard(null);
      setOwner(undefined);
      setDisplayOwner(undefined);
      setIsTransitioning(false);
    }
  }, [showModal, setSelectedCard, setOwner]);

  // Select last card played when modal opens (if there is no selected card)
  useEffect(() => {
    if (showModal && !selectedCard) {
      if (owner === 'player' && thereIsCardsInPlayerHand) {
        setSelectedCard(playedCardsInHandPlayer[indexLastCardInPlayerHand].card);
      } else if (owner === 'cpu' && thereIsCardsInCPUHand) {
        setSelectedCard(playedCardsInHandCPU[indexLastCardInCPUHand].card);
      }
    }
  }, [
    indexLastCardInCPUHand,
    indexLastCardInPlayerHand,
    owner,
    playedCardsInHandCPU,
    playedCardsInHandPlayer,
    selectedCard,
    showModal,
    thereIsCardsInCPUHand,
    thereIsCardsInPlayerHand,
  ]);

  if (
    (displayOwner === 'player' && playedCardsInHandPlayer.length === 0) ||
    (displayOwner === 'cpu' && playedCardsInHandCPU.length === 0)
  ) {
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
                  key={displayOwner}
                  cards={playedCards}
                  selectedCard={selectedCard}
                  onCardSelect={handleCardSelect}
                />
              </div>

              {/* Effect Details for selected card - fixed height to prevent layout shift */}
              <div className="max-w-md flex flex-col px-10">
                <Text variant="card-modal-title" color="text-common-ash" className="mb-4">
                  {selectedCard?.name}
                </Text>
                {selectedCard?.specialActionDescription && (
                  <Text variant="title-4" color="text-common-ash" weight="extrabold" align="left">
                    {selectedCard?.specialActionDescription}
                  </Text>
                )}
              </div>
            </div>
          </ModalBody>
        </Frame>
      </ModalContent>
    </Modal>
  );
};
