import { flag } from 'flags/next';
import { FlagType } from '@/types';

const flags = {
  deployButton: flag({
    key: 'deploy-default-button',
    description: 'Flips deploy button visibility',
    defaultValue: false,
    decide() {
      return process.env.DEPLOY_BUTTON_VISIBILITY_FLAG === 'true';
    },
  }),
  betaFeatures: flag({
    key: 'beta-features',
    description: 'Enable beta features for testing',
    defaultValue: false,
    decide() {
      return process.env.BETA_FEATURE_FLAG === 'true';
    },
  }),
} as const;

/**
 * Type-safe flag keys
 */
export type FlagKey = keyof typeof flags;

export const evaluateFlag = (flagKey: FlagKey): boolean | Promise<boolean> => {
  const flag = flags[flagKey] as FlagType<boolean>;
  return flag.decide();
};

export const getAllFlags = async (): Promise<Record<FlagKey, boolean>> => {
  const entries = await Promise.all(
    (Object.keys(flags) as FlagKey[]).map(async (flagKey) => {
      const value = await evaluateFlag(flagKey);
      return [flagKey, value] as const;
    }),
  );

  return Object.fromEntries(entries) as Record<FlagKey, boolean>;
};
