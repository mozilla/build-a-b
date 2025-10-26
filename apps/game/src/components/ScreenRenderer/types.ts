/**
 * Background variant types for intro/setup screens
 * Note: Gameplay backgrounds are handled by Game/Board component
 */
export type BackgroundVariant = 'night-sky' | 'billionaire';

/**
 * Available billionaire backgrounds
 * Maps to character selection in game
 */
export type BillionaireBackground =
  | 'chaz'
  | 'chloe'
  | 'savannah'
  | 'walter'
  | 'poindexter'
  | 'prudence';

/**
 * Configuration for background rendering
 */
export interface BackgroundConfig {
  /** Which type of background to display */
  variant: BackgroundVariant;
  /** Apply blur filter (2px) */
  blur?: boolean;
  /** Apply dark overlay gradient */
  overlay?: boolean;
  /** Apply accent-colored grid overlay (used in quick start guide) */
  gridOverlay?: boolean;
}
