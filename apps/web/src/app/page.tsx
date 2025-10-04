import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/utils/constants';
import SharedPage from './shared-page';
import { getUserAvatar } from '@/utils/actions/get-user-avatar';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const queryParams = await searchParams;
  const searchTerm = queryParams.s;

  const cookieStore = await cookies();
  const userCookie = cookieStore.get(COOKIE_NAME);
  const userId = userCookie?.value;

  const avatarData = userId && !searchTerm ? await getUserAvatar(userId) : null;
  return <SharedPage avatarData={avatarData} />;
}
