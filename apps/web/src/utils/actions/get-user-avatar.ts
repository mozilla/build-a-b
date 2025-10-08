'use server';

import type { AvatarData, DatabaseAvailableSelfiesResponse, DatabaseAvatarResponse } from '@/types';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '../constants';
import { buildImageUrl } from '../helpers/images';
import { createClient } from '../supabase/server';
import { sortSelfies } from '../helpers/order-by-date';

export async function getUserAvatar(userUuid?: string): Promise<AvatarData | null> {
  try {
    const [supabase, cookieStore] = await Promise.all([createClient(), cookies()]);

    const userAssociationId = userUuid || cookieStore.get(COOKIE_NAME)?.value || '';

    if (!userAssociationId) {
      throw new Error("Can't retrieve avatar information.");
    }

    // Get user avatar data in a single query
    const [
      { data: avatar, error: avatarError },
      { data: availableSelfies, error: selfieAvailablityError },
    ] = await Promise.all([
      supabase
        .rpc('get_user_avatar_by_uuid', { user_uuid: userAssociationId })
        .maybeSingle<DatabaseAvatarResponse>(),
      supabase
        .rpc('get_available_selfies', { p_uuid: userAssociationId })
        .maybeSingle<DatabaseAvailableSelfiesResponse>(),
    ]);

    if (avatarError) {
      throw new Error(avatarError?.message || 'Could not retrieve user billionaire.');
    }

    if (selfieAvailablityError) {
      throw new Error(
        selfieAvailablityError?.message || 'Could not retrieve selfie availability data.',
      );
    }

    if (!avatar) return null;

    return {
      originalRidingAsset: avatar.asset_riding || '',
      instragramAsset: avatar.asset_instagram || '',
      url: buildImageUrl(avatar.asset_riding),
      bio: avatar.character_story || '',
      name: `${avatar.first_name} ${avatar.last_name}`,
      uuid: userAssociationId,
      selfies: avatar.selfies.sort(sortSelfies()),
      selfieAvailability: {
        selfies_available: availableSelfies?.selfies_available || 0,
        next_at: availableSelfies?.next_at ? new Date(availableSelfies?.next_at) : null,
      },
    };
  } catch (e) {
    // This will be available via server logs.
    console.error(e);
    return null;
  }
}
