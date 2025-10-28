/**
 * Centralized animation timing constants
 * All values in milliseconds
 */
export const ANIMATION_DURATIONS = {
  // Card reveal and comparison
  CARD_FLIP: 1000,
  CARD_COMPARISON: 1500,

  // Special effects
  WIN_ANIMATION: 1200,
  OWYW_ANIMATION: 2000,
  SPECIAL_EFFECT_DISPLAY: 2000,

  // Data war
  DATA_WAR_REVEAL: 1000,
} as const;

export type AnimationDuration = keyof typeof ANIMATION_DURATIONS;
