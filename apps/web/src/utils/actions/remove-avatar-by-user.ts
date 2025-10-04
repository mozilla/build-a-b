'use server';

import { createClient } from '../supabase/server';

export async function removeAvatarByUser(userUuid: string): Promise<void> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.rpc('remove_avatar_by_user', {
      p_uuid: userUuid,
    });

    if (error) {
      throw new Error(error?.message || 'Could not remove avatar by user.');
    }
  } catch (e) {
    console.error(e);
  }
}
