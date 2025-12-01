/**
 * LaunchStackIndicator component types
 */

import type { PlayerType } from '@/types';

export interface LaunchStackIndicatorProps {
  launchStackCount: number;
  maxStacks?: number; // Default: 3
  className?: string;
  owner: PlayerType; // 'player' or 'cpu' - determines skew direction
}
