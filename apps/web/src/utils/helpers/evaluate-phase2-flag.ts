import { evaluateFlag } from '@/app/flags';

/**
 * Evaluate phase 2 feature flags to determine if
 * the minimum phase requirement is met.
 *
 * @example
 * evaluatePhase2Flag('b');
 * FLAG_SHOW_PHASE = 2a -> false
 * FLAG_SHOW_PHASE = 2b -> true
 * FLAG_SHOW_PHASE = 2c -> true
 */
export async function evaluatePhase2Flag(min: 'a' | 'b' | 'c'): Promise<boolean> {
  const [a, b, c] = await Promise.all([
    evaluateFlag('showPhase2aFeatures'),
    evaluateFlag('showPhase2bFeatures'),
    evaluateFlag('showPhase2cFeatures'),
  ]);

  switch (min) {
    case 'a':
      return a || b || c;
    case 'b':
      return b || c;
    case 'c':
      return c;
    default:
      return false;
  }
}
