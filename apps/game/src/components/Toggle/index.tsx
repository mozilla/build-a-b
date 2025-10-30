import { Switch } from '@/components/Switch';
import { Text } from '@/components/Text';
import { cn } from '@/utils/cn';
import { type FC } from 'react';

interface AudioToggleProps {
  enabled: boolean;
  onToggle: () => void;
  className?: string;
}

export const AudioToggle: FC<AudioToggleProps> = ({ enabled, onToggle, className }) => {
  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      <div className="flex items-center gap-3">
        {/* <Icon name="audio" width={24} height={24} className="text-common-ash" /> */}
        <Text variant="title-3" className="text-common-ash">
          Audio
        </Text>
      </div>
      <div className="flex items-center gap-4">
        <Text variant="title-5" className="text-common-ash">
          {enabled ? 'ON' : 'OFF'}
        </Text>
        <Switch checked={enabled} onChange={onToggle} />
      </div>
    </div>
  );
};
