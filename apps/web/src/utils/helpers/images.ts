import { DEFAULT_AVATAR_HEIGHT, DEFAULT_AVATAR_WIDTH } from '../constants';

export function buildImageUrl(
  filePath: string | null,
  width = DEFAULT_AVATAR_WIDTH,
  height = DEFAULT_AVATAR_HEIGHT,
): string {
  if (!filePath) return '';

  return `${filePath.replace('/object/', '/render/image/')}?width=${width}&height=${height}&resize=cover&quality=80`;
}
