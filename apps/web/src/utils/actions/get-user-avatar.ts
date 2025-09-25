'use server';

import type { AvatarData } from '@/types';
import { Database } from '@/types/database.types';
import { buildImageUrl } from '../helpers/images';
import { createClient } from '../supabase/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '../constants';

export async function getUserAvatar(userUuid?: string): Promise<AvatarData | null> {
  try {
    const [supabase, cookieStore] = await Promise.all([createClient(), cookies()]);

    const userAssociationId = userUuid || cookieStore.get(COOKIE_NAME)?.value || '';

    if (!userAssociationId) {
      throw new Error("Can't retrieve avatar information.");
    }

    // Get user by UUID to retrieve avatar_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('avatar_id')
      .eq('uuid', userAssociationId)
      .single<{ avatar_id: string }>();

    if (userError || !user?.avatar_id) {
      throw new Error(userError?.message || 'User not found.');
    }

    // Get avatar data using the avatar_id
    const { data: avatar, error: avatarError } = await supabase
      .from('avatars')
      .select('*')
      .eq('id', user.avatar_id)
      .single<Database['public']['Tables']['avatars']['Row']>();

    if (avatarError || !avatar) {
      throw new Error(avatarError?.message || 'Could no retrieve user avatar.');
    }

    return {
      originalRidingAsset: avatar.asset_riding || '',
      instragramAsset: avatar.asset_instagram || '',
      url: buildImageUrl(avatar.asset_riding),
      bio: avatar.character_story || '',
      name: `${avatar.first_name} ${avatar.last_name}`,
      uuid: userAssociationId,
    };
  } catch (e) {
    // This will be available via server logs.
    console.error(e);
    return null;
  }
}
