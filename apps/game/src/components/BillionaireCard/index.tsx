import Text from '@/components/Text';
import { TRACKS } from '@/config/audio-config';
import { useGameStore } from '@/store';
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
  const { playAudio } = useGameStore();
  return (
    <Button
      disableRipple
      onPress={(e) => {
        playAudio(TRACKS.BUTTON_PRESS, { volume: 0.5 });
        onPress?.(e);
      }}
      className={cn(
        'flex flex-col items-center gap-2 cursor-pointer transition-transform-opacity h-auto px-0 whitespace-normal ',
        isSelected && 'scale-110 opacity-100',
        className,
      )}
      {...cardProps}
    >
      <div
        className={cn(
          'w-[7.125rem] aspect-square rounded-full overflow-hidden border-2 border-transparent',
          isSelected && 'border-accent',
        )}
      >
        <img src={imageSrc} alt={name} className="w-full h-full object-cover" />
      </div>
      <Text
        className="max-w-[6.1rem] leading-none"
        variant="label-extrabold"
        color="text-common-ash"
      >
        {name}
      </Text>
    </Button>
  );
};
