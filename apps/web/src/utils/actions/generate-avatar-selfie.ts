'use server';
import type {
  DatabaseStandingAvatarResponse,
  Selfie,
  SelfieInitResponse,
  SelfieStatusResponse,
} from '@/types';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '../constants';
import { createClient } from '../supabase/server';
import { pollStatus } from './poll';

export async function generateAvatarSelfie(): Promise<Selfie | null> {
  try {
    const [supabase, cookieStore] = await Promise.all([createClient(), cookies()]);
    const uuid = cookieStore.get(COOKIE_NAME)?.value;

    if (!uuid) {
      throw new Error('No UUID stored when trying to create a selfie.');
    }

    const userWithAvatarResponse = await supabase
      .rpc('get_avatar_standing_asset_by_user_uuid', { user_uuid: uuid })
      .single<DatabaseStandingAvatarResponse>();

    if (!userWithAvatarResponse.data) {
      throw new Error("No avatar associated to the user, can't create a selfie.");
    }

    const userData = userWithAvatarResponse.data;

    const seed = userData?.asset_standing?.endsWith('?')
      ? userData.asset_standing.slice(0, -1)
      : userData?.asset_standing;

    if (!seed) {
      throw new Error('Could not retrieve avatar data when trying to create a selfie.');
    }

    const selfieProcessStartedResponse = await fetch(
      'https://mozilla-billionaires.mndo.to/api/selfie/generate',
      {
        method: 'POST',
        body: JSON.stringify({ input_path: seed }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      },
    );

    console.log('Starting job...');

    const selfieProcessStarted: SelfieInitResponse = await selfieProcessStartedResponse.json();

    if (!selfieProcessStarted?.job_id) {
      throw new Error('Job could not be started when trying to generate a selfie.');
    }

    console.log('Checking status...');
    // Poll for job completion
    const generatedSelfie = await pollStatus<SelfieStatusResponse>(
      selfieProcessStarted.job_id,
      'selfie',
    );

    if (!generatedSelfie?.selfie_image_url) {
      throw new Error('Selfie generation failed or timed out.');
    }

    console.log('Selfie was successfully generated.', generatedSelfie.selfie_image_url);

    const { data: selfieResponse, error } = await supabase
      .from('selfies')
      .insert({
        user_id: userData.user_id,
        avatar_id: userData.avatar_id,
        asset: generatedSelfie.selfie_image_url,
      })
      .select('id,asset,created_at')
      .single<Selfie>();

    if (error) throw error;

    return selfieResponse;
  } catch (e) {
    // Log the error to have it in server logs and re-throw to reset state.
    console.error(e);
    throw e;
  }
}
