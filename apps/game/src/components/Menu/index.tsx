import { AnimatePresence, motion } from 'framer-motion';
import { type FC } from 'react';

import nightSkyBg from '@/assets/backgrounds/color_nightsky.webp';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { BackgroundCarousel } from '@/components/Screens/SelectBackground/BackgroundCarousel';
import { Text } from '@/components/Text';
import { AudioToggle } from '@/components/Toggle';
import { useGameMachine } from '@/hooks/use-game-machine';
import { useGameStore } from '@/store';
import { cn } from '@/utils/cn';
import { menuMicrocopy } from './microcopy';

export const Menu: FC = () => {
  const { showMenu, toggleMenu, audioEnabled, toggleAudio, resetGame } = useGameStore();
  const { send } = useGameMachine();

  const handleQuickGuide = () => {
    toggleMenu(); // Close menu first
    send({ type: 'SHOW_GUIDE' });
  };

  const handleRestart = () => {
    resetGame();
    toggleMenu();
    send({ type: 'RESET_GAME' });
  };

  const handleQuit = () => {
    resetGame();
    toggleMenu();
    send({ type: 'QUIT_GAME' });
  };

  if (!showMenu) return null;

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleMenu}
        >
          <img src={nightSkyBg} alt="" className="w-full h-full object-cover" role="presentation" />
        </motion.div>

        {/* Menu Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="relative w-full h-full bg-grey-200 rounded-[2rem] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] overflow-hidden">
            {/* Close Button */}
            <Button
              onPress={toggleMenu}
              className="absolute top-5 right-5 cursor-pointer z-10 bg-transparent hover:opacity-70 active:opacity-70 transition-opacity p-0 min-w-0 w-[2.125rem] h-[2.125rem] flex items-center justify-center"
              aria-label="Close menu"
            >
              <Icon name="close" width={8} height={8} />
            </Button>

            {/* Menu Content */}
            <div className="relative h-full flex flex-col items-center pt-[6.25rem] pb-8">
              {/* Title */}
              <Text variant="title-2" align="center" className="text-common-ash mb-8">
                {menuMicrocopy.title}
              </Text>

              {/* Menu Items */}
              <div className="w-full flex flex-col gap-8">
                {/* Quick Launch Guide Button */}
                <div className="px-9 flex flex-col gap-y-8">
                  <button
                    onClick={handleQuickGuide}
                    className={cn(
                      'flex items-center gap-3 text-left',
                      'hover:opacity-80 transition-opacity',
                    )}
                  >
                    {/* <Icon name="book" width={24} height={24} className="text-common-ash" /> */}
                    <Text variant="title-3" className="text-common-ash">
                      {menuMicrocopy.quickGuideButton}
                    </Text>
                  </button>

                  {/* Audio Toggle */}
                  <AudioToggle enabled={audioEnabled} onToggle={toggleAudio} />

                  {/* Change Background Label */}
                  <div className="flex items-center gap-3">
                    {/* <Icon name="swap" width={24} height={24} className="text-common-ash" /> */}
                    <Text variant="title-3" className="text-common-ash">
                      {menuMicrocopy.changeBackground}
                    </Text>
                  </div>
                </div>

                {/* Background Carousel */}
                <div className="w-full">
                  <BackgroundCarousel className="w-full" />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 w-full mt-4">
                  <Button
                    onPress={handleRestart}
                    variant="primary"
                    className="flex-1 flex items-center gap-2"
                  >
                    <Icon name="rocket" width={16} height={16} />
                    {menuMicrocopy.restartButton}
                  </Button>
                  <Button
                    onPress={handleQuit}
                    variant="primary"
                    className="flex-1 flex items-center gap-2"
                  >
                    <Icon name="close" width={16} height={16} />
                    {menuMicrocopy.quitButton}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
};
