'use server';
import type { AvatarData, Choice, DatabaseAvatarResponse, DatabaseUserResponse } from '@/types';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '../constants';
import { buildImageUrl } from '../helpers/images';
import { createClient } from '../supabase/server';

export async function generateAvatar(options: Choice[]): Promise<AvatarData | null> {
  try {
    const supabase = await createClient();
    const searchPattern = options.join('-');

    // TODO: FILTER BY POSE
    const { data: selectedAvatar, error } = await supabase
      .rpc('get_random_avatar', {
        search_pattern: searchPattern,
      })
      .single<DatabaseAvatarResponse>();

    if (error || !selectedAvatar) return null;

    const { data: newUser } = await supabase
      .from('users')
      .insert({ avatar_id: selectedAvatar.id })
      .select()
      .single<DatabaseUserResponse>();

    return {
      url: buildImageUrl(selectedAvatar.asset),
      bio: selectedAvatar.character_story || '',
      name: `${selectedAvatar.first_name} ${selectedAvatar.last_name}`,
      uuid: newUser?.uuid || '',
    };
  } catch (e) {
    return null;
  }
}
