import { BUCKET_NAME, DEFAULT_AVATAR_HEIGHT, DEFAULT_AVATAR_WIDTH } from '../constants';

export function buildImageUrl(
  fileName: string | null,
  width = DEFAULT_AVATAR_WIDTH,
  height = DEFAULT_AVATAR_HEIGHT,
): string {
  if (!fileName) return '';

  return `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/render/image/public/${BUCKET_NAME}/${fileName}?width=${width}&height=${height}&resize=cover`;
}
