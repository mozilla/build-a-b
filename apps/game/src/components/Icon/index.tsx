import { iconRegistry } from '@/components/Icon/registry';
import type { FC } from 'react';
import type { IconProps } from './types';

export const Icon: FC<IconProps> = ({ name, label, size, ...props }) => {
  const SvgIcon = iconRegistry[name];

  const dimensions =
    size != null
      ? { width: size, height: size }
      : props.width != null || props.height != null
      ? { width: props.width, height: props.height }
      : undefined;

  return (
    <SvgIcon
      {...(dimensions || {})}
      aria-label={label ?? undefined}
      role={label ? 'img' : 'presentation'}
      {...props}
    />
  );
};
