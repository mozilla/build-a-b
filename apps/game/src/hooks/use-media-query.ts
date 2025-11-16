import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

type UseMediaQueryOptions = {
  initialize?: boolean;
};

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
