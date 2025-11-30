import { ScreenRenderer } from '@/components';
import { BlurredBackground } from '@/components/BlurredBackground';
import { Menu } from '@/components/Menu';
import { MusicManager } from '@/components/MusicManager';
import { Text } from '@/components/Text';
import { useAudioLifecycle } from '@/hooks/use-audio-lifecycle';
import { useGameStore } from '@/store';
import { HeroUIProvider } from '@heroui/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
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

  const [showAutoplayToast, setShowAutoplayToast] = useState(false);

  // Get audio channels from store for lifecycle management
  const audioMusicChannel = useGameStore((state) => state.audioMusicChannel);
  const audioSfxChannels = useGameStore((state) => state.audioSfxChannels);

  // Setup audio lifecycle management (handles tab switching, backgrounding, zombie audio prevention)
  useAudioLifecycle({
    musicChannel: audioMusicChannel,
    sfxChannels: audioSfxChannels,
  });

  // Check autoplay support on mount
  useEffect(() => {
    const checkAutoplay = async () => {
      try {
        // Create a short silent audio data URL
        const silentAudio =
          'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
        const audio = new Audio(silentAudio);

        // Test with UNMUTED audio (this is what gets blocked)
        audio.volume = 0.01; // Very low but not muted

        const playPromise = audio.play();

        if (playPromise !== undefined) {
          await playPromise;
          // Autoplay succeeded
          audio.pause();
          audio.remove();
          setShowAutoplayToast(false);
        }
      } catch {
        // Autoplay was prevented - show toast
        setShowAutoplayToast(true);
      }
    };

    checkAutoplay();
  }, []);

  // Detect browser for appropriate settings link
  const getAutoplaySettingsUrl = () => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('firefox') || userAgent.includes('fxios')) {
      return 'https://support.mozilla.org/en-US/kb/block-autoplay';
    } else if (userAgent.includes('edg') || userAgent.includes('edgios')) {
      return 'https://support.microsoft.com/en-us/microsoft-edge/block-autoplay-of-media-in-microsoft-edge-c0d6e122-0c7e-4b2e-8179-f2f6b1b2e9e2';
    } else if (userAgent.includes('crios') || userAgent.includes('chrome')) {
      // Chrome on iOS uses "CriOS", desktop/Android uses "Chrome"
      return 'https://support.google.com/chrome/answer/9658361';
    } else if (userAgent.includes('safari')) {
      return 'https://support.apple.com/guide/safari/stop-autoplay-videos-ibrw29c6ecf8/mac';
    } else {
      // Fallback to Chrome for other Chromium browsers
      return 'https://support.google.com/chrome/answer/9658361';
    }
  };

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

            {/* Autoplay Toast */}
            {showAutoplayToast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-[25rem] px-4"
              >
                <div className="bg-black/95 border border-common-ash/20 rounded-lg p-4 shadow-lg flex items-start gap-3">
                  <Text variant="body-small" className="text-common-ash flex-1">
                    For a better experience enable{' '}
                    <a
                      href={getAutoplaySettingsUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-electric underline hover:text-primary-electric/80"
                    >
                      autoplay
                    </a>
                  </Text>
                  <button
                    onClick={() => setShowAutoplayToast(false)}
                    className="text-common-ash/60 hover:text-common-ash transition-colors flex-shrink-0"
                    aria-label="Close"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 4L4 12M4 4L12 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </PreloadingProvider>
      </GameProvider>
    </HeroUIProvider>
  );
}

export default App;
