import { ScreenRenderer } from '@/components';
import { Game } from './components/Game';
import { GameProvider } from './providers/GameProvider';

/**
 * This is the main container of the application.
 */
function App() {
  return (
    <GameProvider>
      <div className="h-[100vh] w-[100vw] bg-black flex items-center justify-center">
        <Game />
        <ScreenRenderer />
      </div>
    </GameProvider>
  );
}

export default App;
