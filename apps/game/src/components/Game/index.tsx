/**
 * Game Component - Main game container
 */

import { useGame } from '../../hooks/use-game';
import { Board } from '../Board';
import { DeckPile } from '../DeckPile';
import { Card } from '../Card';
import BackgroundImage from '../../assets/backgrounds/color_savannah.webp';

export function Game() {
  const { player, cpu, playCard } = useGame();

  const handlePlayerDeckClick = () => {
    playCard('player');
  };

  const handleCpuDeckClick = () => {
    playCard('cpu');
  };

  return (
    <div className="h-[100vh] w-[100vw] bg-black flex items-center justify-center">
      <Board bgSrc={BackgroundImage}>
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
