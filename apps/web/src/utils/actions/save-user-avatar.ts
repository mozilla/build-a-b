'use server';

import { cookies } from 'next/headers';
import { COOKIE_NAME } from '../constants';
import { redirect } from 'next/navigation';

/**
 * Saves the user information in the cookie and performs the redirect.
 * This function is meant to be used when they hit the "Continue" button,
 * otherwise, they may opt to close the modal which (we assume) it means
 * they wanna go over the flow again.
 */
export async function saveUserAvatar(uuid: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, uuid);
  return redirect(`/a/${uuid}`);
}
