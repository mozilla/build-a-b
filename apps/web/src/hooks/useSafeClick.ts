'use client';

import { MouseEvent } from 'react';

export interface UseSafeClickReturn {
  preventInvalidClick: (e: MouseEvent<HTMLElement>, test: boolean, cb?: () => void) => void;
}

/**
 * Hook for handling safe click behavior with conditional prevention.
 *
 * @returns Object containing click prevention utility function
 */
export const useSafeClick = (): UseSafeClickReturn => {
  /**
   * Safeguards click functionality by calling `preventDefault` when necessary.
   *
   * @param e - React MouseEvent
   * @param test - The condition deeming the click valid (when true, click proceeds)
   * @param cb - An optional callback to invoke once the test passes
   */
  const preventInvalidClick = (
    e: MouseEvent<HTMLElement>,
    test: boolean,
    cb?: () => void,
  ): void => {
    if (!test) e.preventDefault();
    if (cb && test) cb();
  };

  return {
    preventInvalidClick,
  };
};
