// Import billionaire character images
import chazImg from '@/assets/characters/chaz.webp';
import chloeImg from '@/assets/characters/chloe.webp';
import enzoImg from '@/assets/characters/enzo.webp';
import prudenceImg from '@/assets/characters/prudence.webp';
import savannahImg from '@/assets/characters/savannah.webp';
import walterImg from '@/assets/characters/walter.webp';

export type BillionaireId = 'chaz' | 'chloe' | 'savannah' | 'walter' | 'enzo' | 'prudence';
export interface Billionaire {
  id: BillionaireId;
  name: string;
  imageSrc: string;
  description?: string;
}

export const DEFAULT_BILLIONAIRE_ID = 'chaz';

/**
 * Selects a random billionaire from the list, excluding the specified billionaire ID
 * Used to randomly assign a CPU opponent that's different from the player's selection
 */
export const getRandomBillionaire = (excludeId?: BillionaireId): BillionaireId => {
  const availableBillionaires = BILLIONAIRES.filter((b) => b.id !== excludeId);
  const randomIndex = Math.floor(Math.random() * availableBillionaires.length);
  return availableBillionaires[randomIndex].id;
};

export const BILLIONAIRES: Billionaire[] = [
  {
    id: 'chaz',
    name: 'Chaz Brogan',
    imageSrc: chazImg,
    description: 'asteroid-mining, vanity-juiced, influence-chasing',
  },
  {
    id: 'chloe',
    name: 'Chloe Von Weirdenspiel',
    imageSrc: chloeImg,
    description: 'social-media-obsessed, attention-seeking, data-hoarding',
  },
  {
    id: 'savannah',
    name: 'Savannah Blaire',
    imageSrc: savannahImg,
    description: 'asteroid-mining, vanity-juiced, influence-chasing',
  },
  {
    id: 'walter',
    name: 'Walter Bradford Benedict',
    imageSrc: walterImg,
    description: 'monopoly-building, regulation-dodging, profit-maximizing',
  },
  {
    id: 'enzo',
    name: 'Enzo Huntington',
    imageSrc: enzoImg,
    description: 'tech-disrupting, patent-hoarding, innovation-claiming',
  },
  {
    id: 'prudence',
    name: 'Dame Prudence Smythe',
    imageSrc: prudenceImg,
    description: 'empire-expanding, tax-avoiding, fortune-amassing',
  },
] as const;
