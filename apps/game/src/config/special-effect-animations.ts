/**
 * Special Effect Animation Registry
 * Centralized mapping of special effects to their animation video files
 *
 * Animations are loaded from Supabase storage
 */

import { getPreferredFormat, type VideoFileType } from '@/utils/video';

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

export type SpecialEffectAnimationVideoSrc =
  | Record<VideoFileType, string>
  | Record<VideoFileType, { player: string; cpu: string }>;

export interface SpecialEffectAnimation {
  videoSrc: SpecialEffectAnimationVideoSrc;
  title: string;
  loop?: boolean;
}

export function getAllAnimationVideoSrc(preferredFormat?: VideoFileType): string[] {
  preferredFormat = preferredFormat ?? getPreferredFormat();
  const videoUrls = [];
  for (const [key, value] of Object.entries(SPECIAL_EFFECT_ANIMATIONS)) {
    const videoSrcFormat = value.videoSrc[preferredFormat];

    if (typeof videoSrcFormat === 'string') {
      if (videoSrcFormat !== '') {
        videoUrls.push(videoSrcFormat);
      }
    } else {
      // special handling for mandatory_recall_won to account for dynamic counter
      // not the prettiest but hardcoded for now to 3
      if (key === 'mandatory_recall_won') {
        if (videoSrcFormat.player !== '') {
          videoUrls.push(videoSrcFormat.player.replace('{counter}', '1'));
          videoUrls.push(videoSrcFormat.player.replace('{counter}', '2'));
          videoUrls.push(videoSrcFormat.player.replace('{counter}', '3'));
        }

        if (videoSrcFormat.cpu !== '') {
          videoUrls.push(videoSrcFormat.cpu.replace('{counter}', '1'));
          videoUrls.push(videoSrcFormat.cpu.replace('{counter}', '2'));
          videoUrls.push(videoSrcFormat.cpu.replace('{counter}', '3'));
        }
      } else {
        if (videoSrcFormat.player !== '') {
          videoUrls.push(videoSrcFormat.player);
        }

        if (videoSrcFormat.cpu !== '') {
          videoUrls.push(videoSrcFormat.cpu);
        }
      }
    }
  }

  return videoUrls;
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
): string {
  const { videoSrc } = animation;
  const preferredFormat = getPreferredFormat();

  const videoSrcFormat = videoSrc[preferredFormat];

  // If videoSrcFormat is a string, return it directly (used for both player and CPU)
  if (typeof videoSrcFormat === 'string') {
    return videoSrcFormat;
  }

  // If videoSrc is an object, return the appropriate version
  const src = isPlayerAction ? videoSrcFormat.player : videoSrcFormat.cpu;

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
      videoSrc: {
        webm: `${SUPABASE_BASE_URL}firewall_empathy.webm`,
        mov: `${SUPABASE_BASE_URL}firewall_empathy.mov`,
        mp4: '',
      },
      title: 'Forced Empathy',
      loop: true,
    },
    open_what_you_want: {
      videoSrc: {
        webm: `${SUPABASE_BASE_URL}firewall_owyw.webm`,
        mov: `${SUPABASE_BASE_URL}firewall_owyw.mov`,
        mp4: '',
      },
      title: 'Open What You Want',
      loop: true,
    },
    hostile_takeover: {
      videoSrc: {
        webm: {
          player: `${SUPABASE_BASE_URL}move_takeover_player.webm`,
          cpu: `${SUPABASE_BASE_URL}move_takeover_cpu.webm`,
        },
        mov: {
          player: `${SUPABASE_BASE_URL}move_takeover_player.mov`,
          cpu: `${SUPABASE_BASE_URL}move_takeover_cpu.mov`,
        },
        mp4: {
          player: '',
          cpu: '',
        },
      },
      title: 'Hostile Takeover',
      loop: true,
    },
    launch_stack: {
      videoSrc: {
        webm: `${SUPABASE_BASE_URL}launchstack.webm`,
        mov: `${SUPABASE_BASE_URL}launchstack.mov`,
        mp4: '',
      },
      title: 'Launch Stack',
      loop: true,
    },
    launch_stack_won: {
      videoSrc: {
        webm: {
          player: `${SUPABASE_BASE_URL}won_launchstack_player.webm`,
          cpu: `${SUPABASE_BASE_URL}won_launchstack_cpu.webm`,
        },
        mov: {
          player: `${SUPABASE_BASE_URL}won_launchstack_player.mov`,
          cpu: `${SUPABASE_BASE_URL}won_launchstack_cpu.mov`,
        },
        mp4: {
          player: '',
          cpu: '',
        },
      },
      title: 'Launch Stack Won',
      loop: false,
    },
    data_grab: {
      videoSrc: {
        webm: `${SUPABASE_BASE_URL}data_grab.webm`,
        mov: `${SUPABASE_BASE_URL}data_grab.mov`,
        mp4: '',
      },
      title: 'Data Grab',
      loop: true,
    },
    firewall_recall: {
      videoSrc: {
        webm: {
          player: `${SUPABASE_BASE_URL}firewall_recall_player.webm`,
          cpu: `${SUPABASE_BASE_URL}firewall_recall_cpu.webm`,
        },
        mov: {
          player: `${SUPABASE_BASE_URL}firewall_recall_player.mov`,
          cpu: `${SUPABASE_BASE_URL}firewall_recall_cpu.mov`,
        },
        mp4: {
          player: '',
          cpu: '',
        },
      },
      title: 'Firewall Recall',
      loop: true,
    },
    firewall_smacker: {
      videoSrc: {
        webm: `${SUPABASE_BASE_URL}firewall_smacker.webm`,
        mov: `${SUPABASE_BASE_URL}firewall_smacker.mov`,
        mp4: '',
      },
      title: 'Firewall Smacker',
      loop: true,
    },
    move_buyout: {
      videoSrc: {
        webm: {
          player: `${SUPABASE_BASE_URL}move_buyout_player.webm`,
          cpu: `${SUPABASE_BASE_URL}move_buyout_cpu.webm`,
        },
        mov: {
          player: `${SUPABASE_BASE_URL}move_buyout_player.mov`,
          cpu: `${SUPABASE_BASE_URL}move_buyout_cpu.mov`,
        },
        mp4: {
          player: '',
          cpu: '',
        },
      },
      title: 'Move Buyout',
      loop: true,
    },
    move_tantrum: {
      videoSrc: {
        webm: {
          player: `${SUPABASE_BASE_URL}move_tantrum_player.webm`,
          cpu: `${SUPABASE_BASE_URL}move_tantrum_cpu.webm`,
        },
        mov: {
          player: `${SUPABASE_BASE_URL}move_tantrum_player.mov`,
          cpu: `${SUPABASE_BASE_URL}move_tantrum_cpu.mov`,
        },
        mp4: {
          player: '',
          cpu: '',
        },
      },
      title: 'Move Tantrum',
      loop: true,
    },
    move_theft: {
      videoSrc: {
        webm: {
          player: `${SUPABASE_BASE_URL}move_theft_player.webm`,
          cpu: `${SUPABASE_BASE_URL}move_theft_cpu.webm`,
        },
        mov: {
          player: `${SUPABASE_BASE_URL}move_theft_player.mov`,
          cpu: `${SUPABASE_BASE_URL}move_theft_cpu.mov`,
        },
        mp4: {
          player: '',
          cpu: '',
        },
      },
      title: 'Move Theft',
      loop: true,
    },
    theft_won: {
      videoSrc: {
        webm: {
          player: `${SUPABASE_BASE_URL}theft_won_player.webm`,
          cpu: `${SUPABASE_BASE_URL}theft_won_cpu.webm`,
        },
        mov: {
          player: `${SUPABASE_BASE_URL}theft_won_player.mov`,
          cpu: `${SUPABASE_BASE_URL}theft_won_cpu.mov`,
        },
        mp4: {
          player: '',
          cpu: '',
        },
      },
      title: 'Launch Stack Stolen',
      loop: false,
    },
    mandatory_recall_won: {
      videoSrc: {
        webm: {
          player: `${SUPABASE_BASE_URL}recall_player_{counter}.webm`,
          cpu: `${SUPABASE_BASE_URL}recall_cpu_{counter}.webm`,
        },
        mov: {
          player: `${SUPABASE_BASE_URL}recall_player_{counter}.mov`,
          cpu: `${SUPABASE_BASE_URL}recall_cpu_{counter}.mov`,
        },
        mp4: {
          player: '',
          cpu: '',
        },
      },
      title: 'Launch Stack Stolen',
      loop: false,
    },
  };
