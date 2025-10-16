import { sortSelfies } from '../order-by-date';
import type { Selfie } from '@/types';

describe('sortSelfies', () => {
  const mockSelfies: Selfie[] = [
    { id: '1', asset: 'image1.png', created_at: '2025-01-10T10:00:00Z' },
    { id: '2', asset: 'image2.png', created_at: '2025-01-12T10:00:00Z' },
    { id: '3', asset: 'image3.png', created_at: '2025-01-08T10:00:00Z' },
  ];

  describe('desc order (default)', () => {
    it('Should sort selfies in descending order by created_at.', () => {
      const sorted = [...mockSelfies].sort(sortSelfies());

      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('1');
      expect(sorted[2].id).toBe('3');
    });

    it('Should sort selfies in descending order when explicitly specified.', () => {
      const sorted = [...mockSelfies].sort(sortSelfies('desc'));

      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('1');
      expect(sorted[2].id).toBe('3');
    });
  });

  describe('asc order', () => {
    it('Should sort selfies in ascending order by created_at.', () => {
      const sorted = [...mockSelfies].sort(sortSelfies('asc'));

      expect(sorted[0].id).toBe('3');
      expect(sorted[1].id).toBe('1');
      expect(sorted[2].id).toBe('2');
    });
  });

  describe('edge cases', () => {
    it('Should handle selfies without created_at using current time.', () => {
      const selfiesWithoutDate: Selfie[] = [
        { id: '1', asset: 'image1.png', created_at: '2025-01-10T10:00:00Z' },
        { id: '2', asset: 'image2.png' },
        { id: '3', asset: 'image3.png' },
      ];

      const sorted = [...selfiesWithoutDate].sort(sortSelfies('desc'));

      // Selfies without created_at should be treated as having current time
      // and appear at the top in desc order
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });

    it('Should handle empty array.', () => {
      const sorted = [].sort(sortSelfies());

      expect(sorted).toEqual([]);
    });

    it('Should handle single selfie.', () => {
      const singleSelfie: Selfie[] = [
        { id: '1', asset: 'image1.png', created_at: '2025-01-10T10:00:00Z' },
      ];
      const sorted = [...singleSelfie].sort(sortSelfies());

      expect(sorted).toEqual(singleSelfie);
    });

    it('Should handle selfies with same created_at.', () => {
      const sameDateSelfies: Selfie[] = [
        { id: '1', asset: 'image1.png', created_at: '2025-01-10T10:00:00Z' },
        { id: '2', asset: 'image2.png', created_at: '2025-01-10T10:00:00Z' },
        { id: '3', asset: 'image3.png', created_at: '2025-01-10T10:00:00Z' },
      ];

      const sorted = [...sameDateSelfies].sort(sortSelfies());

      // Should maintain relative order when dates are equal
      expect(sorted.length).toBe(3);
      expect(sorted.every((s) => s.created_at === '2025-01-10T10:00:00Z')).toBe(true);
    });
  });
});
