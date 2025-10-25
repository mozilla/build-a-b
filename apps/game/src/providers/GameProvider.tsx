/**
 * Game Provider - No longer needed with Zustand + XState
 * Zustand doesn't require a provider, but keeping this for compatibility
 * XState machine is instantiated per component via useGameMachine hook
 */

import { type PropsWithChildren, useEffect } from 'react';
import { useGameStore } from '../stores/game-store';

export function GameProvider({ children }: PropsWithChildren) {
  const initializeGame = useGameStore((state) => state.initializeGame);

  // Initialize game on mount
  useEffect(() => {
    // ====== TEST SCENARIO 1: TRACKER CARDS ======
    // initializeGame('blocker-first', 'common-first');

    // ====== TEST SCENARIO 2: BLOCKER CARDS ======
    // initializeGame('blocker-first', 'common-first');

    // Keep adding scenarios here as needed to test different flows.

    initializeGame('random', 'random');
  }, [initializeGame]);

  return <>{children}</>;
}
