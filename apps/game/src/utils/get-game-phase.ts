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
      // Handle 3-level nesting (e.g., data_war.reveal_face_up.settling)
      if (typeof childState === 'object' && childState !== null) {
        const childEntries = Object.entries(childState);
        if (childEntries.length > 0) {
          const [midState, leafState] = childEntries[0];
          if (typeof leafState === 'string') {
            return `${parentState}.${midState}.${leafState}` as GamePhase;
          }
        }
      }
      return parentState as GamePhase;
    }
  }

  // Fallback (should never happen with proper state machine setup)
  return 'welcome';
}
