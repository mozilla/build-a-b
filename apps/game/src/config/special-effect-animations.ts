/**
 * Special Effect Animation Registry
 * Centralized mapping of special effects to their animation video files
 */

import forcedEmpathyVideo from '@/assets/animations/effects/forced-empathy.webm';
// Import more animations as they become available:
// import hostileTakeoverVideo from '@/assets/animations/effects/hostile-takeover.webm';
// import openWhatYouWantVideo from '@/assets/animations/effects/open-what-you-want.webm';
// import launchStackVideo from '@/assets/animations/effects/launch-stack.webm';

export type SpecialEffectAnimationType =
  | 'forced_empathy'
  | 'open_what_you_want'
  | 'hostile_takeover'
  | 'launch_stack';

export interface SpecialEffectAnimation {
  videoSrc: string;
  title: string;
  loop?: boolean;
}

/**
 * Animation registry mapping effect types to their video files
 * Add new animations here as they become available
 */
export const SPECIAL_EFFECT_ANIMATIONS: Record<
  SpecialEffectAnimationType,
  SpecialEffectAnimation
> = {
  forced_empathy: {
    videoSrc: forcedEmpathyVideo,
    title: 'Forced Empathy',
    loop: true,
  },
  open_what_you_want: {
    videoSrc: forcedEmpathyVideo, // TODO: Replace with actual OWYW animation when available
    title: 'Open What You Want',
    loop: true,
  },
  hostile_takeover: {
    videoSrc: forcedEmpathyVideo, // TODO: Replace with actual Hostile Takeover animation when available
    title: 'Hostile Takeover',
    loop: true,
  },
  launch_stack: {
    videoSrc: forcedEmpathyVideo, // TODO: Replace with actual Launch Stack animation when available
    title: 'Launch Stack',
    loop: true,
  },
};
