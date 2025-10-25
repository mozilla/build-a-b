import { iconRegistry } from '@/components/Icon/registry';
import type { HTMLAttributes, SVGProps } from 'react';

type IconName = keyof typeof iconRegistry;
export interface BaseIconProps {
  name: IconName;
  label?: string;
}

export type IconProps =
  | (BaseIconProps & SVGProps<SVGSVGElement> & { as?: 'svg' })
  | (BaseIconProps & HTMLAttributes<HTMLButtonElement> & { as: 'button' });
