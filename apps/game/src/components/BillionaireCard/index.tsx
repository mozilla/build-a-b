import Text from '@/components/Text';
import { cn } from '@/utils/cn';
import { Button } from '@heroui/react';
import { type FC } from 'react';
import type { BillionaireCardProps } from './types';

export const BillionaireCard: FC<BillionaireCardProps> = ({
  name,
  imageSrc,
  isSelected = false,
  onPress,
  className,
  ...cardProps
}) => {
  return (
    <Button
      disableRipple
      onPress={onPress}
      className={cn(
        'flex flex-col items-center gap-2 cursor-pointer transition-transform-opacity h-auto',
        isSelected && 'scale-110 opacity-100',
        className,
      )}
      {...cardProps}
    >
      <div
        className={cn(
          'w-[7.125rem] h-[7.125rem] rounded-full overflow-hidden border-2 border-transparent',
          isSelected && 'border-accent',
        )}
      >
        <img src={imageSrc} alt={name} className="w-full h-full object-cover" />
      </div>
      <Text variant="label-extrabold" color="text-common-ash">
        {name}
      </Text>
    </Button>
  );
};
