'use server';

import type { AvatarData } from '@/types';
import { Database } from '@/types/database.types';
import { buildImageUrl } from '../helpers/images';
import { createClient } from '../supabase/server';

export async function getUserAvatar(userUuid: string): Promise<AvatarData | null> {
  try {
    const supabase = await createClient();

    // Get user by UUID to retrieve avatar_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('avatar_id')
      .eq('uuid', userUuid)
      .single<{ avatar_id: string }>();

    if (userError || !user?.avatar_id) return null;

    // Get avatar data using the avatar_id
    const { data: avatar, error: avatarError } = await supabase
      .from('avatars')
      .select('*')
      .eq('id', user.avatar_id)
      .single<Database['public']['Tables']['avatars']['Row']>();

    if (avatarError || !avatar) return null;

    return {
      url: buildImageUrl(`${avatar.combination_key}.png`),
      bio: avatar.character_story || '',
      name: `${avatar.first_name} ${avatar.last_name}`,
      uuid: userUuid,
    };
  } catch (e) {
    return null;
  }
}
