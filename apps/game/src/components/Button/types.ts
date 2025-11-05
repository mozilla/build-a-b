import type { ButtonProps as HeroUIButtonProps } from '@heroui/react';

export interface ButtonProps extends Omit<HeroUIButtonProps, 'variant' | 'isDisabled'> {
  variant?: 'primary' | 'secondary';
}
