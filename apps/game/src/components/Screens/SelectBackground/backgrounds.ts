import type { BackgroundOption } from './types';

// Import background images
import chazBg from '@/assets/backgrounds/color_chaz.webp';
import chloeBg from '@/assets/backgrounds/color_chloe2.webp';
import feltBg from '@/assets/backgrounds/color_felt.webp';
import nebulaBg from '@/assets/backgrounds/color_nebula.webp';
import nightskyBg from '@/assets/backgrounds/color_nightsky.webp';
import poindexterBg from '@/assets/backgrounds/color_poindexter.webp';
import prudenceBg from '@/assets/backgrounds/color_prudence.webp';
import savannahBg from '@/assets/backgrounds/color_savannah.webp';
import walterBg from '@/assets/backgrounds/color_walter.webp';

export const DEFAULT_BOARD_BACKGROUND = savannahBg;

export const BACKGROUNDS: BackgroundOption[] = [
  {
    id: 'chaz',
    name: 'Chaz',
    imageSrc: chazBg,
  },
  {
    id: 'chloe',
    name: 'Chloe',
    imageSrc: chloeBg,
  },
  {
    id: 'savannah',
    name: 'Savannah',
    imageSrc: savannahBg,
  },
  {
    id: 'walter',
    name: 'Walter',
    imageSrc: walterBg,
  },
  {
    id: 'poindexter',
    name: 'Poindexter',
    imageSrc: poindexterBg,
  },
  {
    id: 'prudence',
    name: 'Prudence',
    imageSrc: prudenceBg,
  },
  {
    id: 'nebula',
    name: 'Nebula',
    imageSrc: nebulaBg,
  },
  {
    id: 'nightsky',
    name: 'Night Sky',
    imageSrc: nightskyBg,
  },
  {
    id: 'felt',
    name: 'Felt',
    imageSrc: feltBg,
  },
];
