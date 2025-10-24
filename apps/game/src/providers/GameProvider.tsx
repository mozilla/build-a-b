/**
 * Game Provider - No longer needed with Zustand + XState
 * Zustand doesn't require a provider, but keeping this for compatibility
 * XState machine is instantiated per component via useGameMachine hook
 */

import { type PropsWithChildren, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';

export function GameProvider({ children }: PropsWithChildren) {
  const initializeGame = useGameStore((state) => state.initializeGame);

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return <>{children}</>;
}
