/**
 * CPU Player Automation Hook
 * Automatically plays CPU turns with realistic delays
 */

import { useEffect } from 'react';
import type { GamePhase } from '../types';
import { ANIMATION_DURATIONS, getGameSpeedAdjustedDuration } from '../config/animation-timings';
import { useGameStore } from '../store/game-store';

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

  const hostileTakeoverDataWar = useGameStore((state) => state.hostileTakeoverDataWar);
  const playerHasHT = useGameStore((state) => state.player.playedCard?.specialType === 'hostile_takeover');

  useEffect(() => {
    // Only automate during regular ready phase when it's CPU's turn
    // Data War phases require manual player click (both players reveal simultaneously)
    // Exception: During HT data war when PLAYER has HT, CPU auto-plays data war cards
    // (When CPU has HT, player still clicks manually)
    // Also check if game is not paused (e.g., effect modal is open)
    const isDataWarPhase =
      currentPhase === 'data_war.reveal_face_down' || currentPhase === 'data_war.reveal_face_up.ready';
    const shouldAutoPlayDataWar = hostileTakeoverDataWar && playerHasHT && isDataWarPhase;
    const shouldTapReady = activePlayer === 'cpu' && currentPhase === 'ready';
    const shouldTap = enabled && (shouldTapReady || shouldAutoPlayDataWar) && !isPaused;

    if (!shouldTap) {
      return;
    }

    // Add realistic delay for better UX (with game speed adjustment)
    const adjustedDelay = getGameSpeedAdjustedDuration(delay);
    const timer = setTimeout(() => {
      onCPUTurn();
    }, adjustedDelay);

    return () => {
      clearTimeout(timer);
    };
  }, [enabled, activePlayer, currentPhase, delay, isPaused, onCPUTurn, hostileTakeoverDataWar, playerHasHT]);
}
