import { FlagType } from '@/types';
import { flag } from 'flags/next';

const flags = {
  demoAvatarBento: flag({
    key: 'demo-avatar-bento',
    description: 'Shows the demo avatar bento on the homepage',
    defaultValue: false,
    decide() {
      return process.env.FLAG_DEMO_AVATAR_BENTO === 'true';
    },
  }),
  demoLargeTeaserBento: flag({
    key: 'demo-large-teaser-bento',
    description: 'Shows the demo large teaser bento on the homepage',
    defaultValue: false,
    decide() {
      return process.env.FLAG_DEMO_LARGE_TEASER_BENTO === 'true';
    },
  }),
  showAvatarPlaypenButtons: flag({
    key: 'show-avatar-playpen-buttons',
    description: 'Shows the avatar playpen buttons when avatar is generated',
    defaultValue: false,
    decide() {
      return process.env.FLAG_SHOW_AVATAR_PLAYPEN_BUTTONS === 'true';
    },
  }),
  showAvatarBentoV2: flag({
    key: 'avatar-bento-v2',
    description: 'Shows the restructured AvatarBento component',
    defaultValue: false,
    decide() {
      return process.env.FLAG_AVATAR_BENTO_V2 === 'true';
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
