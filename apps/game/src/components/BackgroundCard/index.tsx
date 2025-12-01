import { Button } from '@heroui/react';
import { type FC } from 'react';
import type { BackgroundCardProps } from './types';

export const BackgroundCard: FC<BackgroundCardProps> = ({
  imageSrc,
  isSelected = false,
  onClick,
  className = '',
}) => {
  return (
    <Button
      onPress={onClick}
      className={`relative w-[10.25rem] h-[18.125rem] rounded-lg overflow-hidden transition-all ${
        isSelected ? 'ring-4 ring-accent scale-105' : 'opacity-70 hover:opacity-90'
      } ${className}`}
    >
      <img src={imageSrc} alt="Background option" className="w-full h-full object-cover" />
    </Button>
  );
};
