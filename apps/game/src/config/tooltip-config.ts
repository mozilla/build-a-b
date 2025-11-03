/**
 * Centralized tooltip configuration
 * Each tooltip has a unique ID and message
 */

export interface TooltipConfig {
  id: string;
  message: string;
  showOnce: boolean; // If true, only show this tooltip once
}

export const TOOLTIP_CONFIGS: Record<string, TooltipConfig> = {
  READY_TAP_DECK: {
    id: 'ready_tap_deck',
    message: 'Tap stack to start!',
    showOnce: true,
  },

  DATA_WAR: {
    id: 'data_war',
    message: 'DATA WAR!',
    showOnce: false, // Always show (not educational)
  },

  DATA_WAR_FACE_DOWN: {
    id: 'data_war_face_down',
    message: 'Tap to reveal 3 cards face down',
    showOnce: true,
  },

  DATA_WAR_FACE_UP: {
    id: 'data_war_face_up',
    message: 'Tap to reveal final card',
    showOnce: true,
  },

  OWYW_TAP_DECK: {
    id: 'owyw_tap_deck',
    message: 'Tap to see top 3 cards',
    showOnce: true,
  },

  EFFECT_NOTIFICATION: {
    id: 'effect_notification',
    message: 'Tap to see effect',
    showOnce: true, // Educational - show only the first time ever
  },

  // Add more tooltips here as needed
};

/**
 * Gets tooltip message if it should be shown
 * Returns empty string if tooltip has been seen and showOnce is true
 */
export function getTooltipMessage(
  tooltipKey: string,
  hasSeenTooltip: (id: string) => boolean
): string {
  const config = TOOLTIP_CONFIGS[tooltipKey];

  if (!config) {
    console.warn(`Unknown tooltip key: ${tooltipKey}`);
    return '';
  }

  if (config.showOnce && hasSeenTooltip(config.id)) {
    return ''; // Don't show if already seen
  }

  return config.message;
}
