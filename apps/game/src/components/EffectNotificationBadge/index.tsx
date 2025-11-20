/**
 * EffectNotificationBadge - Badge showing count of accumulated effects with stacked icons
 */

import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon/registry';
import Text from '@/components/Text';
import { TRACKS } from '@/config/audio-config';
import { useGameStore } from '@/store';
import type { EffectNotification } from '@/types/game';
import { type FC } from 'react';

// Map special card types to icon names
const SPECIAL_TYPE_TO_ICON: Record<string, IconName> = {
  tracker: 'trackerIcon',
  blocker: 'blockerIcon',
  forced_empathy: 'firewallIcon',
  tracker_smacker: 'firewallIcon',
  open_what_you_want: 'firewallIcon',
  mandatory_recall: 'firewallIcon',
  hostile_takeover: 'moveIcon',
  temper_tantrum: 'moveIcon',
  patent_theft: 'moveIcon',
  leveraged_buyout: 'moveIcon',
  launch_stack: 'launchStackIcon',
};

interface EffectNotificationBadgeProps {
  accumulatedEffects: EffectNotification[]; // Array of accumulated effects
  progressPercentage?: number; // For future implementation (0-100)
}

export const EffectNotificationBadge: FC<EffectNotificationBadgeProps> = ({
  accumulatedEffects,
}) => {
  // Separate regular effects from launch stacks
  const regularEffects = accumulatedEffects.filter(
    (effect) => effect.specialType !== 'launch_stack',
  );
  const launchStackEffects = accumulatedEffects.filter(
    (effect) => effect.specialType === 'launch_stack',
  );

  const regularCount = regularEffects.length;
  const launchStackCount = launchStackEffects.length;

  const effectCount = accumulatedEffects.length;
  const { playAudio } = useGameStore();

  return (
    <div
      onMouseEnter={() => playAudio(TRACKS.WHOOSH)}
      className="w-full flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 bg-gray-800/30 border-white/20"
    >
      {/* Stacked icons - similar to TurnValue with ~50% overlap */}
      <div
        className={`relative h-[1.875rem] flex items-center justify-center ${
          effectCount > 1 ? 'pl-4' : ''
        }`}
      >
        {accumulatedEffects.map((effect, index) => {
          const iconName = effect.specialType ? SPECIAL_TYPE_TO_ICON[effect.specialType] : null;
          if (!iconName) return null;

          return (
            <div
              key={`${effect.card.id}-${index}`}
              style={{
                zIndex: effectCount + index,
                transform: index > 0 ? `translateX(-${index * 0.625}rem)` : undefined,
              }}
            >
              <Icon
                name={iconName}
                size={30}
                aria-label={`${effect.effectType} effect`}
                className="w-[1.875rem] h-[1.875rem]"
              />
            </div>
          );
        })}
      </div>

      {/* Regular effects count pill */}
      {regularCount > 0 && (
        <Text
          variant="badge-xs"
          className="whitespace-nowrap p-2 bg-charcoal rounded-md w-full text-center"
          color="text-common-ash"
          weight="extrabold"
        >
          {regularCount} {regularCount === 1 ? 'Effect' : 'Effects'}
        </Text>
      )}

      {/* Launch stack count pill */}
      {launchStackCount > 0 && (
        <Text
          variant="badge-xs"
          className="whitespace-nowrap p-2 bg-charcoal rounded-md w-full text-center"
          color="text-common-ash"
          weight="extrabold"
        >
          {launchStackCount} {launchStackCount === 1 ? 'Launch Stack' : 'Launch Stacks'}
        </Text>
      )}
    </div>
  );
};
