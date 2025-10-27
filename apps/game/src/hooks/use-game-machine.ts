/**
 * Hook to use XState game flow machine
 */

import { useMachine } from '@xstate/react';
import { gameFlowMachine } from '../machines/game-flow-machine';
import { useGameStore } from '../stores/game-store';

export function useGameMachine() {
  const checkWinCondition = useGameStore((state) => state.checkWinCondition);

  const [state, send] = useMachine(
    gameFlowMachine.provide({
      guards: {
        hasWinCondition: () => {
          return checkWinCondition();
        },
      },
    }),
  );

  return {
    state,
    send,
    currentPhase: state.value,
    context: state.context,
  };
}
