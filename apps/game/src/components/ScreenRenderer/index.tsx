import { Icon } from '@/components/Icon';
import { Intro } from '@/components/Screens/Intro';
import { QuickStart } from '@/components/Screens/QuickStart';
import { SelectBackground } from '@/components/Screens/SelectBackground';
import { SelectBillionaire } from '@/components/Screens/SelectBillionaire';
import { VSAnimation } from '@/components/Screens/VSAnimation';
import { Welcome } from '@/components/Screens/Welcome';
import { YourMission } from '@/components/Screens/YourMission';
import { useGameLogic } from '@/hooks/use-game-logic';
import { useGameStore } from '@/stores/game-store';
import { Button } from '@heroui/react';
import { AnimatePresence, type HTMLMotionProps } from 'framer-motion';
import type { FC } from 'react';
import { useGameMachine } from '../../hooks/use-game-machine';
import { ScreenBackground } from './Background';

export interface BaseScreenProps extends HTMLMotionProps<'div'> {
  send?: ReturnType<typeof useGameMachine>['send'];
}

// Screen registry mapping state machine phases to components
const SCREEN_REGISTRY: Record<string, FC<BaseScreenProps>> = {
  welcome: Welcome,
  select_billionaire: SelectBillionaire,
  select_background: SelectBackground,
  intro: Intro,
  quick_start_guide: QuickStart,
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
  const { toggleMenu } = useGameStore();

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

  // Pass send function and other common props to all screens
  return (
    <div className="absolute top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center">
      <AnimatePresence>
        <ScreenBackground key="background" phaseKey={phaseKey} />
        <ScreenComponent
          key="component"
          send={send}
          className="flex flex-col items-center justify-center relative w-full h-full"
        />
        {showCloseIcon && (
          <div className="absolute top-5 right-5 z-20">
            <Button onPress={toggleMenu}>
              <Icon name="pause" />
            </Button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
