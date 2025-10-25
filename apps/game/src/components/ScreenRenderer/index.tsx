import { SelectBillionaire } from '@/components/Screens/SelectBillionaire';
import { Welcome } from '@/components/Screens/Welcome';
import { AnimatePresence } from 'framer-motion';
import type { FC, HTMLAttributes } from 'react';
import { useGameMachine } from '../../hooks/use-game-machine';
import { ScreenBackground } from './Background';

export interface BaseScreenProps extends HTMLAttributes<HTMLDivElement> {
  send?: ReturnType<typeof useGameMachine>['send'];
}

// Screen registry mapping state machine phases to components
const SCREEN_REGISTRY: Record<string, FC<BaseScreenProps>> = {
  welcome: Welcome,
  select_billionaire: SelectBillionaire,
  // select_background: Welcome, // Placeholder until implemented
  // intro: Welcome, // Placeholder until implemented
  // quick_start_guide: Welcome, // Placeholder until implemented
  // your_mission: Welcome, // Placeholder until implemented
  // vs_animation: Welcome, // Placeholder until implemented
  // ready: Welcome,
  // revealing: Welcome,
  // comparing: Welcome,
  // data_war: Welcome,
  // special_effect: Welcome,
  // resolving: Welcome,
  // game_over: Welcome,
};

export const ScreenRenderer: FC = () => {
  const { currentPhase, send } = useGameMachine();

  // Convert state value to string for registry lookup
  const phaseKey = typeof currentPhase === 'string' ? currentPhase : String(currentPhase);

  // Get the component for the current phase
  const ScreenComponent = SCREEN_REGISTRY[phaseKey];

  // Fallback if phase not found
  if (!ScreenComponent) {
    console.warn(`No screen component found for phase: ${phaseKey}`);
    return null;
    // return (
    //   <div className="flex items-center justify-center h-full text-common-ash">
    //     <p>Unknown phase: {phaseKey}</p>
    //   </div>
    // );
  }

  // Pass send function and other common props to all screens
  return (
    <div className="absolute top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center">
      <AnimatePresence>
        <ScreenBackground />
        <ScreenComponent
          send={send}
          className="flex flex-col items-center justify-center relative w-full h-full"
        />
      </AnimatePresence>
    </div>
  );
};
