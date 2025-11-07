/**
 * Glow Effects Utility
 * Reusable glow effect utilities for various game elements
 */

export type GlowType =
  | 'tracker'
  | 'firewall'
  | 'blocker'
  | 'move'
  | 'launch-stack'
  | 'data-grab'
  | 'data-war'
  | 'active'
  | 'none';

export type GlowColor = 'accent' | 'blue' | 'purple' | 'gold' | 'white' | 'custom';

interface GlowConfig {
  color: string;
  intensity: 'low' | 'medium' | 'high';
  animated?: boolean;
  animationClass?: string; // CSS class for the animation
}

/**
 * Card-specific glow colors
 * Each card type has its own color matching the card design
 */
export const CARD_GLOW_COLORS = {
  tracker: '#49C1B4', // Teal/cyan
  firewall: '#FEC560', // Orange/yellow
  blocker: '#FCE978', // Yellow
  move: '#8090D0', // Lighter, brighter purple/blue for better visibility
  launch_stack: '#C77DB8', // Lighter, brighter purple for better visibility
  data_grab: '#0088CC', // Blue
  data_war: '#FFFFFF', // White (for common cards in data war)
} as const;

/**
 * Predefined glow configurations for card types
 */
export const GLOW_PRESETS: Record<GlowType, GlowConfig | null> = {
  tracker: {
    color: CARD_GLOW_COLORS.tracker,
    intensity: 'medium',
    animated: true,
    animationClass: 'animate-tracker-glow',
  },
  firewall: {
    color: CARD_GLOW_COLORS.firewall,
    intensity: 'medium',
    animated: true,
    animationClass: 'animate-firewall-glow',
  },
  blocker: {
    color: CARD_GLOW_COLORS.blocker,
    intensity: 'medium',
    animated: true,
    animationClass: 'animate-blocker-glow',
  },
  move: {
    color: CARD_GLOW_COLORS.move,
    intensity: 'medium',
    animated: true,
    animationClass: 'animate-move-glow',
  },
  'launch-stack': {
    color: CARD_GLOW_COLORS.launch_stack,
    intensity: 'medium',
    animated: true,
    animationClass: 'animate-launch-stack-glow',
  },
  'data-grab': {
    color: CARD_GLOW_COLORS.data_grab,
    intensity: 'medium',
    animated: true,
    animationClass: 'animate-data-grab-glow',
  },
  'data-war': {
    color: CARD_GLOW_COLORS.data_war,
    intensity: 'high',
    animated: true,
    animationClass: 'animate-data-war-glow',
  },
  active: {
    color: '#ffffff', // White
    intensity: 'high',
    animated: true,
    animationClass: 'animate-heartbeat',
  },
  none: null,
};

/**
 * Get CSS class names for a glow effect
 * @param type - Predefined glow type
 * @returns CSS class string for the glow effect
 */
export function getGlowClasses(type: GlowType): string {
  const config = GLOW_PRESETS[type];

  if (!config) {
    return '';
  }

  const baseClasses: string[] = [];

  // Add animation class if specified
  if (config.animated && config.animationClass) {
    baseClasses.push(config.animationClass);
  }

  return baseClasses.join(' ');
}

/**
 * Get inline style for custom glow effect
 * @param config - Custom glow configuration
 * @returns React style object
 */
export function getGlowStyle(config: GlowConfig): React.CSSProperties {
  const intensityMap = {
    low: '10px',
    medium: '20px',
    high: '30px',
  };

  const blur = intensityMap[config.intensity];

  return {
    filter: `drop-shadow(0 0 ${blur} ${config.color})`,
  };
}

/**
 * Creates a custom glow configuration
 * @param color - Hex color for the glow
 * @param intensity - Glow intensity level
 * @param animated - Whether the glow should pulse
 * @returns GlowConfig object
 */
export function createCustomGlow(
  color: string,
  intensity: 'low' | 'medium' | 'high' = 'medium',
  animated: boolean = false
): GlowConfig {
  return { color, intensity, animated };
}

/**
 * Determine if a card should glow based on its special type and game state
 * @param specialType - The card's special type (e.g., 'tracker', 'blocker')
 * @param isSpecial - Whether the card has special abilities
 * @param isDataWar - Whether the game is currently in data war state
 * @returns GlowType to apply
 */
export function getCardGlowType(
  specialType: string | undefined,
  isSpecial: boolean = false,
  isDataWar: boolean = false
): GlowType {
  // Common cards glow white during data war
  if (!isSpecial && isDataWar) {
    return 'data-war';
  }

  // No glow for common cards outside data war
  if (!isSpecial || !specialType) {
    return 'none';
  }

  // Map special card types to their color-coded glow types
  switch (specialType) {
    // Tracker cards - Teal glow
    case 'tracker':
      return 'tracker';

    // Blocker cards - Yellow glow
    case 'blocker':
      return 'blocker';

    // Firewall cards - Orange/yellow glow
    case 'forced_empathy':
    case 'tracker_smacker':
    case 'open_what_you_want':
    case 'mandatory_recall':
      return 'firewall';

    // Move cards - Purple/blue glow
    case 'hostile_takeover':
    case 'temper_tantrum':
    case 'patent_theft':
    case 'leveraged_buyout':
      return 'move';

    // Launch Stack cards - Purple glow
    case 'launch_stack':
      return 'launch-stack';

    // Data Grab cards - Blue glow
    case 'data_grab':
      return 'data-grab';

    default:
      return 'none';
  }
}

/**
 * Conditional glow wrapper - returns glow classes if condition is met
 * @param condition - Whether to apply glow
 * @param glowType - Type of glow to apply
 * @returns Class string or empty string
 */
export function conditionalGlow(condition: boolean, glowType: GlowType): string {
  return condition ? getGlowClasses(glowType) : '';
}
