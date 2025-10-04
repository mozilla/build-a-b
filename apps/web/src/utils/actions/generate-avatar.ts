'use server';
import type { AvatarData, Choice, DatabaseAvatarResponse, DatabaseUserResponse } from '@/types';
import { buildImageUrl } from '../helpers/images';
import { createClient } from '../supabase/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '../constants';

export async function generateAvatar(options: Choice[]): Promise<AvatarData | null> {
  try {
    const [supabase, cookieStore] = await Promise.all([createClient(), cookies()]);

    // Keep this log for server debugging
    console.log('Starting search with options: ', options);

    const { data: selectedAvatar, error } = await supabase
      .rpc('get_random_avatar_v2', {
        selected_origin_story: options[0],
        selected_core_drive: options[1],
        selected_public_mask: options[2],
        selected_power_play: options[3],
        selected_legacy_plan: options[4],
      })
      .single<DatabaseAvatarResponse>();

    if (error || !selectedAvatar) {
      throw new Error(error?.message || 'Could not retrieve billionaire.');
    }

    const cookieValue = cookieStore.get(COOKIE_NAME)?.value || '';

    const { data: newOrUpdatedUser, error: upsertError } = await supabase
      .rpc('upsert_user_with_avatar', {
        p_uuid: cookieValue,
        p_avatar_id: selectedAvatar.id,
      })
      .single<DatabaseUserResponse>();

    if (upsertError || !newOrUpdatedUser) {
      throw new Error(upsertError?.message || 'Could not create/update user.');
    }

    if (cookieValue !== newOrUpdatedUser?.uuid) {
      cookieStore.set(COOKIE_NAME, newOrUpdatedUser?.uuid || '');
    }

    // Add 4 second delay before returning data
    await new Promise((resolve) => setTimeout(resolve, 4000));

    return {
      originalRidingAsset: selectedAvatar.asset_riding || '',
      instragramAsset: selectedAvatar.asset_instagram || '',
      url: buildImageUrl(selectedAvatar.asset_riding),
      bio: selectedAvatar.character_story || '',
      name: `${selectedAvatar.first_name} ${selectedAvatar.last_name}`,
      uuid: newOrUpdatedUser?.uuid || '',
      selfies: [],
    };
  } catch (e) {
    // Log the error to have it in server logs and re-throw to reset state.
    console.error(e);
    throw e;
  }
}
