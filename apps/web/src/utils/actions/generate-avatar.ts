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
      throw new Error(error?.message || 'Could not retrieve an avatar.');
    }

    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({ avatar_id: selectedAvatar.id })
      .select()
      .single<DatabaseUserResponse>();

    if (userError) {
      throw userError;
    }

    cookieStore.set(COOKIE_NAME, newUser?.uuid || '');

    // Add 4 second delay before returning data
    await new Promise((resolve) => setTimeout(resolve, 4000));

    return {
      originalRidingAsset: selectedAvatar.asset_riding || '',
      instragramAsset: selectedAvatar.asset_instagram || '',
      url: buildImageUrl(selectedAvatar.asset_riding),
      bio: selectedAvatar.character_story || '',
      name: `${selectedAvatar.first_name} ${selectedAvatar.last_name}`,
      uuid: newUser?.uuid || '',
      selfies: [],
    };
  } catch (e) {
    // Log the error to have it in server logs and re-throw to reset state.
    console.error(e);
    throw e;
  }
}
