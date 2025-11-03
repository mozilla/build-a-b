import { type FC } from 'react';
import { useGameStore } from '../../store/game-store';
import { useGame } from '../../hooks/use-game';
import { Card } from '../Card';
import { DeckPile } from '../DeckPile';
import type { BaseScreenProps } from '../ScreenRenderer';

export const DataWar: FC<BaseScreenProps> = () => {
  const { player, cpu, playCard } = useGame();
  const playerLaunchStacks = useGameStore((state) => state.playerLaunchStacks);
  const cpuLaunchStacks = useGameStore((state) => state.cpuLaunchStacks);

  // Total cards owned = playable deck + collected Launch Stacks
  const playerTotalCards = player.deck.length + playerLaunchStacks.length;
  const cpuTotalCards = cpu.deck.length + cpuLaunchStacks.length;

  const handlePlayerDeckClick = () => {
    playCard('player');
  };

  const handleCpuDeckClick = () => {
    playCard('cpu');
  };

  return (
    <div className="flex flex-col justify-between items-center flex-1">
      {/* CPU Deck (top) */}
      <DeckPile cardCount={cpuTotalCards} owner="cpu" onClick={handleCpuDeckClick} />

      {/* Play Area - Center of board */}
      <div className="flex flex-col items-center justify-around flex-1 relative mb-4">
        {/* CPU Played Card Area */}
        <div className="h-[10.9375rem] flex items-center justify-center">
          {cpu.playedCard && <Card cardFrontSrc={cpu.playedCard.imageUrl} state="flipped" />}
        </div>

        {/* Player Played Card Area */}
        <div className="h-[10.9375rem] flex items-center justify-center">
          {player.playedCard && <Card cardFrontSrc={player.playedCard.imageUrl} state="flipped" />}
        </div>
      </div>

      {/* Player Deck (bottom) */}
      <DeckPile cardCount={playerTotalCards} owner="player" onClick={handlePlayerDeckClick} />
    </div>
  );
};
