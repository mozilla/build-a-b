import { useGameMachine } from '@/hooks/use-game-machine';
import { useGameStore } from '@/stores/gameStore';
import type { FC } from 'react';
import type { BackgroundConfig } from './types';

// Import background images
import nightSkyBg from '@/assets/backgrounds/color_nightsky.webp';
import { BILLIONAIRE_BACKGROUNDS } from '@/config/backgrounds';

// Map game states to background configurations
const STATE_BACKGROUND_CONFIG: Record<string, BackgroundConfig> = {
  // Setup screens - Night Sky
  welcome: { variant: 'night-sky' },
  select_billionaire: { variant: 'night-sky' },
  select_background: { variant: 'night-sky' },

  // Intro screens - Blurred Billionaire
  intro: { variant: 'billionaire', blur: true, overlay: true },
  your_mission: { variant: 'billionaire', blur: true, overlay: true },

  // Guide screen - Gameplay background is now handled by Game component
  // We only show the grid overlay here as a visual effect
  quick_start_guide: { variant: 'night-sky', gridOverlay: true },

  // Gameplay screens - Background now handled by Game/Board component
  // ScreenRenderer should not render backgrounds during gameplay
  vs_animation: { variant: 'billionaire', blur: true, overlay: true },
};

export const ScreenBackground: FC = () => {
  const { currentPhase } = useGameMachine();
  const { selectedBillionaire } = useGameStore();

  // Convert state value to string
  const phaseKey = typeof currentPhase === 'string' ? currentPhase : String(currentPhase);

  // Get background configuration for current state
  const config = STATE_BACKGROUND_CONFIG[phaseKey];

  // Don't render background during gameplay - Game component handles it
  if (!config) return null;

  // Determine which background image to use
  let backgroundImage = nightSkyBg;
  if (config.variant === 'billionaire' && selectedBillionaire) {
    backgroundImage = BILLIONAIRE_BACKGROUNDS[selectedBillionaire] || nightSkyBg;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base background image */}
      <div className={`absolute inset-0 ${config.blur ? 'blur-[2px]' : ''}`} aria-hidden="true">
        <img
          src={backgroundImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover max-w-none"
        />
        {/* Dark overlay for blurred backgrounds */}
        {config.overlay && (
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,0,0,0.2)] to-[rgba(0,0,0,0.2)]" />
        )}
      </div>

      {/* Grid overlay for quick start guide */}
      {config.gridOverlay && (
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0px_32px_0px_#53ffbc]" />
      )}
    </div>
  );
};
