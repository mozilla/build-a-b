/**
 * EffectNotificationBadge - Badge showing count of accumulated effects with stacked icons
 */

import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/Icon/registry';
import Text from '@/components/Text';
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
  showProgressBar?: boolean; // For future implementation
  progressPercentage?: number; // For future implementation (0-100)
}

export const EffectNotificationBadge: FC<EffectNotificationBadgeProps> = ({
  accumulatedEffects,
  showProgressBar = false,
  progressPercentage = 0,
}) => {
  const effectCount = accumulatedEffects.length;

  return (
    <div className="max-w-[5.875rem] flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 bg-gray-800/30 border-white/20">
      {/* Stacked icons - similar to TurnValue with ~50% overlap */}
      <div
        className={`relative h-[30px] flex items-center justify-center ${
          accumulatedEffects.length > 1 ? 'pl-4' : 0
        }`}
      >
        {accumulatedEffects.map((effect, index) => {
          const iconName = effect.specialType ? SPECIAL_TYPE_TO_ICON[effect.specialType] : null;
          if (!iconName) return null;

          return (
            <div
              key={`${effect.card.id}-${index}`}
              className="w-[30px] h-[30px] shrink-0"
              style={{
                zIndex: effectCount + index,
                transform: index > 0 ? `translateX(-${index * 10}px)` : undefined, // Overlap by 15px per icon
              }}
            >
              <Icon name={iconName} size={40} aria-label={`${effect.effectType} effect`} />
            </div>
          );
        })}
      </div>

      {/* Effect count */}
      <Text
        variant="badge-xs"
        className="whitespace-nowrap p-2 bg-charcoal rounded-md"
        color="text-common-ash"
        weight="extrabold"
      >
        {effectCount} {effectCount === 1 ? 'Effect' : 'Effects'}
      </Text>

      {/* Future: Progress bar space (hidden for now) */}
      {showProgressBar && (
        <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-100"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
};
