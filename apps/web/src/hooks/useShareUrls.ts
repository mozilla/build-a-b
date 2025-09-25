'use client';

import { useEffect, useState } from 'react';

const microcopy = {
  threadsIntentShare: '@firefox #billionaireblastoff',
} as const;

export interface UseShareUrlsReturn {
  currentHref: string;
  threadsShareUrl: string;
  safeHref: (url: string) => string;
}

/**
 * Hook for generating social media share URLs and handling current page URL.
 *
 * @returns Object containing current page URL, social share URLs, and a `safeHref` utility function.
 */
export const useShareUrls = (): UseShareUrlsReturn => {
  const [currentHref, setCurrentHref] = useState<string>('');

  useEffect(() => {
    setCurrentHref(window.location.href);
  }, []);

  const threadsShareUrl = currentHref
    ? `https://threads.net/intent/post?url=${encodeURIComponent(currentHref)}&text=${encodeURIComponent(microcopy.threadsIntentShare)}`
    : '#';

  /**
   * Returns a safe href that prevents navigation when the URL is not ready.
   *
   * @param url - The URL to make safe
   * @returns Safe URL or '#' if not ready
   */
  const safeHref = (url: string): string => {
    if (!currentHref) return '#';
    return url;
  };

  return {
    currentHref,
    threadsShareUrl,
    safeHref,
  };
};
