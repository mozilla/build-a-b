import { getUserAvatar } from '@/utils/actions/get-user-avatar';
import SharedPage from '../../shared-page';
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DynamicPage({ params }: PageProps) {
  const { id } = await params;

  const avatarData = await getUserAvatar(id);

  return <SharedPage avatarData={avatarData} />;
}
