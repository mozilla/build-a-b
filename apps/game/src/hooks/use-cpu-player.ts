/**
 * CPU Player Automation Hook
 * Automatically plays CPU turns with realistic delays
 */

import { useEffect } from 'react';
import type { GamePhase } from '../types';

interface useCpuPlayerOptions {
  enabled?: boolean; // Whether CPU automation is enabled (default: true)
  delay?: number; // Delay in ms before CPU plays (default: 1000ms)
}

/**
 * Hook that automatically triggers CPU turns when it's their turn
 *
 * @param currentPhase - Current game phase from state machine
 * @param activePlayer - Which player's turn it is
 * @param onCPUTurn - Callback to execute when CPU should play
 * @param options - Configuration options
 */
export function useCpuPlayer(
  currentPhase: GamePhase,
  activePlayer: 'player' | 'cpu',
  onCPUTurn: () => void,
  options: useCpuPlayerOptions = {}
) {
  const { enabled = true, delay = 1000 } = options;

  useEffect(() => {
    // Only automate during regular ready phase when it's CPU's turn
    // Data War phases require manual player click (both players reveal simultaneously)
    const shouldTap = enabled && activePlayer === 'cpu' && currentPhase === 'ready';

    if (!shouldTap) {
      return;
    }

    // Add realistic delay for better UX
    const timer = setTimeout(() => {
      onCPUTurn();
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [enabled, activePlayer, currentPhase, delay, onCPUTurn]);
}
