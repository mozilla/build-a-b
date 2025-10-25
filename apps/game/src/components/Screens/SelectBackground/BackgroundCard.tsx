import { cn } from '@/utils/cn';
import type { FC } from 'react';

interface BackgroundCardProps {
  imageSrc: string;
  name: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export const BackgroundCard: FC<BackgroundCardProps> = ({
  imageSrc,
  name,
  isSelected,
  onClick,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex-shrink-0 transition-all duration-300 cursor-pointer snap-center',
        'flex items-center justify-center',
        isSelected ? 'w-[11.25rem] h-[19.938rem]' : 'w-[7.938rem] h-[17.188rem]',
        className,
      )}
      aria-label={`Select ${name} background`}
    >
      <div
        className={cn(
          'w-full h-full rounded-[1rem] border-[0.156rem] border-common-ash overflow-hidden',
          'transition-all duration-300',
          isSelected
            ? 'border-accent border-[0.173rem] rounded-[1.125rem] shadow-[0_0_1.25rem_rgba(83,255,188,0.5)]'
            : 'opacity-70',
        )}
        style={{
          transform: 'rotate(352deg)',
          transformOrigin: 'center center',
        }}
      >
        <img src={imageSrc} alt={name} className="w-full h-full object-cover" />
        {!isSelected && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/20" />
        )}
      </div>
    </button>
  );
};
