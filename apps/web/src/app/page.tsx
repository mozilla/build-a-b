import { cookies } from 'next/headers';
import SharedPage from './shared-page';
import { COOKIE_NAME } from '@/utils/constants';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = await cookies();
  const { value } = cookieStore.get(COOKIE_NAME) || {};
  if (value) {
    return redirect(`/a/${value}`);
  }

  return <SharedPage />;
}
