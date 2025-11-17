/**
 * Centralized animation timing constants
 * All values in milliseconds
 */
export const ANIMATION_DURATIONS = {
  LOADING_SCREEN_COMPLETE_DELAY: 800, // Delay after reaching 100% before proceeding (if user saw LoadingScreen)
  // Card animations
  CARD_FLIP: 700, // Card flip animation duration (used by Card component)
  CARD_COMPARISON: 1800, // Increased for data war glow pause
  CARD_PLAY_FROM_DECK: 800, // Duration for card to travel from deck to play area
  CARD_COLLECTION: 1200, // Duration for cards to collect to winning deck (matches WIN_ANIMATION)

  // Special effects
  WIN_ANIMATION: 1200, // Reduced from 1200ms for faster turn resolution
  OWYW_ANIMATION: 2000,
  SPECIAL_EFFECT_DISPLAY: 4000,
  VS_ANIMATION_DURATION: 3000, // Approximate duration - actual transition triggered by video 'ended' event

  // Data war
  DATA_WAR_REVEAL: 1000,
  DATA_WAR_BADGE_VIEWING_DELAY: 2000, // Time to allow player to view badge/modal before Data War starts (e.g., after Hostile Takeover)

  // Player deck win effect
  WIN_EFFECT_DELAY: 500, // Delay before showing win effect
  WIN_EFFECT_DURATION: 2500, // Total time win effect is visible

  // CPU player automation
  CPU_TURN_DELAY: 500, // Delay before CPU plays a card

  // UI transitions
  UI_TRANSITION_DELAY: 300, // General UI transition/navigation delay
  EFFECT_NOTIFICATION_TRANSITION_DELAY: 2000, // Delay after effect animations complete - gives users time to click badge/card

  // Special card effects
  CARD_EFFECT_TRIGGER_DELAY: 1000, // Delay before triggering the actual card effect post animation
  CARD_SETTLE_DELAY: 1000, // Delay after card lands before effect overlay triggers (matches CARD_PLAY_FROM_DECK + 200ms pause)
  FORCED_EMPATHY_SWAP_DURATION: 1000, // Deck swap animation duration
  FORCED_EMPATHY_VIDEO_DURATION: 5000, // How long the video overlay stays visible (total effect time)
  FORCED_EMPATHY_SETTLE_DELAY: 1000, // Delay after deck swap completes before continuing game flow (prevents overlap with subsequent animations)
  DATA_WAR_ANIMATION_DURATION: 2000, // Data war character animation duration
  DATA_WAR_FACE_DOWN_CARDS_ANIMATION_DURATION: 3000,

  // Data Grab mini-game
  DATA_GRAB_TAKEOVER: 5000, // Takeover intro animation
  DATA_GRAB_GAME: 4500, // Active gameplay duration (matches card fall speed)
  DATA_GRAB_HAND_VIEWER: 1000, // Minimum results display time (reduced from 3000ms)

  // LaunchStack
  LAUNCH_STACK_WON_TOKEN_DURATION: 1500
} as const;

export type AnimationDuration = keyof typeof ANIMATION_DURATIONS;
