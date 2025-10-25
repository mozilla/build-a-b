/**
 * Game Component - Main game container
 */

import { BACKGROUNDS } from '@/components/Screens/SelectBackground/backgrounds';
import { useEffect } from 'react';
import { useGameLogic } from '../../hooks/use-game-logic';
import { useGameStore } from '../../stores/game-store';
import { Board } from '../Board';
import { PlayedCards } from '../PlayedCards';
import { PlayerDeck } from '../PlayerDeck';

/**
 * Game Component - Main game container
 */
export function Game() {
  const {
    phase,
    player,
    cpu,
    activePlayer,
    tapDeck,
    handleRevealCards,
    handleCompareTurn,
    handleResolveTurn,
    resetGame,
    send,
  } = useGameLogic();
  // Use separate selectors to avoid creating new objects on every render
  const winner = useGameStore((state) => state.winner);
  const winCondition = useGameStore((state) => state.winCondition);
  const selectedBackground = useGameStore((state) => state.selectedBackground);

  // Find the selected background from the BACKGROUNDS array
  const background = BACKGROUNDS.find((bg) => bg.id === selectedBackground);
  // Default to first background if not found
  const backgroundImage = background?.imageSrc || BACKGROUNDS[0].imageSrc;

  useEffect(() => {
    switch (phase) {
      // Skip to game on mount (temporary - will implement full setup flow later)
      case 'welcome':
        send({ type: 'SKIP_TO_GAME' });
        break;
      case 'revealing':
        handleRevealCards();
        break;
      case 'comparing':
        handleCompareTurn();
        break;
      case 'resolving':
        handleResolveTurn();
        break;
      default:
        break;
    }
  }, [phase, send, handleRevealCards, handleCompareTurn, handleResolveTurn]);

  useEffect(() => {
    // Handle special effect phase - auto-dismiss after a brief delay
    if (phase === 'special_effect.showing') {
      const timer = setTimeout(() => {
        send({ type: 'DISMISS_EFFECT' });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, send]);

  // Determine if deck can be clicked based on phase and active player
  const isDataWarPhase =
    phase === 'data_war.reveal_face_down' || phase === 'data_war.reveal_face_up';

  // During ready phase, only active player can tap
  // During data war, only player deck is clickable (one click reveals both)
  const canClickPlayerDeck = (phase === 'ready' && activePlayer === 'player') || isDataWarPhase;
  const canClickCpuDeck = phase === 'ready' && activePlayer === 'cpu';
  const cpuTurnState =
    cpu.playedCard?.specialType === 'tracker'
      ? 'tracker'
      : player.playedCard?.specialType === 'blocker'
      ? 'blocker'
      : 'normal';
  const playerTurnState =
    player.playedCard?.specialType === 'tracker'
      ? 'tracker'
      : cpu.playedCard?.specialType === 'blocker'
      ? 'blocker'
      : 'normal';

  const handleDeckClick = () => {
    tapDeck();
  };

  return (
    <div className="h-[100vh] w-[100vw] bg-black flex items-center justify-center">
      <Board bgSrc={backgroundImage}>
        <div className="flex flex-col justify-between items-center flex-1 max-w-[25rem] max-h-[54rem]">
          <PlayerDeck
            deckLength={cpu.deck.length}
            handleDeckClick={canClickCpuDeck ? handleDeckClick : undefined}
            turnValue={cpu.currentTurnValue}
            turnValueState={cpuTurnState}
            owner="cpu"
          />

          {/* Play Area - Center of board */}
          <div className="flex flex-col items-center justify-around flex-1 relative mb-4">
            {/* CPU Played Card Area */}
            <div className="flex items-center justify-center gap-6">
              {/* CPU Cards */}
              <PlayedCards cards={cpu.playedCardsInHand} />
            </div>

            {/* Player Played Card Area */}
            <div className="flex items-center justify-center gap-6">
              {/* Player Cards */}
              <PlayedCards cards={player.playedCardsInHand} />
            </div>
          </div>

          <PlayerDeck
            deckLength={player.deck.length}
            handleDeckClick={canClickPlayerDeck ? handleDeckClick : undefined}
            turnValue={player.currentTurnValue}
            turnValueState={playerTurnState}
            owner="player"
          />
        </div>

        {/* Game Over Overlay */}
        {phase === 'game_over' && winner && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
              <h1 className="text-4xl font-bold mb-4">
                {winner === 'player' ? '🎉 You Win!' : '😔 CPU Wins!'}
              </h1>
              <p className="text-xl mb-6">
                {winCondition === 'launch_stacks'
                  ? '3 Launch Stacks Collected!'
                  : 'All Cards Collected!'}
              </p>
              <button
                onClick={resetGame}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </Board>
    </div>
  );
}
