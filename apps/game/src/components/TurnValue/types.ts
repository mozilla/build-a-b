/**
 * TurnValue component types
 */

import type { ActiveEffect } from '../../types';

export type TurnValueState = 'normal' | 'tracker' | 'blocker';

export interface TurnValueProps {
  value: number;
  activeEffects?: ActiveEffect[];
  className?: string;
}
