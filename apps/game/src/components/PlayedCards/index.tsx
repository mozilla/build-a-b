import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import { cn } from '@/utils/cn';
import { getCardGlowType, getGlowClasses } from '@/utils/glow-effects';
import { useSelector } from '@xstate/react';
import { motion } from 'framer-motion';
import type { FC } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import { CARD_BACK_IMAGE } from '../../config/game-config';
import { TOOLTIP_CONFIGS } from '../../config/tooltip-config';
import { GameMachineContext } from '../../providers/GameProvider';
import {
  useCurrentEffectNotification,
  useGameStore,
  usePendingEffectNotifications,
  useSetShowEffectNotificationModal,
  useShowEffectNotificationBadge,
} from '../../store';
import { getGamePhase } from '../../utils/get-game-phase';
import { Card } from '../Card';
import { EffectNotificationBadge } from '../EffectNotificationBadge';
import { Tooltip } from '../Tooltip';
import type { PlayedCardsProps } from './types';

const ANIMATION_DELAYS = {
  CARD_ROTATION: 500,
  CARD_SLIDE: 300,
} as const;

export const PlayedCards: FC<PlayedCardsProps> = ({ cards = [], owner }) => {
  const showEffectNotificationBadge = useShowEffectNotificationBadge();
  const pendingEffectNotifications = usePendingEffectNotifications();
  const currentEffectNotification = useCurrentEffectNotification();
  const setShowEffectNotificationModal = useSetShowEffectNotificationModal();
  const showEffectNotificationModal = useGameStore((state) => state.showEffectNotificationModal);
  const shouldShowTooltip = useGameStore((state) => state.shouldShowTooltip);
  const incrementTooltipCount = useGameStore((state) => state.incrementTooltipCount);

  // Get game phase to detect data war
  const actorRef = GameMachineContext.useActorRef();
  const stateValue = useSelector(actorRef, (snapshot) => snapshot.value);
  const phase = getGamePhase(stateValue);

  // Show glow for common cards:
  // - ONLY during 'comparing' phase if cards are tied (before animation starts)
  // - NOT during data_war phases (animation playing or after)
  // - NOT when expecting another play (blocker/tracker/launch stack needs to play again)
  const player = useGameStore((state) => state.player);
  const cpu = useGameStore((state) => state.cpu);
  const dataWarVideoPlaying = useGameStore((state) => state.dataWarVideoPlaying);
  const anotherPlayExpected = useGameStore((state) => state.anotherPlayExpected);
  const isTiedInComparing =
    phase === 'comparing' &&
    player.playedCard &&
    cpu.playedCard &&
    player.currentTurnValue === cpu.currentTurnValue &&
    !anotherPlayExpected; // Don't show glow if expecting another play
  // Only show glow before the animation starts
  const shouldShowDataWarGlow = isTiedInComparing;

  const playAreaRef = useRef<HTMLDivElement>(null);
  const [deckOffset, setDeckOffset] = useState({ x: 0, y: 0 });

  // Check if we should show the effect notification tooltip
  const effectTooltipConfig = TOOLTIP_CONFIGS.EFFECT_NOTIFICATION;
  const shouldShowEffectTooltip =
    shouldShowTooltip(effectTooltipConfig.id, effectTooltipConfig.maxDisplayCount) &&
    !showEffectNotificationModal;

  // Determine if this is the CPU's or player's card
  const isCPU = owner === 'cpu';

  // Measure the distance from deck to play area dynamically
  useLayoutEffect(() => {
    const measureDistance = () => {
      if (!playAreaRef.current) return;

      // Find the deck pile element based on owner
      const deckSelector = isCPU
        ? '[data-deck-owner="cpu"]' // CPU deck at top
        : '[data-deck-owner="player"]'; // Player deck at bottom

      const deckElement = document.querySelector(deckSelector);

      if (!deckElement || !playAreaRef.current) return;

      const deckRect = deckElement.getBoundingClientRect();
      const playAreaRect = playAreaRef.current.getBoundingClientRect();

      // Calculate the offset from deck center to play area center
      const deltaX =
        deckRect.left + deckRect.width / 2 - (playAreaRect.left + playAreaRect.width / 2);
      const deltaY =
        deckRect.top + deckRect.height / 2 - (playAreaRect.top + playAreaRect.height / 2);

      setDeckOffset({ x: deltaX, y: deltaY });
    };

    measureDistance();

    // Remeasure on window resize
    window.addEventListener('resize', measureDistance);
    return () => window.removeEventListener('resize', measureDistance);
  }, [isCPU, cards.length]); // Re-measure when cards change

  return (
    <div
      ref={playAreaRef}
      className="h-[10.9375rem] w-[8.125rem] max-w-[125px] max-h-[175px] flex items-center justify-center relative"
    >
      {cards.map((playedCardState, index) => {
        const isTopCard = index === cards.length - 1;
        // Top card stays straight, cards underneath get subtle rotation (-5 to +5)
        const rotations = [
          '-rotate-3',
          'rotate-2',
          '-rotate-1',
          'rotate-3',
          'rotate-1',
          '-rotate-2',
        ];
        const rotationClass = isTopCard
          ? 'rotate-0'
          : rotations[(playedCardState.card.id.charCodeAt(0) + index * 7) % rotations.length];

        // Delay rotation for previous cards when new card lands
        const rotationDelay = isTopCard ? 0 : ANIMATION_DELAYS.CARD_ROTATION; // Rotate after new card's animation

        // Show card back for face-down cards, card front for face-up
        const cardImage = playedCardState.isFaceDown
          ? CARD_BACK_IMAGE
          : playedCardState.card.imageUrl;

        // Check if this card should show the effect notification badge
        const shouldShowBadge =
          isTopCard &&
          showEffectNotificationBadge &&
          pendingEffectNotifications.some((notif) => notif.card.id === playedCardState.card.id);

        // Determine if this card should glow
        // Only show glow on: top card, not face-down, has special ability or data war
        const glowType =
          isTopCard && !playedCardState.isFaceDown
            ? getCardGlowType(
                playedCardState.card.specialType,
                playedCardState.card.isSpecial,
                shouldShowDataWarGlow || false,
              )
            : 'none';
        const glowClasses = getGlowClasses(glowType);

        const handleCardClick = () => {
          if (shouldShowBadge) {
            // Increment tooltip display count
            if (shouldShowEffectTooltip) {
              incrementTooltipCount(effectTooltipConfig.id);
            }

            // Find the notification for this card
            const clickedNotification = pendingEffectNotifications.find(
              (notif) => notif.card.id === playedCardState.card.id,
            );

            // If it's not the current notification, make it current
            if (clickedNotification && clickedNotification !== currentEffectNotification) {
              // Reorder queue to put this notification first
              const reorderedNotifications = [
                clickedNotification,
                ...pendingEffectNotifications.filter((notif) => notif !== clickedNotification),
              ];
              useGameStore.setState({
                pendingEffectNotifications: reorderedNotifications,
                currentEffectNotification: clickedNotification,
              });
            }

            setShowEffectNotificationModal(true);
          }
        };

        return (
          <motion.div
            key={`${playedCardState.card.id}-${index}`}
            className={cn(
              'absolute',
              rotationClass,
              shouldShowBadge && 'cursor-pointer',
              glowClasses,
            )}
            style={{
              zIndex: '5',
              // Force animation and glow to stop when video is playing
              ...(dataWarVideoPlaying &&
                glowType === 'data-war' && {
                  animation: 'none',
                  filter: 'none',
                }),
            }}
            initial={{
              // Start from measured deck position
              x: deckOffset.x,
              y: deckOffset.y,
              rotate: isCPU ? -14 : 12, // Initial rotation based on Figma frames
              scale: 0.69, // Cards start at deck size (86px vs 125px ≈ 0.69)
            }}
            animate={{
              // Animate to center position
              x: 0,
              y: 0,
              rotate: 0,
              scale: 1,
            }}
            transition={{
              duration: ANIMATION_DURATIONS.CARD_PLAY_FROM_DECK / 1000,
              ease: [0.43, 0.13, 0.23, 0.96], // Custom easing for smooth movement
              delay: isTopCard ? 0 : rotationDelay / 1000,
            }}
            onClick={handleCardClick}
          >
            <Card cardFrontSrc={cardImage} state="flipped" />

            {/* Effect Notification Badge with optional tooltip */}
            {shouldShowBadge &&
              (() => {
                const notification = pendingEffectNotifications.find(
                  (notif) => notif.card.id === playedCardState.card.id,
                );

                if (!notification) return null;

                // Wrap badge with tooltip only on first effect notification
                return (
                  <div className="absolute top-1/2 -translate-y-[5rem] -right-29 z-10">
                    <Tooltip
                      content={effectTooltipConfig.message}
                      placement="bottom"
                      arrowDirection="left"
                      isOpen={shouldShowEffectTooltip}
                      classNames={{
                        base: ['translate-x-1', 'translate-y-[-0.8rem]'],
                        content: ['text-green-400', 'text-sm', 'p-1', 'max-w-[6rem]'],
                      }}
                    >
                      <div>
                        <EffectNotificationBadge
                          effectName={
                            notification.specialType === 'launch_stack'
                              ? 'Launch Stack'
                              : notification.effectName
                          }
                        />
                      </div>
                    </Tooltip>
                  </div>
                );
              })()}
          </motion.div>
        );
      })}
    </div>
  );
};
