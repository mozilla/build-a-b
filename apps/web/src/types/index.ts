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
  | 'fountain.of.youth';

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

export type DatabaseStandingAvatarResponse = {
  avatar_id: string;
  user_id: string;
  asset_standing: string;
};

export type SelfieInitResponse = {
  /**
   * Job ID. Used to poll the job status.
   */
  job_id: string;
  /**
   * Message with additional information
   */
  message: string;
  /**
   * The image sent to the API.
   */
  input_path: string;
  /**
   * Status. If the response is successful this will be 'received'.
   */
  status: string;
};

export type SelfieStatusResponse = {
  /**
   * Image storage temporal path.
   */
  input_image_path: string;
  /**
   * Generated selfie url
   */
  selfie_image_url: string;
  /**
   * Job status. When the image is generated this value will be 'completed'.
   */
  status: string;
};

export type StatusEndpointBaseResponse = {
  status: string;
};
