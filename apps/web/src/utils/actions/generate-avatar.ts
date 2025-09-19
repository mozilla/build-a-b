'use server';
import type { Choice } from '@/types';
import { createClient } from '../supabase/server';

export async function generateAvatar(options: Choice[]) {
  const supabase = await createClient();

  // Concatenate choices with - separator to match the file naming pattern
  const searchPattern = options.join('-');

  // Filter files that start with the pattern and are webp format
  const { data: files, error } = await supabase.storage.from('billionaires').list('', {
    search: searchPattern + '_',
  });

  // Further filter to only include webp files
  const webpFiles = files?.filter((file) => file.name.endsWith('.webp')) || [];

  if (error) return null;

  if (webpFiles.length === 0) {
    return null;
  }

  // Pick a random file from the filtered results
  const randomIndex = Math.floor(Math.random() * webpFiles.length);
  const selectedFile = webpFiles[randomIndex];

  // Get the public URL for the selected file
  const {
    data: { publicUrl },
  } = supabase.storage.from('billionaires').getPublicUrl(selectedFile.name);

  return { filename: selectedFile.name, url: publicUrl };
}
