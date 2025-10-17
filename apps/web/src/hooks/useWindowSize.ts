import { useLayoutEffect, useState } from 'react';

export function useWindowSize() {
  const [size, setSize] = useState<'portrait' | 'landscape' | null>(null);

  useLayoutEffect(() => {
    const handleResize = () => {
      setSize(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
}
