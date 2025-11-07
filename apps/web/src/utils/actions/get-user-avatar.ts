'use server';

import type {
  AvatarData,
  DatabaseAvailableSelfiesResponse,
  DatabaseAvatarResponse,
  DatabaseUserResponse,
} from '@/types';
import { cookies } from 'next/headers';
import { COOKIE_NAME, MAX_SELFIES } from '../constants';
import { buildImageUrl } from '../helpers/images';
import { createClient } from '../supabase/server';

export async function getUserAvatar(userUuid?: string): Promise<AvatarData | null> {
  try {
    const [supabase, cookieStore] = await Promise.all([createClient(), cookies()]);

    const userAssociationId = userUuid || cookieStore.get(COOKIE_NAME)?.value || '';

    console.log(userAssociationId);

    if (!userAssociationId) {
      throw new Error("Can't retrieve avatar information.");
    }

    // Get user avatar data in a single query
    const [
      { data: avatar, error: avatarError },
      { data: availableSelfies, error: selfieAvailablityError },
      { data: user, error: userError },
    ] = await Promise.all([
      supabase
        .rpc('get_user_avatar_by_uuid', { user_uuid: userAssociationId })
        .maybeSingle<DatabaseAvatarResponse>(),
      supabase
        .rpc('get_available_selfies', { p_uuid: userAssociationId })
        .maybeSingle<DatabaseAvailableSelfiesResponse>(),
      supabase
        .from('users')
        .select('easter_egg_id')
        .eq('uuid', userAssociationId)
        .maybeSingle<Pick<DatabaseUserResponse, 'easter_egg_id'>>(),
    ]);

    if (avatarError) {
      throw new Error(avatarError?.message || 'Could not retrieve user billionaire.');
    }

    if (selfieAvailablityError) {
      throw new Error(
        selfieAvailablityError?.message || 'Could not retrieve selfie availability data.',
      );
    }

    if (userError) {
      throw new Error(userError?.message || 'Could not retrieve user data.');
    }

    if (!avatar) return null;

    return {
      originalRidingAsset: avatar.asset_riding || '',
      instragramAsset: avatar.asset_instagram || '',
      url: buildImageUrl(avatar.asset_riding),
      bio: avatar.character_story || '',
      name: `${avatar.first_name} ${avatar.last_name}`,
      uuid: userAssociationId,
      selfies: avatar.selfies,
      selfieAvailability: {
        selfies_available:
          avatar.selfies.length === MAX_SELFIES ||
          typeof availableSelfies?.selfies_available !== 'number'
            ? 0
            : availableSelfies?.selfies_available,
        next_at: availableSelfies?.next_at ? new Date(availableSelfies?.next_at) : null,
      },
      hasEasterEgg: !!user?.easter_egg_id,
    };
  } catch (e) {
    // This will be available via server logs.
    console.error(e);
    return null;
  }
}
