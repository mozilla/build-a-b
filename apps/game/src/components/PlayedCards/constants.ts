/**
 * Animation timing constants for played cards
 */
export const ANIMATION_DELAYS = {
  CARD_ROTATION: 500,
  CARD_SLIDE: 300,
} as const;

/**
 * Z-index configuration for card stacking
 * 
 * NOTE: These values align with the centralized z-index system defined in
 * /src/styles/z-index.css. See /docs/Z_INDEX_SYSTEM.md for full documentation.
 * 
 * - Card Layer: 20-500 (settled cards to in-flight)
 * - Collection Layer: 150-200 (loser to winner)
 */
export const Z_INDEX_CONFIG = {
  START_BASE: 500, // High z-index while cards are in-flight (--z-card-in-flight)
  FINAL_BASE: 20, // Base z-index for landed cards (--z-card-settled)
  CARD_MAX: 100, // Maximum z-index to prevent interfering with overlays (--z-card-settled-max)
  COLLECTION_WINNER_BASE: 200, // Base for winner's cards during collection (--z-collection-winner)
  COLLECTION_LOSER_BASE: 150, // Base for loser's cards during collection (--z-collection-loser)
  FALLBACK: 20, // Fallback for non-animated cards (--z-card-settled)
} as const;

/**
 * Rotation classes for card stacking variation
 * Creates subtle visual differences for stacked cards
 */
export const ROTATION_CLASSES = [
  '-rotate-3',
  'rotate-2',
  '-rotate-1',
  'rotate-3',
  'rotate-1',
  '-rotate-2',
] as const;

/**
 * Initial rotation angles based on deck position
 */
export const INITIAL_ROTATION = {
  CPU: -14,
  PLAYER: 12,
} as const;

/**
 * Collection rotation angles based on visual position
 */
export const COLLECTION_ROTATION = {
  BOTTOM: 31,
  TOP: -31,
} as const;

/**
 * Animation scale values
 */
export const SCALE = {
  DECK: 0.688,
  TABLE: 1,
} as const;

/**
 * Epsilon value for detecting when a card has landed (Y position threshold)
 */
export const LANDING_EPSILON = 2;
