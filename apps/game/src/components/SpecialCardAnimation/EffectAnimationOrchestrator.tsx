import { useGameStore } from '@/store';
import { SPECIAL_EFFECT_ANIMATIONS } from '@/config/special-effect-animations';
import { SpecialCardAnimation } from './index';

/**
 * Effect Animation Orchestrator
 *
 * Centralized component that manages which special effect animation to show
 * based on game state. Checks all animation flags and renders the appropriate
 * animation using the SpecialCardAnimation component.
 *
 * Animations managed:
 * - Open What You Want (pre-reveal, beginning of next turn)
 * - Forced Empathy (instant, when card is played)
 * - Hostile Takeover (instant, when card is played)
 * - Launch Stack (post-turn, after collecting a launch stack)
 */
export const EffectAnimationOrchestrator = () => {
  const {
    showOpenWhatYouWantAnimation,
    showForcedEmpathyAnimation,
    showHostileTakeoverAnimation,
    showLaunchStackAnimation,
  } = useGameStore();

  // Priority order: Check animations in order of their display timing
  // Instant effects (Forced Empathy, Hostile Takeover) > Post-turn (Launch Stack) > Pre-reveal (OWYW)

  // Forced Empathy - Shows video overlay (separate from deck pile animation)
  if (showForcedEmpathyAnimation) {
    const animation = SPECIAL_EFFECT_ANIMATIONS.forced_empathy;
    return (
      <SpecialCardAnimation
        show={true}
        videoSrc={animation.videoSrc}
        title={animation.title}
        loop={animation.loop}
      />
    );
  }

  // Hostile Takeover - Shows when hostile takeover is played
  if (showHostileTakeoverAnimation) {
    const animation = SPECIAL_EFFECT_ANIMATIONS.hostile_takeover;
    return (
      <SpecialCardAnimation
        show={true}
        videoSrc={animation.videoSrc}
        title={animation.title}
        loop={animation.loop}
      />
    );
  }

  // Launch Stack - Shows after collecting a launch stack
  if (showLaunchStackAnimation) {
    const animation = SPECIAL_EFFECT_ANIMATIONS.launch_stack;
    return (
      <SpecialCardAnimation
        show={true}
        videoSrc={animation.videoSrc}
        title={animation.title}
        loop={animation.loop}
      />
    );
  }

  // Open What You Want - Shows during 2-second transition at beginning of next turn
  if (showOpenWhatYouWantAnimation) {
    const animation = SPECIAL_EFFECT_ANIMATIONS.open_what_you_want;
    return (
      <SpecialCardAnimation
        show={true}
        videoSrc={animation.videoSrc}
        title={animation.title}
        loop={animation.loop}
      />
    );
  }

  // No animation to show
  return null;
};
