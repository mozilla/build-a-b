/**
 * Character-Based Animation Utilities
 * Shared logic for VS and Data War animations based on character matchups
 */

import type { BillionaireId } from '@/config/billionaires';
import { getPreferredFormat, type VideoFileType } from './video';
export type AnimationType = 'vs' | 'datawar' | 'winner';

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
    mov: {
      chaz: {
        chloe:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/1_R1_Chaz_vs_Chloe.mov',
        enzo: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/9_R1_Chaz_vs_Enzo.mov',
        prudence:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/7_R1_Chaz_vs_Prudence.mov',
        savannah:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/5_R1_Chaz_vs_Savannah.mov',
        walter:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/3_R1_Chaz_vs_Walter.mov',
      },
      chloe: {
        chaz: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/2_R1_Chloe_vs_Chaz.mov',
        enzo: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/17_R1_Chloe_vs_Enzo.mov',
        prudence:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/15_R1_Chloe_vs_Prudence.mov',
        savannah:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/13_R1_Chloe_vs_Savannah.mov',
        walter:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/11_R1_Chloe_vs_Walter.mov',
      },
      enzo: {
        chaz: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/10_R1_Enzo_vs_Chaz.mov',
        chloe:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/18_R1_Enzo_vs_Chloe.mov',
        prudence:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/30_R1_Enzo_vs_Prudence.mov',
        savannah:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/28_R1_Enzo_vs_Savannah.mov',
        walter:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/24_R1_Enzo_vs_Walter.mov',
      },
      prudence: {
        chaz: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/8_R1_Prudence_vs_Chaz.mov',
        chloe:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/16_R1_Prudence_vs_Chloe.mov',
        enzo: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/29_R1_Prudence_vs_Enzo.mov',
        savannah:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/26_R1_Prudence_vs_Savannah.mov',
        walter:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/22_R1_Prudence_vs_Walter.mov',
      },
      savannah: {
        chaz: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/6_R1_Savanah_vs_Chaz.mov',
        chloe:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/14_R1_Savannah_vs_Chloe.mov',
        enzo: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/27_R1_Savannah_vs_Enzo.mov',
        prudence:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/25_R1_Savannah_vs_Prudence.mov',
        walter:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/20_R1_Savannah_vs_Walter.mov',
      },
      walter: {
        chaz: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/4_R1_Walter_vs_Chaz.mov',
        chloe:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/12_R1_Walter_vs_Chloe.mov',
        enzo: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/23_R1_Walter_vs_Enzo.mov',
        prudence:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/21_R1_Walter_vs_Prudence.mov',
        savannah:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/19_R1_Walter_vs_Savannah.mov',
      },
    },
    webm: {
      chaz: {
        chloe:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/1_R1_Chaz_vs_Chloe.webm',
        enzo: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/9_R1_Chaz_vs_Enzo.webm',
        prudence:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/7_R1_Chaz_vs_Prudence.webm',
        savannah:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/5_R1_Chaz_vs_Savannah.webm',
        walter:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/3_R1_Chaz_vs_Walter.webm',
      },
      chloe: {
        chaz: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/2_R1_Chloe_vs_Chaz.webm',
        enzo: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/17_R1_Chloe_vs_Enzo.webm',
        prudence:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/15_R1_Chloe_vs_Prudence.webm',
        savannah:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/13_R1_Chloe_vs_Savannah.webm',
        walter:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/11_R1_Chloe_vs_Walter.webm',
      },
      enzo: {
        chaz: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/10_R1_Enzo_vs_Chaz.webm',
        chloe:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/18_R1_Enzo_vs_Chloe.webm',
        prudence:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/30_R1_Enzo_vs_Prudence.webm',
        savannah:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/28_R1_Enzo_vs_Savannah.webm',
        walter:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/24_R1_Enzo_vs_Walter.webm',
      },
      prudence: {
        chaz: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/8_R1_Prudence_vs_Chaz.webm',
        chloe:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/16_R1_Prudence_vs_Chloe.webm',
        enzo: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/29_R1_Prudence_vs_Enzo.webm',
        savannah:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/26_R1_Prudence_vs_Savannah.webm',
        walter:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/22_R1_Prudence_vs_Walter.webm',
      },
      savannah: {
        chaz: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/6_R1_Savanah_vs_Chaz.webm',
        chloe:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/14_R1_Savannah_vs_Chloe.webm',
        enzo: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/27_R1_Savannah_vs_Enzo.webm',
        prudence:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/25_R1_Savannah_vs_Prudence.webm',
        walter:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/20_R1_Savannah_vs_Walter.webm',
      },
      walter: {
        chaz: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/4_R1_Walter_vs_Chaz.webm',
        chloe:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/12_R1_Walter_vs_Chloe.webm',
        enzo: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/23_R1_Walter_vs_Enzo.webm',
        prudence:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/21_R1_Walter_vs_Prudence.webm',
        savannah:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/19_R1_Walter_vs_Savannah.webm',
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
    mov: {
      // intentionally blank to use webm instead
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
        chloe:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Chaz_vs_Chloe.webm',
        enzo: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Chaz_vs_Enzo.webm',
        prudence:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Chaz_vs_Prudence.webm',
        savannah:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Chaz_vs_Savannah.webm',
        walter:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Chaz_vs_Walter.webm',
      },
      chloe: {
        chaz: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Chloe_vs_Chaz.webm',
        enzo: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Chloe_vs_Enzo.webm',
        prudence:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Chloe_vs_Prudence.webm',
        savannah:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Chloe_vs_Savannah.webm',
        walter:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Chloe_vs_Walter.webm',
      },
      enzo: {
        chaz: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Enzo_vs_Chaz.webm',
        chloe:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Enzo_vs_Chloe.webm',
        prudence:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Enzo_vs_Prudence.webm',
        savannah:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Enzo_vs_Savannah.webm',
        walter:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Enzo_vs_Walter.webm',
      },
      prudence: {
        chaz: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Prudence_vs_Chaz.webm',
        chloe:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Prudence_vs_Chloe.webm',
        enzo: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Prudence_vs_Enzo.webm',
        savannah:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Prudence_vs_Savannah.webm',
        walter:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Prudence_vs_Walter.webm',
      },
      savannah: {
        chaz: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Savannah_vs_Chaz.webm',
        chloe:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Savannah_vs_Chloe.webm',
        enzo: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Savannah_vs_Enzo.webm',
        prudence:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Savannah_vs_Prudence.webm',
        walter:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Savannah_vs_Walter.webm',
      },
      walter: {
        chaz: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Walter_vs_Chaz.webm',
        chloe:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Walter_vs_Chloe.webm',
        enzo: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Walter_vs_Enzo.webm',
        prudence:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Walter_vs_Prudence.webm',
        savannah:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_DataWar_Walter_vs_Savannah.webm',
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
    mov: {
      // intentionally blank to use webm instead
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
        chaz: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_Winner_Player_Chaz.webm',
        chloe:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_Winner_Player_Chloe.webm',
        enzo: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_Winner_Player_Enzo.webm',
        prudence:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_Winner_Player_Prudence.webm',
        savannah:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_Winner_Player_Savannah.webm',
        walter:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_Winner_Player_Walter.webm',
      },
      cpu: {
        chaz: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_Winner_CPU_Chaz.webm',
        chloe:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_Winner_CPU_Chloe.webm',
        enzo: 'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_Winner_CPU_Enzo.webm',
        prudence:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_Winner_CPU_Prudence.webm',
        savannah:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_Winner_CPU_Savannah.webm',
        walter:
          'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/R1_Winner_CPU_Walter.webm',
      },
    },
  },
};

/**
 * Gets the animation video source for a character matchup and animation type
 * Returns undefined if no animation exists for this matchup
 * Prefers WebM format for non safari browsers,
 * Prefers MOV format for safari
 * For mov will fallback to webm -> mp4
 * For webm will fallback to mp4
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
  preferredFormat?: VideoFileType,
): string | undefined => {
  const player = playerId as BillionaireId;
  const cpu = cpuId as BillionaireId;

  preferredFormat = preferredFormat ?? getPreferredFormat();

  // Winner animations use separate player/cpu sets
  if (animationType === 'winner') {
    // cpuId should be 'player' or 'cpu' for winner animations
    const winnerType = cpuId as 'player' | 'cpu';
    const winnerRegistry = ANIMATION_REGISTRIES.winner;
    const preferredAnimation = winnerRegistry[preferredFormat][winnerType]?.[player];
    if (preferredAnimation) return preferredAnimation;

    // Use fallback when preferred format video not found
    if (preferredFormat === 'mov') {
      return (
        winnerRegistry['webm'][winnerType]?.[player] ?? winnerRegistry['mp4'][winnerType]?.[player]
      );
    }

    return winnerRegistry['mp4'][winnerType]?.[player];
  }

  // VS and DataWar animations use nested matchup structure
  const registry = ANIMATION_REGISTRIES[animationType];

  // Try preferred format first
  const preferredAnimation = registry[preferredFormat][cpu]?.[player];
  if (preferredAnimation) return preferredAnimation;

  // Use fallback when preferred format video not found
  if (preferredFormat === 'mov') {
    return registry['webm'][cpu]?.[player] ?? registry['mp4'][cpu]?.[player];
  }

  return registry['mp4'][cpu]?.[player];
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
