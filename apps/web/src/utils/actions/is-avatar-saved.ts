'use server';

import { cookies } from 'next/headers';
import { COOKIE_NAME } from '../constants';

export async function isAvatarSaved() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return Boolean(cookie?.value);
}
