'use server';

import type { Selfie } from '@/types';
import { cookies } from 'next/headers';
import { CARDS_COUNT } from '../easter-egg';
import { COOKIE_NAME } from '../constants';
import { createClient } from '../supabase/server';

type EasterEggResponse = {
  avatar_id: number;
  asset: string;
  id: number;
  created_at: string;
};

export async function storeEasterEgg(): Promise<Selfie | null> {
  try {
    const [supabase, cookieStore] = await Promise.all([createClient(), cookies()]);
    const uuid = cookieStore.get(COOKIE_NAME)?.value;

    if (!uuid) {
      throw new Error('No UUID stored when trying to create easter egg.');
    }

    // Generate random number between 1 and CARDS_COUNT (dynamically based on files)
    const randomCardId = Math.floor(Math.random() * CARDS_COUNT) + 1;

    const getEasterEggResponse = await supabase
      .rpc('store_easter_egg', { p_uuid: uuid, p_easter_egg_id: randomCardId })
      .maybeSingle<EasterEggResponse>();

    if (!getEasterEggResponse.data) {
      console.log('No easter egg available for this user.');
      return null;
    }

    console.log('Easter egg was successfully generated.', getEasterEggResponse.data.asset);

    return {
      id: getEasterEggResponse.data.id,
      asset: getEasterEggResponse.data.asset,
      created_at: getEasterEggResponse.data.created_at,
    };
  } catch (e) {
    // Log the error to have it in server logs and re-throw to reset state.
    console.error(e);
    throw e;
  }
}
