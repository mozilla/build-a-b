import { ScreenRenderer } from '@/components';
import { BlurredBackground } from '@/components/BlurredBackground';
import { Menu } from '@/components/Menu';
import { MusicManager } from '@/components/MusicManager';
import { useAudioLifecycle } from '@/hooks/use-audio-lifecycle';
import { useGameStore } from '@/store';
import { setupAudioContextRecovery } from '@/utils/audio-context-recovery';
import { HeroUIProvider } from '@heroui/react';
import { useEffect } from 'react';
import { Game } from './components/Game';
import { GameProvider } from './providers/GameProvider';
import { PreloadingProvider } from './providers/PreloadingProvider';

/**
 * This is the main container of the application.
 */
function App() {
  /**
   * TODO - Should we have a 'beforeunload'-like handler to warn users about losing game progress?
   * concerns:
   *  - not all mobile browsers support it, so it will need a cross-browser solution
   *  - only trigger if a game is in progress
   */

  // Get audio channels from store for lifecycle management
  const audioMusicChannel = useGameStore((state) => state.audioMusicChannel);
  const audioSfxChannels = useGameStore((state) => state.audioSfxChannels);

  // Setup audio recovery system (runs once on mount)
  // This helps recover from AudioContext suspension on iOS
  useEffect(() => {
    setupAudioContextRecovery();
  }, []);

  // Setup audio lifecycle management (handles tab switching, backgrounding, zombie audio prevention)
  // Enable debug mode to see what's happening in console
  useAudioLifecycle({
    musicChannel: audioMusicChannel,
    sfxChannels: audioSfxChannels,
    debug: import.meta.env.DEV, // Enable debug logging in development
  });

  return (
    <HeroUIProvider>
      <GameProvider>
        <PreloadingProvider>
          <MusicManager />
          <div className="h-[100dvh] w-[100vw] bg-black flex items-center justify-center overscroll-none">
            <BlurredBackground />
            <Game />
            <ScreenRenderer />
            <Menu />
          </div>
        </PreloadingProvider>
      </GameProvider>
    </HeroUIProvider>
  );
}

export default App;
