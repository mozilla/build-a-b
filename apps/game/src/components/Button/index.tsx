import { variantStyles } from '@/components/Text/styles';
import { cn } from '@/utils/cn';
import { type FC } from 'react';
import type { ButtonProps } from './types';

const baseTypography = variantStyles['body-large-semibold'];

const baseClasses =
  'cursor-pointer flex items-center justify-center px-6 py-3 rounded-full transition-colors';

const variantClasses = {
  primary:
    'bg-[rgba(24,24,27,0.3)] border-2 border-accent text-accent hover:bg-[rgba(24,24,27,0.5)]',
  secondary:
    'bg-transparent border-2 border-common-ash text-common-ash hover:bg-[rgba(248,246,244,0.1)]',
};

export const Button: FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}) => {
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseTypography,
        baseClasses,
        variantClasses[variant],
        disabledClasses,
        className,
      )}
    >
      {children}
    </button>
  );
};
