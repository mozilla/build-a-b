import { Switch } from '@/components/Switch';
import { Text } from '@/components/Text';
import { cn } from '@/utils/cn';
import { type FC, type HTMLAttributes } from 'react';

interface AudioToggleProps extends HTMLAttributes<HTMLDivElement> {
  enabled: boolean;
  onToggle: () => void;
}

export const AudioToggle: FC<AudioToggleProps> = ({
  enabled,
  onToggle,
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('flex items-center justify-between w-full', className)} {...props}>
      <div className="flex items-center gap-3">
        {/* <Icon name="audio" width={24} height={24} className="text-common-ash" /> */}
        <Text variant="title-3" className="text-common-ash">
          {children}
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
