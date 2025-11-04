/**
 * Character-Based Animation Utilities
 * Shared logic for VS and Data War animations based on character matchups
 */

// Import VS animations
import chazVsSavannahVS from '@/assets/animations/vs/chaz-vs-savannah.webm';

// Import Data War animations
import chazVsSavannahDataWar from '@/assets/animations/datawar/datawar-chaz-savannah.webm';

export type AnimationType = 'vs' | 'datawar';

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
 */
const ANIMATION_REGISTRIES: Record<AnimationType, Record<string, string>> = {
  vs: {
    'chaz-vs-savannah': chazVsSavannahVS,
    // Add more VS animations as they become available:
    // 'chaz-vs-chloe': chazVsChloeVS,
    // 'savannah-vs-walter': savannahVsWalterVS,
  },
  datawar: {
    'chaz-vs-savannah': chazVsSavannahDataWar,
    // Add more Data War animations as they become available:
    // 'chaz-vs-chloe': chazVsChloeDataWar,
    // 'savannah-vs-walter': savannahVsWalterDataWar,
  },
};

/**
 * Gets the animation video source for a character matchup and animation type
 * Returns undefined if no animation exists for this matchup
 */
export const getCharacterAnimation = (
  playerId: string,
  cpuId: string,
  animationType: AnimationType,
): string | undefined => {
  const matchupKey = getCharacterMatchupKey(playerId, cpuId);
  return ANIMATION_REGISTRIES[animationType][matchupKey];
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
