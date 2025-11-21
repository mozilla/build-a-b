/**
 * Centralized animation timing constants
 * All values in milliseconds
 */

/**
 * Applies the game speed multiplier to a duration value
 * Used for delays and viewing times (NOT for CSS animations or video durations)
 *
 * Speed ranges from 0.1x (slowest, 10x duration) to 1.0x (normal speed)
 * Examples:
 * - 0.1x = 10x slower (duration × 10)
 * - 0.5x = 2x slower (duration × 2)
 * - 1.0x = normal speed (duration × 1)
 *
 * @param baseDuration - The base duration in milliseconds
 * @returns The adjusted duration based on current game speed setting
 */
export function getGameSpeedAdjustedDuration(baseDuration: number): number {
  // Avoid circular dependency by importing dynamically
  if (typeof window !== 'undefined') {
    try {
      // @ts-expect-error - accessing global store
      const store = window.__gameStore?.getState?.();
      const multiplier = store?.gameSpeedMultiplier ?? 1;
      return Math.round(baseDuration / multiplier); // Divide because lower multiplier = slower = longer durations
    } catch {
      return baseDuration;
    }
  }
  return baseDuration;
}

/**
 * TIMING CATEGORIES FOR GAME SPEED:
 *
 * ✅ SPEED-ADJUSTED (use getGameSpeedAdjustedDuration):
 * - CARD_SETTLE_DELAY, CARD_SETTLE_DELAY_FAST, CARD_SETTLE_DELAY_ANOTHER_PLAY
 * - CARD_COMPARISON, CARD_COMPARISON_FAST, CARD_COMPARISON_ANOTHER_PLAY
 * - CPU_TURN_DELAY
 * - SPECIAL_EFFECT_DISPLAY
 * - EFFECT_NOTIFICATION_TRANSITION_DELAY, EFFECT_NOTIFICATION_TRANSITION_DELAY_FAST
 * - INSTANT_ANIMATION_DELAY
 * - WIN_EFFECT_DELAY
 * - UI_TRANSITION_DELAY
 * - CARD_EFFECT_TRIGGER_DELAY
 * - FORCED_EMPATHY_SETTLE_DELAY
 * - DATA_GRAB_HAND_VIEWER
 * - DATA_GRAB_CARD_RESTORE_DELAY
 *
 * ❌ NOT SPEED-ADJUSTED (use raw values):
 * - CARD_FLIP, CARD_PLAY_FROM_DECK, CARD_COLLECTION (CSS/Framer Motion animations)
 * - WIN_EFFECT_DURATION, WIN_ANIMATION, WIN_ANIMATION_FAST (CSS animations)
 * - FORCED_EMPATHY_SWAP_DURATION, FORCED_EMPATHY_VIDEO_DURATION (animations/video)
 * - VS_ANIMATION_DURATION (video duration)
 * - DATA_WAR_ANIMATION_DURATION, DATA_WAR_FACE_DOWN_CARDS_ANIMATION_DURATION (animations)
 * - DATA_GRAB_TAKEOVER, DATA_GRAB_GAME (animation/gameplay timing)
 * - LAUNCH_STACK_WON_TOKEN_DURATION (animation)
 */

export const ANIMATION_DURATIONS = {
  LOADING_SCREEN_COMPLETE_DELAY: 800, // Delay after reaching 100% before proceeding (if user saw LoadingScreen)
  // Card animations
  CARD_FLIP: 700, // Card flip animation duration (used by Card component) - DO NOT SPEED ADJUST
  CARD_COMPARISON: 1800, // Increased for data war glow pause (special cards/data war) - SPEED ADJUSTABLE
  CARD_COMPARISON_FAST: 200, // Fast comparison for common cards/trackers/blockers - quick badge interaction - SPEED ADJUSTABLE
  CARD_COMPARISON_ANOTHER_PLAY: 300, // Super fast for "another play" sequences (next card coming immediately) - SPEED ADJUSTABLE
  CARD_PLAY_FROM_DECK: 800, // Duration for card to travel from deck to play area - DO NOT SPEED ADJUST
  CARD_COLLECTION: 1200, // Duration for cards to collect to winning deck (matches WIN_ANIMATION) - DO NOT SPEED ADJUST

  // Special effects
  WIN_ANIMATION: 1200, // Normal win animation for turns that resolve
  WIN_ANIMATION_FAST: 400, // Fast for "another play" (trackers/blockers/launch stacks)
  OWYW_ANIMATION: 2000,
  SPECIAL_EFFECT_DISPLAY: 4000,
  VS_ANIMATION_DURATION: 3000, // Approximate duration - actual transition triggered by video 'ended' event

  // Instant animation delay (used for all animations that play immediately when card is revealed)
  // Applies to: forced_empathy, tracker_smacker, hostile_takeover, data_war, data_grab
  INSTANT_ANIMATION_DELAY: 1500, // Breathing room before showing instant animations - SPEED ADJUSTABLE

  // Player deck win effect
  WIN_EFFECT_DELAY: 750, // Delay before showing win effect
  WIN_EFFECT_DURATION: 2500, // Total time win effect is visible

  // CPU player automation
  CPU_TURN_DELAY: 500, // Delay before CPU plays a card

  // UI transitions
  UI_TRANSITION_DELAY: 300, // General UI transition/navigation delay
  EFFECT_NOTIFICATION_TRANSITION_DELAY: 2000, // Delay after effect animations complete - gives users time to click badge/card
  EFFECT_NOTIFICATION_TRANSITION_DELAY_FAST: 200, // Fast delay when no notifications to show (trackers/blockers)

  // Special card effects
  CARD_EFFECT_TRIGGER_DELAY: 1000, // Delay before triggering the actual card effect post animation
  CARD_SETTLE_DELAY: 1000, // Delay after card lands before effect overlay triggers (special cards/data war)
  CARD_SETTLE_DELAY_FAST: 650, // Fast settle for common cards - gives cards time to breathe on board before resolution (150ms + 500ms display time)
  CARD_SETTLE_DELAY_ANOTHER_PLAY: 400, // Super fast for "another play" sequences (trackers/blockers/launch stacks)
  FORCED_EMPATHY_SWAP_DURATION: 1000, // Deck swap animation duration
  FORCED_EMPATHY_VIDEO_DURATION: 5000, // How long the video overlay stays visible (total effect time)
  FORCED_EMPATHY_SETTLE_DELAY: 1000, // Delay after deck swap completes before continuing game flow (prevents overlap with subsequent animations)
  DATA_WAR_ANIMATION_DURATION: 2000, // Data war character animation duration
  DATA_WAR_FACE_DOWN_CARDS_ANIMATION_DURATION: 2500, // CARD_PLAY_FROM_DECK (800) + 2 staggers (600ms x 2 = 1200) + settle (500)

  // Data Grab mini-game
  DATA_GRAB_TAKEOVER: 5000, // Takeover intro animation - DO NOT SPEED ADJUST
  DATA_GRAB_GAME: 4500, // DEPRECATED: Duration is now calculated dynamically based on card count (see DATA_GRAB_CONFIG.FALL_SPEED_REM_PER_SECOND)
  DATA_GRAB_HAND_VIEWER: 1000, // Minimum results display time (reduced from 3000ms) - SPEED ADJUSTABLE
  DATA_GRAB_CARD_RESTORE: 1, // Fast card restore to tableau (hidden behind modal)
  DATA_GRAB_CARD_RESTORE_DELAY: 200, // Fast card restore to tableau delay (hidden behind modal) - SPEED ADJUSTABLE

  // LaunchStack
  LAUNCH_STACK_WON_TOKEN_DURATION: 1000,

  // GameOver
  ROCKET_REVEAL_TIMEOUT: 2500, // Triggers the rocket/button reveal after 4 seconds if it wasn't already triggered
} as const;

export type AnimationDuration = keyof typeof ANIMATION_DURATIONS;
