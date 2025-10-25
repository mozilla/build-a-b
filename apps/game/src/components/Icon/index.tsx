import { iconRegistry } from '@/components/Icon/registry';
import type { FC, HTMLAttributes, SVGProps } from 'react';
import type { IconProps } from './types';

export const Icon: FC<IconProps> = ({ name, label, as = 'svg', ...props }) => {
  const SvgIcon = iconRegistry[name];

  if (as === 'button') {
    return (
      <button {...(props as HTMLAttributes<HTMLButtonElement>)} aria-label={label ?? undefined}>
        <SvgIcon />
      </button>
    );
  }
  return <SvgIcon {...(props as SVGProps<SVGSVGElement>)} aria-label={label ?? undefined} />;
};
