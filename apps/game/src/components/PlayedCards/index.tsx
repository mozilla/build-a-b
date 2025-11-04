import type { FC } from 'react';
import { CARD_BACK_IMAGE } from '../../config/game-config';
import { TOOLTIP_CONFIGS } from '../../config/tooltip-config';
import {
  useCurrentEffectNotification,
  useGameStore,
  usePendingEffectNotifications,
  useSetShowEffectNotificationModal,
  useShowEffectNotificationBadge,
} from '../../store';
import { Card } from '../Card';
import { EffectNotificationBadge } from '../EffectNotificationBadge';
import { Tooltip } from '../Tooltip';
import type { PlayedCardsProps } from './types';

const ANIMATION_DELAYS = {
  CARD_ROTATION: 500,
  CARD_SLIDE: 300,
} as const;

export const PlayedCards: FC<PlayedCardsProps> = ({ cards = [] }) => {
  const showEffectNotificationBadge = useShowEffectNotificationBadge();
  const pendingEffectNotifications = usePendingEffectNotifications();
  const currentEffectNotification = useCurrentEffectNotification();
  const setShowEffectNotificationModal = useSetShowEffectNotificationModal();
  const showEffectNotificationModal = useGameStore((state) => state.showEffectNotificationModal);
  const hasSeenTooltip = useGameStore((state) => state.hasSeenTooltip);
  const markTooltipAsSeen = useGameStore((state) => state.markTooltipAsSeen);

  // Check if we should show the effect notification tooltip
  const effectTooltipConfig = TOOLTIP_CONFIGS.EFFECT_NOTIFICATION;
  const shouldShowEffectTooltip =
    !hasSeenTooltip(effectTooltipConfig.id) && !showEffectNotificationModal;

  return (
    <div className="h-[10.9375rem] w-[8.125rem] max-w-[125px] max-h-[175px] flex items-center justify-center relative">
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

        const handleCardClick = () => {
          if (shouldShowBadge) {
            // Mark tooltip as seen (only happens once)
            if (shouldShowEffectTooltip) {
              markTooltipAsSeen(effectTooltipConfig.id);
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
          <div
            key={`${playedCardState.card.id}-${index}`}
            className={`absolute ${isTopCard ? 'animate-slide-from-top' : ''} ${rotationClass} ${
              shouldShowBadge ? 'cursor-pointer' : ''
            }`}
            style={{
              zIndex: index,
              transition: `transform 600ms ease-out ${rotationDelay}ms`,
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
          </div>
        );
      })}
    </div>
  );
};
