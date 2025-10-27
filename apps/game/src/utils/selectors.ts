/**
 * Selector utilities for looking up configuration objects by ID
 * Provides centralized, type-safe access to billionaire and background data
 */

import { BACKGROUNDS } from '@/components/Screens/SelectBackground/backgrounds';
import type { BackgroundOption } from '@/components/Screens/SelectBackground/types';
import { BILLIONAIRES, type Billionaire } from '@/config/billionaires';

/**
 * Get a billionaire object by ID
 * @param id - The billionaire ID
 * @returns The billionaire object or null if not found
 */
export const getBillionaireById = (id: string | null | undefined): Billionaire | null => {
  if (!id) return null;
  return BILLIONAIRES.find((b) => b.id === id) || null;
};

/**
 * Get a background object by ID
 * @param id - The background ID
 * @returns The background object or null if not found
 */
export const getBackgroundById = (id: string | null | undefined): BackgroundOption | null => {
  if (!id) return null;
  return BACKGROUNDS.find((bg) => bg.id === id) || null;
};

/**
 * Get the image source for a billionaire by ID
 * @param id - The billionaire ID
 * @returns The image source or null if not found
 */
export const getBillionaireImage = (id: string | null | undefined): string | null => {
  const billionaire = getBillionaireById(id);
  return billionaire?.imageSrc || null;
};

/**
 * Get the image source for a background by ID
 * @param id - The background ID
 * @returns The image source or null if not found
 */
export const getBackgroundImage = (id: string | null | undefined): string | null => {
  const background = getBackgroundById(id);
  return background?.imageSrc || null;
};
