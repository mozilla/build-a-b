import { cn } from '@/utils/cn';
import type { ElementType } from 'react';
import type {
  FontWeight,
  PolymorphicTextProps,
  TextAlign,
  TextTransform,
  TextVariant,
} from './types';

/**
 * Mapping of typography variants to Tailwind classes
 * Based on Figma design system styles
 */
const variantStyles: Record<TextVariant, string> = {
  // Titles - Extrabold by default
  'title-1': 'text-4xl leading-[2.5rem] font-extrabold', // 36px / 40px
  'title-2': 'text-[1.875rem] leading-[2.25rem] font-extrabold', // 30px / 36px
  'title-3': 'text-2xl leading-8 font-extrabold', // 24px / 32px
  'title-4': 'text-xl leading-7 font-extrabold', // 20px / 28px
  'title-5': 'text-base leading-6 font-extrabold', // 16px / 24px

  // Body text - Large
  'body-large-semibold': 'text-lg leading-6 font-semibold', // 18px / 24px
  'body-large-medium': 'text-lg leading-6 font-medium', // 18px / 24px
  'body-large': 'text-lg leading-6 font-normal', // 18px / 24px

  // Body text - Medium
  'body-medium-semibold': 'text-base leading-6 font-semibold', // 16px / 24px
  'body-medium': 'text-base leading-6 font-normal', // 16px / 24px

  // Body text - Small
  'body-small-medium': 'text-sm leading-5 font-medium', // 14px / 20px
  'body-small': 'text-sm leading-5 font-normal', // 14px / 20px

  // Body text - Extra small
  'body-xs': 'text-xs leading-4 font-normal', // 12px / 16px

  // Labels
  'label-uppercase': 'text-[0.5rem] leading-normal font-extrabold uppercase tracking-[0.04em]', // 8px, 8% letter spacing
  'label-medium': 'text-xs leading-4 font-medium', // 12px / 16px
  'label-semibold': 'text-xs leading-4 font-semibold', // 12px / 16px

  // Display text
  'display-large':
    'text-[4.75rem] leading-normal font-extrabold italic uppercase tracking-[-0.015em]', // 76px, -1.5% letter spacing
  'display-medium': 'text-6xl leading-none font-extrabold', // 60px
  'display-small': 'text-5xl leading-none font-extrabold', // 48px
};

/**
 * Font weight class mapping
 */
const fontWeightStyles: Record<FontWeight, string> = {
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
const textAlignStyles: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

/**
 * Text transform class mapping
 */
const textTransformStyles: Record<TextTransform, string> = {
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
  none: 'normal-case',
};

/**
 * Text component with comprehensive typography support
 *
 * @example
 * // Basic usage with variant
 * <Text variant="title-2">Main Title</Text>
 *
 * @example
 * // Custom element
 * <Text as="h1" variant="title-1">Page Title</Text>
 *
 * @example
 * // With styling overrides
 * <Text
 *   variant="body-large"
 *   weight="bold"
 *   align="center"
 *   color="text-accent"
 * >
 *   Custom styled text
 * </Text>
 *
 * @example
 * // Truncated text
 * <Text variant="body-medium" truncate>
 *   This text will be truncated with ellipsis
 * </Text>
 *
 * @example
 * // Line clamping
 * <Text variant="body-small" lineClamp={3}>
 *   This text will be clamped to 3 lines with ellipsis
 * </Text>
 */
export function Text<T extends ElementType = 'p'>({
  variant = 'body-medium',
  as,
  weight,
  italic = false,
  align,
  transform,
  color,
  truncate = false,
  lineClamp,
  className = '',
  children,
  ...props
}: PolymorphicTextProps<T>) {
  const Component = as || 'p';

  return (
    <Component
      className={cn(
        // Base variant styles
        variantStyles[variant],
        // Font weight override
        weight && fontWeightStyles[weight],
        // Italic
        italic && 'italic',
        // Text alignment
        align && textAlignStyles[align],
        // Text transform
        transform && textTransformStyles[transform],
        // Color
        color,
        // Truncation
        truncate && 'truncate',
        // Line clamping
        lineClamp && `line-clamp-${lineClamp}`,
        // Custom classes
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Text;
