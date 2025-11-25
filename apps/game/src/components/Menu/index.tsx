import blueGridBg from '@/assets/backgrounds/color_blue.webp';
import nightSkyBg from '@/assets/backgrounds/color_nightsky.webp';
import { Button } from '@/components/Button';
import { Frame } from '@/components/Frame';
import { Icon } from '@/components/Icon';
import { QuickStart } from '@/components/Screens/QuickStart';
import { BackgroundCarousel } from '@/components/Screens/SelectBackground/BackgroundCarousel';
import { Text } from '@/components/Text';
import { AudioToggle } from '@/components/Toggle';
import { TRACKS } from '@/config/audio-config';
import { useGameLogic } from '@/hooks/use-game-logic';
import { useGameStore } from '@/store';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { Fragment, useEffect, useState, type FC } from 'react';
import { menuMicrocopy } from './microcopy';
import { NON_GAMEPLAY_PHASES } from '@/config/store';

export const Menu: FC = () => {
  const [showGuide, setShowGuide] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const {
    showMenu,
    toggleMenu,
    toggleMusic,
    toggleSoundEffects,
    musicEnabled,
    soundEffectsEnabled,
    playAudio,
    pauseAudio,
  } = useGameStore();
  const { quitGame, restartGame, phase } = useGameLogic();
  const phaseKey = typeof phase === 'string' ? phase : String(phase);

  // Disables restart for non-gameplay phases
  const isNonGameplayPhase = NON_GAMEPLAY_PHASES.includes(
    phaseKey as (typeof NON_GAMEPLAY_PHASES)[number],
  );

  // Pause/resume SFX when sound effects toggle changes
  useEffect(() => {
    if (!soundEffectsEnabled) {
      pauseAudio('sfx');
    }
    // Note: We don't resume SFX because they're short-lived effects
    // They'll play automatically when needed if soundEffectsEnabled is true
  }, [soundEffectsEnabled, pauseAudio]);

  const handleQuickGuide = () => {
    playAudio(TRACKS.WHOOSH);
    setShowGuide(true);
  };

  const handleRestart = () => {
    playAudio(TRACKS.WHOOSH);
    setShowRestartConfirm(true);
  };

  const handleRestartConfirm = () => {
    setShowRestartConfirm(false);
    restartGame();
  };

  const handleRestartCancel = () => {
    playAudio(TRACKS.WHOOSH);
    setShowRestartConfirm(false);
  };

  const handleQuit = () => {
    playAudio(TRACKS.WHOOSH);
    setShowQuitConfirm(true);
  };

  const handleQuitConfirm = () => {
    playAudio(TRACKS.WHOOSH);
    setShowQuitConfirm(false);
    quitGame();
  };

  const handleQuitCancel = () => {
    playAudio(TRACKS.WHOOSH);
    setShowQuitConfirm(false);
  };

  if (!showMenu) return null;

  return (
    <AnimatePresence>
      <Fragment key="menu-fragment">
        {/* Backdrop */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 z-200 lg:hidden"
          onClick={toggleMenu}
        /> */}

        {/* Menu Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="fixed overflow-auto inset-0 z-201 flex items-center justify-center h-[100dvh] w-[100vw] z-[var(--z-winner-animation)]"
        >
          <Frame
            backgroundSrc={nightSkyBg}
            className="shadow-[0_1.25rem_1.5625rem_-0.3125rem_rgba(0,0,0,0.1),0_0.5rem_0.625rem_-0.375rem_rgba(0,0,0,0.1)]"
            variant="screen-renderer"
          >
            {/* Menu Content */}
            <div className="relative h-full flex flex-col items-center pt-6 overflow-auto">
              {/* Close Button */}
              <header className="mx-auto relative w-full mb-10">
                <Button
                  onPress={toggleMenu}
                  className="absolute top-0 right-6 cursor-pointer z-10 bg-transparent hover:opacity-70 active:opacity-70 transition-opacity p-0 w-7 h-7 flex items-center justify-center"
                  aria-label={menuMicrocopy.closeMenu}
                >
                  <Icon name="close" width={8} height={8} className="w-2 h-2" />
                </Button>
              </header>
              {/* Title */}
              <Text variant="title-2" align="center" className="text-common-ash mb-8 mx-auto">
                {menuMicrocopy.title}
              </Text>

              {/* Menu Items */}
              <div className="w-full flex flex-col gap-8">
                {/* Quick Launch Guide Button */}
                <div className="w-full px-8 flex flex-col gap-y-8 mx-auto">
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

                  {/* Music Toggle */}
                  <AudioToggle enabled={musicEnabled} onToggle={toggleMusic}>
                    {menuMicrocopy.music}
                  </AudioToggle>

                  {/* Sound Effects Toggle */}
                  <AudioToggle enabled={soundEffectsEnabled} onToggle={toggleSoundEffects}>
                    {menuMicrocopy.soundEffects}
                  </AudioToggle>

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
                  <BackgroundCarousel className="w-full" variant="menu" />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 w-full pb-[clamp(1rem,-6.9788rem_+_17.02vh,2rem)] framed:max-w-[25rem] mx-auto px-9 framed:pb-8">
                  <Button
                    onPress={handleRestart}
                    variant="primary"
                    className="flex-1 flex items-center gap-2"
                    disabled={isNonGameplayPhase}
                  >
                    <Icon name="restart" size={12} className="w-3 h-3" />
                    {menuMicrocopy.restartButton}
                  </Button>
                  <Button
                    onPress={handleQuit}
                    variant="primary"
                    className="flex-1 flex items-center gap-2"
                  >
                    <Icon name="close" size={12} className="w-3 h-3" />
                    {menuMicrocopy.quitButton}
                  </Button>
                </div>
              </div>
            </div>
            <Fragment key="quick-launch-fragment">
              <AnimatePresence>
                {showGuide && (
                  <div
                    key="quick-launch-wrapper"
                    className="frame absolute inset-0 z-202 max-h-screen hide-scrollbar overflow-y-auto flex justify-center"
                  >
                    <img
                      src={blueGridBg}
                      alt=""
                      className="sticky top-0 inset-0 w-full h-full object-cover shadow-[inset_0_0_2rem_0_#53ffbc]"
                      role="presentation"
                    />
                    <div className="max-w-[24.375rem] mx-auto absolute top-0 z-10">
                      <QuickStart fromMenu onContinue={() => setShowGuide(false)} />
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </Fragment>
            <Fragment key="quit-confirm-fragment">
              <AnimatePresence>
                {showQuitConfirm && (
                  <>
                    {/* Scrim/Overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed inset-0 bg-cyan-900/70 z-203"
                      onClick={handleQuitCancel}
                    />

                    {/* Drawer Sheet - positioned relative to frame */}
                    <motion.div
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      transition={{
                        ease: [0.35, 0, 0.15, 1],
                        duration: 0.4,
                      }}
                      className="absolute bottom-0 left-0 right-0 z-204 w-full mx-auto"
                    >
                      {/* Drawer Content */}
                      <div
                        className="relative w-full bg-cover bg-center bg-no-repeat rounded-tl-[2rem] sm:rounded-tl-[2.5rem] rounded-tr-[2rem] sm:rounded-tr-[2.5rem] overflow-hidden pb-20 sm:pb-8"
                        style={{ backgroundImage: `url(${nightSkyBg})` }}
                      >
                        {/* Inner glow effect */}
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0.5rem_1.875rem_0_rgba(0,166,249,1)]" />

                        {/* Content Container */}
                        <div className="relative flex flex-col items-center gap-6 sm:gap-4 md:gap-6 pt-12 sm:pt-16 md:pt-20 px-4 sm:px-6 md:px-8">
                          {/* Message */}
                          <div className="w-full mx-auto">
                            <Text variant="title-2" align="center" className="text-common-ash mb-4">
                              {menuMicrocopy.quitConfirmTitle}
                            </Text>
                            <Text
                              variant="body-medium"
                              align="center"
                              color="text-common-ash"
                              weight="semibold"
                              className="text-pretty"
                            >
                              {menuMicrocopy.quitConfirmMessage}
                            </Text>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-4 w-full mt-4 max-w-[20.375rem] mx-auto px-4">
                            <Button onPress={handleQuitCancel} variant="primary" className="flex-1">
                              {menuMicrocopy.cancelButton}
                            </Button>
                            <Button
                              onPress={handleQuitConfirm}
                              variant="primary"
                              className="flex-1 flex items-center gap-2"
                            >
                              <Icon name="close" size={12} className="w-3 h-3" />
                              {menuMicrocopy.quitButton}
                            </Button>
                          </div>
                        </div>

                        {/* Close Button */}
                        <Button
                          onPress={handleQuitCancel}
                          className="absolute top-5 right-5 cursor-pointer z-10 bg-transparent hover:opacity-70 active:opacity-70 transition-opacity p-0 min-w-0 w-[2.125rem] h-[2.125rem] flex items-center justify-center"
                          aria-label={menuMicrocopy.closeDrawer}
                        >
                          <Icon name="close" width={8} height={8} className="w-2 h-2" />
                        </Button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </Fragment>
            <Fragment key="restart-confirm-fragment">
              <AnimatePresence>
                {showRestartConfirm && (
                  <>
                    {/* Scrim/Overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed inset-0 bg-cyan-900/70 z-203"
                      onClick={handleRestartCancel}
                    />

                    {/* Drawer Sheet - positioned relative to frame */}
                    <motion.div
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      transition={{
                        ease: [0.35, 0, 0.15, 1],
                        duration: 0.4,
                      }}
                      className="absolute bottom-0 left-0 right-0 z-204 w-full mx-auto"
                    >
                      {/* Drawer Content */}
                      <div
                        className="relative w-full bg-cover bg-center bg-no-repeat rounded-tl-[2rem] sm:rounded-tl-[2.5rem] rounded-tr-[2rem] sm:rounded-tr-[2.5rem] overflow-hidden pb-20 sm:pb-8"
                        style={{ backgroundImage: `url(${nightSkyBg})` }}
                      >
                        {/* Inner glow effect */}
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0.5rem_1.875rem_0_rgba(0,166,249,1)]" />

                        {/* Content Container */}
                        <div className="relative flex flex-col items-center gap-6 sm:gap-4 md:gap-6 pt-12 sm:pt-16 md:pt-20 px-4 sm:px-6 md:px-8">
                          {/* Message */}
                          <div className="w-full mx-auto">
                            <Text
                              variant="title-2"
                              align="center"
                              color="text-common-ash"
                              className="mb-4"
                            >
                              {menuMicrocopy.restartConfirmTitle}
                            </Text>
                            <Text
                              variant="body-medium"
                              align="center"
                              color="text-common-ash"
                              weight="semibold"
                              className="text-pretty"
                            >
                              {menuMicrocopy.restartConfirmMessage}
                            </Text>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-4 w-full mt-4 max-w-[20.375rem] mx-auto px-4">
                            <Button
                              onPress={handleRestartCancel}
                              variant="primary"
                              className="flex-1"
                            >
                              {menuMicrocopy.cancelButton}
                            </Button>
                            <Button
                              onPress={handleRestartConfirm}
                              variant="primary"
                              className="flex-1 flex items-center gap-2"
                            >
                              <Icon name="restart" size={12} className="w-3 h-3" />
                              {menuMicrocopy.restartButton}
                            </Button>
                          </div>
                        </div>

                        {/* Close Button */}
                        <Button
                          onPress={handleRestartCancel}
                          className="absolute top-5 right-5 cursor-pointer z-10 bg-transparent hover:opacity-70 active:opacity-70 transition-opacity p-0 min-w-0 w-[2.125rem] h-[2.125rem] flex items-center justify-center"
                          aria-label={menuMicrocopy.closeDrawer}
                        >
                          <Icon name="close" width={8} height={8} className="w-2 h-2" />
                        </Button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </Fragment>
          </Frame>
        </motion.div>
      </Fragment>
    </AnimatePresence>
  );
};
