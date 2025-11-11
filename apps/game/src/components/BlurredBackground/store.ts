/**
 * Store for managing the global blurred background state
 */

import { create } from 'zustand';

export interface BlurredBackgroundState {
  backgroundSrc: string | null;
  setBackground: (src: string | null, zIndex?: number) => void;
}

export const useBlurredBackgroundStore = create<BlurredBackgroundState>((set) => ({
  backgroundSrc: null,
  setBackground: (src) => set({ backgroundSrc: src }),
}));
