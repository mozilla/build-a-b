/**
 * Events that occur during non-gameplay phases (setup and intro screens)
 * These events fire before actual card gameplay begins
 */
export const NON_GAMEPLAY_EVENT_TYPES = [
  'START_GAME',
  'SELECT_BILLIONAIRE',
  'SELECT_BACKGROUND',
  'SHOW_GUIDE',
  'SKIP_INSTRUCTIONS',
  'SHOW_MISSION',
  'START_PLAYING',
  'SKIP_GUIDE',
  'BACK_TO_INTRO',
  'VS_ANIMATION_COMPLETE',
] as const;

/**
 * Phases/states that occur during non-gameplay (setup and intro screens)
 * These are the state machine state names before actual card gameplay begins
 */
export const NON_GAMEPLAY_PHASES = [
  'welcome',
  'select_billionaire',
  'select_background',
  'intro',
  'quick_start_guide',
  'your_mission',
  'vs_animation',
  'game_over',
] as const;
