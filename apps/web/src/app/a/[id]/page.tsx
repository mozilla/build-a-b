import { getUserAvatar } from '@/utils/actions/get-user-avatar';
import { notFound } from 'next/navigation';
import ClientPageWrapper from '../../../utils/page.client';
import SharedPage from '../../shared-page';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DynamicPage({ params }: PageProps) {
  const { id } = await params;

  const avatarData = await getUserAvatar(id);

  if (!avatarData?.url) return notFound();

  return (
    <ClientPageWrapper avatarData={avatarData}>
      <SharedPage avatarData={avatarData} />
    </ClientPageWrapper>
  );
}
