# Effect Notification Modal Refactor - Implementation Plan

## Overview
Refactor the EffectNotificationModal system to support multiple card effects via a carousel, non-blocking gameplay, and prepare for future progress bar functionality.

---

## Current Behavior

### Problems
1. **Game Blocking**: When a special card is played for the first time, the game blocks until the user clicks the card and dismisses the modal
2. **Single Card Only**: Modal can only show one card effect at a time
3. **No Accumulation**: Cannot accumulate multiple effects during a turn (e.g., tracker + blocker)
4. **Immediate Processing**: Each effect must be acknowledged before the next card is played

### Current Flow
1. Special card played for first time → Badge appears on card
2. Badge shows with one-time tooltip
3. User MUST click card to see modal
4. Game is blocked until modal is dismissed
5. Modal shows single card effect
6. User closes modal, game continues

---

## Desired Behavior

### Requirements

#### 1. Non-Blocking Gameplay
- Game should NOT pause when badge appears
- Badge is optional - clicking it is not required to continue gameplay
- Game ONLY pauses when modal is actually opened (user clicks the badge)
- Once modal is open, game must pause until modal is closed

#### 2. Multi-Card Carousel Support
- Modal should display multiple card effects using a Swiper carousel
- Reuse carousel pattern from `OpenWhatYouWantModal`
- Effects accumulate during a turn (e.g., play tracker, then blocker → both show in modal)
- Badge shows count of accumulated effects (e.g., "2" if tracker + blocker pending)

#### 3. Turn-Based Accumulation
- Effects accumulate during the current turn/round
- When turn ends (cards collected), accumulated effects should clear
- Next turn starts with fresh accumulation
- **Important**: Effect types are tracked globally (localStorage) - once seen, never shown again across ALL turns/games
  - Example: Tracker shown in Turn 1 → Never shows again in any future turn
  - Accumulation is turn-based, but "seen" status is permanent

#### 4. Progress Timer Mechanism (Implement Logic Now, UI Later)
- **Implement mechanism now**: Timer/pause logic that can delay auto-play
- **UI not needed yet**: Visual progress bar will be added later
- Purpose: When instant/auto-play cards are involved, give user time to click badge
- Mechanism should support configurable timer duration (default: 0 for now, can be set to 3000ms later)
- When timer > 0: Game waits before auto-playing next card, allowing user to click badge
- When timer = 0: Current behavior (no delay)
- **Implementation approach**: Add state machine state or store flag with timer value

### New Flow
1. Special card played for first time (effect type never seen before) → Badge appears on card
2. Badge shows count (e.g., "1") with optional tooltip
3. Game continues normally - user can play next card
4. If another new special card is played (different effect type, never seen) → Badge count updates (e.g., "2")
5. User can click **badge OR card** at any time → Modal opens with carousel
6. **Game pauses** when modal opens
7. User can swipe through accumulated effects
8. User closes modal → Modal marks all shown effects as "seen" (persisted in localStorage)
9. Game resumes from where it left off

**Important**: "Never seen before" is persistent across all turns/games (localStorage). If user saw tracker effect in Turn 1, playing tracker in Turn 5 will NOT show the badge/modal again.

---

## Technical Implementation

### Phase 1: Create Reusable Carousel Component

#### New Component: `CardCarousel`
**Location**: `/components/CardCarousel/index.tsx`

**Purpose**: Abstract the Swiper carousel logic from OpenWhatYouWantModal for reuse

**Props**:
```typescript
interface CardCarouselProps {
  cards: Card[];
  selectedCard: Card | null;
  onCardSelect: (card: Card) => void;
  renderCardContent?: (card: Card) => React.ReactNode; // Optional custom content below card
  className?: string;
}
```

**Features**:
- Uses Swiper with A11y and Keyboard modules
- Centered slides with overlap effect (`spaceBetween: -80`)
- Card rotation (-15deg)
- Keyboard navigation support
- Click to select card

**Extract From**: `OpenWhatYouWantModal` (lines 89-114)

---

### Phase 2: Update EffectNotificationBadge

#### Update: `EffectNotificationBadge/index.tsx`

**Current Props**:
```typescript
interface EffectNotificationBadgeProps {
  effectName: string;
}
```

**New Props**:
```typescript
interface EffectNotificationBadgeProps {
  effectCount: number; // Number of accumulated effects
  showProgressBar?: boolean; // For future implementation
  progressPercentage?: number; // For future implementation
}
```

**Changes**:
1. Display count badge (number) instead of just pulsing indicator
2. Badge shows: Circle with number inside (e.g., "2" for two effects)
3. Reserve space at bottom for future progress bar
4. Keep existing pulsing animation

**Design Notes**:
- Badge dimensions should accommodate progress bar below count
- Progress bar will be thin horizontal bar (similar to HeroUI Progress component)
- For now, progress bar space can be empty/invisible

---

### Phase 3: Update Store State & Logic

#### Update: `store/types.ts`

**Add to GameStore**:
```typescript
// Effect Notification System
accumulatedEffects: EffectNotification[]; // Effects accumulated during current turn
effectAccumulationPaused: boolean; // True when modal is open (pauses game)
```

**Update Methods**:
```typescript
// New/Modified Actions
addEffectToAccumulation: (notification: EffectNotification) => void;
clearAccumulatedEffects: () => void; // Called when turn ends
openEffectModal: () => void; // Opens modal AND pauses game
closeEffectModal: () => void; // Closes modal AND resumes game
```

#### Update: `store/game-store.ts`

**Changes**:

1. **Replace `pendingEffectNotifications` queue with `accumulatedEffects`**:
   - `pendingEffectNotifications` currently blocks game until dismissed
   - `accumulatedEffects` accumulates without blocking

2. **Remove blocking behavior**:
   - Currently, modal opens automatically via `showEffectNotificationBadge` flag
   - New: Badge shows, but modal only opens on user click

3. **Add pause state**:
   - `effectAccumulationPaused` flag
   - When `true`, game state machine should not progress
   - Set `true` in `openEffectModal`, `false` in `closeEffectModal`

4. **Add accumulation logic**:
   ```typescript
   addEffectToAccumulation: (notification) => {
     const { accumulatedEffects, seenEffectTypes } = get();

     // Only add if effect type hasn't been seen before
     if (!seenEffectTypes.includes(notification.effectType)) {
       set({
         accumulatedEffects: [...accumulatedEffects, notification],
         showEffectNotificationBadge: true,
       });
     }
   },

   clearAccumulatedEffects: () => {
     set({
       accumulatedEffects: [],
       showEffectNotificationBadge: false,
     });
   },

   openEffectModal: () => {
     set({
       showEffectNotificationModal: true,
       effectAccumulationPaused: true, // Pause game
     });
   },

   closeEffectModal: () => {
     const { accumulatedEffects, markEffectAsSeen } = get();

     // Mark all accumulated effects as seen
     accumulatedEffects.forEach(effect => {
       markEffectAsSeen(effect.effectType);
     });

     set({
       showEffectNotificationModal: false,
       effectAccumulationPaused: false, // Resume game
       accumulatedEffects: [], // Clear after viewing
       showEffectNotificationBadge: false,
     });
   },
   ```

5. **Update `collectCards` to clear accumulation**:
   - When cards are collected (turn ends), call `clearAccumulatedEffects()`
   - This ensures effects don't carry over to next turn

---

### Phase 4: Update EffectNotificationModal

#### Update: `EffectNotificationModal/index.tsx`

**Changes**:

1. **Use CardCarousel component**:
   - Replace single card display with carousel
   - Pass `accumulatedEffects` as cards
   - Support swiping through multiple effects

2. **Update state usage**:
   ```typescript
   const accumulatedEffects = useGameStore((state) => state.accumulatedEffects);
   const showModal = useGameStore((state) => state.showEffectNotificationModal);
   const closeEffectModal = useGameStore((state) => state.closeEffectModal);
   ```

3. **Add carousel navigation**:
   - Track selected effect (current slide)
   - Show effect name/description for selected slide
   - Update "Your Play" / "Opponent's Play" indicator based on selected card

4. **Structure**:
   ```tsx
   <Modal isOpen={showModal} onClose={closeEffectModal}>
     <ModalContent>
       <ModalBody>
         {/* Player indicator (updates with carousel) */}
         <PlayerIndicator playedBy={selectedEffect.playedBy} />

         {/* Card Carousel */}
         <CardCarousel
           cards={accumulatedEffects.map(e => e.card)}
           selectedCard={selectedCard}
           onCardSelect={handleSelectCard}
         />

         {/* Effect details for selected card */}
         <EffectDetails
           effectName={selectedEffect.effectName}
           effectDescription={selectedEffect.effectDescription}
         />
       </ModalBody>
     </ModalContent>
   </Modal>
   ```

5. **Keep close button and click-to-close behavior**

---

### Phase 5: Update AnimatedCard (Card & Badge Click Handler)

#### Update: `PlayedCards/AnimatedCard.tsx`

**Current Behavior**: Clicking badge OR card sets `currentEffectNotification` and opens modal automatically

**New Behavior**: Clicking badge OR card calls `openEffectModal()` which pauses game and shows modal

**Important**: Both the card AND the badge are clickable targets - preserve this dual-click behavior

**Changes**:
```typescript
const accumulatedEffects = useGameStore((state) => state.accumulatedEffects);
const openEffectModal = useGameStore((state) => state.openEffectModal);
const shouldShowTooltip = useGameStore((state) => state.shouldShowTooltip);
const incrementTooltipCount = useGameStore((state) => state.incrementTooltipCount);

// Check if this card should show the effect notification badge
const shouldShowBadge =
  isTopCard &&
  showEffectNotificationBadge &&
  accumulatedEffects.some((notif) => notif.card.id === playedCardState.card.id);

const handleCardClick = () => {
  if (shouldShowBadge) {
    // Increment tooltip display count if showing
    if (shouldShowEffectTooltip) {
      incrementTooltipCount(effectTooltipConfig.id);
    }

    // Open modal and pause game
    openEffectModal();
  }
};
```

**Update Badge Rendering**:
```tsx
{shouldShowBadge && (
  <div className="absolute top-1/2 -translate-y-[5rem] -right-29 z-10">
    <Tooltip
      content={effectTooltipConfig.message}
      placement="bottom"
      arrowDirection="left"
      isOpen={shouldShowEffectTooltip}
    >
      <div>
        <EffectNotificationBadge
          effectCount={accumulatedEffects.length}
          showProgressBar={false} // Future feature
        />
      </div>
    </Tooltip>
  </div>
)}
```

---

### Phase 6: Game State Machine Integration

#### Update: `machines/game-flow-machine.ts` or Game Logic

**Problem**: Game currently auto-progresses between states. With non-blocking badges, we need to:
1. Allow normal progression when badge shows (don't wait for user)
2. Pause progression when modal is open

**Solution Options**:

**Option A: Check `effectAccumulationPaused` in state transitions**
```typescript
// In state machine guards or game logic
const canProgress = !useGameStore.getState().effectAccumulationPaused;

if (!canProgress) {
  // Wait for modal to close before transitioning
  return;
}
```

**Option B: Use XState guards**
```typescript
// Add guard to prevent transitions when modal is open
guards: {
  notShowingEffectModal: ({ context }) => {
    return !useGameStore.getState().effectAccumulationPaused;
  },
}

// Apply to transitions
on: {
  NEXT_STATE: {
    target: 'nextState',
    guard: 'notShowingEffectModal',
  },
}
```

**Recommended**: Option B (XState guards) for cleaner state machine logic

---

### Phase 7: Effect Generation Logic

#### Update: Where effects are added to queue

**Current**: Effects added via `processEffectNotifications()` or similar

**Changes**:
1. Replace calls to `pendingEffectNotifications.push()` with `addEffectToAccumulation()`
2. Remove auto-opening modal logic
3. Effects accumulate silently until user clicks badge

**Example**:
```typescript
// OLD (blocks game)
if (!seenEffectTypes.includes('tracker')) {
  set({
    pendingEffectNotifications: [...pending, trackerNotification],
    currentEffectNotification: trackerNotification,
    showEffectNotificationModal: true, // Auto-opens and blocks
  });
}

// NEW (non-blocking)
if (!seenEffectTypes.includes('tracker')) {
  get().addEffectToAccumulation(trackerNotification);
  // Badge shows, game continues
}
```

---

### Phase 8: Progress Timer Mechanism (Logic Only, No UI)

#### Purpose
Implement the timer/pause mechanism that will eventually support the progress bar feature, but set to 0 (disabled) for now.

#### Update: `store/types.ts`

**Add to GameStore**:
```typescript
// Progress Timer for Effect Badge (future feature)
effectBadgeTimerDuration: number; // Milliseconds to wait before auto-play (0 = disabled)
effectBadgeTimerActive: boolean; // True when timer is running
effectBadgeTimerStartTime: number | null; // Timestamp when timer started
```

#### Update: `store/game-store.ts`

**Add state**:
```typescript
effectBadgeTimerDuration: 0, // Set to 0 for now (disabled)
effectBadgeTimerActive: false,
effectBadgeTimerStartTime: null,
```

**Add methods**:
```typescript
// Start progress timer (called when effect badge appears during auto-play)
startEffectBadgeTimer: () => {
  const { effectBadgeTimerDuration } = get();

  if (effectBadgeTimerDuration === 0) {
    // Timer disabled, proceed immediately
    return false;
  }

  set({
    effectBadgeTimerActive: true,
    effectBadgeTimerStartTime: Date.now(),
  });

  // Return true to indicate game should wait
  return true;
},

// Stop timer (called when user clicks badge or timer expires)
stopEffectBadgeTimer: () => {
  set({
    effectBadgeTimerActive: false,
    effectBadgeTimerStartTime: null,
  });
},

// Check if timer is running
isEffectTimerActive: () => {
  return get().effectBadgeTimerActive;
},
```

#### Update: Game State Machine or CPU Logic

**Integration Point**: When CPU or auto-play card is about to be played and badge appears

**Logic**:
```typescript
// Before auto-playing next card
const shouldWait = useGameStore.getState().startEffectBadgeTimer();

if (shouldWait) {
  // Set up timeout
  const duration = useGameStore.getState().effectBadgeTimerDuration;

  setTimeout(() => {
    // Timer expired, stop timer and continue game
    useGameStore.getState().stopEffectBadgeTimer();
    // Continue with auto-play...
  }, duration);

  // Don't proceed with auto-play yet
  return;
}

// Timer disabled (duration = 0), proceed immediately
// Continue with auto-play...
```

**When User Clicks Badge**:
```typescript
const handleCardClick = () => {
  if (shouldShowBadge) {
    // Stop timer if running
    if (useGameStore.getState().isEffectTimerActive()) {
      useGameStore.getState().stopEffectBadgeTimer();
    }

    // Open modal and pause game
    openEffectModal();
  }
};
```

#### Configuration

**Add to constants or config file**:
```typescript
// config/game-config.ts or similar
export const EFFECT_BADGE_TIMER_DURATION = 0; // Set to 3000 when feature is ready
```

**Benefits of This Approach**:
1. ✅ Mechanism is in place, just needs duration changed from 0 to enable
2. ✅ No UI changes needed - timer logic is separate from visual progress bar
3. ✅ State machine guards can check `effectBadgeTimerActive` to pause game
4. ✅ Easy to test by changing config value
5. ✅ When progress bar UI is added later, it just reads `effectBadgeTimerStartTime` and `effectBadgeTimerDuration` to calculate percentage

#### Future: Adding Progress Bar UI

When ready to add visual progress bar:
1. Update `EffectNotificationBadge` to show progress bar when `effectBadgeTimerActive === true`
2. Use interval to calculate progress: `(Date.now() - startTime) / duration * 100`
3. Pass `showProgressBar={effectBadgeTimerActive}` and `progressPercentage={calculated}`
4. Change `EFFECT_BADGE_TIMER_DURATION` from 0 to 3000 (or desired ms)

---

## File Structure

### New Files
```
src/
  components/
    CardCarousel/
      index.tsx          # Reusable carousel component
      types.ts           # Props interface
```

### Modified Files
```
src/
  components/
    EffectNotificationModal/
      index.tsx          # Add carousel, multi-card support

    EffectNotificationBadge/
      index.tsx          # Show count, add progress bar space

    PlayedCards/
      AnimatedCard.tsx   # Update click handler, badge rendering

  store/
    types.ts             # Add accumulatedEffects, effectAccumulationPaused
    game-store.ts        # Add new methods, update logic

  machines/
    game-flow-machine.ts # Add guards to prevent progression when modal open

  utils/
    effect-helpers.ts    # Update effect notification logic
```

---

## Implementation Steps

### Step 1: Create CardCarousel Component
- Extract Swiper logic from OpenWhatYouWantModal
- Create reusable component with props interface
- Test with sample cards
- **Effort**: 2-3 hours

### Step 2: Update Store
- Add `accumulatedEffects` and `effectAccumulationPaused` state
- Implement `addEffectToAccumulation`, `clearAccumulatedEffects`
- Implement `openEffectModal`, `closeEffectModal`
- Update `collectCards` to clear accumulation
- **Effort**: 3-4 hours

### Step 3: Update EffectNotificationBadge
- Add count display
- Reserve space for progress bar
- Update styling
- **Effort**: 1-2 hours

### Step 4: Update EffectNotificationModal
- Integrate CardCarousel
- Add carousel navigation
- Update close handler
- **Effort**: 3-4 hours

### Step 5: Update AnimatedCard
- Update badge click handler
- Pass effect count to badge
- Remove blocking logic
- **Effort**: 1-2 hours

### Step 6: Game State Integration
- Add XState guards
- Prevent progression when modal open
- Test game flow with open modal
- **Effort**: 2-3 hours

### Step 7: Update Effect Generation
- Replace `pendingEffectNotifications` with `addEffectToAccumulation`
- Remove auto-open logic
- Test accumulation during turn
- **Effort**: 2-3 hours

### Step 8: Implement Progress Timer Mechanism
- Add timer state to store (`effectBadgeTimerDuration`, etc.)
- Implement timer methods (`startEffectBadgeTimer`, `stopEffectBadgeTimer`)
- Add timer config (set to 0 for now)
- Integrate with CPU/auto-play logic
- Update badge click handler to stop timer
- **Effort**: 2-3 hours

### Step 9: Testing & Polish
- Test with multiple effects (tracker + blocker + etc.)
- Test turn-based accumulation clearing
- Test game pause/resume when modal opens
- Test carousel navigation
- Test both card AND badge click targets
- Test timer mechanism (verify it does nothing when duration = 0)
- **Effort**: 3-4 hours

**Total Estimated Effort**: 19-28 hours

---

## Future Enhancements (Not in Scope)

### Progress Bar for Instant Plays
When auto-play cards are involved, user should have time to click badge before next card plays.

**Implementation**:
1. Add timer when instant play card is played
2. Show progress bar in badge counting down (e.g., 3 seconds)
3. If user clicks badge before timer expires → open modal, pause game
4. If timer expires → hide badge, continue game
5. Use `setTimeout` + interval to update progress percentage

**Props Ready**:
```typescript
// Badge already has props for this
showProgressBar={true}
progressPercentage={66} // 0-100
```

**Timer Logic** (future):
```typescript
const startProgressTimer = (durationMs: number) => {
  const intervalMs = 50;
  const steps = durationMs / intervalMs;
  let currentStep = 0;

  const interval = setInterval(() => {
    currentStep++;
    const percentage = (currentStep / steps) * 100;

    set({ badgeProgressPercentage: percentage });

    if (currentStep >= steps) {
      clearInterval(interval);
      // Hide badge, continue game
      set({ showEffectNotificationBadge: false });
    }
  }, intervalMs);

  return interval;
};
```

---

## Testing Checklist

- [ ] Single effect accumulation works (tracker only)
- [ ] Multiple effects accumulate (tracker + blocker)
- [ ] Badge shows correct count (1, 2, 3, etc.)
- [ ] Badge tooltip shows only once (per tooltip config)
- [ ] Clicking badge opens modal
- [ ] Game pauses when modal opens
- [ ] Game resumes when modal closes
- [ ] Carousel navigation works (swipe, keyboard)
- [ ] Effects marked as seen after viewing
- [ ] Effects clear at end of turn (after collection)
- [ ] Effects don't carry over to next turn
- [ ] Can play cards while badge is visible (non-blocking)
- [ ] Modal blocks further card plays (when open)
- [ ] Player/Opponent indicator updates with carousel
- [ ] Works for both player and CPU cards
- [ ] OpenWhatYouWantModal still works after CardCarousel extraction

---

## Notes

- **Carousel Reusability**: CardCarousel should be generic enough for future use cases
- **State Cleanup**: Ensure `accumulatedEffects` clears properly to avoid memory leaks
- **Accessibility**: Carousel must support keyboard navigation (already in Swiper config)
- **Mobile**: Swiper handles touch gestures automatically
- **Performance**: Accumulation should not impact game performance (simple array operations)

---

## Questions for Clarification

1. **Effect Ordering in Carousel**: Should effects appear in the order they were played (chronological)?
   - **Assumption**: Yes, chronological order (first played = first in carousel)

2. **Badge Position**: Should badge position change with multiple cards or stay in same location?
   - **Assumption**: Stay in same location (right side of card)

3. **Seen Effects**: After viewing in modal, should they never show again (even in future turns)?
   - **Assumption**: Yes, `markEffectAsSeen` persists (localStorage)

4. **CPU vs Player**: Should we show different badges/counts for CPU vs Player effects?
   - **Assumption**: No, single badge showing all accumulated effects for that turn

5. **Modal Persistence**: If modal is open and turn ends, what happens?
   - **Assumption**: Modal force-closes when cards are collected (turn ends)

---

## Success Criteria

✅ Game does not block when special card is played
✅ Badge appears with count of accumulated effects
✅ User can continue playing without clicking badge
✅ Clicking badge opens modal and pauses game
✅ Modal shows carousel with all accumulated effects
✅ Carousel supports keyboard and touch navigation
✅ Effects clear at end of turn
✅ Game resumes when modal is closed
✅ Design accommodates future progress bar
✅ No regressions in existing effect notification behavior
