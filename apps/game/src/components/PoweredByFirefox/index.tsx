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
        {/* Firefox logo would go here */}
        <svg viewBox="0 0 95 32" className="w-full h-full">
          <text
            x="0"
            y="24"
            fill="currentColor"
            fontSize="18"
            fontWeight="600"
            className="fill-common-ash"
          >
            Firefox
          </text>
        </svg>
      </div>
    </a>
  );
};
