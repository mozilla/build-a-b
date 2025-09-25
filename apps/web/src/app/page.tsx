import { cookies } from 'next/headers';
import SharedPage from './shared-page';
import { COOKIE_NAME } from '@/utils/constants';
import { redirect } from 'next/navigation';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const queryParams = await searchParams;
  const searchTerm = queryParams.s;

  const cookieStore = await cookies();
  const { value } = cookieStore.get(COOKIE_NAME) || {};
  if (value && !searchTerm) {
    return redirect(`/a/${value}`);
  }

  return <SharedPage />;
}
