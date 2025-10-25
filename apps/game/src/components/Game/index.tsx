/**
 * Game Component - Main game container
 * Handles the actual card gameplay with user-selected background
 */

import { DataWar } from '@/components/DataWar';
import { BACKGROUNDS } from '@/components/Screens/SelectBackground/backgrounds';
import { useGameStore } from '@/stores/gameStore';
import { Board } from '../Board';

export function Game() {
  const { selectedBackground } = useGameStore();

  // Find the selected background from the BACKGROUNDS array
  const background = BACKGROUNDS.find((bg) => bg.id === selectedBackground);
  // Default to first background if not found
  const backgroundImage = background?.imageSrc || BACKGROUNDS[0].imageSrc;

  return (
    <Board bgSrc={backgroundImage}>
      <DataWar />
    </Board>
  );
}
