/**
 * Centralized tooltip configuration
 * All game tooltips are defined here for easy management and type safety
 *
 * maxDisplayCount:
 * - null = unlimited (always show, like "DATA WAR!")
 * - number = show N times max (e.g., 3 = show only first 3 times)
 */

export interface TooltipConfig {
  id: string;
  message: string;
  maxDisplayCount: number | null; // null = unlimited, number = show N times max
}

/**
 * All tooltip configurations
 * Keys are used as references in the state machine
 */
export const TOOLTIP_CONFIGS = {
  // Setup & Intro Tooltips
  INTRO: {
    id: 'intro',
    message: 'How do I play?',
    maxDisplayCount: null, // Always show (informational)
  },
  QUICK_START_GUIDE: {
    id: 'quick_start_guide',
    message: 'Quick Launch Guide',
    maxDisplayCount: null, // Always show (informational)
  },
  YOUR_MISSION: {
    id: 'your_mission',
    message: 'Your mission: (should you choose to accept it)',
    maxDisplayCount: null, // Always show (informational)
  },

  // Deck Interaction Tooltips
  TAP_TO_PLAY: {
    id: 'tap_to_play',
    message: 'Tap to Play',
    maxDisplayCount: null, // Managed by play trigger tracking
  },

  // Data War Tooltips
  DATA_WAR: {
    id: 'data_war',
    message: 'DATA WAR!',
    maxDisplayCount: null, // Always show (excitement/game state)
  },

  // Special Effects Tooltips
  OWYW_TAP_DECK: {
    id: 'owyw_tap_deck',
    message: 'Tap to see top 3 cards',
    maxDisplayCount: 2, // Show first 2 times
  },
  
  // Tableau Tooltips
  TAP_TO_VIEW_CARDS: {
    id: 'tap_to_view_cards',
    message: 'Tap to View Cards',
    maxDisplayCount: null, // Managed by card type tracking
  },

  // Game Over
  GAME_OVER: {
    id: 'game_over',
    message: 'Game Over!',
    maxDisplayCount: null, // Always show (game state)
  },

  // Empty tooltip (for clearing)
  EMPTY: {
    id: 'empty',
    message: '',
    maxDisplayCount: null,
  },
} as const;

/**
 * Type-safe tooltip keys
 * Use this type to ensure only valid tooltip keys are referenced
 */
export type TooltipKey = keyof typeof TOOLTIP_CONFIGS;

/**
 * Gets tooltip configuration by key
 * @param key - The tooltip key from TOOLTIP_CONFIGS
 * @returns The tooltip configuration or null if not found
 */
export function getTooltipConfig(key: TooltipKey): TooltipConfig | null {
  const config = TOOLTIP_CONFIGS[key];

  if (!config) {
    console.warn(`Unknown tooltip key: ${key}`);
    return null;
  }

  return config;
}

/**
 * Gets tooltip message if it should be shown based on display count
 * @param key - The tooltip key from TOOLTIP_CONFIGS
 * @param currentCount - How many times this tooltip has been displayed
 * @returns The tooltip message or empty string if should not be shown
 */
export function getTooltipMessage(key: TooltipKey, currentCount: number): string {
  const config = getTooltipConfig(key);

  if (!config) {
    return '';
  }

  // If maxDisplayCount is null, always show
  if (config.maxDisplayCount === null) {
    return config.message;
  }

  // If we've reached the max display count, don't show
  if (currentCount >= config.maxDisplayCount) {
    return '';
  }

  return config.message;
}

/**
 * Checks if a tooltip should be displayed based on its display count
 * @param key - The tooltip key from TOOLTIP_CONFIGS
 * @param currentCount - How many times this tooltip has been displayed
 * @returns True if tooltip should be shown, false otherwise
 */
export function shouldShowTooltip(key: TooltipKey, currentCount: number): boolean {
  const config = getTooltipConfig(key);

  if (!config) {
    return false;
  }

  // If maxDisplayCount is null, always show
  if (config.maxDisplayCount === null) {
    return true;
  }

  // Check if we haven't reached the max display count
  return currentCount < config.maxDisplayCount;
}
