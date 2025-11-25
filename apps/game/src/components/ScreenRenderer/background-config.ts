import type { BackgroundConfig } from './types';
// Map game states to background configurations
export const STATE_BACKGROUND_CONFIG: Record<string, BackgroundConfig> = {
  // Setup screens - Night Sky
  welcome: { variant: 'night-sky' },
  select_billionaire: { variant: 'night-sky' },
  select_background: { variant: 'night-sky' },

  // Intro screens - Blurred Billionaire
  intro: { variant: 'billionaire', blur: true, overlay: true },
  your_mission: { variant: 'billionaire', blur: true, overlay: true },

  // Guide screen - Gameplay background is now handled by Game component
  // We only show the grid overlay here as a visual effect
  quick_start_guide: { variant: 'grid', gridOverlay: true },

  // Gameplay screens - Background now handled by Game/Board component
  // ScreenRenderer should not render backgrounds during gameplay
  vs_animation: { variant: 'billionaire', blur: true, overlay: true },
};
