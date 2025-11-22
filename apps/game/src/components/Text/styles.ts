import type { FontWeight, TextAlign, TextTransform, TextVariant } from '@/components/Text/types';

/**
 * Mapping of typography variants to Tailwind classes
 * Based on Figma design system styles with unitless line-heights
 */
export const variantStyles: Record<TextVariant, string> = {
  // Titles - Extrabold by default
  'title-1': 'text-4xl leading-[1.111] font-extrabold', // 36px / 40px (40/36 = 1.111)
  'title-2': 'text-[1.875rem] leading-[1.2] font-extrabold', // 30px / 36px (36/30 = 1.2)
  'title-3': 'text-2xl leading-[1.333] font-extrabold', // 24px / 32px (32/24 = 1.333)
  'title-4': 'text-xl leading-[1.4] font-extrabold', // 20px / 28px (28/20 = 1.4)
  'title-5': 'text-base leading-[1.5] font-extrabold', // 16px / 24px (24/16 = 1.5)
  'title-6': 'title-6 leading-[1.5] font-extrabold', // 16px / 24px (24/16 = 1.5)

  'card-modal-title': 'text-[1.75rem] leading-none font-extrabold', // 28px / 28px (28/28 = 1)

  // Body text - Large
  'body-large-semibold': 'text-lg leading-[1.333] font-semibold', // 18px / 24px (24/18 = 1.333)
  'body-large-medium': 'text-lg leading-[1.333] font-medium', // 18px / 24px (24/18 = 1.333)
  'body-large': 'text-lg leading-[1.333] font-normal', // 18px / 24px (24/18 = 1.333)

  // Body text - Medium
  'body-medium-semibold': 'text-base leading-[1.5] font-semibold', // 16px / 24px (24/16 = 1.5)
  'body-medium': 'text-base leading-[1.5] font-normal', // 16px / 24px (24/16 = 1.5)

  // Body text - Small
  'body-small-medium': 'text-sm leading-[1.429] font-medium', // 14px / 20px (20/14 = 1.429)
  'body-small': 'text-sm leading-[1.429] font-normal', // 14px / 20px (20/14 = 1.429)

  // Body text - Extra small
  'body-xs': 'text-xs leading-[1.333] font-normal', // 12px / 16px (16/12 = 1.333)

  // Badge text
  'badge-xl': 'text-[2.625rem] leading-none font-extrabold', // 42px, normal line-height
  'badge-xs': 'text-[0.5rem] leading-[1.5] font-extrabold', // 8px / 12px (12/8 = 1.5)

  // Labels
  'label-uppercase': 'text-[0.5rem] leading-normal font-extrabold uppercase tracking-[0.08em]', // 8px, 8% letter spacing (0.64px/8px = 0.08em)
  'label-medium': 'text-xs leading-[1.333] font-medium', // 12px / 16px (16/12 = 1.333)
  'label-semibold': 'text-xs leading-[1.333] font-semibold', // 12px / 16px (16/12 = 1.333)
  'label-extrabold': 'text-xs font-extrabold', // 12px / 12px (12/12 = 1)

  // Display text
  'display-large':
    'text-[4.75rem] leading-normal font-extrabold italic uppercase tracking-[-0.015em]', // 76px, -1.5% letter spacing
  'display-medium': 'text-6xl leading-none font-extrabold', // 60px
  'display-small': 'text-5xl leading-none font-extrabold', // 48px
};

/**
 * Font weight class mapping
 */
export const fontWeightStyles: Record<FontWeight, string> = {
  thin: 'font-thin',
  light: 'font-light',
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

/**
 * Text alignment class mapping
 */
export const textAlignStyles: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

/**
 * Text transform class mapping
 */
export const textTransformStyles: Record<TextTransform, string> = {
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
  none: 'normal-case',
};
