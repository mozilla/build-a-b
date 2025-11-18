import Blastoff from '@/assets/icons/bbo-presents.svg?react';
import CloseIcon from '@/assets/icons/close.svg?react';
import EffectRocketIcon from '@/assets/icons/effect-rocket.svg?react';
import LogoWordmark from '@/assets/icons/logo-wordmark.svg?react';
import FirefoxIcon from '@/assets/icons/logo.svg?react';
import MenuIcon from '@/assets/icons/menu.svg?react';
import PauseIcon from '@/assets/icons/pause.svg?react';
import RestartIcon from '@/assets/icons/restart.svg?react';
import RocketIcon from '@/assets/icons/rocket.svg?react';
import TrackerIcon from '@/assets/icons/tracker-plus.svg?react';
import BlockerIcon from '@/assets/icons/blocker-minus.svg?react';
import MoveIcon from '@/assets/icons/move.svg?react';
import FirewallIcon from '@/assets/icons/firewall.svg?react';
import LaunchStackIcon from '@/assets/icons/launch-stack.svg?react';
import ReturnIcon from '@/assets/icons/return.svg?react';

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
  'trackerIcon',
  'blockerIcon',
  'moveIcon',
  'firewallIcon',
  'launchStackIcon',
  'return',
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
  trackerIcon: TrackerIcon,
  blockerIcon: BlockerIcon,
  moveIcon: MoveIcon,
  firewallIcon: FirewallIcon,
  launchStackIcon: LaunchStackIcon,
  return: ReturnIcon,
} satisfies Record<IconName, FC<SVGProps<SVGSVGElement>>>;
