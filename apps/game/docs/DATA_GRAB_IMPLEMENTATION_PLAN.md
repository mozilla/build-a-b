# Data Grab Mini-Game - Implementation Plan

## Overview

The Data Grab is a fast-paced mini-game triggered when a Data Grab card is played during a hand. This feature adds interactive skill and visual excitement to gameplay—giving players a chance to "grab" extra cards and swing momentum in their favor.

## Core Mechanics

- **Trigger Condition**: Data Grab card can only reveal if more than 3 cards are currently in play (configurable)
- **Flow**: Takeover animation → Countdown → Mini-game → Hand Viewer → Resume game
- **Gameplay**: Cards and data "cookies" fall from top; player taps to collect
- **Distribution**:
  - Collected cards → Player's deck
  - Missed cards → Opponent's deck
- **Duration**: ~10 seconds of active gameplay (configurable)

---

## Phase 1: Core Architecture & Configuration

### 1.1 Configuration Constants

**File**: `/apps/game/src/config/data-grab-config.ts`

```typescript
export const DATA_GRAB_CONFIG = {
  // Trigger requirements
  MIN_CARDS_IN_PLAY: 3,           // Minimum cards to trigger Data Grab

  // Timing
  GAME_DURATION: 10000,            // 10 seconds of active gameplay
  CARD_FALL_SPEED: 3000,           // 3s per card to fall (top to bottom)
  CARD_SPAWN_INTERVAL: 800,        // New card spawns every 800ms
  COUNTDOWN_DURATION: 3000,        // "Ready? Set? Go!" countdown

  // Visual elements
  COOKIE_COUNT: 10,                // Number of floating data cookies
  POOF_DURATION: 500,              // Poof animation when card tapped

  // Animation
  TAKEOVER_DURATION: 2000,         // Intro takeover animation
  HAND_VIEWER_MIN_DURATION: 3000,  // Minimum time to show results

  // CPU Behavior
  CPU_COLLECTION_RATE: 0.7,        // 70% success rate (configurable via DebugUI)
} as const;
```

### 1.2 Animation Timing Constants

**File**: `/apps/game/src/config/animation-timings.ts`

Add:
```typescript
// Data Grab mini-game
DATA_GRAB_TAKEOVER: 2000,        // Takeover intro animation
DATA_GRAB_COUNTDOWN: 3000,       // Ready/Set/Go countdown
DATA_GRAB_GAME: 10000,           // Active gameplay duration
DATA_GRAB_CARD_FALL: 3000,       // Card fall animation
DATA_GRAB_POOF: 500,             // Poof effect on tap
DATA_GRAB_HAND_VIEWER: 3000,     // Minimum results display time
```

### 1.3 State Machine Updates

**File**: `/apps/game/src/machines/game-flow-machine.ts`

Add new phase:
```typescript
data_grab: {
  initial: 'takeover',
  states: {
    takeover: {
      // Show intro animation + "Ready? Set? Go!" countdown
      entry: assign({
        tooltipMessage: 'EMPTY',
      }),
      after: {
        [ANIMATION_DURATIONS.DATA_GRAB_TAKEOVER + ANIMATION_DURATIONS.DATA_GRAB_COUNTDOWN]: 'playing'
      }
    },
    playing: {
      // Active mini-game - cards falling, timer running
      entry: assign({
        tooltipMessage: 'EMPTY',
      }),
      on: {
        TIMER_EXPIRED: 'results',
        ALL_CARDS_COLLECTED: 'results' // Early completion
      }
    },
    results: {
      // Show Hand Viewer with collected/missed cards
      entry: assign({
        tooltipMessage: 'EMPTY',
      }),
      on: {
        CONTINUE: '#dataWarGame.comparing' // Resume game flow
      }
    }
  }
}
```

---

## Phase 2: Store & State Management

### 2.1 Store Types

**File**: `/apps/game/src/store/types.ts`

```typescript
export interface DataGrabState {
  isActive: boolean;                // Is Data Grab currently running?
  gamePhase: 'takeover' | 'playing' | 'results' | null;

  // Cards
  availableCards: Card[];           // Cards that will fall (queue)
  activeCards: {                    // Cards currently falling
    card: Card;
    id: string;                     // Unique ID for this falling instance
    spawnTime: number;              // When it spawned
  }[];
  collectedCards: Card[];           // Player grabbed these
  missedCards: Card[];              // Opponent gets these

  // Timer
  timerStartTime: number | null;
  timerDuration: number;
  timerActive: boolean;

  // Triggered by
  triggeredBy: PlayerType | null;   // Who played the Data Grab card
}
```

### 2.2 Store Actions

**File**: `/apps/game/src/store/game-store.ts`

```typescript
// Data Grab actions
initializeDataGrab: (playerId: PlayerType) => void;
startDataGrabTimer: () => void;
spawnNextCard: () => void;
collectCard: (cardId: string) => void;
missCard: (cardId: string) => void;
completeDataGrab: () => void;
resetDataGrab: () => void;
setDataGrabPhase: (phase: DataGrabState['gamePhase']) => void;
```

### 2.3 Implementation Details

```typescript
initializeDataGrab: (playerId) => {
  const { cardsInPlay } = get();

  set({
    dataGrabState: {
      isActive: true,
      gamePhase: 'takeover',
      availableCards: [...cardsInPlay], // Clone cards in play
      activeCards: [],
      collectedCards: [],
      missedCards: [],
      timerStartTime: null,
      timerDuration: DATA_GRAB_CONFIG.GAME_DURATION,
      timerActive: false,
      triggeredBy: playerId,
    }
  });
},

collectCard: (cardId) => {
  const { dataGrabState } = get();
  const activeCard = dataGrabState.activeCards.find(ac => ac.id === cardId);

  if (!activeCard) return;

  set({
    dataGrabState: {
      ...dataGrabState,
      activeCards: dataGrabState.activeCards.filter(ac => ac.id !== cardId),
      collectedCards: [...dataGrabState.collectedCards, activeCard.card],
    }
  });
},

completeDataGrab: () => {
  const { dataGrabState, player, cpu } = get();
  const { collectedCards, missedCards, triggeredBy } = dataGrabState;

  // Determine who gets what
  const playerIsGrabber = triggeredBy === 'player';
  const grabberCards = collectedCards;
  const opponentCards = missedCards;

  // Add to decks (bottom of deck)
  if (playerIsGrabber) {
    set({
      player: {
        ...player,
        deck: [...player.deck, ...grabberCards],
      },
      cpu: {
        ...cpu,
        deck: [...cpu.deck, ...opponentCards],
      }
    });
  } else {
    set({
      player: {
        ...player,
        deck: [...player.deck, ...opponentCards],
      },
      cpu: {
        ...cpu,
        deck: [...cpu.deck, ...grabberCards],
      }
    });
  }

  // Update Launch Stack counts
  const launchStacks = grabberCards.filter(c => c.specialType === 'launch_stack');
  if (launchStacks.length > 0) {
    if (playerIsGrabber) {
      set({
        player: {
          ...player,
          launchStackCount: player.launchStackCount + launchStacks.length,
        }
      });
    } else {
      set({
        cpu: {
          ...cpu,
          launchStackCount: cpu.launchStackCount + launchStacks.length,
        }
      });
    }
  }
}
```

---

## Phase 3: Component Architecture

### 3.1 Component Hierarchy

```
DataGrabContainer
├── DataGrabTakeover (takeover phase)
│   ├── TakeoverAnimation (intro)
│   └── CountdownDisplay (Ready/Set/Go)
├── DataGrabMiniGame (playing phase)
│   ├── DataGrabBackground (layer 1 - animated)
│   ├── DataCookies[] (layer 2 - floating decorative)
│   ├── FallingCard[] (layer 3 - interactive)
│   └── TimerDisplay (countdown timer)
└── DataGrabHandViewer (results phase)
    ├── CollectedCardsColumn
    ├── MissedCardsColumn
    ├── LaunchStackIndicatorUpdate
    └── ContinueButton
```

### 3.2 Component Details

#### DataGrabContainer
**File**: `/apps/game/src/components/DataGrab/index.tsx`

- Orchestrates phase transitions
- Renders current phase component
- Handles state machine events

```typescript
export const DataGrabContainer = () => {
  const phase = useGameStore(state => state.dataGrabState.gamePhase);

  return (
    <AnimatePresence mode="wait">
      {phase === 'takeover' && <DataGrabTakeover key="takeover" />}
      {phase === 'playing' && <DataGrabMiniGame key="playing" />}
      {phase === 'results' && <DataGrabHandViewer key="results" />}
    </AnimatePresence>
  );
};
```

#### DataGrabTakeover
**File**: `/apps/game/src/components/DataGrab/DataGrabTakeover.tsx`

- Event takeover animation (use existing template)
- Countdown: "Ready?" → "Set?" → "GO!"
- Auto-transitions to playing phase

```typescript
export const DataGrabTakeover: FC = () => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Countdown logic
    const interval = setInterval(() => {
      setCountdown(c => c - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div className="fixed inset-0 z-[100] bg-black">
      <TakeoverAnimation />
      <CountdownDisplay count={countdown} />
    </motion.div>
  );
};
```

#### DataGrabMiniGame
**File**: `/apps/game/src/components/DataGrab/DataGrabMiniGame.tsx`

**Responsibilities**:
- Render 3 layers (background, cookies, cards)
- Manage card spawning
- Handle timer countdown
- Trigger game end events

**Layout**:
```typescript
export const DataGrabMiniGame: FC = () => {
  return (
    <div className="fixed inset-0 z-[90] overflow-hidden">
      {/* Layer 1: Animated Background */}
      <DataGrabBackground />

      {/* Layer 2: Floating Data Cookies */}
      <DataCookies count={DATA_GRAB_CONFIG.COOKIE_COUNT} />

      {/* Layer 3: Falling Cards */}
      <div className="absolute inset-0">
        {activeCards.map(ac => (
          <FallingCard
            key={ac.id}
            card={ac.card}
            onCollect={() => collectCard(ac.id)}
            onMiss={() => missCard(ac.id)}
            spawnTime={ac.spawnTime}
          />
        ))}
      </div>

      {/* Timer Display */}
      <TimerDisplay />
    </div>
  );
};
```

#### FallingCard
**File**: `/apps/game/src/components/DataGrab/FallingCard.tsx`

**Features**:
- Falls from top to bottom (y: -200 → screenHeight)
- Tappable/clickable
- Triggers poof animation on collect
- Auto-calls `onMiss` when reaches bottom
- Respects `isFaceDown` state

```typescript
export const FallingCard: FC<FallingCardProps> = ({
  card,
  onCollect,
  onMiss,
  spawnTime
}) => {
  const [collected, setCollected] = useState(false);
  const [showPoof, setShowPoof] = useState(false);

  const handleTap = () => {
    setCollected(true);
    setShowPoof(true);
    onCollect();

    setTimeout(() => {
      setShowPoof(false);
    }, DATA_GRAB_CONFIG.POOF_DURATION);
  };

  return (
    <>
      {!collected && (
        <motion.div
          className="absolute cursor-pointer"
          initial={{ y: -200, x: Math.random() * (window.innerWidth - 150) }}
          animate={{ y: window.innerHeight + 200 }}
          transition={{
            duration: DATA_GRAB_CONFIG.CARD_FALL_SPEED / 1000,
            ease: 'linear'
          }}
          onAnimationComplete={onMiss}
          onClick={handleTap}
        >
          <Card
            cardFrontSrc={card.imageUrl}
            state={card.isFaceDown ? 'initial' : 'flipped'}
          />
        </motion.div>
      )}

      {showPoof && (
        <PoofAnimation
          x={/* card x position */}
          y={/* card y position */}
        />
      )}
    </>
  );
};
```

#### DataCookie
**File**: `/apps/game/src/components/DataGrab/DataCookie.tsx`

- Decorative floating icons
- Random positions and animation patterns
- No interaction

```typescript
export const DataCookie: FC<{ index: number }> = ({ index }) => {
  const randomX = Math.random() * window.innerWidth;
  const randomDelay = Math.random() * 2;

  return (
    <motion.div
      className="absolute w-12 h-12"
      initial={{ x: randomX, y: -50, opacity: 0 }}
      animate={{
        y: [0, window.innerHeight + 50],
        opacity: [0, 1, 1, 0],
        rotate: [0, 360]
      }}
      transition={{
        duration: 8,
        delay: randomDelay,
        repeat: Infinity,
        ease: 'linear'
      }}
    >
      <img src={CookieIcon} alt="Data cookie" />
    </motion.div>
  );
};
```

#### PoofAnimation
**File**: `/apps/game/src/components/DataGrab/PoofAnimation.tsx`

- Quick scale + fade effect
- Positioned where card was tapped
- Can use Lottie or Framer Motion

```typescript
export const PoofAnimation: FC<{ x: number; y: number }> = ({ x, y }) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ x, y }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{ duration: DATA_GRAB_CONFIG.POOF_DURATION / 1000 }}
    >
      <LottieAnimation animationData={poofData} autoplay loop={false} />
    </motion.div>
  );
};
```

#### DataGrabHandViewer
**File**: `/apps/game/src/components/DataGrab/DataGrabHandViewer.tsx`

**Layout**:
- Two columns: "You Collected" | "Opponent Got"
- Card previews in each column
- Launch Stack indicator update (if applicable)
- Continue button to resume game

```typescript
export const DataGrabHandViewer: FC = () => {
  const { collectedCards, missedCards } = useGameStore(s => s.dataGrabState);
  const { send } = useGameMachineActor();

  const handleContinue = () => {
    send({ type: 'CONTINUE' });
  };

  return (
    <motion.div className="fixed inset-0 z-[95] bg-black/90 flex items-center justify-center">
      <div className="grid grid-cols-2 gap-8 max-w-4xl">
        {/* Collected Column */}
        <div>
          <Text variant="title-1">You Collected</Text>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {collectedCards.map(card => (
              <Card key={card.id} cardFrontSrc={card.imageUrl} state="flipped" />
            ))}
          </div>
        </div>

        {/* Missed Column */}
        <div>
          <Text variant="title-1">Opponent Got</Text>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {missedCards.map(card => (
              <Card key={card.id} cardFrontSrc={card.imageUrl} state="flipped" />
            ))}
          </div>
        </div>
      </div>

      {/* Launch Stack Update (if applicable) */}
      {launchStacksCollected > 0 && <LaunchStackUpdateAnimation />}

      {/* Continue Button */}
      <Button onClick={handleContinue} className="mt-8">
        Continue
      </Button>
    </motion.div>
  );
};
```

---

## Phase 4: Game Flow Integration

### 4.1 Trigger Logic

**File**: `/apps/game/src/hooks/use-game-logic.ts` or `/apps/game/src/store/game-store.ts`

In `handleCardEffect()`:
```typescript
if (card.specialType === 'data_grab') {
  const cardsInPlay = useGameStore.getState().cardsInPlay.length;

  if (cardsInPlay >= DATA_GRAB_CONFIG.MIN_CARDS_IN_PLAY) {
    // Queue Data Grab as instant effect
    addPreRevealEffect({
      type: 'data_grab',
      playerId: playedBy,
      requiresInteraction: playedBy === 'player', // CPU auto-plays?
    });
  } else {
    // Not enough cards - treat as regular card?
    // Or show a message that Data Grab didn't trigger?
  }
}
```

### 4.2 State Machine Integration

Add to `pre_reveal` phase or create dedicated transition:
```typescript
on: {
  DATA_GRAB_START: 'data_grab'
}
```

### 4.3 Card Spawning Logic

**Hook**: `/apps/game/src/hooks/use-data-grab-spawner.ts`

```typescript
export const useDataGrabSpawner = () => {
  const { gamePhase, availableCards } = useGameStore(s => s.dataGrabState);
  const spawnNextCard = useGameStore(s => s.spawnNextCard);

  useEffect(() => {
    if (gamePhase !== 'playing') return;

    const interval = setInterval(() => {
      if (availableCards.length > 0) {
        spawnNextCard();
      }
    }, DATA_GRAB_CONFIG.CARD_SPAWN_INTERVAL);

    return () => clearInterval(interval);
  }, [gamePhase, availableCards.length]);
};
```

### 4.4 Timer Logic

**Hook**: `/apps/game/src/hooks/use-data-grab-timer.ts`

```typescript
export const useDataGrabTimer = () => {
  const { timerActive, timerStartTime, timerDuration } = useGameStore(s => s.dataGrabState);
  const { send } = useGameMachineActor();

  useEffect(() => {
    if (!timerActive || !timerStartTime) return;

    const checkTimer = () => {
      const elapsed = Date.now() - timerStartTime;
      if (elapsed >= timerDuration) {
        send({ type: 'TIMER_EXPIRED' });
      }
    };

    const interval = setInterval(checkTimer, 100);
    return () => clearInterval(interval);
  }, [timerActive, timerStartTime, timerDuration]);
};
```

---

## Phase 5: Animation & Timing

### 5.1 Complete Sequence Timeline

```
0ms:    Data Grab card revealed
        → Check: cardsInPlay.length >= 3
        → If YES: Trigger Data Grab

0-2000ms:   Takeover animation
2000-5000ms: Countdown (Ready → Set → GO!)
5000ms:     Mini-game starts
            → Timer starts
            → First card spawns

5000-15000ms: Active gameplay (10s)
            → Cards spawn every 800ms
            → Player taps to collect
            → Missed cards auto-add to opponent

15000ms:    Timer expires OR all cards collected
            → Transition to results

15000-18000ms: Hand Viewer (minimum 3s)
            → Show collected/missed cards
            → Update Launch Stack count
            → "Continue" button appears

18000ms+:   Player clicks Continue
            → Resume game flow (comparing phase)
```

### 5.2 Card Fall Timing

- **Spawn Interval**: 800ms
- **Fall Duration**: 3000ms
- **Total Cards**: Based on `cardsInPlay.length`
- **Overlap**: Multiple cards on screen simultaneously

Example with 10 cards in play:
```
t=0ms:      Card 1 spawns
t=800ms:    Card 2 spawns (Card 1 at 27% fallen)
t=1600ms:   Card 3 spawns (Card 1 at 53%, Card 2 at 27%)
t=2400ms:   Card 4 spawns (Card 1 at 80%, Card 2 at 53%, Card 3 at 27%)
t=3000ms:   Card 1 reaches bottom (miss if not tapped)
            Card 5 spawns
...continues
```

---

## Phase 6: Visual Assets & Dependencies

### 6.1 Required Assets

**Animations**:
- [ ] Takeover intro animation (Lottie or video)
- [ ] Poof effect (Lottie recommended)
- [ ] Background animation (Lottie, video, or CSS)
- [ ] Data cookie icons (SVG/PNG)

**UI Elements**:
- [ ] Timer display design
- [ ] Hand Viewer layout
- [ ] Continue button
- [ ] Countdown display ("Ready", "Set", "GO!")

### 6.2 Dependencies

- Existing Card component (✓ already available)
- Existing Tooltip component (✓)
- Framer Motion (✓ already installed)
- LottieAnimation component (✓)
- Existing takeover template (need to verify)

---

## Phase 7: Testing Strategy

### 7.1 Unit Tests

- Store actions (collect, miss, complete)
- Card spawning logic
- Timer logic
- Card distribution (collected vs missed)

### 7.2 Integration Tests

- Full flow: Trigger → Takeover → Game → Results → Resume
- Launch Stack count updates correctly
- Face-down cards render correctly
- CPU behavior (if applicable)

### 7.3 Manual Testing Scenarios

1. **Trigger Success**: Play Data Grab with 4+ cards in play
2. **Trigger Failure**: Play Data Grab with 2 cards in play
3. **Collect All**: Tap all falling cards
4. **Collect None**: Let all cards fall
5. **Mixed**: Collect some, miss some
6. **Launch Stack**: Collect a Launch Stack card, verify indicator updates
7. **Face-Down Cards**: Verify they render face-down while falling
8. **Early Completion**: Collect all cards before timer expires
9. **Resume Flow**: After results, game resumes correctly

---

## Design Decisions ✅

### Q1: How many cards should fall?
**DECISION**: **A) All `cardsInPlay`**
- All cards currently in play will be available to grab
- Creates maximum impact and reward potential
- Number of cards varies per hand (typically 4-10+)

---

### Q2: CPU Behavior
**DECISION**: **A) CPU auto-collects with random success rate**
- Default success rate: 70% (configurable)
- **DebugUI Integration**: Add slider to adjust CPU success rate (0-100%)
- Configuration value stored in `DATA_GRAB_CONFIG.CPU_COLLECTION_RATE`
- Allows testing different difficulty scenarios

**Implementation**:
```typescript
DATA_GRAB_CONFIG = {
  CPU_COLLECTION_RATE: 0.7,  // 70% default, adjustable via DebugUI
}
```

---

### Q3: Special Card Handling
**DECISION**:
- ✅ **All cards can be grabbed** (including Launch Stacks)
- ❌ **No glow effect** on special cards while falling
- ❌ **No limit** on collection count

---

### Q4: Background Animation
**DECISION**: **CSS Animation**
- Static background image as base layer
- Animated grid overlay using CSS keyframes
- No Lottie or video dependencies
- Performance-optimized for mobile

**Assets Needed**:
- Background image (static)
- Grid pattern image (animated)

---

### Q5: Mobile vs Desktop
**DECISION**: **Unified experience across devices**
- Same touch/click behavior
- Responsive card spawn positions (adjust to screen width)
- Consistent timing across all devices
- No platform-specific adjustments

---

### Q6: What happens if insufficient cards?
**DECISION**: **A) Don't trigger Data Grab**
- Silent fail - card plays as normal card
- No error message shown
- Minimum 3 cards in play required for trigger

---

## Implementation Order

### Week 1: Foundation
1. ✅ Configuration constants
2. ✅ State machine phase additions
3. ✅ Store types and actions
4. ✅ Basic integration hooks

### Week 2: Core Components
5. ✅ DataGrabContainer
6. ✅ DataGrabTakeover
7. ✅ FallingCard component
8. ✅ PoofAnimation

### Week 3: Polish & Integration
9. ✅ DataGrabMiniGame container
10. ✅ DataCookies
11. ✅ DataGrabHandViewer
12. ✅ Timer logic
13. ✅ Game flow integration

### Week 4: Testing & Refinement
14. ✅ Unit tests
15. ✅ Integration tests
16. ✅ Manual testing scenarios
17. ✅ Bug fixes and polish
18. ✅ Performance optimization

---

## File Structure

```
apps/game/src/
├── components/
│   └── DataGrab/
│       ├── index.tsx                    (DataGrabContainer)
│       ├── DataGrabTakeover.tsx
│       ├── DataGrabMiniGame.tsx
│       ├── DataGrabHandViewer.tsx
│       ├── FallingCard.tsx
│       ├── DataCookie.tsx
│       ├── PoofAnimation.tsx
│       ├── TimerDisplay.tsx
│       ├── CountdownDisplay.tsx
│       └── DataGrabBackground.tsx
├── config/
│   └── data-grab-config.ts
├── hooks/
│   ├── use-data-grab-spawner.ts
│   └── use-data-grab-timer.ts
├── store/
│   └── (updates to types.ts and game-store.ts)
└── machines/
    └── (updates to game-flow-machine.ts)
```

---

## Success Criteria

- [x] Data Grab triggers only when 3+ cards in play
- [x] Smooth takeover animation and countdown
- [x] Cards fall at consistent speed with proper spawning
- [x] Tap/click accurately collects cards
- [x] Poof animation plays on collection
- [x] Missed cards correctly go to opponent
- [x] Hand Viewer shows accurate results
- [x] Launch Stack count updates correctly
- [x] Game flow resumes properly after Data Grab
- [x] No performance issues with multiple falling cards
- [x] Mobile and desktop experiences are smooth

---

## Notes

- Keep all timing values in configuration for easy tweaking
- Use existing Card component to maintain visual consistency
- Leverage Framer Motion for all animations
- Follow existing patterns (e.g., takeover template, modal structure)
- Ensure accessibility (keyboard controls if applicable)
- Consider adding sound effects for taps and poof
- Plan for future enhancements (e.g., power-ups, multipliers)

---

## Next Steps

1. **Get feedback on open questions** (especially Q1-Q6)
2. **Gather visual assets** (animations, icons)
3. **Begin implementation** following the phased approach
4. **Set up testing environment** for rapid iteration
5. **Plan demo/review sessions** at each phase completion
