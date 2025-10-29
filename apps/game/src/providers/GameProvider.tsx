/**
 * Game Provider - Provides shared XState machine instance
 * Creates ONE machine instance that all components share
 */

import { createActorContext } from '@xstate/react';
import { createBrowserInspector } from '@statelyai/inspect';
import { type PropsWithChildren, useEffect } from 'react';
import { gameFlowMachine } from '../machines/game-flow-machine';
import { useGameStore } from '../stores/game-store';

// XState Inspector - only enabled in development
const inspector = import.meta.env.DEV
  ? createBrowserInspector({
      autoStart: true, // Auto-open inspector popup
    })
  : undefined;

// Create shared actor context
export const GameMachineContext = createActorContext(gameFlowMachine);

export function GameProvider({ children }: PropsWithChildren) {
  const initializeGame = useGameStore((state) => state.initializeGame);

  // Initialize game on mount
  useEffect(() => {
    // ====== TEST SCENARIO 1: TRACKER CARDS ======
    // initializeGame('blocker-first', 'common-first');

    // ====== TEST SCENARIO 2: BLOCKER CARDS ======
    // initializeGame('blocker-first', 'common-first');

    // ====== TEST SCENARIO 3: OWYW FLOW ======
    // initializeGame('owyw-first', 'common-first', false, true)

    // Keep adding scenarios here as needed to test different flows.
    initializeGame('firewall-first', 'random', false, true);
  }, [initializeGame]);

  return (
    <GameMachineContext.Provider
      logic={gameFlowMachine.provide({
        guards: {
          hasWinCondition: () => {
            const state = useGameStore.getState();
            return state.winner !== null && state.winCondition !== null;
          },
        },
      })}
      options={{
        inspect: inspector?.inspect,
      }}
    >
      {children}
    </GameMachineContext.Provider>
  );
}
