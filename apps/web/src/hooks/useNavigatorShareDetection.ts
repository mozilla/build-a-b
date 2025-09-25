'use client';

import { useEffect, useState } from 'react';

export interface UseNavigatorShareDetectionReturn {
  isNavigatorShareAvailable: boolean;
}

/**
 * Hook for detecting native navigator share capability.
 * Performs feature detection to eliminate flash of conditional rendering.
 *
 * @returns Object containing share availability status
 */
export const useNavigatorShareDetection = (): UseNavigatorShareDetectionReturn => {
  const [isNavigatorShareAvailable, setIsNavigatorShareAvailable] = useState<boolean>(false);

  useEffect(() => {
    /**
     * Feature detect navigator.share capability to eliminate flash of conditional
     * rendering within consuming components.
     */
    setIsNavigatorShareAvailable(
      'canShare' in navigator && navigator.canShare({ title: 'feature-detect' }),
    );
  }, []);

  return {
    isNavigatorShareAvailable,
  };
};
