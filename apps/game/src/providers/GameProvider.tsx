/**
 * Game Provider - Provides shared XState machine instance
 * Creates ONE machine instance that all components share
 */

import { createBrowserInspector } from '@statelyai/inspect';
import { createActorContext } from '@xstate/react';
import { type PropsWithChildren, useEffect } from 'react';
import { gameFlowMachine } from '../machines/game-flow-machine';
import { useGameStore } from '../store/game-store';

// XState Inspector - only enabled in development
const inspector = import.meta.env.DEV
  ? createBrowserInspector({
      autoStart: false, // Auto-open inspector popup
    })
  : undefined;

// Create shared actor context
export const GameMachineContext = createActorContext(gameFlowMachine);

export function GameProvider({ children }: PropsWithChildren) {
  const initializeGame = useGameStore((state) => state.initializeGame);

  // Initialize game on mount
  useEffect(() => {
    // Patent Theft test scenario:
    // Turn 1: CPU plays Launch Stack (6), Player plays common-1 → CPU wins → CPU gets 1 Launch Stack
    // Turn 2: Player plays Patent Theft (6), CPU plays common-3 → Player wins → Player steals Launch Stack
    initializeGame(
      'custom',
      'custom',
      ['common-1', 'move-theft', 'common-2'], // Player: common-1 (lose), Patent Theft (win), extra card
      ['ls-ai-platform', 'common-3', 'common-4'], // CPU: Launch Stack (win), common-3 (lose), extra card
    );
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
