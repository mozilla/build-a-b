import fs from 'fs';
import path from 'path';

export interface CuratedSelfie {
  filename: string;
  path: string;
}

/**
 * Get the list of curated selfies from the public directory
 * This runs server-side only
 */
export function getCuratedSelfies(): CuratedSelfie[] {
  const curatedSelfiesDir = path.join(
    process.cwd(),
    'public',
    'assets',
    'images',
    'galleries',
    'curated_selfies',
  );

  try {
    const files = fs.readdirSync(curatedSelfiesDir);
    const webpFiles = files.filter((file) => file.endsWith('.webp'));

    return webpFiles.map((filename) => ({
      filename,
      path: `/assets/images/galleries/curated_selfies/${filename}`,
    }));
  } catch (error) {
    console.error('Error reading curated selfies directory:', error);
    return [];
  }
}

/**
 * Get the count of curated selfies
 */
export function getCuratedSelfiesCount(): number {
  return getCuratedSelfies().length;
}

/**
 * Get a random sample of curated selfies
 */
export function getRandomCuratedSelfies(count: number): CuratedSelfie[] {
  const allSelfies = getCuratedSelfies();
  const shuffled = [...allSelfies].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

