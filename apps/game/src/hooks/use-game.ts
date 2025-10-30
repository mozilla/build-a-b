/**
 * Hook to access game state and actions
 * For now, just use Zustand store
 * XState machine will be used in specific components that need flow control
 */

import { useGameStore } from '../store/game-store';

export function useGame() {
  return useGameStore();
}
