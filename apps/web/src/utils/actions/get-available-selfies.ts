'use server';

import type { DatabaseAvailableSelfiesResponse } from '@/types';
import { createClient } from '../supabase/server';

export async function getAvailableSelfies(
  uuid: string,
): Promise<{ next_n: number; next_at: Date } | null> {
  try {
    const supabase = await createClient();

    const { data } = await supabase
      .rpc('get_available_selfies', { p_uuid: uuid })
      .maybeSingle<DatabaseAvailableSelfiesResponse>();

    if (!data) {
      console.log('Could not determine user available selfies.');
      return null;
    }

    console.log('Available selfies information successfully retrieved.');

    return { next_n: data.next_n, next_at: data.next_at ? new Date(data.next_at) : new Date() };
  } catch (e) {
    // Log the error to have it in server logs.
    console.error(e);
    return null;
  }
}
