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
