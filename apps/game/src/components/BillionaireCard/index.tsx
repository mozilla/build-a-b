import { type FC } from 'react';
import type { BillionaireCardProps } from './types';

export const BillionaireCard: FC<BillionaireCardProps> = ({
  name,
  imageSrc,
  isSelected = false,
  onClick,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${
        isSelected ? 'scale-110 opacity-100' : 'opacity-70 hover:opacity-90'
      } ${className}`}
    >
      <div
        className={`w-[114px] h-[114px] rounded-full overflow-hidden border-2 ${
          isSelected ? 'border-accent' : 'border-transparent'
        }`}
      >
        <img src={imageSrc} alt={name} className="w-full h-full object-cover" />
      </div>
      <p className="label-2 text-common-ash text-center font-medium max-w-[114px]">{name}</p>
    </button>
  );
};
