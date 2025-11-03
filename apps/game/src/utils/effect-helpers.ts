/**
 * Effect Helper Utilities
 * Functions for working with special card effects
 */

import type { Card } from '../types';

/**
 * Determines if a card is a special card with an effect
 */
export function isSpecialCard(card: Card): boolean {
  return card.isSpecial === true;
}

/**
 * Gets the effect type identifier from a card
 * This is used for tracking which effects have been seen
 */
export function getEffectType(card: Card): string {
  // Extract base effect type from card type
  // Examples:
  // - 'tracker-1' -> 'tracker'
  // - 'blocker-2' -> 'blocker'
  // - 'firewall-empathy' -> 'forced_empathy'
  // - 'move-takeover' -> 'hostile_takeover'

  const typeId = card.typeId;

  // Map card typeIds to effect type identifiers
  const effectTypeMap: Record<string, string> = {
    // Trackers (all map to 'tracker')
    'tracker-1': 'tracker',
    'tracker-2': 'tracker',
    'tracker-3': 'tracker',

    // Blockers (all map to 'blocker')
    'blocker-1': 'blocker',
    'blocker-2': 'blocker',

    // Launch Stacks (all map to 'launch_stack')
    'ls-government': 'launch_stack',
    'ls-rocket-company': 'launch_stack',
    'ls-newspaper': 'launch_stack',
    'ls-energy-grid': 'launch_stack',
    'ls-ai-platform': 'launch_stack',

    // Firewalls (each unique)
    'firewall-empathy': 'forced_empathy',
    'firewall-open': 'open_what_you_want',
    'firewall-smacker': 'tracker_smacker',
    'firewall-recall': 'mandatory_recall',

    // Moves (each unique)
    'move-takeover': 'hostile_takeover',
    'move-theft': 'patent_theft',
    'move-buyout': 'leveraged_buyout',
    'move-tantrum': 'temper_tantrum',

    // Data Grab
    'data-grab': 'data_grab',
  };

  return effectTypeMap[typeId] || typeId;
}

/**
 * Gets the list of instant effect types
 * These effects play animations before the notification is shown
 */
export function isInstantEffect(effectType: string): boolean {
  return ['forced_empathy', 'tracker_smacker', 'hostile_takeover'].includes(effectType);
}

/**
 * Configuration for which effects should show notifications
 * Can be modified to exclude certain effects
 */
export const EFFECT_NOTIFICATION_CONFIG = {
  showForEffects: [
    'tracker',
    'blocker',
    'launch_stack',
    'forced_empathy',
    'open_what_you_want',
    'tracker_smacker',
    'mandatory_recall',
    'hostile_takeover',
    'patent_theft',
    'leveraged_buyout',
    'temper_tantrum',
    'data_grab',
  ],
};

/**
 * Checks if an effect type should show a notification
 */
export function shouldShowEffectNotification(effectType: string): boolean {
  return EFFECT_NOTIFICATION_CONFIG.showForEffects.includes(effectType);
}
