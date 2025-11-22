/**
 * Special Effect Animation Registry
 * Centralized mapping of special effects to their animation video files
 *
 * Animations are loaded from Supabase storage
 */

import mandatoryRecallPlayer1 from '@/assets/special-effects/mandatory_recall_player_1.json';
import mandatoryRecallPlayer2 from '@/assets/special-effects/mandatory_recall_player_2.json';
import mandatoryRecallPlayer3 from '@/assets/special-effects/mandatory_recall_player_3.json';
import mandatoryRecallCpu1 from '@/assets/special-effects/mandatory_recall_cpu_1.json';
import mandatoryRecallCpu2 from '@/assets/special-effects/mandatory_recall_cpu_2.json';
import mandatoryRecallCpu3 from '@/assets/special-effects/mandatory_recall_cpu_3.json';
import theftWonCpu from '@/assets/special-effects/theft_won_cpu.json';
import theftWonPlayer from '@/assets/special-effects/theft_won_player.json';
import wonLaunchStackCpu from '@/assets/special-effects/won_launchstack_cpu.json';
import wonLaunchStackPlayer from '@/assets/special-effects/won_launchstack_player.json';

export const SUPABASE_BASE_URL =
  'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/';

export type SpecialEffectAnimationType =
  | 'forced_empathy'
  | 'open_what_you_want'
  | 'hostile_takeover'
  | 'launch_stack'
  | 'launch_stack_won'
  | 'data_grab'
  | 'firewall_recall'
  | 'firewall_smacker'
  | 'move_buyout'
  | 'move_tantrum'
  | 'move_theft'
  | 'theft_won'
  | 'mandatory_recall_won';

export interface SpecialEffectAnimation {
  videoSrc: string | { player: string; cpu: string };
  lottie?: unknown | { player: unknown[]; cpu: unknown[] };
  title: string;
  loop?: boolean;
}

export function isAnimationLottie(animation: SpecialEffectAnimation) {
  return !!animation.lottie;
}

/**
 * Helper function to get the correct video source based on who played the card
 * @param animation - The animation configuration
 * @param isPlayerAction - Whether the action was performed by the player (true) or CPU (false)
 * @returns The video source URL string
 */
export function getAnimationVideoSrc(
  animation: SpecialEffectAnimation,
  isPlayerAction: boolean = true,
  counter?: string,
): string | unknown {
  const { videoSrc, lottie } = animation;

  if (lottie) {
    if (typeof lottie === 'string') {
      return lottie;
    }

    if (typeof lottie === 'object' && 'player' in lottie && 'cpu' in lottie) {
      const lottieAction = isPlayerAction ? lottie.player : lottie.cpu;

      if (Array.isArray(lottieAction)) {
        const index = Number(counter ?? 0);
        return lottieAction[index];
      } else {
        return lottieAction;
      }
    }
  }

  // If videoSrc is a string, return it directly (used for both player and CPU)
  if (typeof videoSrc === 'string') {
    return videoSrc;
  }

  // If videoSrc is an object, return the appropriate version
  const src = isPlayerAction ? videoSrc.player : videoSrc.cpu;

  if (counter) {
    return src.replace('{counter}', counter);
  }
  return src;
}

/**
 * Animation registry mapping effect types to their video files
 * Some animations have separate versions for player and CPU actions
 */
export const SPECIAL_EFFECT_ANIMATIONS: Record<SpecialEffectAnimationType, SpecialEffectAnimation> =
  {
    forced_empathy: {
      videoSrc: `${SUPABASE_BASE_URL}firewall_empathy.webm`,
      title: 'Forced Empathy',
      loop: true,
    },
    open_what_you_want: {
      videoSrc: `${SUPABASE_BASE_URL}firewall_owyw.webm`,
      title: 'Open What You Want',
      loop: true,
    },
    hostile_takeover: {
      videoSrc: {
        // This should be fixed in supabase, but for now I'm doing a code change to fix animation
        player: `${SUPABASE_BASE_URL}move_takeover_cpu.webm`,
        cpu: `${SUPABASE_BASE_URL}move_takeover_player.webm`,
      },
      title: 'Hostile Takeover',
      loop: true,
    },
    launch_stack: {
      videoSrc: `${SUPABASE_BASE_URL}launchstack.webm`,
      title: 'Launch Stack',
      loop: true,
    },
    launch_stack_won: {
      videoSrc: {
        player: `${SUPABASE_BASE_URL}won_launchstack_player.webm`,
        cpu: `${SUPABASE_BASE_URL}won_launchstack_cpu.webm`,
      },
      lottie: {
        player: wonLaunchStackPlayer,
        cpu: wonLaunchStackCpu,
      },
      title: 'Launch Stack Won',
      loop: false,
    },
    data_grab: {
      videoSrc: `${SUPABASE_BASE_URL}data_grab.webm`,
      title: 'Data Grab',
      loop: true,
    },
    firewall_recall: {
      videoSrc: {
        player: `${SUPABASE_BASE_URL}firewall_recall_player.webm`,
        cpu: `${SUPABASE_BASE_URL}firewall_recall_cpu.webm`,
      },
      title: 'Firewall Recall',
      loop: true,
    },
    firewall_smacker: {
      videoSrc: `${SUPABASE_BASE_URL}firewall_smacker.webm`,
      title: 'Firewall Smacker',
      loop: true,
    },
    move_buyout: {
      videoSrc: {
        player: `${SUPABASE_BASE_URL}move_buyout_player.webm`,
        cpu: `${SUPABASE_BASE_URL}move_buyout_cpu.webm`,
      },
      title: 'Move Buyout',
      loop: true,
    },
    move_tantrum: {
      videoSrc: {
        player: `${SUPABASE_BASE_URL}move_tantrum_player.webm`,
        cpu: `${SUPABASE_BASE_URL}move_tantrum_cpu.webm`,
      },
      title: 'Move Tantrum',
      loop: true,
    },
    move_theft: {
      videoSrc: {
        player: `${SUPABASE_BASE_URL}move_theft_player.webm`,
        cpu: `${SUPABASE_BASE_URL}move_theft_cpu.webm`,
      },
      title: 'Move Theft',
      loop: true,
    },
    theft_won: {
      videoSrc: {
        player: `${SUPABASE_BASE_URL}theft_won_player.webm`,
        cpu: `${SUPABASE_BASE_URL}theft_won_cpu.webm`,
      },
      lottie: {
        player: theftWonPlayer,
        cpu: theftWonCpu,
      },
      title: 'Launch Stack Stolen',
      loop: false,
    },
    mandatory_recall_won: {
      videoSrc: {
        player: `${SUPABASE_BASE_URL}recall_cpu_{counter}.webm`,
        cpu: `${SUPABASE_BASE_URL}recall_player_{counter}.webm`,
      },
      lottie: {
        player: [mandatoryRecallPlayer1, mandatoryRecallPlayer2, mandatoryRecallPlayer3],
        cpu: [mandatoryRecallCpu1, mandatoryRecallCpu2, mandatoryRecallCpu3],
      },
      title: 'Launch Stack Stolen',
      loop: false,
    },
  };
