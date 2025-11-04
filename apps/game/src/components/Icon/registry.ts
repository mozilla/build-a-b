import Blastoff from '@/assets/icons/bbo-presents.svg?react';
import CloseIcon from '@/assets/icons/close.svg?react';
import EffectRocketIcon from '@/assets/icons/effect-rocket.svg?react';
import LogoWordmark from '@/assets/icons/logo-wordmark.svg?react';
import FirefoxIcon from '@/assets/icons/logo.svg?react';
import MenuIcon from '@/assets/icons/menu.svg?react';
import PauseIcon from '@/assets/icons/pause.svg?react';
import RestartIcon from '@/assets/icons/restart.svg?react';
import RocketIcon from '@/assets/icons/rocket.svg?react';
import type { FC, SVGProps } from 'react';

export const iconName = [
  'blastoff',
  'close',
  'menu',
  'back',
  'firefoxLogo',
  'logoWordmark',
  'pause',
  'rocket',
  'restart',
  'effectRocket',
] as const;
export type IconName = (typeof iconName)[number];

export const iconRegistry = {
  close: CloseIcon,
  menu: MenuIcon,
  back: CloseIcon,
  firefoxLogo: FirefoxIcon,
  logoWordmark: LogoWordmark,
  blastoff: Blastoff,
  pause: PauseIcon,
  rocket: RocketIcon,
  restart: RestartIcon,
  effectRocket: EffectRocketIcon,
} satisfies Record<IconName, FC<SVGProps<SVGSVGElement>>>;
