/**
 * TurnValue component types
 */

export type TurnValueState = 'normal' | 'tracker' | 'blocker';

export interface TurnValueProps {
  value: number;
  state?: TurnValueState;
  className?: string;
}
