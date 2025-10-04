import { cookies } from 'next/headers';
import SharedPage from './shared-page';
import { COOKIE_NAME } from '@/utils/constants';
import { redirect } from 'next/navigation';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const cookieStore = await cookies();
  const { value } = cookieStore.get(COOKIE_NAME) || {};

  // If a cookie value exists redirect to the user's avatar page
  if (value) {
    return redirect(`/a/${value}`);
  }

  return <SharedPage />;
}
