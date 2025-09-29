'use server';

import { createClient } from '../supabase/server';

export async function getPowerPlays(
  originStory: string,
  coreDrive: string,
  publicMask: string,
): Promise<string[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_power_plays', {
      selected_origin_story: originStory,
      selected_core_drive: coreDrive,
      selected_public_mask: publicMask,
    });

    if (error || !data) {
      throw new Error(error?.message || 'Could not retrieve power plays.');
    }

    return data.map((row: { power_play: string }) => row.power_play);
  } catch (e) {
    console.error(e);
    return [];
  }
}
