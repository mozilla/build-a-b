import { useState } from 'react';
import { Card } from './components/Card';
import type { CardState } from './components/Card/types';
import CommonCard from './assets/cards/common-1.webp';

/**
 * This is the main container of the application.
 * TODO: The current code is just to show a Card example.
 * Please remove when the implementing the board.
 */
function App() {
  const [cardState, setCardState] = useState<CardState>('initial');

  const handleBackClick = () => {
    console.log('Back clicked - flipping card to flipped state');
    setCardState('flipped');
  };

  const handleFrontClick = () => {
    console.log('Front clicked - moving to final position');
    setCardState('final');
  };

  return (
    <div className="h-[100vh] w-[100vw] bg-black flex items-center justify-center">
      <Card
        cardFrontSrc={CommonCard}
        state={cardState}
        onBackClick={handleBackClick}
        onFrontClick={handleFrontClick}
        positions={{
          initial: { x: 0, y: 0 },
          flipped: { x: 0, y: -100 },
          final: { x: 100, y: -100 },
        }}
        showFrontInStates={['flipped']}
      />
    </div>
  );
}

export default App;
