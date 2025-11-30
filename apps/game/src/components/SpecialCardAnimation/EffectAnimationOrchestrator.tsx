import { useGameStore } from '@/store';
import {
  SPECIAL_EFFECT_ANIMATIONS,
  getAnimationVideoSrc,
  isAnimationLottie,
} from '@/config/special-effect-animations';
import { SpecialCardAnimation } from './index';
import { GameMachineContext } from '@/providers/GameProvider';

/**
 * Effect Animation Orchestrator
 *
 * Centralized component that manages which special effect animation to show
 * based on game state. Checks all animation flags and renders the appropriate
 * animation using the SpecialCardAnimation component.
 *
 * Animations managed:
 * - Tracker Smacker (instant, when card is played)
 * - Forced Empathy (instant, when card is played)
 * - Hostile Takeover (instant, when card is played, unless blocked by tracker smacker)
 * - Leveraged Buyout (when card is played, unless blocked by tracker smacker)
 * - Patent Theft (when card is played, unless blocked by tracker smacker)
 * - Temper Tantrum (when card is played, unless blocked by tracker smacker)
 * - Mandatory Recall (when card is played)
 * - Theft Won (post-effect, when Patent Theft steals a Launch Stack)
 * - Launch Stack (post-turn, after collecting a launch stack)
 * - Data Grab (during mini-game takeover)
 *
 * Note: Open What You Want animation is now handled directly in the OpenWhatYouWantModal component
 */
export const EffectAnimationOrchestrator = () => {
  const actorRef = GameMachineContext.useActorRef();
  const {
    showForcedEmpathyAnimation,
    showHostileTakeoverAnimation,
    showLaunchStackAnimation,
    showDataGrabTakeover,
    showTrackerSmackerAnimation,
    showLeveragedBuyoutAnimation,
    showPatentTheftAnimation,
    showTemperTantrumAnimation,
    showMandatoryRecallAnimation,
    showTheftWonAnimation,
    showRecallWonAnimation,
    activePlayer,
    currentAnimationPlayer,
    isPlayingQueuedAnimation,
    effectAccumulationPaused,
    showMenu,
    cpuLaunchStacks,
    playerLaunchStacks,
    recallReturnCount,
  } = useGameStore();

  // Hide all animations when effect modal or menu is open (game is paused)
  if (effectAccumulationPaused || showMenu) {
    return null;
  }

  // Determine if the current action is from the player
  // Use currentAnimationPlayer when processing queued animations, otherwise use activePlayer
  const isPlayerAction =
    isPlayingQueuedAnimation && currentAnimationPlayer
      ? currentAnimationPlayer === 'player'
      : activePlayer === 'player';

  // Priority order: Check animations in order of their display timing
  // Instant effects (Forced Empathy, Hostile Takeover, etc.) > Post-turn (Launch Stack) > Pre-reveal (OWYW)

  // Tracker Smacker - Instant effect
  if (showTrackerSmackerAnimation) {
    const animation = SPECIAL_EFFECT_ANIMATIONS.firewall_smacker;
    return (
      <SpecialCardAnimation
        show={true}
        animationSrc={getAnimationVideoSrc(animation, isPlayerAction)}
        isLottie={isAnimationLottie(animation)}
        title={animation.title}
        loop={animation.loop}
      />
    );
  }

  // Forced Empathy - Shows video overlay (separate from deck pile animation)
  if (showForcedEmpathyAnimation) {
    const animation = SPECIAL_EFFECT_ANIMATIONS.forced_empathy;
    return (
      <SpecialCardAnimation
        show={true}
        animationSrc={getAnimationVideoSrc(animation, isPlayerAction)}
        isLottie={isAnimationLottie(animation)}
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
        animationSrc={getAnimationVideoSrc(animation, isPlayerAction)}
        isLottie={isAnimationLottie(animation)}
        title={animation.title}
        loop={animation.loop}
      />
    );
  }

  // Leveraged Buyout - Move card
  if (showLeveragedBuyoutAnimation) {
    const animation = SPECIAL_EFFECT_ANIMATIONS.move_buyout;
    return (
      <SpecialCardAnimation
        show={true}
        animationSrc={getAnimationVideoSrc(animation, isPlayerAction)}
        isLottie={isAnimationLottie(animation)}
        title={animation.title}
        loop={animation.loop}
      />
    );
  }

  // Patent Theft - Move card
  if (showPatentTheftAnimation) {
    const animation = SPECIAL_EFFECT_ANIMATIONS.move_theft;
    return (
      <SpecialCardAnimation
        show={true}
        animationSrc={getAnimationVideoSrc(animation, isPlayerAction)}
        isLottie={isAnimationLottie(animation)}
        title={animation.title}
        loop={animation.loop}
      />
    );
  }

  // Temper Tantrum - Move card
  if (showTemperTantrumAnimation) {
    const animation = SPECIAL_EFFECT_ANIMATIONS.move_tantrum;
    return (
      <SpecialCardAnimation
        show={true}
        animationSrc={getAnimationVideoSrc(animation, isPlayerAction)}
        isLottie={isAnimationLottie(animation)}
        title={animation.title}
        loop={animation.loop}
      />
    );
  }

  // Mandatory Recall - Firewall card
  if (showMandatoryRecallAnimation) {
    const animation = SPECIAL_EFFECT_ANIMATIONS.firewall_recall;
    return (
      <SpecialCardAnimation
        show={true}
        animationSrc={getAnimationVideoSrc(animation, isPlayerAction)}
        isLottie={isAnimationLottie(animation)}
        title={animation.title}
        loop={animation.loop}
      />
    );
  }

  // Recall Won - Shows when Mandatory Recall returns Launch Stacks to opponent
  if (showRecallWonAnimation) {
    const animation = SPECIAL_EFFECT_ANIMATIONS.mandatory_recall_won;
    // The count represents how many launch stacks are being returned
    const count = recallReturnCount || 1;

    return (
      <SpecialCardAnimation
        show={true}
        animationSrc={getAnimationVideoSrc(animation, isPlayerAction, count.toString())}
        isLottie={isAnimationLottie(animation)}
        title={animation.title}
        loop={animation.loop}
      />
    );
  }

  // Theft Won - Shows when Patent Theft steals a Launch Stack
  if (showTheftWonAnimation) {
    const animation = SPECIAL_EFFECT_ANIMATIONS.theft_won;
    const launchStackCounter = isPlayerAction ? playerLaunchStacks.length : cpuLaunchStacks.length;

    return (
      <SpecialCardAnimation
        show={true}
        animationSrc={getAnimationVideoSrc(
          animation,
          isPlayerAction,
          launchStackCounter.toString(),
        )}
        isLottie={isAnimationLottie(animation)}
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
        animationSrc={getAnimationVideoSrc(animation, isPlayerAction)}
        isLottie={isAnimationLottie(animation)}
        title={animation.title}
        loop={animation.loop}
      />
    );
  }

  // Data Grab - Shows takeover animation with countdown
  if (showDataGrabTakeover) {
    const animation = SPECIAL_EFFECT_ANIMATIONS.data_grab;
    return (
      <SpecialCardAnimation
        show={true}
        animationSrc={getAnimationVideoSrc(animation, isPlayerAction)}
        isLottie={isAnimationLottie(animation)}
        title={animation.title}
        loop={animation.loop}
        onVideoEnd={() => {
          // Send completion event to state machine when video finishes
          // This ensures we only transition after the video has actually played
          actorRef.send({ type: 'DATA_GRAB_COUNTDOWN_COMPLETE' });
        }}
      />
    );
  }

  // No animation to show
  return null;
};
