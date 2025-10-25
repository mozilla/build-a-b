/**
 * Helper function to convert XState machine state value to GamePhase string
 *
 * XState v5 returns either:
 * - Simple string for top-level states: 'welcome', 'ready', etc.
 * - Object for nested states: { data_war: 'animating' }, { special_effect: 'showing' }
 *
 * This helper normalizes both formats to a GamePhase string with dot notation for nested states
 */

import type { GamePhase } from '../types';

/**
 * Converts XState state value to GamePhase with dot notation for nested states
 *
 * @param stateValue - The state value from XState snapshot (can be string or object)
 * @returns GamePhase string with dot notation for nested states
 *
 * @example
 * getGamePhase('welcome') // returns 'welcome'
 * getGamePhase('ready') // returns 'ready'
 * getGamePhase({ data_war: 'animating' }) // returns 'data_war.animating'
 * getGamePhase({ special_effect: 'showing' }) // returns 'special_effect.showing'
 */
export function getGamePhase(
  stateValue: string | Record<string, unknown>
): GamePhase {
  // If it's a string, return it directly
  if (typeof stateValue === 'string') {
    return stateValue as GamePhase;
  }

  // If it's an object (nested state), convert to dot notation
  if (typeof stateValue === 'object' && stateValue !== null) {
    const entries = Object.entries(stateValue);
    if (entries.length > 0) {
      const [parentState, childState] = entries[0];
      // Handle nested states - convert to dot notation
      if (typeof childState === 'string') {
        return `${parentState}.${childState}` as GamePhase;
      }
      // If child is also an object, we could handle deeper nesting here
      // but current state machine only has 2 levels
      return parentState as GamePhase;
    }
  }

  // Fallback (should never happen with proper state machine setup)
  return 'welcome';
}
