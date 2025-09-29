'use server';

import { createClient } from '../supabase/server';

export async function getLegacyPlans(
  originStory: string,
  coreDrive: string,
  publicMask: string,
  powerPlay: string,
): Promise<string[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_legacy_plans', {
      selected_origin_story: originStory,
      selected_core_drive: coreDrive,
      selected_public_mask: publicMask,
      selected_power_play: powerPlay,
    });

    if (error || !data) {
      throw new Error(error?.message || 'Could not retrieve legacy plans.');
    }

    return data.map((row: { legacy_plan: string }) => row.legacy_plan);
  } catch (e) {
    console.error(e);
    return [];
  }
}
