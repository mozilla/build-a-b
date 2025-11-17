import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

type UseMediaQueryOptions = {
  initialize?: boolean;
};

export const QUERIES = {
  /** Width-constrained by height - matches Frame's .39*100dvh width calculation */
  framedX: '(min-width: 450px) and (min-aspect-ratio: 390/844)',

  /** Height-constrained by width - matches Frame's 100vw width with aspect ratio cap */
  framedY: '(min-width: 450px) and (min-height: 866px) and (max-aspect-ratio: 390/843)',

  /** Either framed-x OR framed-y conditions */
  framed:
    '(min-width: 450px) and (min-aspect-ratio: 390/844), (min-width: 450px) and (min-height: 866px) and (max-aspect-ratio: 390/843)',

  /** Neither framed-x nor framed-y - full viewport mode */
  frameless:
    '(max-width: 449.98px), ((min-width: 450px) and (max-aspect-ratio: 389/844) and (not ((min-height: 866px) and (max-aspect-ratio: 390/843))))',

  /** Landscape orientation or wider viewports */
  landscape: '(orientation: landscape), (min-width: 1024px)',

  /** Portrait orientation on smaller viewports */
  portrait: '(orientation: portrait) and (max-width: 1023.98px)',
} as const;

export function useMediaQuery(
  query: string,
  { initialize = false }: UseMediaQueryOptions = {},
): boolean {
  const queryRef = useRef(query);

  const getMatches = (query: string): boolean => {
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(() => {
    if (initialize) return initialize;
    return getMatches(query);
  });

  const handleMediaChange = useCallback(() => {
    setMatches(getMatches(query));
  }, [setMatches, query]);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useLayoutEffect(() => {
    const matchMedia = window.matchMedia(queryRef.current);
    handleMediaChange();
    matchMedia.addEventListener('change', handleMediaChange);

    return () => {
      matchMedia.removeEventListener('change', handleMediaChange);
    };
  }, [handleMediaChange]);

  return matches;
}
