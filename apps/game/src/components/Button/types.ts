import type { ButtonProps as HeroUIButtonProps } from '@heroui/react';

export interface ButtonProps extends Omit<HeroUIButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary';
}
