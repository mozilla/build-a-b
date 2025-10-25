/**
 * Game Component - Main game container
 * Handles the actual card gameplay with user-selected background
 */

import { DataWar } from '@/components/DataWar';
import { useGameStore } from '@/stores/gameStore';
import { Board } from '../Board';

// Import selectable gameplay backgrounds
import blackBg from '@/assets/backgrounds/color_black.webp';
import blueBg from '@/assets/backgrounds/color_blue.webp';
import feltBg from '@/assets/backgrounds/color_felt.webp';
import nebulaBg from '@/assets/backgrounds/color_nebula.webp';
import orangeBg from '@/assets/backgrounds/color_orange.webp';
import tableBg from '@/assets/backgrounds/color_table.webp';

// Map background selection names to their images
const GAMEPLAY_BACKGROUNDS: Record<string, string> = {
  blue: blueBg,
  felt: feltBg,
  table: tableBg,
  nebula: nebulaBg,
  orange: orangeBg,
  black: blackBg,
};

export function Game() {
  const { selectedBackground } = useGameStore();

  // Get the selected background, default to blue if not selected
  const backgroundImage = GAMEPLAY_BACKGROUNDS[selectedBackground?.toLowerCase()] || blueBg;

  return (
    <Board bgSrc={backgroundImage}>
      <DataWar />
    </Board>
  );
}
