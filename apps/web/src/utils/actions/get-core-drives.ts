'use server';

import { createClient } from '../supabase/server';

export async function getCoreDrives(originStory: string): Promise<string[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_core_drives', { selected_origin_story: originStory });

    if (error || !data) {
      throw new Error(error?.message || 'Could not retrieve core drives.');
    }

    return data.map((row: { core_drive: string }) => row.core_drive);
  } catch (e) {
    console.error(e);
    return [];
  }
}
