'use server';
import type { AvatarData, Choice, DatabaseAvatarResponse, DatabaseUserResponse } from '@/types';
import { buildImageUrl } from '../helpers/images';
import { createClient } from '../supabase/server';

export async function generateAvatar(options: Choice[]): Promise<AvatarData | null> {
  try {
    const supabase = await createClient();
    const searchPattern = options.join('-');

    const { data: selectedAvatar, error } = await supabase
      .rpc('get_random_avatar', {
        search_pattern: searchPattern,
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

    return {
      url: buildImageUrl(selectedAvatar.asset_riding),
      bio: selectedAvatar.character_story || '',
      name: `${selectedAvatar.first_name} ${selectedAvatar.last_name}`,
      uuid: newUser?.uuid || '',
    };
  } catch (e) {
    // Log the error to have it in server logs and re-throw to reset state.
    console.error(e);
    throw e;
  }
}
