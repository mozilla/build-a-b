'use server';

import type { DatabaseSelfieResponse, Selfie } from '@/types';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '../constants';
import { createClient } from '../supabase/server';

export async function generateAvatarSelfie(): Promise<Selfie | null> {
  try {
    const [supabase, cookieStore] = await Promise.all([createClient(), cookies()]);
    const uuid = cookieStore.get(COOKIE_NAME)?.value;

    if (!uuid) {
      throw new Error('No UUID stored when trying to create a selfie.');
    }

    const getSelfieResponse = await supabase
      .rpc('get_selfie_for_user_avatar', { p_uuid: uuid })
      .maybeSingle<DatabaseSelfieResponse>();

    if (!getSelfieResponse.data) {
      console.log('No more selfies available for this user/avatar.');
      return null;
    }

    console.log('Selfie was successfully generated.', getSelfieResponse.data.asset);

    return getSelfieResponse.data;
  } catch (e) {
    // Log the error to have it in server logs and re-throw to reset state.
    console.error(e);
    throw e;
  }
}
