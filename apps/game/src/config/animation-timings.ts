/**
 * Centralized animation timing constants
 * All values in milliseconds
 */
export const ANIMATION_DURATIONS = {
  // Card animations
  CARD_FLIP: 700,               // Card flip animation duration (used by Card component)
  CARD_COMPARISON: 1500,

  // Special effects
  WIN_ANIMATION: 1200,
  OWYW_ANIMATION: 2000,
  SPECIAL_EFFECT_DISPLAY: 2000,

  // Data war
  DATA_WAR_REVEAL: 1000,

  // Player deck win effect
  WIN_EFFECT_DELAY: 500,        // Delay before showing win effect
  WIN_EFFECT_DURATION: 2500,    // Total time win effect is visible

  // CPU player automation
  CPU_TURN_DELAY: 1000,         // Delay before CPU plays a card

  // UI transitions
  UI_TRANSITION_DELAY: 300,     // General UI transition/navigation delay

  // Special card effects
  FORCED_EMPATHY_SWAP: 1500,    // Deck swap animation duration
} as const;

export type AnimationDuration = keyof typeof ANIMATION_DURATIONS;
