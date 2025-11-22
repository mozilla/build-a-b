import { Icon } from '@/components/Icon';
import Text from '@/components/Text';
import { type FC } from 'react';
import type { PoweredByFirefoxProps } from './types';
import { gtagEvent } from '@/utils/gtag';

export const PoweredByFirefox: FC<PoweredByFirefoxProps> = ({ className = '', href }) => {
  return (
    <a
      href={href || 'https://www.firefox.com/en-US/'}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-end gap-1.5 cursor-pointer ${className}`}
      onClick={() => {
        gtagEvent({
          action: 'firefox_click',
          category: 'ui',
          label: 'Firefox CTA clicked',
        });
      }}
    >
      <Text className="whitespace-pre" variant="body-large" weight="medium" color="text-common-ash">
        Powered by
      </Text>
      <div className="h-8 w-24">
        <Icon name="logoWordmark" className="w-[5.9375rem] h-[2.0625rem]" />
      </div>
    </a>
  );
};
