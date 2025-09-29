'use server';

import { createClient } from '../supabase/server';

export async function getPublicMasks(originStory: string, coreDrive: string): Promise<string[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_public_masks', {
      selected_origin_story: originStory,
      selected_core_drive: coreDrive,
    });

    if (error || !data) {
      throw new Error(error?.message || 'Could not retrieve public masks.');
    }

    return data.map((row: { public_mask: string }) => row.public_mask);
  } catch (e) {
    console.error(e);
    return [];
  }
}
