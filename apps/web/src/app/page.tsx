import { cookies } from 'next/headers';
import SharedPage from './shared-page';
import { COOKIE_NAME } from '@/utils/constants';
import { redirect } from 'next/navigation';
import { getUserAvatar } from '@/utils/actions/get-user-avatar';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const queryParams = await searchParams;
  const searchTerm = queryParams.s;

  const cookieStore = await cookies();
  const { value } = cookieStore.get(COOKIE_NAME) || {};

  // If a cookie value exists and there's no search term, check if this avatar actually exists
  if (value && !searchTerm) {
    const avatar = await getUserAvatar(value); // Ensure avatar exists
    if (avatar) {
      return redirect(`/a/${value}`);
    }
  }

  return <SharedPage />;
}
