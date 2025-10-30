/**
 * Game Component - Main game container
 */

import { DEFAULT_BOARD_BACKGROUND } from '@/components/Screens/SelectBackground/backgrounds';
import { ANIMATION_DURATIONS } from '@/config/animation-timings';
import { DEFAULT_BILLIONAIRE_ID } from '@/config/billionaires';
import { getBackgroundImage } from '@/utils/selectors';
import { useEffect } from 'react';
import { useGameLogic } from '../../hooks/use-game-logic';
import { useGameStore } from '../../stores/game-store';
import { Board } from '../Board';
import { OpenWhatYouWantModal } from '../OpenWhatYouWantModal';
import { PlayedCards } from '../PlayedCards';
import { PlayerDeck } from '../PlayerDeck';
import { OpenWhatYouWantAnimation } from '../SpecialCardAnimation/OpenWhatYouWantAnimation';

/**
 * Game Component - Main game container
 */
export function Game() {
  const {
    phase,
    player,
    cpu,
    activePlayer,
    tooltipMessage,
    tapDeck,
    handlePreReveal,
    handleRevealCards,
    handleResolveTurn,
    resetGame,
    send,
  } = useGameLogic();
  // Use separate selectors to avoid creating new objects on every render
  const winner = useGameStore((state) => state.winner);
  const winCondition = useGameStore((state) => state.winCondition);
  const selectedBackground = useGameStore((state) => state.selectedBackground);
  const selectedBillionaire = useGameStore((state) => state.selectedBillionaire);

  const backgroundImage =
    getBackgroundImage(selectedBackground) ||
    getBackgroundImage(selectedBillionaire) ||
    DEFAULT_BOARD_BACKGROUND;

  const shouldSkipIntro = new URLSearchParams(window.location.search).get('skip-intro') === 'true';

  useEffect(() => {
    switch (phase) {
      case 'intro':
        // Usage: http://localhost:5173?skip-intro=true
        if (shouldSkipIntro) {
          send({ type: 'SKIP_TO_GAME' });
        }
        break;
      case 'pre_reveal.processing':
        handlePreReveal();
        break;
      case 'pre_reveal.animating':
        // Animation plays automatically via state machine 'after' transition
        break;
      case 'pre_reveal.awaiting_interaction':
        // Hide animation, show tooltip (handled by state machine entry action)
        useGameStore.getState().setShowOpenWhatYouWantAnimation(false);
        break;
      case 'pre_reveal.selecting':
        // Show modal for card selection
        useGameStore.getState().setShowOpenWhatYouWantModal(true);
        break;
      case 'revealing':
        handleRevealCards();
        break;
      case 'comparing':
        // Don't call handleCompareTurn - let the state machine auto-transition after 1500ms delay
        // This gives players time to see the cards before they're collected
        break;
      case 'resolving':
        handleResolveTurn();
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, send]);

  useEffect(() => {
    // Handle special effect phase - auto-dismiss after a brief delay
    if (phase === 'special_effect.showing') {
      const timer = setTimeout(() => {
        send({ type: 'DISMISS_EFFECT' });
      }, ANIMATION_DURATIONS.SPECIAL_EFFECT_DISPLAY);
      return () => clearTimeout(timer);
    }
  }, [phase, send]);

  // Determine if deck can be clicked based on phase and active player
  const isDataWarPhase =
    phase === 'data_war.reveal_face_down' || phase === 'data_war.reveal_face_up';

  // During ready phase, only active player can tap
  // During data war, only player deck is clickable (one click reveals both)
  // During pre_reveal.awaiting_interaction, player can tap to see modal
  const canClickPlayerDeck =
    (phase === 'ready' && activePlayer === 'player') ||
    phase === 'pre_reveal.awaiting_interaction' ||
    isDataWarPhase;
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
            billionaireId={DEFAULT_BILLIONAIRE_ID}
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
            billionaireId={selectedBillionaire}
            tooltipContent={canClickPlayerDeck ? tooltipMessage : ''}
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

        {/* Open What You Want Animation */}
        <OpenWhatYouWantAnimation />

        {/* Open What You Want Modal */}
        <OpenWhatYouWantModal />
      </Board>
    </div>
  );
}
