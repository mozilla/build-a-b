import { useEffect } from 'react';
import { useBlurredBackgroundStore } from './store';

export const useBlurredBackground = (backgroundSrc: string | undefined) => {
  const setBackground = useBlurredBackgroundStore((state) => state.setBackground);

  useEffect(() => {
    if (backgroundSrc) setBackground(backgroundSrc);
  }, [backgroundSrc, setBackground]);
};
