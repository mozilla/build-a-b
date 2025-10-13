import { FlagType } from '@/types';
import { flag } from 'flags/next';

const flags = {
  showAvatarPlaypenButtons: flag({
    key: 'show-avatar-playpen-buttons',
    description: 'Shows the billionaire playpen buttons when billionaire is generated',
    defaultValue: false,
    decide() {
      return process.env.FLAG_SHOW_AVATAR_PLAYPEN_BUTTONS === 'true';
    },
  }),
  showDataWar: flag({
    key: 'show-data-war',
    description: 'Shows the DataWar page and related functionality',
    defaultValue: false,
    decide() {
      return process.env.FLAG_SHOW_DATA_WAR === 'true';
    },
  }),
  showSocialFeed: flag({
    key: 'show-social-feed',
    description: 'Shows the social feed',
    defaultValue: false,
    decide() {
      return process.env.FLAG_SHOW_SOCIAL_FEED === 'true';
    },
  }),
  showPhase2aFeatures: flag({
    key: 'show-phase-2a-features',
    description: 'Display phase 2A changes',
    defaultValue: false,
    decide() {
      return process.env.FLAG_SHOW_PHASE === '2a';
    },
  }),
  showPhase2bFeatures: flag({
    key: 'show-phase-2b-features',
    description: 'Display phase 2B changes',
    defaultValue: false,
    decide() {
      return process.env.FLAG_SHOW_PHASE === '2b';
    },
  }),
  showPhase2cFeatures: flag({
    key: 'show-phase-2c-features',
    description: 'Display phase 2C changes',
    defaultValue: false,
    decide() {
      return process.env.FLAG_SHOW_PHASE === '2c';
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
