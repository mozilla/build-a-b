import { getUserAvatar } from '@/utils/actions/get-user-avatar';
import SharedPage from '../../shared-page';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DynamicPage({ params }: PageProps) {
  const { id } = await params;

  const avatarData = await getUserAvatar(id);

  if (!avatarData?.url) return redirect('/');

  return <SharedPage avatarData={avatarData} />;
}
