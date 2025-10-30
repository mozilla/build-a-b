import { useGameStore } from '../../store/game-store';
import animationData from '../../assets/animations/placeholder.json';
import { SpecialCardAnimation } from './index';

/**
 * Open What You Want Animation Wrapper
 * Shows the OWYW special card animation during the 2-second transition
 */
export const OpenWhatYouWantAnimation = () => {
  const showAnimation = useGameStore((state) => state.showOpenWhatYouWantAnimation);

  return (
    <SpecialCardAnimation
      show={showAnimation}
      animationData={animationData}
      title="Open What You Want"
    />
  );
};
