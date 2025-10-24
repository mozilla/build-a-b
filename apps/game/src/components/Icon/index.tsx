import { type FC } from 'react';
import CloseIcon from '../../assets/icons/close.svg';
import MenuIcon from '../../assets/icons/menu.svg';
import type { IconProps } from './types';

export const Icon: FC<IconProps> = ({ name, onClick, className = '' }) => {
  const iconMap = {
    close: CloseIcon,
    menu: MenuIcon,
    back: CloseIcon, // Using close icon as placeholder
  };

  const IconSrc = iconMap[name];

  return (
    <button
      onClick={onClick}
      className={`w-[34px] h-[34px] cursor-pointer flex items-center justify-center ${className}`}
      aria-label={name}
    >
      <img src={IconSrc} alt={name} className="w-full h-full" />
    </button>
  );
};
