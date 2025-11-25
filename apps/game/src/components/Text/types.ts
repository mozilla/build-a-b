import type { ComponentPropsWithoutRef, ElementType } from 'react';

/**
 * Typography variant types based on Figma design system
 * Each variant corresponds to a named style in Figma
 */
export type TextVariant =
  // Titles
  | 'title-1' // Extrabold, 36px (desktop equivalent)
  | 'title-2' // Extrabold, 30px - Main titles
  | 'title-3' // Extrabold, 24px - Section titles
  | 'title-4' // Extrabold, 20px - Subsection titles
  | 'title-5' // Extrabold, 16px - Minor titles
  | 'title-6' // Extrabold, 16px - Minor titles
  // Card and Modal Titles
  | 'card-modal-title' // Regular, 28px - Card modal titles
  // Body text
  | 'body-large-semibold' // Semibold, 18px - Large body text
  | 'body-large-medium' // Medium, 18px - Large body text
  | 'body-large' // Regular, 18px - Large body text
  | 'body-medium-semibold' // Semibold, 16px - Medium body text
  | 'body-medium' // Regular, 16px - Medium body text
  | 'body-small-medium' // Medium, 14px - Small body text
  | 'body-small' // Regular, 14px - Small body text
  | 'body-xs' // Regular, 12px - Extra small body text
  // Badge
  | 'badge-xl' // Extrabold, 42px - Large badges
  | 'badge-xs' // Extrabold, 8px - Extra small badges
  // Labels
  | 'label-uppercase' // Extrabold, 8px, uppercase - Small labels
  | 'label-medium' // Medium, 12px - Labels
  | 'label-semibold' // Semibold, 12px - Labels
  | 'label-extrabold' // Extrabold, 12px - Labels
  // Special
  | 'display-large' // Extrabold Italic, 76px - Large display text (Data War)
  | 'display-medium' // Extrabold, 60px - Medium display text
  | 'display-small'; // Extrabold, 48px - Small display text

/**
 * Font weight types matching Sharp Sans font family
 */
export type FontWeight =
  | 'thin' // 100
  | 'light' // 300
  | 'regular' // 400
  | 'medium' // 500
  | 'semibold' // 600
  | 'bold' // 700
  | 'extrabold'; // 800

/**
 * Text alignment options
 */
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * Text transform options
 */
export type TextTransform = 'uppercase' | 'lowercase' | 'capitalize' | 'none';

/**
 * Props for the Text component
 */
export interface TextProps<T extends ElementType = 'p'> {
  /**
   * Typography variant - maps to Figma design system
   * @default 'body-medium'
   */
  variant?: TextVariant;

  /**
   * HTML element or React component to render
   * @default 'p'
   */
  as?: T;

  /**
   * Font weight override
   * Only use if you need to override the variant's default weight
   */
  weight?: FontWeight;

  /**
   * Font style
   */
  italic?: boolean;

  /**
   * Text alignment
   */
  align?: TextAlign;

  /**
   * Text transform
   */
  transform?: TextTransform;

  /**
   * Text color override
   * Use Tailwind color classes or custom CSS values
   */
  color?: string;

  /**
   * Enable text truncation with ellipsis
   */
  truncate?: boolean;

  /**
   * Limit number of lines and add ellipsis
   */
  lineClamp?: number;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Children content
   */
  children: React.ReactNode;
}

/**
 * Combined props including element-specific props
 */
export type PolymorphicTextProps<T extends ElementType> = TextProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof TextProps<T>>;
