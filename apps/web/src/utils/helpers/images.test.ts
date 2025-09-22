import { buildImageUrl } from './images';
import { DEFAULT_AVATAR_WIDTH, DEFAULT_AVATAR_HEIGHT } from '../constants';

describe('buildImageUrl', () => {
  it('returns empty string when filePath is null', () => {
    expect(buildImageUrl(null)).toBe('');
  });

  it('returns empty string when filePath is empty string', () => {
    expect(buildImageUrl('')).toBe('');
  });

  it('replaces /object/ with /render/image/ and adds default dimensions', () => {
    const filePath = '/object/avatar.jpg';
    const expected = `/render/image/avatar.jpg?width=${DEFAULT_AVATAR_WIDTH}&height=${DEFAULT_AVATAR_HEIGHT}&resize=cover`;

    expect(buildImageUrl(filePath)).toBe(expected);
  });

  it('uses custom width and height when provided', () => {
    const filePath = '/object/avatar.jpg';
    const width = 300;
    const height = 400;
    const expected = '/render/image/avatar.jpg?width=300&height=400&resize=cover';

    expect(buildImageUrl(filePath, width, height)).toBe(expected);
  });

  it('handles filePaths without /object/ prefix', () => {
    const filePath = '/some/other/path/image.png';
    const expected = `/some/other/path/image.png?width=${DEFAULT_AVATAR_WIDTH}&height=${DEFAULT_AVATAR_HEIGHT}&resize=cover`;

    expect(buildImageUrl(filePath)).toBe(expected);
  });

  it('handles multiple /object/ occurrences by replacing only the first', () => {
    const filePath = '/object/folder/object/image.jpg';
    const expected = `/render/image/folder/object/image.jpg?width=${DEFAULT_AVATAR_WIDTH}&height=${DEFAULT_AVATAR_HEIGHT}&resize=cover`;

    expect(buildImageUrl(filePath)).toBe(expected);
  });
});
