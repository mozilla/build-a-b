/**
 * Game Provider - Provides shared XState machine instance
 * Creates ONE machine instance that all components share
 */

import { createActorContext } from '@xstate/react';
import { createBrowserInspector } from '@statelyai/inspect';
import { type PropsWithChildren, useEffect } from 'react';
import { gameFlowMachine } from '../machines/game-flow-machine';
import { useGameStore } from '../store/game-store';

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

    // ====== TEST SCENARIO 4: Empathy flow ======
    // initializeGame('custom','custom', ['firewall-empathy', 'common-5', 'tracker-1', 'common-2'], ['common-3', 'common-4']);

    //  ====== TEST SCENARIO 5: Firewall recall ======
    // initializeGame( 'custom','custom',['common-1', 'firewall-recall', 'common-1'],['ls-ai-platform', 'common-2', 'common-3']);

    //  ====== TEST SCENARIO 6: Hostile Takeover ======
    // initializeGame('custom', 'custom', ['move-takeover'], ['tracker-2', 'common-2', 'common-3']);

    //  ====== TEST SCENARIO 7: Patent Theft ======
    // initializeGame('custom', 'custom', ['common-1', 'common-1', 'move-theft'], ['ls-ai-platform', 'common-2', 'common-3']);

    //  ====== TEST SCENARIO 8: Leveraged Buyout ======
    // initializeGame('custom', 'custom', ['move-buyout', 'common-2', 'common-5', ], ['common-1', 'common-3', 'common-4']);

    //  ====== TEST SCENARIO 9: Temper Tantrum (Player LOSES, steals 2 cards) ======
    // initializeGame('custom', 'custom', ['move-tantrum', 'common-2', 'common-1'], ['tracker-3', 'common-5', 'common-4']);

    // Keep adding scenarios here as needed to test different flows.
    initializeGame('random', 'random');
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
