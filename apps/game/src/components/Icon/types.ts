import { iconRegistry } from '@/components/Icon/registry';
import type { SVGProps } from 'react';

type IconName = keyof typeof iconRegistry;
export interface BaseIconProps {
  name: IconName;
  label?: string;
  size?: number | string;
}

export type IconProps = BaseIconProps & SVGProps<SVGSVGElement>;
