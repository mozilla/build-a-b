import type { actionTypes } from '@/utils/constants';
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
  | 'eco.fake'
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
  | 'ai.diety'
  | 'clone.library'
  | 'fountain.of.youth'
  | '';

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
  originalRidingAsset: string;
  instragramAsset: string;
  url: string;
  name: string;
  bio: string;
  uuid: string;
  selfies: Selfie[];
  selfieAvailability: SelfieAvailabilityData;
  hasEasterEgg: boolean;
};

export type DatabaseAvatarResponse = Pick<
  Database['public']['Tables']['avatars']['Row'],
  | 'character_story'
  | 'first_name'
  | 'last_name'
  | 'id'
  | 'combination_key'
  | 'asset_riding'
  | 'asset_instagram'
> & { selfies: Selfie[] };

export type Selfie = Pick<
  Database['public']['Tables']['selfies']['Row'],
  'asset' | 'id' | 'created_at'
>;

export type DatabaseUserResponse = Database['public']['Tables']['users']['Row'];

export type DatabaseSelfieResponse = {
  avatar_id: number;
  asset: string;
  id: number;
  created_at: string;
};

export type DatabaseAvailableSelfiesResponse = {
  selfies_available: number;
  next_at: string;
};

export type SelfieAvailabilityData = {
  selfies_available: number;
  next_at: Date | null;
};

export type SelfieAvailabilityState =
  | 'COMING_SOON'
  | 'COOL_DOWN_PERIOD'
  | 'AVAILABLE'
  | 'EASTER_EGG'
  | 'CAMERA_ROLL_FULL';

export type StatusEndpointBaseResponse = {
  status: string;
};

export type ActionType = (typeof actionTypes)[number];
export type ActionTypeOrNull = ActionType | null;

export type Action = {
  onPress: () => void;
  content: {
    title: string;
    description: string;
  };
};
