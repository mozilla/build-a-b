import {
  fontWeightStyles,
  textAlignStyles,
  textTransformStyles,
  variantStyles,
} from '@/components/Text/styles';
import { cn } from '@/utils/cn';
import type { ElementType } from 'react';
import type { PolymorphicTextProps } from './types';

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
