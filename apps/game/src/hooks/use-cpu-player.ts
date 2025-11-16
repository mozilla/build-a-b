/**
 * CPU Player Automation Hook
 * Automatically plays CPU turns with realistic delays
 */

import { useEffect } from 'react';
import type { GamePhase } from '../types';
import { ANIMATION_DURATIONS } from '../config/animation-timings';

interface useCpuPlayerOptions {
  enabled?: boolean; // Whether CPU automation is enabled (default: true)
  delay?: number; // Delay in ms before CPU plays (default: CPU_TURN_DELAY)
  isPaused?: boolean; // Whether the game is paused (e.g., modal open) - default: false
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
  options: useCpuPlayerOptions = {},
) {
  const { enabled = true, delay = ANIMATION_DURATIONS.CPU_TURN_DELAY, isPaused = false } = options;

  useEffect(() => {
    // Only automate during regular ready phase when it's CPU's turn
    // Data War phases require manual player click (both players reveal simultaneously)
    // Also check if game is not paused (e.g., effect modal is open)
    const shouldTap = enabled && activePlayer === 'cpu' && currentPhase === 'ready' && !isPaused;

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
  }, [enabled, activePlayer, currentPhase, delay, isPaused, onCPUTurn]);
}
