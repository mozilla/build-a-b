import { ScreenRenderer } from '@/components';
import { Menu } from '@/components/Menu';
import { HeroUIProvider } from '@heroui/react';
import { Game } from './components/Game';
import { GameProvider } from './providers/GameProvider';

/**
 * This is the main container of the application.
 */
function App() {
  return (
    <HeroUIProvider>
      <GameProvider>
        <div className="h-[100vh] w-[100vw] bg-black flex items-center justify-center">
          <Game />
          <ScreenRenderer />
          <Menu />
        </div>
      </GameProvider>
    </HeroUIProvider>
  );
}

export default App;
