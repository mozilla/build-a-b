/**
 * Character-Based Animation Utilities
 * Shared logic for VS and Data War animations based on character matchups
 */

import type { BillionaireId } from '@/config/billionaires';

// Local assets path (served from public/assets/, respects Vite base path)
const VIDEO_BASE_URL = `${import.meta.env.BASE_URL}assets/video/`;

export type AnimationType = 'vs' | 'datawar' | 'winner';
type VideoFileType = 'webm' | 'mp4';

/**
 * Creates a normalized matchup key from two character IDs
 * Sorts alphabetically to handle both orders (e.g., chaz-savannah = savannah-chaz)
 */
export const getCharacterMatchupKey = (playerId: string, cpuId: string): string => {
  const [first, second] = [playerId, cpuId].sort();
  return `${first}-vs-${second}`;
};

/**
 * Animation registries for different animation types
 * Winner animations have separate sets for player wins and CPU wins
 * VS and DataWar animations use nested structure (player vs CPU matchup)
 */
type WinnerAnimationRegistry = Record<
  VideoFileType,
  {
    player: Record<BillionaireId, string>; // "You win" with each billionaire
    cpu: Record<BillionaireId, string>; // "[Billionaire] wins" for CPU victory
  }
>;
type MatchupAnimationRegistry = Record<
  VideoFileType,
  Record<BillionaireId, Partial<Record<BillionaireId, string>>>
>;

const ANIMATION_REGISTRIES: {
  vs: MatchupAnimationRegistry;
  datawar: MatchupAnimationRegistry;
  winner: WinnerAnimationRegistry;
} = {
  vs: {
    // mp4 is intentionally blank - current assets are not ideal
    mp4: {
      chaz: {
        chloe: '',
        enzo: '',
        prudence: '',
        savannah: '',
        walter: '',
      },
      chloe: {
        chaz: '',
        enzo: '',
        prudence: '',
        savannah: '',
        walter: '',
      },
      enzo: {
        chaz: '',
        chloe: '',
        prudence: '',
        savannah: '',
        walter: '',
      },
      prudence: {
        chaz: '',
        chloe: '',
        enzo: '',
        savannah: '',
        walter: '',
      },
      savannah: {
        chaz: '',
        chloe: '',
        enzo: '',
        prudence: '',
        walter: '',
      },
      walter: {
        chaz: '',
        chloe: '',
        enzo: '',
        prudence: '',
        savannah: '',
      },
    },
    webm: {
      chaz: {
        chloe: `${VIDEO_BASE_URL}1_R1_Chaz_vs_Chloe.webm`,
        enzo: `${VIDEO_BASE_URL}9_R1_Chaz_vs_Enzo.webm`,
        prudence: `${VIDEO_BASE_URL}7_R1_Chaz_vs_Prudence.webm`,
        savannah: `${VIDEO_BASE_URL}5_R1_Chaz_vs_Savannah.webm`,
        walter: `${VIDEO_BASE_URL}3_R1_Chaz_vs_Walter.webm`,
      },
      chloe: {
        chaz: `${VIDEO_BASE_URL}2_R1_Chloe_vs_Chaz.webm`,
        enzo: `${VIDEO_BASE_URL}17_R1_Chloe_vs_Enzo.webm`,
        prudence: `${VIDEO_BASE_URL}15_R1_Chloe_vs_Prudence.webm`,
        savannah: `${VIDEO_BASE_URL}13_R1_Chloe_vs_Savannah.webm`,
        walter: `${VIDEO_BASE_URL}11_R1_Chloe_vs_Walter.webm`,
      },
      enzo: {
        chaz: `${VIDEO_BASE_URL}10_R1_Enzo_vs_Chaz.webm`,
        chloe: `${VIDEO_BASE_URL}18_R1_Enzo_vs_Chloe.webm`,
        prudence: `${VIDEO_BASE_URL}30_R1_Enzo_vs_Prudence.webm`,
        savannah: `${VIDEO_BASE_URL}28_R1_Enzo_vs_Savannah.webm`,
        walter: `${VIDEO_BASE_URL}24_R1_Enzo_vs_Walter.webm`,
      },
      prudence: {
        chaz: `${VIDEO_BASE_URL}8_R1_Prudence_vs_Chaz.webm`,
        chloe: `${VIDEO_BASE_URL}16_R1_Prudence_vs_Chloe.webm`,
        enzo: `${VIDEO_BASE_URL}29_R1_Prudence_vs_Enzo.webm`,
        savannah: `${VIDEO_BASE_URL}26_R1_Prudence_vs_Savannah.webm`,
        walter: `${VIDEO_BASE_URL}22_R1_Prudence_vs_Walter.webm`,
      },
      savannah: {
        chaz: `${VIDEO_BASE_URL}6_R1_Savanah_vs_Chaz.webm`,
        chloe: `${VIDEO_BASE_URL}14_R1_Savannah_vs_Chloe.webm`,
        enzo: `${VIDEO_BASE_URL}27_R1_Savannah_vs_Enzo.webm`,
        prudence: `${VIDEO_BASE_URL}25_R1_Savannah_vs_Prudence.webm`,
        walter: `${VIDEO_BASE_URL}20_R1_Savannah_vs_Walter.webm`,
      },
      walter: {
        chaz: `${VIDEO_BASE_URL}4_R1_Walter_vs_Chaz.webm`,
        chloe: `${VIDEO_BASE_URL}12_R1_Walter_vs_Chloe.webm`,
        enzo: `${VIDEO_BASE_URL}23_R1_Walter_vs_Enzo.webm`,
        prudence: `${VIDEO_BASE_URL}21_R1_Walter_vs_Prudence.webm`,
        savannah: `${VIDEO_BASE_URL}19_R1_Walter_vs_Savannah.webm`,
      },
    },
  },
  datawar: {
    // mp4 is intentionally blank - current assets are not ideal
    mp4: {
      chaz: {
        chloe: '',
        enzo: '',
        prudence: '',
        savannah: '',
        walter: '',
      },
      chloe: {
        chaz: '',
        enzo: '',
        prudence: '',
        savannah: '',
        walter: '',
      },
      enzo: {
        chaz: '',
        chloe: '',
        prudence: '',
        savannah: '',
        walter: '',
      },
      prudence: {
        chaz: '',
        chloe: '',
        enzo: '',
        savannah: '',
        walter: '',
      },
      savannah: {
        chaz: '',
        chloe: '',
        enzo: '',
        prudence: '',
        walter: '',
      },
      walter: {
        chaz: '',
        chloe: '',
        enzo: '',
        prudence: '',
        savannah: '',
      },
    },
    webm: {
      chaz: {
        chloe: `${VIDEO_BASE_URL}R1_DataWar_Chaz_vs_Chloe.webm`,
        enzo: `${VIDEO_BASE_URL}R1_DataWar_Chaz_vs_Enzo.webm`,
        prudence: `${VIDEO_BASE_URL}R1_DataWar_Chaz_vs_Prudence.webm`,
        savannah: `${VIDEO_BASE_URL}R1_DataWar_Chaz_vs_Savannah.webm`,
        walter: `${VIDEO_BASE_URL}R1_DataWar_Chaz_vs_Walter.webm`,
      },
      chloe: {
        chaz: `${VIDEO_BASE_URL}R1_DataWar_Chloe_vs_Chaz.webm`,
        enzo: `${VIDEO_BASE_URL}R1_DataWar_Chloe_vs_Enzo.webm`,
        prudence: `${VIDEO_BASE_URL}R1_DataWar_Chloe_vs_Prudence.webm`,
        savannah: `${VIDEO_BASE_URL}R1_DataWar_Chloe_vs_Savannah.webm`,
        walter: `${VIDEO_BASE_URL}R1_DataWar_Chloe_vs_Walter.webm`,
      },
      enzo: {
        chaz: `${VIDEO_BASE_URL}R1_DataWar_Enzo_vs_Chaz.webm`,
        chloe: `${VIDEO_BASE_URL}R1_DataWar_Enzo_vs_Chloe.webm`,
        prudence: `${VIDEO_BASE_URL}R1_DataWar_Enzo_vs_Prudence.webm`,
        savannah: `${VIDEO_BASE_URL}R1_DataWar_Enzo_vs_Savannah.webm`,
        walter: `${VIDEO_BASE_URL}R1_DataWar_Enzo_vs_Walter.webm`,
      },
      prudence: {
        chaz: `${VIDEO_BASE_URL}R1_DataWar_Prudence_vs_Chaz.webm`,
        chloe: `${VIDEO_BASE_URL}R1_DataWar_Prudence_vs_Chloe.webm`,
        enzo: `${VIDEO_BASE_URL}R1_DataWar_Prudence_vs_Enzo.webm`,
        savannah: `${VIDEO_BASE_URL}R1_DataWar_Prudence_vs_Savannah.webm`,
        walter: `${VIDEO_BASE_URL}R1_DataWar_Prudence_vs_Walter.webm`,
      },
      savannah: {
        chaz: `${VIDEO_BASE_URL}R1_DataWar_Savannah_vs_Chaz.webm`,
        chloe: `${VIDEO_BASE_URL}R1_DataWar_Savannah_vs_Chloe.webm`,
        enzo: `${VIDEO_BASE_URL}R1_DataWar_Savannah_vs_Enzo.webm`,
        prudence: `${VIDEO_BASE_URL}R1_DataWar_Savannah_vs_Prudence.webm`,
        walter: `${VIDEO_BASE_URL}R1_DataWar_Savannah_vs_Walter.webm`,
      },
      walter: {
        chaz: `${VIDEO_BASE_URL}R1_DataWar_Walter_vs_Chaz.webm`,
        chloe: `${VIDEO_BASE_URL}R1_DataWar_Walter_vs_Chloe.webm`,
        enzo: `${VIDEO_BASE_URL}R1_DataWar_Walter_vs_Enzo.webm`,
        prudence: `${VIDEO_BASE_URL}R1_DataWar_Walter_vs_Prudence.webm`,
        savannah: `${VIDEO_BASE_URL}R1_DataWar_Walter_vs_Savannah.webm`,
      },
    },
  },
  winner: {
    mp4: {
      player: {
        chaz: '',
        chloe: '',
        enzo: '',
        prudence: '',
        savannah: '',
        walter: '',
      },
      cpu: {
        chaz: '',
        chloe: '',
        enzo: '',
        prudence: '',
        savannah: '',
        walter: '',
      },
    },
    webm: {
      player: {
        chaz: `${VIDEO_BASE_URL}R1_Winner_Player_Chaz.webm`,
        chloe: `${VIDEO_BASE_URL}R1_Winner_Player_Chloe.webm`,
        enzo: `${VIDEO_BASE_URL}R1_Winner_Player_Enzo.webm`,
        prudence: `${VIDEO_BASE_URL}R1_Winner_Player_Prudence.webm`,
        savannah: `${VIDEO_BASE_URL}R1_Winner_Player_Savannah.webm`,
        walter: `${VIDEO_BASE_URL}R1_Winner_Player_Walter.webm`,
      },
      cpu: {
        chaz: `${VIDEO_BASE_URL}R1_Winner_CPU_Chaz.webm`,
        chloe: `${VIDEO_BASE_URL}R1_Winner_CPU_Chloe.webm`,
        enzo: `${VIDEO_BASE_URL}R1_Winner_CPU_Enzo.webm`,
        prudence: `${VIDEO_BASE_URL}R1_Winner_CPU_Prudence.webm`,
        savannah: `${VIDEO_BASE_URL}R1_Winner_CPU_Savannah.webm`,
        walter: `${VIDEO_BASE_URL}R1_Winner_CPU_Walter.webm`,
      },
    },
  },
};

/**
 * Gets the animation video source for a character matchup and animation type
 * Returns undefined if no animation exists for this matchup
 * Prefers WebM format, falls back to MP4 if WebM is not available
 *
 * For 'winner' animations:
 *   - playerId is the billionaire who appears in the video
 *   - cpuId should be 'player' or 'cpu' to indicate which set of winner videos to use
 * For 'vs' and 'datawar' animations: Both playerId and cpuId are used for matchup
 */
export const getCharacterAnimation = (
  playerId: string,
  cpuId: string,
  animationType: AnimationType,
  preferredFormat: VideoFileType = 'webm',
): string | undefined => {
  const player = playerId as BillionaireId;
  const cpu = cpuId as BillionaireId;

  // Winner animations use separate player/cpu sets
  if (animationType === 'winner') {
    // cpuId should be 'player' or 'cpu' for winner animations
    const winnerType = cpuId as 'player' | 'cpu';
    const preferredAnimation = ANIMATION_REGISTRIES.winner[preferredFormat][winnerType]?.[player];
    if (preferredAnimation) return preferredAnimation;

    // Fall back to the other format
    const fallbackFormat: VideoFileType = preferredFormat === 'webm' ? 'mp4' : 'webm';
    return ANIMATION_REGISTRIES.winner[fallbackFormat][winnerType]?.[player];
  }

  // VS and DataWar animations use nested matchup structure
  const registry = ANIMATION_REGISTRIES[animationType];

  // Try preferred format first
  const preferredAnimation = registry[preferredFormat][cpu]?.[player];
  if (preferredAnimation) return preferredAnimation;

  // Fall back to the other format
  const fallbackFormat: VideoFileType = preferredFormat === 'webm' ? 'mp4' : 'webm';
  return registry[fallbackFormat][cpu]?.[player];
};

/**
 * Checks if an animation exists for a specific matchup and type
 */
export const hasCharacterAnimation = (
  playerId: string,
  cpuId: string,
  animationType: AnimationType,
): boolean => {
  return getCharacterAnimation(playerId, cpuId, animationType) !== undefined;
};
