export function capitalize(word?: string): string {
  if (!word) return '';

  return word
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
