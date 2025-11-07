/**
 * Centralized animation timing constants
 * All values in milliseconds
 */
export const ANIMATION_DURATIONS = {
  // Card animations
  CARD_FLIP: 700, // Card flip animation duration (used by Card component)
  CARD_COMPARISON: 1800, // Increased for data war glow pause
  CARD_PLAY_FROM_DECK: 800, // Duration for card to travel from deck to play area

  // Special effects
  WIN_ANIMATION: 1200,
  OWYW_ANIMATION: 2000,
  SPECIAL_EFFECT_DISPLAY: 2000,
  VS_ANIMATION_DURATION: 3000,

  // Data war
  DATA_WAR_REVEAL: 1000,

  // Player deck win effect
  WIN_EFFECT_DELAY: 500, // Delay before showing win effect
  WIN_EFFECT_DURATION: 2500, // Total time win effect is visible

  // CPU player automation
  CPU_TURN_DELAY: 500, // Delay before CPU plays a card

  // UI transitions
  UI_TRANSITION_DELAY: 300, // General UI transition/navigation delay
  EFFECT_NOTIFICATION_TRANSITION_DELAY: 500, // Delay after closing effect notification modal

  // Special card effects
  CARD_EFFECT_TRIGGER_DELAY: 1000, // Delay before triggering the actual card effect post animation
  CARD_SETTLE_DELAY: 500, // Delay after card lands before effect overlay triggers
  FORCED_EMPATHY_SWAP_DURATION: 1000, // Deck swap animation duration
  FORCED_EMPATHY_VIDEO_DURATION: 5000, // How long the video overlay stays visible (total effect time)
  DATA_WAR_ANIMATION_DURATION: 2000, // Data war character animation duration
} as const;

export type AnimationDuration = keyof typeof ANIMATION_DURATIONS;
