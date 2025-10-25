/**
 * Hook to use XState game flow machine
 */

import { useMachine } from '@xstate/react';
import { gameFlowMachine } from '../machines/gameFlowMachine';
import { useGameStore } from '../stores/gameStore';

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
