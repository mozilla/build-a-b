import type { Database } from './database.types';

export interface FlagType<T = boolean> {
  key: string;
  decide: (params?: unknown) => Promise<T> | T;
  description: string;
  defaultValue: T;
}

export type Choice =
  | 'inherited'
  | 'manipulator'
  | 'data.thief'
  | 'crypto.king'
  | 'med.mogul'
  | 'power'
  | 'chaos'
  | 'immortality'
  | 'control'
  | 'fame'
  | 'eco-fake'
  | 'visionary'
  | 'rebel'
  | 'savior'
  | 'genius'
  | 'raiders'
  | 'shadows'
  | 'data.mine'
  | 'media.spin'
  | 'policy.hack'
  | 'mars'
  | 'sea.lord'
  | 'ai.god'
  | 'blood.bank'
  | 'forever.pill';

export type ChoiceGroup =
  | 'origin-story'
  | 'core-drive'
  | 'public-mask'
  | 'power-play'
  | 'legacy-plan';

export type ChoiceConfig = {
  /**
   * Icon (url) to display in the choice card.
   */
  icon: string;
  /**
   * Icon (url) to display in the confirmation screen.
   */
  iconWhenConfirmed: string;
  /**
   * Text to display in the confirmation screen.
   */
  phrase: string;
  /**
   * The numeric value associated to the choice.
   * This value will be sent to the API.
   */
  value: number;
  /**
   * String associated value.
   */
  id: Choice;
};

export type GameChoices = Record<ChoiceGroup, Record<Choice, ChoiceConfig>>;

export type AvatarData = {
  url: string;
  name: string;
  bio: string;
  uuid: string;
};

export type DatabaseAvatarResponse = Pick<
  Database['public']['Tables']['avatars']['Row'],
  'asset' | 'character_story' | 'first_name' | 'last_name' | 'id'
>;

export type DatabaseUserResponse = Database['public']['Tables']['users']['Row'];
