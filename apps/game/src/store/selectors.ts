import { useShallow } from 'zustand/shallow';
import { useGameStore } from './game-store';

// Selector hooks for better performance
export const usePlayer = () => useGameStore((state) => state.player);
export const useCPU = () => useGameStore((state) => state.cpu);
export const useCardsInPlay = () => useGameStore((state) => state.cardsInPlay);
export const useWinner = () => useGameStore((state) => state.winner);
export const useShowEffectNotificationBadge = () =>
  useGameStore((state) => state.showEffectNotificationBadge);
export const usePendingEffectNotifications = () =>
  useGameStore((state) => state.pendingEffectNotifications);
export const useCurrentEffectNotification = () =>
  useGameStore((state) => state.currentEffectNotification);
export const useSetShowEffectNotificationModal = () =>
  useGameStore((state) => state.setShowEffectNotificationModal);
export const useUIState = () =>
  useGameStore((state) => ({
    isPaused: state.isPaused,
    showMenu: state.showMenu,
    showHandViewer: state.showHandViewer,
    showInstructions: state.showInstructions,
    // audioEnabled: state.audioEnabled, // TODO: Add this back in when we have a way to toggle audio
    showTooltip: state.showTooltip,
  }));
export const useOpenWhatYouWantState = () =>
  useGameStore(
    useShallow((state) => ({
      isActive: state.openWhatYouWantActive,
      cards: state.openWhatYouWantCards,
      showModal: state.showOpenWhatYouWantModal,
      showAnimation: state.showOpenWhatYouWantAnimation,
    })),
  );
