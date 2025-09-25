import { getUserAvatar } from '@/utils/actions/get-user-avatar';
import SharedPage from '../../shared-page';
import { redirect } from 'next/navigation';
import ClientPageWrapper from '../../../utils/page.client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DynamicPage({ params }: PageProps) {
  const { id } = await params;

  const avatarData = await getUserAvatar(id);

  if (!avatarData?.url) return redirect('/');

  return (
    <ClientPageWrapper avatarData={avatarData}>
      <SharedPage avatarData={avatarData} />
    </ClientPageWrapper>
  );
}
