/**
 * Game Component - Main game container
 */

import { BACKGROUNDS } from '@/components/Screens/SelectBackground/backgrounds';
import { useGameStore } from '@/stores/gameStore';
import { useGame } from '../../hooks/use-game';
import { Board } from '../Board';
import { Card } from '../Card';
import { DeckPile } from '../DeckPile';

export function Game() {
  const { player, cpu, playCard } = useGame();
  const { selectedBackground } = useGameStore();

  // Find the selected background from the BACKGROUNDS array
  const background = BACKGROUNDS.find((bg) => bg.id === selectedBackground);
  // Default to first background if not found
  const backgroundImage = background?.imageSrc || BACKGROUNDS[0].imageSrc;

  const handlePlayerDeckClick = () => {
    playCard('player');
  };

  const handleCpuDeckClick = () => {
    playCard('cpu');
  };

  return (
    <div className="h-[100vh] w-[100vw] bg-black flex items-center justify-center">
      <Board bgSrc={backgroundImage}>
        <div className="flex flex-col justify-between items-center flex-1">
          {/* CPU Deck (top) */}
          <DeckPile cardCount={cpu.deck.length} owner="cpu" onClick={handleCpuDeckClick} />

          {/* Play Area - Center of board */}
          <div className="flex flex-col items-center justify-around flex-1 relative mb-4">
            {/* CPU Played Card Area */}
            <div className="h-[10.9375rem] flex items-center justify-center">
              {cpu.playedCard && <Card cardFrontSrc={cpu.playedCard.imageUrl} state="flipped" />}
            </div>

            {/* Player Played Card Area */}
            <div className="h-[10.9375rem] flex items-center justify-center">
              {player.playedCard && (
                <Card cardFrontSrc={player.playedCard.imageUrl} state="flipped" />
              )}
            </div>
          </div>

          {/* Player Deck (bottom) */}
          <DeckPile cardCount={player.deck.length} owner="player" onClick={handlePlayerDeckClick} />
        </div>
      </Board>
    </div>
  );
}
