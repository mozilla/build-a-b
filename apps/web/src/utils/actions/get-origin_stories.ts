'use server';

import { createClient } from '../supabase/server';

export async function getOriginStories(): Promise<string[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_origin_stories');

    if (error || !data) {
      throw new Error(error?.message || 'Could not retrieve origin stories.');
    }

    return data.map((row: { origin_story: string }) => row.origin_story);
  } catch (e) {
    console.error(e);
    return [];
  }
}
