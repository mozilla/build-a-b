import { Icon } from '@/components/Icon';
import { type FC } from 'react';
import type { PoweredByFirefoxProps } from './types';

export const PoweredByFirefox: FC<PoweredByFirefoxProps> = ({ className = '' }) => {
  return (
    <a
      href="https://www.firefox.com/en-US/"
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-end gap-1.5 cursor-pointer ${className}`}
    >
      <p className="font-medium body-large text-common-ash text-right">Powered by</p>
      <div className="h-8 w-24">
        <Icon name="logoWordmark" />
      </div>
    </a>
  );
};
