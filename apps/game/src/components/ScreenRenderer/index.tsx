import blueGridBg from '@/assets/backgrounds/color_blue.webp';
import nightSkyBg from '@/assets/backgrounds/color_nightsky.webp';
import { Frame } from '@/components/Frame';
import { Icon } from '@/components/Icon';
import { LoadingScreen } from '@/components/LoadingScreen';
import { STATE_BACKGROUND_CONFIG } from '@/components/ScreenRenderer/background-config';
import { Intro } from '@/components/Screens/Intro';
import { QuickStart } from '@/components/Screens/QuickStart';
import { SelectBackground } from '@/components/Screens/SelectBackground';
import { SelectBillionaire } from '@/components/Screens/SelectBillionaire';
import { VSAnimation } from '@/components/Screens/VSAnimation';
import { Welcome } from '@/components/Screens/Welcome';
import { YourMission } from '@/components/Screens/YourMission';
import { useGameLogic } from '@/hooks/use-game-logic';
import { usePreloading } from '@/hooks/use-preloading';
import { useGameStore } from '@/store';
import { getBackgroundImage } from '@/utils/selectors';
import { Button } from '@heroui/react';
import { AnimatePresence, type HTMLMotionProps } from 'framer-motion';
import type { FC, PropsWithChildren } from 'react';
import { useGameMachine } from '../../hooks/use-game-machine';

export interface BaseScreenProps
  extends PropsWithChildren<Omit<HTMLMotionProps<'div'>, 'children'>> {
  send?: ReturnType<typeof useGameMachine>['send'];
}

// Screen registry mapping state machine phases to components
const SCREEN_REGISTRY: Record<string, FC<BaseScreenProps>> = {
  welcome: Welcome,
  select_billionaire: SelectBillionaire,
  select_background: SelectBackground,
  intro: Intro,
  quick_start_guide: QuickStart as FC<BaseScreenProps>,
  your_mission: YourMission,
  vs_animation: VSAnimation,
  // ready: Welcome,
  // revealing: Welcome,
  // comparing: Welcome,
  // data_war: Welcome,
  // special_effect: Welcome,
  // resolving: Welcome,
  // game_over: Welcome,
};

// Screens that should show the pause/close icon
const SCREENS_WITH_CLOSE_ICON = [
  'select_billionaire',
  'select_background',
  'intro',
  'quick_start_guide',
  'your_mission',
];

export const ScreenRenderer: FC = () => {
  const { phase: currentPhase, send } = useGameLogic();
  const { toggleMenu, selectedBackground, selectedBillionaire } = useGameStore();
  const {
    isReady,
    loadedAssets,
    totalAssets,
    essentialAssetsReady,
    highPriorityAssetsReady,
    vsVideoReady,
    highPriorityProgress,
    essentialProgress,
  } = usePreloading();

  // Convert state value to string for registry lookup
  const phaseKey = typeof currentPhase === 'string' ? currentPhase : String(currentPhase);

  // Get the component for the current phase
  const ScreenComponent = SCREEN_REGISTRY[phaseKey];
  const showCloseIcon = SCREENS_WITH_CLOSE_ICON.includes(phaseKey);

  // Fallback if phase not found
  if (!ScreenComponent) {
    // console.warn(`No screen component found for phase: ${phaseKey}`);
    return null;
  }

  // Get background configuration
  const config = STATE_BACKGROUND_CONFIG[phaseKey];

  // Determine which background image to use
  let backgroundImage = nightSkyBg;
  if (config?.variant === 'billionaire' && selectedBillionaire) {
    backgroundImage = getBackgroundImage(selectedBackground || selectedBillionaire) || nightSkyBg;
  } else if (config?.variant === 'grid') {
    backgroundImage = blueGridBg;
  }

  // Show loading screen if we're waiting for assets
  // - On select_billionaire: wait for backgrounds to load
  // - On intro/your_mission: wait for all essential assets + VS video
  const isWaitingForBackgrounds = phaseKey === 'select_billionaire' && !highPriorityAssetsReady;
  const isWaitingForEssentialAssets =
    !isReady && (phaseKey === 'intro' || phaseKey === 'your_mission');

  if (isWaitingForBackgrounds || isWaitingForEssentialAssets) {
    // Determine phase-specific progress
    const phaseProgress = isWaitingForBackgrounds ? highPriorityProgress : essentialProgress;

    return (
      <div className="absolute top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center z-100">
        <Frame backgroundSrc={nightSkyBg}>
          <LoadingScreen
            loadedCount={loadedAssets}
            totalCount={totalAssets}
            essentialAssetsReady={essentialAssetsReady}
            vsVideoReady={vsVideoReady}
            progress={phaseProgress}
          />
        </Frame>
      </div>
    );
  }

  // Pass send function and other common props to all screens
  return (
    <div className="absolute top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center z-100">
      <AnimatePresence>
        <Frame
          key="screen-frame"
          backgroundSrc={backgroundImage}
          className="flex flex-col"
          overlay={
            <>
              {/* Dark overlay for blurred backgrounds */}
              {config?.overlay && (
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,0,0,0.2)] to-[rgba(0,0,0,0.2)] pointer-events-none" />
              )}

              {/* Grid overlay for quick start guide */}
              {config?.gridOverlay && (
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0px_32px_0px_#53ffbc]" />
              )}
            </>
          }
        >
          <ScreenComponent
            key="component"
            send={send}
            className="flex flex-col items-center justify-start relative w-full h-full lg:rounded-xl overflow-auto"
          >
            {showCloseIcon && (
              <div className="absolute top-5 right-5 z-20">
                <Button onPress={toggleMenu}>
                  <Icon name="pause" label="pause" />
                </Button>
              </div>
            )}
          </ScreenComponent>
        </Frame>
      </AnimatePresence>
    </div>
  );
};
