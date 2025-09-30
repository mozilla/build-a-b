'use server';

import type { AvatarData, DatabaseAvatarResponse } from '@/types';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '../constants';
import { buildImageUrl } from '../helpers/images';
import { createClient } from '../supabase/server';

export async function getUserAvatar(userUuid?: string): Promise<AvatarData | null> {
  try {
    const [supabase, cookieStore] = await Promise.all([createClient(), cookies()]);

    const userAssociationId = userUuid || cookieStore.get(COOKIE_NAME)?.value || '';

    if (!userAssociationId) {
      throw new Error("Can't retrieve avatar information.");
    }

    // Get user avatar data in a single query
    const { data: avatar, error: avatarError } = await supabase
      .rpc('get_user_avatar_by_uuid', { user_uuid: userAssociationId })
      .single<DatabaseAvatarResponse>();

    if (avatarError || !avatar) {
      throw new Error(avatarError?.message || 'Could not retrieve user billionaire.');
    }

    return {
      originalRidingAsset: avatar.asset_riding || '',
      instragramAsset: avatar.asset_instagram || '',
      url: buildImageUrl(avatar.asset_riding),
      bio: avatar.character_story || '',
      name: `${avatar.first_name} ${avatar.last_name}`,
      uuid: userAssociationId,
      selfies: avatar.selfies,
    };
  } catch (e) {
    // This will be available via server logs.
    console.error(e);
    return null;
  }
}
