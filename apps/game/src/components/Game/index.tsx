/**
 * Game Component - Main game container
 */

import { DataWar } from '@/components/DataWar';
import BackgroundImage from '../../assets/backgrounds/color_savannah.webp';
import { Board } from '../Board';

export function Game() {
  return (
    <Board bgSrc={BackgroundImage}>
      <DataWar />
    </Board>
  );
}
