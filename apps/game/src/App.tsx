import { GameProvider } from './providers/GameProvider';
import { Game } from './components/Game';

/**
 * This is the main container of the application.
 */
function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}

export default App;
