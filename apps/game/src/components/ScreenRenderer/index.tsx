import blueGridBg from '@/assets/backgrounds/color_blue.webp';
import nightSkyBg from '@/assets/backgrounds/color_nightsky.webp';
import { Frame } from '@/components/Frame';
import { Icon } from '@/components/Icon';
import { LoadingScreen, type LoadingScreenPhase } from '@/components/LoadingScreen';
import { STATE_BACKGROUND_CONFIG } from '@/components/ScreenRenderer/background-config';
import { GameOver } from '@/components/Screens/GameOver';
import { Intro } from '@/components/Screens/Intro';
import { QuickStart } from '@/components/Screens/QuickStart';
import { SelectBackground } from '@/components/Screens/SelectBackground';
import { SelectBillionaire } from '@/components/Screens/SelectBillionaire';
import { VSAnimation } from '@/components/Screens/VSAnimation';
import { Welcome } from '@/components/Screens/Welcome';
import { WinnerAnimation } from '@/components/Screens/WinnerAnimation';
import { YourMission } from '@/components/Screens/YourMission';
import { useGameLogic } from '@/hooks/use-game-logic';
import { QUERIES, useMediaQuery } from '@/hooks/use-media-query';
import { usePreloading } from '@/hooks/use-preloading';
import { useGameStore } from '@/store';
import { getBackgroundImage } from '@/utils/selectors';
import { Button } from '@heroui/react';
import { AnimatePresence, type HTMLMotionProps } from 'framer-motion';
import {
  Fragment,
  useCallback,
  useEffect,
  useState,
  type FC,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import { useGameMachine } from '../../hooks/use-game-machine';

export interface BaseScreenProps
  extends PropsWithChildren<Omit<HTMLMotionProps<'div'>, 'children'>> {
  send?: ReturnType<typeof useGameMachine>['send'];
  isFramed?: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (isOpen: boolean) => void;
  setDrawerNode: (node: React.ReactNode) => void;
  // Optional callbacks for WinnerAnimation screen
  onGameOverCrossfadeStart?: () => void;
  onGameOverCrossfadeComplete?: () => void;
  isCrossFadeComplete?: boolean;
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
  game_over: WinnerAnimation,
  // ready: Welcome,
  // revealing: Welcome,
  // comparing: Welcome,
  // data_war: Welcome,
  // special_effect: Welcome,
  // resolving: Welcome,
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
  const {
    toggleMenu,
    selectedBackground,
    selectedBillionaire,
    criticalPriorityAssetsReady,
    criticalProgress,
    setHasShownCriticalLoadingScreen,
    setHasShownHighPriorityLoadingScreen,
    setHasShownEssentialLoadingScreen,
  } = useGameStore();

  // State for GameOver screen crossfade
  const [showGameOverCrossfade, setShowGameOverCrossfade] = useState(false);
  const [isCrossfadeComplete, setIsCrossfadeComplete] = useState(false);
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerNode, setDrawerNode] = useState<ReactNode | null>(null);
  const isFramed = useMediaQuery(QUERIES.framed);

  // Convert state value to string for registry lookup
  const phaseKey = typeof currentPhase === 'string' ? currentPhase : String(currentPhase);

  // Get the component for the current phase
  const ScreenComponent = SCREEN_REGISTRY[phaseKey];
  const showCloseIcon = SCREENS_WITH_CLOSE_ICON.includes(phaseKey);

  // Show loading screen if we're waiting for assets
  const isWaitingForCritical = phaseKey === 'select_billionaire' && !criticalPriorityAssetsReady;
  const isWaitingForBackgrounds = phaseKey === 'select_background' && !highPriorityAssetsReady;
  const isWaitingForEssentialAssets =
    !isReady && (phaseKey === 'intro' || phaseKey === 'your_mission');

  // Track that user has seen the loading screen
  useEffect(() => {
    if (isWaitingForCritical) {
      setHasShownCriticalLoadingScreen(true);
    }
  }, [isWaitingForCritical, setHasShownCriticalLoadingScreen]);

  useEffect(() => {
    if (isWaitingForBackgrounds) {
      setHasShownHighPriorityLoadingScreen(true);
    }
  }, [isWaitingForBackgrounds, setHasShownHighPriorityLoadingScreen]);

  useEffect(() => {
    if (isWaitingForEssentialAssets) {
      setHasShownEssentialLoadingScreen(true);
    }
  }, [isWaitingForEssentialAssets, setHasShownEssentialLoadingScreen]);

  // Reset crossfade state when leaving game_over phase
  useEffect(() => {
    if (phaseKey !== 'game_over') {
      setShowGameOverCrossfade(false);
      setIsCrossfadeComplete(false);
    }
  }, [phaseKey]);

  // Memoize callbacks to prevent WinnerAnimation from re-rendering
  const handleGameOverCrossfadeStart = useCallback(() => {
    setShowGameOverCrossfade(true);
  }, []);

  const handleGameOverCrossfadeComplete = useCallback(() => {
    setIsCrossfadeComplete(true);
  }, []);

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

  if (isWaitingForCritical || isWaitingForBackgrounds || isWaitingForEssentialAssets) {
    let phaseProgress = essentialProgress;
    let phase = 'essential';

    if (isWaitingForCritical) {
      phaseProgress = criticalProgress;
      phase = 'critical';
    } else if (isWaitingForBackgrounds) {
      phaseProgress = highPriorityProgress;
      phase = 'backgrounds';
    }

    return (
      <div className="absolute top-0 left-0 h-[100dvh] w-[100vw] flex items-center justify-center z-100">
        <Frame backgroundSrc={nightSkyBg}>
          <LoadingScreen
            phase={phase as LoadingScreenPhase}
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

  return (
    <div className="absolute inset-0 flex items-center justify-center z-100 overflow-clip">
      <div className="h-[100dvh] w-[100vw] flex items-center justify-center">
        <AnimatePresence>
          <Frame
            key="screen-frame"
            backgroundSrc={backgroundImage}
            className="flex flex-col"
            variant="screen-renderer"
            overlay={
              <>
                {/* Dark overlay for blurred backgrounds */}
                {config?.overlay && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,0,0,0.2)] to-[rgba(0,0,0,0.2)] pointer-events-none" />
                )}

                {/* Grid overlay for quick start guide */}
                {config?.gridOverlay && (
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_2rem_0_#53ffbc]" />
                )}
              </>
            }
          >
            {/* Special dual-screen rendering for game_over phase */}
            {phaseKey === 'game_over' ? (
              <>
                {/* Winner video - always rendered, fades out during crossfade */}
                <ScreenComponent
                  key="winner-video"
                  send={send}
                  drawerOpen={drawerOpen}
                  setDrawerOpen={setDrawerOpen}
                  setDrawerNode={setDrawerNode}
                  onGameOverCrossfadeStart={handleGameOverCrossfadeStart}
                  onGameOverCrossfadeComplete={handleGameOverCrossfadeComplete}
                  className="flex flex-col items-center justify-start relative w-full h-full overflow-auto overscroll-none"
                  style={{
                    opacity: showGameOverCrossfade ? 0 : 1,
                    transition: 'opacity 3s ease-in-out',
                  }}
                />

                {/* GameOver screen - rendered when crossfade starts */}
                {showGameOverCrossfade && (
                  <GameOver
                    key="game-over-screen"
                    send={send}
                    isFramed={isFramed}
                    drawerOpen={drawerOpen}
                    setDrawerOpen={setDrawerOpen}
                    setDrawerNode={setDrawerNode}
                    isCrossFadeComplete={isCrossfadeComplete}
                    className="absolute inset-0 flex flex-col items-center justify-start w-full h-full overflow-auto overscroll-none"
                  />
                )}
              </>
            ) : (
              /* Normal single-screen rendering for all other phases */
              <ScreenComponent
                key="component"
                send={send}
                isFramed={isFramed}
                drawerOpen={drawerOpen}
                setDrawerOpen={setDrawerOpen}
                setDrawerNode={setDrawerNode}
                className="flex flex-col items-center justify-start relative w-full h-full overflow-auto overscroll-none"
              >
                {showCloseIcon && (
                  <div className="absolute top-5 right-5">
                    <Button onPress={toggleMenu}>
                      <Icon name="pause" label="pause" className="w-[1.5rem] h-[1.375rem]" />
                    </Button>
                  </div>
                )}
              </ScreenComponent>
            )}
            {isFramed && drawerOpen && <Fragment key="drawer">{drawerNode}</Fragment>}
          </Frame>
        </AnimatePresence>
      </div>
    </div>
  );
};
