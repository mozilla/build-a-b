# OWYW Test Scenarios

Test these scenarios to ensure the guard change doesn't introduce regressions:

## Scenario 1: Previous Turn OWYW + Current Turn DataWar
**Setup:**
```typescript
initializeGame(
  'custom',
  'custom',
  [
    'firewall-open',      // OWYW (6) - Turn 1
    'move-buyout',        // Selected card (6) - Turn 2, ties with CPU
    'common-3',           // Face-down 1
    'common-4',           // Face-down 2
    'common-2',           // Face-down 3
    'common-5',           // Face-up (5)
  ],
  [
    'common-5',           // (5) - Turn 1, loses
    'move-theft',         // (6) - Turn 2, ties → DataWar
    'common-1',           // Face-down 1
    'common-2',           // Face-down 2
    'common-5',           // Face-down 3
    'common-4',           // Face-up (4)
  ]
);
```

**Expected Flow:**
1. Turn 1: Player plays OWYW (6), CPU plays (5) → Player wins
2. Turn 2: Pre-reveal modal shows (previous turn OWYW)
3. Player selects card (6), CPU plays (6) → DataWar
4. DataWar face-up: **Should NOT show modal** (OWYW already used in pre-reveal)
5. Face-up cards play normally

**Test:** `openWhatYouWantActive` should be `null` during DataWar face-up

---

## Scenario 2: CPU Plays OWYW in DataWar
**Setup:**
```typescript
initializeGame(
  'custom',
  'custom',
  [
    'move-buyout',        // (6) - ties with CPU OWYW
    'common-3',           // Face-down 1
    'common-4',           // Face-down 2
    'common-2',           // Face-down 3
    'common-5',           // Face-up (5)
  ],
  [
    'firewall-open',      // OWYW (6) - ties with player
    'common-1',           // Face-down 1
    'common-2',           // Face-down 2
    'common-5',           // Face-down 3
    'firewall-recall',    // Top option for CPU (6)
    'move-theft',         // Second option (6)
    'common-4',           // Third option (4)
  ]
);
```

**Expected Flow:**
1. Player plays (6), CPU plays OWYW (6) → DataWar
2. Face-down cards play
3. DataWar face-up ready: CPU has OWYW in `playedCardsInHand`
4. **If CPU is face-up player**: CPU auto-selects card, no modal
5. Face-up cards play normally

**Test:** CPU OWYW should be detected and handled correctly

---

## Scenario 3: Both Players Play OWYW
**Setup:**
```typescript
initializeGame(
  'custom',
  'custom',
  [
    'firewall-open',      // OWYW (6)
    'common-3',           // Face-down 1
    'common-4',           // Face-down 2
    'common-2',           // Face-down 3
    'firewall-recall',    // Top option (6)
    'move-buyout',        // Second option (6)
    'common-5',           // Third option (5)
  ],
  [
    'firewall-recall',    // OWYW (6)
    'common-1',           // Face-down 1
    'common-2',           // Face-down 2
    'common-5',           // Face-down 3
    'move-theft',         // Top option (6)
    'common-5',           // Second option (5)
    'common-4',           // Third option (4)
  ]
);
```

**Expected Flow:**
1. Both play OWYW (6) → DataWar
2. Face-down cards play
3. DataWar face-up: Check which player is face-up (not HT player)
4. **Only face-up player's OWYW triggers**
5. Modal shows or CPU auto-selects depending on who's face-up

**Test:** Only the face-up player's OWYW should be checked

---

## Scenario 4: OWYW + Hostile Takeover DataWar
**Setup:**
```typescript
initializeGame(
  'custom',
  'custom',
  [
    'firewall-open',      // OWYW (6)
    'common-3',           // Face-down 1
    'common-4',           // Face-down 2
    'common-2',           // Face-down 3
    'firewall-recall',    // Top option (6)
    'move-buyout',        // Second option (6)
    'common-5',           // Third option (5)
  ],
  [
    'move-buyout',        // (6) - ties, triggers DataWar
    'common-1',           // Face-down 1
    'common-2',           // Face-down 2
    'common-5',           // Face-down 3
    'common-5',           // Face-up (5)
  ]
);
```
Then set HT flag active for player before playing.

**Expected Flow:**
1. Player plays OWYW + HT active, CPU plays (6) → DataWar
2. **CPU becomes face-up player** (HT player doesn't play face-up)
3. Guard checks CPU's `playedCardsInHand` (no OWYW)
4. No modal, CPU plays face-up card normally

**Test:** HT should correctly determine who plays face-up

---

## Scenario 5: Current Implementation (Nested DataWars)
**Setup:** (Already working)
```typescript
initializeGame(
  'custom',
  'custom',
  [
    'firewall-open',      // OWYW (6)
    'common-3',           // Face-down 1
    'common-4',           // Face-down 2
    'common-2',           // Face-down 3
    'firewall-recall',    // Selected card (6) - ties again
    'move-theft',         // Second option (6)
    'common-5',           // Third option (5)
  ],
  [
    'move-buyout',        // (6) - ties
    'common-1',           // Face-down 1
    'common-2',           // Face-down 2
    'common-5',           // Face-down 3
    'move-tantrum',       // Face-up (6) - ties again
    'common-1',           // Face-down 1
    'common-2',           // Face-down 2
    'common-5',           // Face-down 3
    'common-5',           // Face-up (5)
  ]
);
```

**Expected Flow:**
1. DataWar 1: OWYW modal → Select card (6)
2. Face-up cards play (6 vs 6) → DataWar 2
3. DataWar 2 face-up: Guard sees face-up card in `playedCardsInHand` after OWYW
4. **Modal does NOT show** (already used)
5. Face-up cards play normally

**Test:** Already verified working ✅

---

## Key Checks for All Scenarios

1. **State Cleanup:**
   - `openWhatYouWantActive` cleared after use
   - `preRevealEffects` cleared after use
   - `playedCardsInHand` persists through DataWars (expected behavior)

2. **Guard Logic:**
   - Correctly identifies face-up player (accounting for HT)
   - Detects OWYW in `playedCardsInHand`
   - Checks for face-up cards after OWYW index
   - Returns correct boolean value

3. **Card Playing:**
   - Face-up cards play when OWYW shown
   - Face-up cards play when OWYW skipped
   - Correct players play (respecting HT rules)
