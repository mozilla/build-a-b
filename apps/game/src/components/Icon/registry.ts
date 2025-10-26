import Blastoff from '@/assets/icons/bbo-presents.svg?react';
import CloseIcon from '@/assets/icons/close.svg?react';
import LogoWordmark from '@/assets/icons/logo-wordmark.svg?react';
import FirefoxIcon from '@/assets/icons/logo.svg?react';
import MenuIcon from '@/assets/icons/menu.svg?react';

export const iconName = [
  'blastoff',
  'close',
  'menu',
  'back',
  'firefoxLogo',
  'logoWordmark',
] as const;
export type IconName = (typeof iconName)[number];

export const iconRegistry = {
  close: CloseIcon,
  menu: MenuIcon,
  back: CloseIcon,
  firefoxLogo: FirefoxIcon,
  logoWordmark: LogoWordmark,
  blastoff: Blastoff,
} satisfies Record<IconName, React.FC<React.SVGProps<SVGSVGElement>>>;
