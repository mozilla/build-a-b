/**
 * Game Component - Main game container
 */

import { BACKGROUNDS } from '@/components/Screens/SelectBackground/backgrounds';
import { useEffect } from 'react';
import { useGameLogic } from '../../hooks/use-game-logic';
import { useGameStore } from '../../stores/game-store';
import { Board } from '../Board';
import { Card } from '../Card';
import { CARD_BACK_IMAGE } from '../../config/game-config';

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

  // Skip to game on mount (temporary - will implement full setup flow later)
  useEffect(() => {
    switch (phase) {
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

  const handleDeckClick = () => {
    tapDeck();
  };

  return (
    <div className="h-[100vh] w-[100vw] bg-black flex items-center justify-center">
      <Board bgSrc={backgroundImage}>
        <div className="flex flex-col justify-between items-center flex-1">
          {/* CPU Deck (top) */}
          <DeckPile
            cardCount={cpu.deck.length}
            owner="cpu"
            onClick={canClickCpuDeck ? handleDeckClick : undefined}
          />

          {/* Play Area - Center of board */}
          <div className="flex flex-col items-center justify-around flex-1 relative mb-4">
            {/* CPU Played Card Area */}
            <div className="h-[10.9375rem] flex items-center justify-center relative">
              {cpu.playedCardsInHand.map((playedCardState, index) => {
                const isTopCard = index === cpu.playedCardsInHand.length - 1;
                // Top card stays straight, cards underneath get subtle rotation (-5 to +5)
                const rotations = [
                  '-rotate-3',
                  'rotate-2',
                  '-rotate-1',
                  'rotate-3',
                  'rotate-1',
                  '-rotate-2',
                ];
                const rotationClass = isTopCard
                  ? 'rotate-0'
                  : rotations[
                      (playedCardState.card.id.charCodeAt(0) + index * 7) % rotations.length
                    ];

                // Delay rotation for previous cards when new card lands
                const rotationDelay = isTopCard ? 0 : 500; // Rotate after new card's animation

                // Show card back for face-down cards, card front for face-up
                const cardImage = playedCardState.isFaceDown
                  ? CARD_BACK_IMAGE
                  : playedCardState.card.imageUrl;

                return (
                  <div
                    key={`${playedCardState.card.id}-${index}`}
                    className={`absolute ${
                      isTopCard ? 'animate-slide-from-top' : ''
                    } ${rotationClass}`}
                    style={{
                      zIndex: index,
                      transition: `transform 600ms ease-out ${rotationDelay}ms`,
                    }}
                  >
                    <Card cardFrontSrc={cardImage} state="flipped" />
                  </div>
                );
              })}
            </div>

            {/* Player Played Card Area */}
            <div className="h-[10.9375rem] flex items-center justify-center relative">
              {player.playedCardsInHand.map((playedCardState, index) => {
                const isTopCard = index === player.playedCardsInHand.length - 1;
                // Top card stays straight, cards underneath get subtle rotation (-5 to +5)
                const rotations = [
                  '-rotate-3',
                  'rotate-2',
                  '-rotate-1',
                  'rotate-3',
                  'rotate-1',
                  '-rotate-2',
                ];
                const rotationClass = isTopCard
                  ? 'rotate-0'
                  : rotations[
                      (playedCardState.card.id.charCodeAt(0) + index * 7) % rotations.length
                    ];

                // Delay rotation for previous cards when new card lands
                const rotationDelay = isTopCard ? 0 : 500; // Rotate after new card's animation

                // Show card back for face-down cards, card front for face-up
                const cardImage = playedCardState.isFaceDown
                  ? CARD_BACK_IMAGE
                  : playedCardState.card.imageUrl;

                return (
                  <div
                    key={`${playedCardState.card.id}-${index}`}
                    className={`absolute ${
                      isTopCard ? 'animate-slide-from-bottom' : ''
                    } ${rotationClass}`}
                    style={{
                      zIndex: index,
                      transition: `transform 600ms ease-out ${rotationDelay}ms`,
                    }}
                  >
                    <Card cardFrontSrc={cardImage} state="flipped" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Player Deck (bottom) */}
          <DeckPile
            cardCount={player.deck.length}
            owner="player"
            onClick={canClickPlayerDeck ? handleDeckClick : undefined}
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
