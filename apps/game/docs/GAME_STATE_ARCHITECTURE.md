# Data War - Game State Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture Philosophy](#architecture-philosophy)
3. [XState Machine - Game Flow Control](#xstate-machine---game-flow-control)
4. [Zustand Store - Game Data Management](#zustand-store---game-data-management)
5. [How They Work Together](#how-they-work-together)
6. [Complete Game Flow Walkthrough](#complete-game-flow-walkthrough)
7. [Special Effects System](#special-effects-system)
8. [Key Patterns & Best Practices](#key-patterns--best-practices)

---

## Overview

The Data War game uses a **dual-state management architecture** combining:

- **XState (State Machine)**: Controls **when** things happen - game flow, phases, and transitions
- **Zustand (State Store)**: Controls **what** data exists - cards, players, scores, UI state

This separation provides clear boundaries: XState ensures we can't enter invalid states, while Zustand efficiently manages and updates game data.

---

## Architecture Philosophy

### Why Two State Management Systems?

**The Problem:**
- The game has **12+ distinct phases** with complex transitions
- Each phase has specific allowed actions and transitions
- Special effects queue and trigger at specific times
- Animations must coordinate with game logic
- Multiple win conditions need to be checked at precise moments

**The Solution:**

```
┌─────────────────────────────────────────────────────────┐
│                     USER ACTION                         │
│                  (e.g., TAP_DECK)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   XSTATE MACHINE      │ ◄── Controls WHEN
         │   (Game Flow)         │     - Phase transitions
         │                       │     - Valid actions
         │   Current Phase:      │     - Animation timing
         │   • welcome           │
         │   • revealing         │
         │   • comparing         │
         │   • resolving         │
         │   • game_over         │
         └───────┬───────────────┘
                 │
                 │ Triggers actions
                 ▼
         ┌───────────────────────┐
         │   ZUSTAND STORE       │ ◄── Controls WHAT
         │   (Game Data)         │     - Player data
         │                       │     - Card data
         │   State:              │     - UI state
         │   • player.deck       │     - Effects queue
         │   • cpu.deck          │
         │   • cardsInPlay       │
         │   • winner            │
         └───────────────────────┘
```

**Benefits:**
1. **Impossible states eliminated** - Can't resolve a turn before revealing cards
2. **Clear debugging** - XState Inspector shows exact flow, Redux DevTools shows data changes
3. **Easy testing** - Test flow and data independently
4. **Maintainable** - Each system has a single responsibility

---

## XState Machine - Game Flow Control

### Location
`apps/game/src/machines/game-flow-machine.ts`

### Purpose
The XState machine is a **state machine** that defines all possible game phases and the allowed transitions between them. Think of it as a **traffic controller** - it determines which roads (transitions) are available from each intersection (state).

### Context (Machine-Owned Data)

```typescript
interface GameFlowContext {
  currentTurn: number;              // Turn counter
  trackerSmackerActive: 'player' | 'cpu' | null;  // Who has Tracker Smacker active
  tooltipMessage: string;           // Current tooltip text
}
```

**Note:** The machine only stores data needed for flow control. All game data lives in Zustand.

### States (Game Phases)

The machine defines **13 primary states**:

#### 1. Setup & Intro States

```typescript
welcome              // Welcome screen
  ├─ START_GAME → select_billionaire
  └─ SKIP_TO_GAME → ready

select_billionaire   // Character selection
  └─ SELECT_BILLIONAIRE → select_background

select_background    // Background selection
  └─ SELECT_BACKGROUND → intro

intro                // Intro screen with guide option
  ├─ SHOW_GUIDE → quick_start_guide
  └─ SKIP_INSTRUCTIONS → vs_animation

quick_start_guide    // Quick launch guide
  ├─ SHOW_MISSION → your_mission
  └─ SKIP_GUIDE → your_mission

your_mission         // Mission briefing
  └─ START_PLAYING → vs_animation

vs_animation         // VS battle animation
  ├─ VS_ANIMATION_COMPLETE → ready
  └─ after 2000ms → ready  // Auto-transition
```

**Key Pattern:** Setup states use **entry actions** to set tooltip messages that guide the user.

#### 2. Gameplay States

```typescript
ready                // Ready to play (tap deck prompt)
  └─ REVEAL_CARDS → revealing

revealing            // Cards being flipped
  └─ CARDS_REVEALED → comparing

comparing            // Determining winner
  ├─ TIE → data_war
  ├─ SPECIAL_EFFECT → special_effect
  └─ RESOLVE_TURN → resolving

resolving            // Winner collecting cards
  └─ CHECK_WIN_CONDITION → [game_over | pre_reveal | ready]
     ├─ if hasWinCondition → game_over
     └─ else → pre_reveal

pre_reveal           // Pre-reveal effects processing (OWYW)
  └─ PRE_REVEAL_COMPLETE → ready

game_over            // Final state (victory screen)
  [type: 'final']
```

#### 3. Nested States (Compound States)

**Data War State** (handles tie scenarios):
```typescript
data_war
  ├─ animating            // "DATA WAR!" animation
  │   └─ after 2000ms → reveal_face_down
  │
  ├─ reveal_face_down     // Prompt to tap for 3 cards
  │   └─ TAP_DECK → reveal_face_up
  │
  └─ reveal_face_up       // Prompt to tap for final card
      └─ TAP_DECK → #dataWarGame.comparing
         (increments currentTurn)
```

**Special Effect State**:
```typescript
special_effect
  ├─ showing              // Display effect modal
  │   └─ DISMISS_EFFECT → processing
  │
  └─ processing           // Apply effect logic
      └─ after 500ms → #dataWarGame.resolving
```

**Pre-Reveal State** (handles effects before next card reveal):
```typescript
pre_reveal
  ├─ processing           // Process non-interactive effects
  │   └─ after 1200ms → [animating | #dataWarGame.ready]
  │       ├─ if hasPreRevealEffects → animating
  │       └─ else → #dataWarGame.ready
  │
  ├─ animating            // OWYW animation plays
  │   └─ after 2000ms → awaiting_interaction
  │
  ├─ awaiting_interaction // Wait for user to tap deck
  │   └─ TAP_DECK → selecting
  │
  └─ selecting            // User selecting card from modal
      └─ CARD_SELECTED → #dataWarGame.revealing
```

**Key Pattern:** Nested states use `#machineId.state` for absolute targeting.

### Events (Transitions)

```typescript
type GameFlowEvent =
  // Setup Events
  | { type: 'START_GAME' }
  | { type: 'SKIP_TO_GAME' }
  | { type: 'SELECT_BILLIONAIRE'; billionaire: string }
  | { type: 'SELECT_BACKGROUND'; background: string }
  | { type: 'SHOW_GUIDE' }
  | { type: 'SKIP_INSTRUCTIONS' }
  | { type: 'SHOW_MISSION' }
  | { type: 'START_PLAYING' }
  | { type: 'SKIP_GUIDE' }
  | { type: 'VS_ANIMATION_COMPLETE' }

  // Gameplay Events
  | { type: 'REVEAL_CARDS' }
  | { type: 'CARDS_REVEALED' }
  | { type: 'TIE' }
  | { type: 'NO_TIE' }
  | { type: 'SPECIAL_EFFECT' }
  | { type: 'NO_SPECIAL_EFFECT' }
  | { type: 'RESOLVE_TURN' }
  | { type: 'TAP_DECK' }
  | { type: 'DISMISS_EFFECT' }
  | { type: 'CHECK_WIN_CONDITION' }
  | { type: 'WIN' }
  | { type: 'CONTINUE' }

  // Pre-reveal Events
  | { type: 'START_OWYW_ANIMATION' }
  | { type: 'CARD_SELECTED' }
  | { type: 'PRE_REVEAL_COMPLETE' }

  // Global Events
  | { type: 'RESET_GAME' }
  | { type: 'QUIT_GAME' };
```

**Event Categories:**
- **Non-Gameplay Events**: Setup and intro (before actual card play)
- **Gameplay Events**: Turn resolution and card effects
- **Global Events**: Available from any state (RESET_GAME, QUIT_GAME)

### Guards (Conditional Transitions)

```typescript
guards: {
  hasWinCondition: () => {
    // Check Zustand store for win condition
    const state = useGameStore.getState();
    return state.winner !== null && state.winCondition !== null;
  },
  isDataWar: () => {
    // Check if current turn is a tie (Data War)
    const state = useGameStore.getState();
    return state.checkForDataWar();
  },
  hasSpecialEffects: () => {
    // Check if there are pending special effects to show
    const state = useGameStore.getState();
    return state.pendingEffects.length > 0;
  },
  hasPreRevealEffects: () => {
    // Check if there are pre-reveal effects to process (like OWYW)
    const state = useGameStore.getState();
    return state.hasPreRevealEffects();
  }
}
```

**Usage in State:**
```typescript
resolving: {
  on: {
    CHECK_WIN_CONDITION: [
      {
        target: 'game_over',
        guard: 'hasWinCondition',  // If true, go to game_over
      },
      {
        target: 'ready',            // Otherwise, continue playing
      },
    ],
  },
}
```

**Key Pattern:** Guards check Zustand store state to make flow decisions.

### Delayed Transitions (Animation Timing)

**Animation Timing Constants** (`apps/game/src/config/animation-timings.ts`):
```typescript
export const ANIMATION_DURATIONS = {
  CARD_FLIP: 1000,
  CARD_COMPARISON: 1500,
  WIN_ANIMATION: 1200,
  OWYW_ANIMATION: 2000,
  SPECIAL_EFFECT_DISPLAY: 2000,
  DATA_WAR_REVEAL: 1000,
} as const;
```

**Usage in State Machine:**
```typescript
import { ANIMATION_DURATIONS } from '../config/animation-timings';

vs_animation: {
  after: {
    [ANIMATION_DURATIONS.SPECIAL_EFFECT_DISPLAY]: 'ready',
  },
}

comparing: {
  after: {
    [ANIMATION_DURATIONS.CARD_COMPARISON]: [
      { target: 'data_war', guard: 'isDataWar' },
      { target: 'special_effect', guard: 'hasSpecialEffects' },
      { target: 'resolving' },
    ],
  },
}

pre_reveal: {
  states: {
    processing: {
      after: {
        [ANIMATION_DURATIONS.WIN_ANIMATION]: [
          { target: 'animating', guard: 'hasPreRevealEffects' },
          { target: '#dataWarGame.ready' },
        ],
      },
    },
    animating: {
      after: {
        [ANIMATION_DURATIONS.OWYW_ANIMATION]: 'awaiting_interaction',
      },
    },
  },
}
```

**Key Pattern:** `after` is perfect for animation sequences that auto-advance. Centralized constants make timing tweaks easy and consistent.

### Global Transitions

```typescript
on: {
  RESET_GAME: {
    target: '.welcome',  // Go back to welcome (relative target)
    actions: assign({
      currentTurn: 0,
      trackerSmackerActive: null,
      tooltipMessage: '',
    }),
  },
  QUIT_GAME: {
    target: '.welcome',
  },
}
```

**Key Pattern:** Global transitions are available from any state.

---

## Zustand Store - Game Data Management

### Location
`apps/game/src/stores/game-store.ts`

### Purpose
Zustand is a **lightweight state management library** that holds all game data. It provides:
- Fast, selective updates (only re-render components that use changed data)
- [DevTools](https://chromewebstore.google.com/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) integration for debugging
- Simple API without boilerplate
- Outside-React access (important for XState integration)

### Store Structure

```typescript
interface GameStore {
  // === PLAYER STATE ===
  player: Player;
  cpu: Player;

  // === GAME STATE ===
  cardsInPlay: Card[];
  activePlayer: 'player' | 'cpu';
  anotherPlayMode: boolean;        // True when only activePlayer plays (trackers/blockers)
  pendingEffects: SpecialEffect[];
  preRevealEffects: PreRevealEffect[]; // Queue of effects to process before reveal
  preRevealProcessed: boolean;     // Flag to prevent duplicate pre-reveal processing
  trackerSmackerActive: 'player' | 'cpu' | null;
  winner: 'player' | 'cpu' | null;
  winCondition: 'all_cards' | 'launch_stacks' | null;

  // === OPEN WHAT YOU WANT STATE ===
  openWhatYouWantActive: 'player' | 'cpu' | null;
  openWhatYouWantCards: Card[];
  showOpenWhatYouWantModal: boolean;
  showOpenWhatYouWantAnimation: boolean;

  // === TEMPER TANTRUM CARD SELECTION STATE ===
  showTemperTantrumModal: boolean;        // Show modal for player card selection
  temperTantrumAvailableCards: Card[];    // Cards player can choose from (winner's cards only)
  temperTantrumSelectedCards: Card[];     // Cards player has selected (max 2)
  temperTantrumMaxSelections: number;     // Always 2 (or less if fewer cards available)
  temperTantrumWinner: 'player' | 'cpu' | null; // Who won the turn (to return remaining cards)
  temperTantrumLoserCards: Card[];        // Loser's cards (stored to preserve for distribution)

  // === COLLECTION ANIMATION STATE ===
  showingWinEffect: 'player' | 'cpu' | null;  // Show win effect (billionaire celebration)
  collecting: { winner: PlayerType; cards: Card[] } | null; // Card collection animation

  // === UI STATE ===
  selectedBillionaire: string;
  selectedBackground: string;
  isPaused: boolean;
  showMenu: boolean;
  showHandViewer: boolean;
  handViewerPlayer: 'player' | 'cpu';
  showInstructions: boolean;
  audioEnabled: boolean;
  showTooltip: boolean;

  // === ACTIONS ===
  // ... (40+ action methods)
}
```

### Player Entity

```typescript
interface Player {
  id: 'player' | 'cpu';
  name: string;
  deck: Card[];                    // Cards in possession
  playedCard: Card | null;         // Currently played card
  playedCardsInHand: Card[];       // Stack of cards played this turn
  currentTurnValue: number;        // Turn value (base + modifiers)
  launchStackCount: number;        // Number of launch stacks collected
  billionaireCharacter?: string;   // Selected character (player only)
}
```

### Key Actions (Grouped by Responsibility)

#### 1. Game Initialization

```typescript
initializeGame: (playerStrategy?, cpuStrategy?) => void
```
- Creates shuffled decks for both players
- Resets all game state
- Uses `deck-builder` utility to create card decks

**Implementation:**
```typescript
initializeGame: (playerStrategy = 'random', cpuStrategy = 'random') => {
  const { playerDeck, cpuDeck } = initializeGameDeck(
    DEFAULT_GAME_CONFIG,
    playerStrategy,
    cpuStrategy,
    false,
  );
  set({
    player: { ...createInitialPlayer('player'), deck: playerDeck },
    cpu: { ...createInitialPlayer('cpu'), deck: cpuDeck },
    cardsInPlay: [],
    winner: null,
    // ... reset all state
  });
}
```

#### 2. Card Play Actions

```typescript
playCard: (playerId: 'player' | 'cpu') => void
```

**What it does:**
1. Takes top card from player's deck
2. Sets it as `playedCard`
3. Adds it to `playedCardsInHand` stack
4. Updates `currentTurnValue` (normal vs "another play" mode)
5. Adds card to `cardsInPlay`

**Key Logic:**
```typescript
// In "another play" mode, ADD to existing value
// In normal mode, SET the value
const newTurnValue = get().anotherPlayMode
  ? playerState.currentTurnValue + card.value
  : card.value;
```

**Another Play Mode:**
- When trackers/blockers/launch stacks are played
- The same player plays again, and values accumulate
- Example: Play Tracker (value 2) → anotherPlayMode = true → Play Common-3 → Total = 2 + 3 = 5

#### 3. Card Collection Actions

```typescript
collectCards: (winnerId: 'player' | 'cpu', cards: Card[]) => void
```

**What it does:**
Three-stage collection animation:
1. **Stage 1**: Show win effect (billionaire celebration) - sets `showingWinEffect`
2. **Stage 2**: Start card collection animation (cards fly to deck) - sets `collecting`
3. **Stage 3**: Add cards to deck and clear all states

**Timing:**
- Win effect duration: 1200ms
- Card collection duration: 1200ms
- Total: 2400ms

**Key Pattern:**
- Won cards go to the bottom of the deck (traditional War rules)
- Separated `showingWinEffect` from `collecting` to prevent simultaneous animations
- Three-stage process ensures win effect plays completely before card collection

#### 4. Turn Resolution Actions

```typescript
resolveTurn: () => 'player' | 'cpu' | 'tie'
```

**What it does:**
1. Compares `currentTurnValue` for both players
2. Returns winner WITHOUT collecting cards yet
3. Cards are collected later after processing pending effects

**Related:**
```typescript
collectCardsAfterEffects: (winner: 'player' | 'cpu' | 'tie') => void
```
- Called after `processPendingEffects()`
- Actually transfers cards to winner

**Key Pattern:** Two-phase resolution allows special effects to modify the outcome.

#### 5. Special Effect Actions

**Effect Handling:**
```typescript
handleCardEffect: (card: Card, playedBy: 'player' | 'cpu') => void
```

**What it does:**
1. Checks if card is special
2. Creates `SpecialEffect` object
3. Categorizes as instant or queued:
   - **Instant**: `forced_empathy`, `tracker_smacker`, `hostile_takeover`
   - **Queued**: All others (trackers, blockers, steal cards, etc.)
4. Applies effect immediately (instant) or adds to `pendingEffects` (queued)

**Effect Queue Management:**
```typescript
addPendingEffect: (effect: SpecialEffect) => void
processPendingEffects: (winner: 'player' | 'cpu' | 'tie') => void
clearPendingEffects: () => void

// Pre-reveal effects (processed before next card reveal)
addPreRevealEffect: (effect: PreRevealEffect) => void
clearPreRevealEffects: () => void
hasPreRevealEffects: () => boolean
setPreRevealProcessed: (processed: boolean) => void
```

**PreRevealEffect Type:**
```typescript
interface PreRevealEffect {
  type: 'owyw';  // Can add more types in future (e.g., 'forced_empathy_animation')
  playerId: 'player' | 'cpu';
  requiresInteraction: boolean;  // If true, waits for user to tap deck
  data?: unknown;  // Optional data for the effect
}
```

**Processing Order:**
- Effects are processed in play order (player card first, then CPU, or vice versa)
- Each effect checks if blocked by Tracker Smacker
- Effects can modify cards in play before collection

#### 6. Tracker & Blocker Effects

```typescript
applyTrackerEffect: (playerId: 'player' | 'cpu', trackerCard: Card) => void
```
- Checks if blocked by Tracker Smacker
- Adds tracker value to player's `currentTurnValue`

```typescript
applyBlockerEffect: (playerId: 'player' | 'cpu', blockerCard: Card) => void
```
- Checks if blocked by Tracker Smacker
- Subtracts blocker value from **opponent's** `currentTurnValue`
- Blocker cards themselves have 0 value

#### 7. Win Condition Checking

```typescript
checkWinCondition: () => boolean
```

**Checks:**
1. **All Cards**: One player has no cards left
2. **Launch Stacks**: One player has 3+ launch stacks

**Returns:** `true` if game should end, `false` otherwise

**Side Effects:** Updates `winner` and `winCondition` state

#### 8. Special Card-Specific Actions

**Deck Manipulation:**
```typescript
swapDecks: () => void                    // Forced Empathy
stealCards: (from, to, count) => void    // Leveraged Buyout
reorderTopCards: (playerId, cards) => void  // Open What You Want
```

**Launch Stacks:**
```typescript
addLaunchStack: (playerId: 'player' | 'cpu') => void
stealLaunchStack: (from, to) => void     // Patent Theft
removeLaunchStacks: (playerId, count) => void  // Mandatory Recall
```

**Tracker Smacker:**
```typescript
setTrackerSmackerActive: (playerId: 'player' | 'cpu' | null) => void
```
- Blocks opponent's trackers, blockers, and certain special effects
- Active for the entire turn (could span multiple hands)

#### 9. Open What You Want (OWYW) Actions

```typescript
setOpenWhatYouWantActive: (playerId: 'player' | 'cpu' | null) => void
prepareOpenWhatYouWantCards: (playerId: 'player' | 'cpu') => void
playSelectedCardFromOWYW: (selectedCard: Card) => void
setShowOpenWhatYouWantModal: (show: boolean) => void
setShowOpenWhatYouWantAnimation: (show: boolean) => void
```

**Flow:**
1. When OWYW effect is processed → `setOpenWhatYouWantActive(playerId)`
2. On player's next turn → `prepareOpenWhatYouWantCards()` (get top 3)
3. Show modal with 3 cards
4. Player selects card → `playSelectedCardFromOWYW()`
   - Selected card moves to top of deck
   - Unselected cards shuffled and added to bottom
   - Automatically plays the selected card

#### 10. Temper Tantrum Card Selection Actions

```typescript
initializeTemperTantrumSelection: (winner: 'player' | 'cpu') => void
selectTemperTantrumCard: (card: Card) => void
confirmTemperTantrumSelection: () => void
setShowTemperTantrumModal: (show: boolean) => void
```

**Flow:**
1. **When player loses with Temper Tantrum**:
   - `initializeTemperTantrumSelection(winner)` is called
   - Stores winner's cards in `temperTantrumAvailableCards` (shown in modal)
   - Stores loser's cards in `temperTantrumLoserCards` (preserved for distribution)
   - Sets `blockTransitions: true` to pause game
   - Opens modal showing only winner's cards

2. **Player selects cards**:
   - `selectTemperTantrumCard(card)` toggles selection
   - Can select up to `temperTantrumMaxSelections` (2 or less)
   - Selected cards stored in `temperTantrumSelectedCards`
   - Visual feedback: selected cards scale up (scale-100 vs scale-[0.8] for unselected)

3. **Player confirms selection**:
   - `confirmTemperTantrumSelection()` is called
   - Closes modal and triggers collection animation
   - After animation completes (1200ms):
     - **Loser (player) gets**: ONLY stolen cards (doesn't keep their own cards)
     - **Winner gets**: remaining cards + loser's cards
   - Resets turn values and active effects
   - Sets `blockTransitions: false` to resume game

**Card Distribution Logic:**
```typescript
// Example: Player played 1 card, CPU played 3 cards, player loses
// Player steals 2 from CPU's 3 cards

// Loser gets: 2 stolen cards (selected in modal)
playerDeck += stolenCards  // +2 cards

// Winner gets: 1 remaining card + 1 loser's card
cpuDeck += (winnerCards - stolenCards) + loserCards  // +1 + 1 = +2 cards
```

**Key Features:**
- **Modal-based selection** for player (interactive)
- **Automatic selection** for CPU (first 2 cards)
- **Preserved card state**: Loser's cards stored before modal opens
- **Proper distribution**: Loser only gets stolen cards, winner gets everything else
- **Animation flow**: Collection animation shows cards flying to both players' decks
- **State cleanup**: Clears all Temper Tantrum state after distribution

#### 11. UI Actions

```typescript
selectBillionaire: (billionaire: string) => void
selectBackground: (background: string) => void
togglePause: () => void
toggleMenu: () => void
toggleHandViewer: (player?: 'player' | 'cpu') => void
toggleAudio: () => void
toggleInstructions: () => void
setShowTooltip: (show: boolean) => void
resetGame: (playerStrategy?, cpuStrategy?) => void
```

**Key Pattern:** UI actions often have side effects:
- `toggleMenu()` also pauses the game
- `selectBillionaire()` updates both UI state and player character

### Selector Hooks (Performance Optimization)

```typescript
export const usePlayer = () => useGameStore((state) => state.player);
export const useCPU = () => useGameStore((state) => state.cpu);
export const useCardsInPlay = () => useGameStore((state) => state.cardsInPlay);
export const useWinner = () => useGameStore((state) => state.winner);
export const useUIState = () => useGameStore((state) => ({
  isPaused: state.isPaused,
  showMenu: state.showMenu,
  // ...
}));
export const useOpenWhatYouWantState = () => useGameStore(
  useShallow((state) => ({
    isActive: state.openWhatYouWantActive,
    cards: state.openWhatYouWantCards,
    // ...
  }))
);
```

**Key Pattern:** Selector hooks prevent unnecessary re-renders by only subscribing to specific slices of state.

---

## How They Work Together

### Integration Pattern

**XState triggers Zustand actions:**
```typescript
// XState machine configuration
const gameFlowMachine = createMachine({
  // ...
  guards: {
    hasWinCondition: () => {
      const state = useGameStore.getState();
      return state.winner !== null && state.winCondition !== null;
    },
  },
});
```

**Components read from both:**
```typescript
function GameBoard() {
  const [state, send] = useMachine(gameFlowMachine);  // XState
  const { player, cpu } = useGameStore();              // Zustand

  // UI based on XState phase
  if (state.matches('ready')) {
    return <TapDeckPrompt onClick={() => send('REVEAL_CARDS')} />;
  }

  // Data from Zustand
  return <CardDisplay cards={player.playedCardsInHand} />;
}
```

### Data Flow Diagram

```
USER CLICKS DECK
       │
       ▼
  send('REVEAL_CARDS')
       │
       ▼
┌──────────────────┐
│  XState Machine  │
│  ready → revealing│
└────────┬─────────┘
         │
         ▼
  useGameLogic hook detects state change
         │
         ▼
  useGameStore.getState().playCard('player')
  useGameStore.getState().playCard('cpu')
         │
         ▼
┌──────────────────┐
│  Zustand Store   │
│  Updates:        │
│  - player.playedCard
│  - cpu.playedCard
│  - cardsInPlay  │
└────────┬─────────┘
         │
         ▼
  Components re-render with new data
         │
         ▼
  After animation delay
         │
         ▼
  send('CARDS_REVEALED')
         │
         ▼
┌──────────────────┐
│  XState Machine  │
│  revealing → comparing│
└──────────────────┘
```

### Example: Complete Turn Sequence

**1. Ready Phase**
```typescript
// XState: state.matches('ready')
// Zustand: player.playedCard = null, cpu.playedCard = null
// UI: Shows "Tap deck to play" prompt
```

**2. User Taps Deck**
```typescript
send('REVEAL_CARDS')
// XState transitions: ready → revealing
```

**3. Revealing Phase**
```typescript
// use-game-logic.ts detects state change
useEffect(() => {
  if (state.matches('revealing')) {
    // Play both cards
    playCard('player');
    playCard('cpu');

    // Wait for animations
    setTimeout(() => {
      send('CARDS_REVEALED');
    }, 1000);
  }
}, [state.value]);
```

**4. Comparing Phase**
```typescript
// use-game-logic.ts handles comparison logic
useEffect(() => {
  if (state.matches('comparing')) {
    // Check for tie
    if (checkForDataWar()) {
      send('TIE');
      return;
    }

    // Check for special effects
    const hasSpecialEffects = /* ... */;
    if (hasSpecialEffects) {
      send('SPECIAL_EFFECT');
      return;
    }

    // Normal resolution
    send('RESOLVE_TURN');
  }
}, [state.value]);
```

**5. Resolving Phase**
```typescript
// use-game-logic.ts handles turn resolution
useEffect(() => {
  if (state.matches('resolving')) {
    // Determine winner
    const winner = resolveTurn();

    // Process special effects
    processPendingEffects(winner);

    // Collect cards
    collectCardsAfterEffects(winner);

    // Check win condition
    send('CHECK_WIN_CONDITION');
  }
}, [state.value]);
```

**6. Win Check**
```typescript
// XState guard evaluates
guards: {
  hasWinCondition: () => {
    return useGameStore.getState().winner !== null;
  }
}

// If true → game_over
// If false → ready (next turn)
```

---

## Complete Game Flow Walkthrough

### Phase-by-Phase Flow

```
┌──────────────┐
│   welcome    │  Tooltip: "Welcome to Data War!"
└──────┬───────┘
       │ START_GAME
       ▼
┌──────────────────────┐
│ select_billionaire   │  Tooltip: "Whose little face is going to space?"
└──────┬───────────────┘
       │ SELECT_BILLIONAIRE
       │ (also updates Zustand: selectedBillionaire, player.billionaireCharacter)
       ▼
┌──────────────────────┐
│ select_background    │  Tooltip: "Which one do you want to play on?"
└──────┬───────────────┘
       │ SELECT_BACKGROUND
       │ (updates Zustand: selectedBackground)
       ▼
┌──────────────┐
│    intro     │  Tooltip: "How do I play?"
└──────┬───────┘
       │ SHOW_GUIDE or SKIP_INSTRUCTIONS
       ▼
┌──────────────────────┐
│ quick_start_guide    │  Tooltip: "Quick Launch Guide"
└──────┬───────────────┘
       │ SHOW_MISSION or SKIP_GUIDE
       ▼
┌──────────────────┐
│  your_mission    │  Tooltip: "Your mission: (should you choose to accept it)"
└──────┬───────────┘
       │ START_PLAYING
       ▼
┌──────────────────┐
│  vs_animation    │  Tooltip: "Get ready for battle!"
└──────┬───────────┘  Auto-transition after 2s
       │
       ▼
┌──────────────────┐
│      ready       │  Tooltip: "Tap stack to start!"
└──────┬───────────┘
       │ REVEAL_CARDS
       ▼
┌──────────────────┐
│    revealing     │  Cards flip face-up
└──────┬───────────┘  Auto after animations
       │ CARDS_REVEALED
       ▼
┌──────────────────┐
│    comparing     │  Determine winner
└──────┬───────────┘
       │
       ├─────► TIE ──────► data_war (nested state)
       │                     │
       ├─────► SPECIAL_EFFECT ──► special_effect (nested state)
       │                     │
       └─────► RESOLVE_TURN ──► resolving
                              │
                              ▼
                        CHECK_WIN_CONDITION
                              │
                              ├─► hasWinCondition = true ──► game_over (final)
                              │
                              └─► hasWinCondition = false ──► pre_reveal (check for pre-reveal effects)
                                                                │
                                                                ├─► hasPreRevealEffects = true ──► pre_reveal flow
                                                                │   (animation → interaction → selection)
                                                                │
                                                                └─► hasPreRevealEffects = false ──► ready (next turn)
```

### Data War (Nested State)

```
data_war
  │
  ├─► animating         Tooltip: "DATA WAR!"
  │      │              Show animation for 2 seconds
  │      ▼ (after 2000ms)
  │
  ├─► reveal_face_down  Tooltip: "Tap to reveal 3 cards face down"
  │      │              User action required
  │      ▼ TAP_DECK
  │      │ (Zustand: play 3 cards face-down for each player)
  │
  └─► reveal_face_up    Tooltip: "Tap to reveal final card"
         │              User action required
         ▼ TAP_DECK
         │ (Zustand: play 1 card face-up for each player)
         │ (Increment currentTurn)
         │
         ▼
    Exit to comparing (absolute target: #dataWarGame.comparing)
```

### Special Effect (Nested State)

```
special_effect
  │
  ├─► showing          Tooltip: "Special card effect!"
  │      │             Display effect modal/animation
  │      ▼ DISMISS_EFFECT
  │
  └─► processing       Apply effect logic
         │             Wait 500ms for transitions
         ▼ (after 500ms)
         │
    Exit to resolving (absolute target: #dataWarGame.resolving)
```

### Pre-Reveal (Nested State)

```
pre_reveal
  │
  ├─► processing       Tooltip: "" (cleared)
  │      │             Check for pre-reveal effects
  │      │             Wait 1200ms for win animation to complete
  │      ▼ (after 1200ms)
  │      │
  │      ├─► hasPreRevealEffects = true ──► animating
  │      └─► hasPreRevealEffects = false ──► Exit to ready
  │
  ├─► animating        Tooltip: ""
  │      │             OWYW animation plays
  │      │             Wait 2000ms
  │      ▼ (after 2000ms)
  │      │
  │      └─► awaiting_interaction
  │
  ├─► awaiting_interaction  Tooltip: "Tap to see top 3 cards"
  │      │                  User action required (player only)
  │      ▼ TAP_DECK
  │      │ (Show OWYW modal with top 3 cards)
  │      │
  │      └─► selecting
  │
  └─► selecting        Tooltip: ""
         │             Player selects card from modal
         ▼ CARD_SELECTED
         │ (Selected card moves to top of deck)
         │ (Clear preRevealEffects and preRevealProcessed flag)
         │
    Exit to revealing (absolute target: #dataWarGame.revealing)
    (The selected card will be played automatically)
```

**Note:** For CPU, the OWYW flow is non-interactive and completes instantly:
- Auto-selects random card from top 3
- Clears effects immediately
- Transitions directly to ready (no animation or modal)

---

## Special Effects System

### Effect Categories

**1. Instant Effects** (trigger immediately, don't queue)
- `forced_empathy` - Swap decks
- `tracker_smacker` - Block opponent effects for turn
- `hostile_takeover` - Instant war (ignores trackers/blockers)

**2. Queued Effects** (processed after hand resolution)
- Trackers - Play again + add value
- Blockers - Play again + subtract from opponent
- `open_what_you_want` - Reorder top 3 cards on next turn
- `mandatory_recall` - Opponent shuffles launch stacks back
- `temper_tantrum` - If lose, steal up to 2 cards from winner's pile (modal selection for player)
- `patent_theft` - If win, steal 1 launch stack
- `leveraged_buyout` - If win, steal 2 cards from opponent deck
- `data_grab` - Randomly distribute cards in play
- `launch_stack` - Collect launch stack (win condition)

### Effect Processing Flow

```typescript
// 1. Card is played
handleCardEffect(card, playedBy)
  │
  ├─► Is instant?
  │     ├─► Yes: Apply immediately (swapDecks, setTrackerSmackerActive)
  │     └─► No: addPendingEffect({ type, playedBy, card, isInstant: false })
  │
  └─► Continue turn resolution

// 2. After winner is determined
resolveTurn() → returns winner

// 3. Process pending effects (in play order)
processPendingEffects(winner)
  │
  └─► For each effect in pendingEffects:
        │
        ├─► Check if blocked by Tracker Smacker
        │     └─► If blocked: skip this effect
        │
        └─► Apply effect based on type:
              ├─► open_what_you_want: setOpenWhatYouWantActive(playedBy)
              ├─► mandatory_recall: if winner === playedBy, removeLaunchStacks(opponent)
              ├─► temper_tantrum: See Temper Tantrum Flow below
              ├─► patent_theft: if winner === playedBy, stealLaunchStack()
              ├─► leveraged_buyout: if winner === playedBy, stealCards(opponent, 2)
              └─► data_grab: randomly split cardsInPlay between both players

// 4. Collect cards after effects
collectCardsAfterEffects(winner)
  │
  ├─► Skip if showTemperTantrumModal is true (cards distributed in modal flow)
  └─► collectCards(winner, cardsInPlay)
```

### Temper Tantrum Processing Flow

**Trigger Condition:** Player who played Temper Tantrum LOSES the turn

```typescript
processPendingEffects(winner)
  │
  └─► case 'temper_tantrum':
        │
        ├─► If winner === effect.playedBy: No effect (tantrum player won)
        │
        └─► If winner !== effect.playedBy: Effect triggers
              │
              ├─► If loser === 'player': INTERACTIVE FLOW
              │     │
              │     ├─► initializeTemperTantrumSelection(winner)
              │     │     ├─► Extract winner's cards from playedCardsInHand
              │     │     ├─► Extract loser's cards from playedCardsInHand
              │     │     ├─► Store winner's cards in temperTantrumAvailableCards
              │     │     ├─► Store loser's cards in temperTantrumLoserCards
              │     │     ├─► Set maxSelections = min(2, winnerCards.length)
              │     │     ├─► Set temperTantrumWinner = winner
              │     │     ├─► Set blockTransitions = true (pause game)
              │     │     └─► Set showTemperTantrumModal = true
              │     │
              │     ├─► Modal displays winner's cards (CardCarousel)
              │     │     ├─► Player scrolls: highlights card (onCardSelect)
              │     │     ├─► Player taps: toggles selection (onCardClick)
              │     │     ├─► Selected cards: scale-100 (normal size)
              │     │     ├─► Unselected cards: scale-[0.8] (80% size)
              │     │     └─► Button enabled when exactly maxSelections cards selected
              │     │
              │     ├─► Player confirms: confirmTemperTantrumSelection()
              │     │     ├─► Close modal
              │     │     ├─► Set collecting state (triggers animation)
              │     │     └─► After CARD_COLLECTION duration (1200ms):
              │     │           ├─► Loser gets: stolenCards ONLY
              │     │           ├─► Winner gets: remainingCards + loserCards
              │     │           ├─► Clear playedCardsInHand for both players
              │     │           ├─► Reset currentTurnValue to 0
              │     │           ├─► Clear activeEffects
              │     │           ├─► Clear showEffectNotificationBadge
              │     │           ├─► Set cardsInPlay = []
              │     │           └─► Set blockTransitions = false
              │     │
              │     └─► collectCardsAfterEffects skipped (modal handles distribution)
              │
              └─► If loser === 'cpu': AUTOMATIC FLOW
                    ├─► Extract playerCards from playedCardsInHand (winner's cards)
                    ├─► Extract cpuCards from playedCardsInHand (loser's cards)
                    ├─► Steal first 2 cards from playerCards
                    ├─► CPU (loser) gets: stolenCards ONLY
                    ├─► Player (winner) gets: remainingPlayerCards + cpuCards
                    ├─► Clear playedCardsInHand for both players
                    └─► Set cardsInPlay = []
```

**Key Implementation Details:**
- **Card preservation**: Winner's and loser's cards stored BEFORE modal opens (playedCardsInHand may be cleared during animation)
- **Distribution math**: Total cards distributed = cards in play (loser gets some, winner gets rest)
- **Animation timing**: Collection animation runs AFTER modal closes, uses standard CARD_COLLECTION duration
- **State blocking**: `blockTransitions` prevents normal game flow until selection complete
- **Proper cleanup**: Resets all turn-specific state (values, effects, badges) after distribution
```

### Tracker Smacker Blocking

```typescript
// Checks if effect should be blocked
isEffectBlocked(trackerSmackerActive, effectPlayedBy)
  │
  └─► Returns true if:
        - trackerSmackerActive !== null
        - trackerSmackerActive !== effectPlayedBy
        (i.e., opponent has Tracker Smacker active)

// Effects that can be blocked:
- tracker
- blocker
- leveraged_buyout
- patent_theft
- temper_tantrum
```

### Open What You Want Flow

```typescript
// 1. OWYW effect is queued during turn resolution
processPendingEffects(winner)
  └─► case 'open_what_you_want':
        ├─► setOpenWhatYouWantActive(playedBy)
        └─► addPreRevealEffect({
              type: 'owyw',
              playerId: playedBy,
              requiresInteraction: playedBy === 'player',  // Only player needs interaction
            })

// 2. After turn completes, machine transitions to pre_reveal.processing
handlePreReveal()
  │
  ├─► Check preRevealProcessed flag (guard against duplicate calls)
  ├─► Get preRevealEffects from store
  │
  └─► For each effect:
        └─► if type === 'owyw':
              ├─► prepareOpenWhatYouWantCards(playerId)
              │     └─► openWhatYouWantCards = player.deck.slice(0, 3)
              │
              ├─► For CPU (non-interactive):
              │     ├─► Auto-select random card from top 3
              │     ├─► playSelectedCardFromOWYW(randomCard)
              │     ├─► setOpenWhatYouWantActive(null)
              │     ├─► clearPreRevealEffects()
              │     └─► send({ type: 'PRE_REVEAL_COMPLETE' }) → ready
              │
              └─► For Player (interactive):
                    ├─► setShowOpenWhatYouWantAnimation(true)
                    ├─► Machine auto-transitions: processing → animating (after 1200ms)
                    ├─► Machine auto-transitions: animating → awaiting_interaction (after 2000ms)
                    ├─► setShowOpenWhatYouWantAnimation(false)
                    └─► Tooltip: "Tap to see top 3 cards"

// 3. Player taps deck (awaiting_interaction → selecting)
send({ type: 'TAP_DECK' })
  └─► setShowOpenWhatYouWantModal(true)
        └─► Modal displays top 3 cards (Swiper carousel)

// 4. Player selects card from modal
playSelectedCardFromOWYW(selectedCard)
  │
  ├─► Remove top 3 from deck
  ├─► Get 2 unselected cards and shuffle them
  ├─► Reorder deck: [selectedCard, ...restOfDeck, ...shuffledUnselected]
  ├─► setOpenWhatYouWantActive(null)
  ├─► clearPreRevealEffects()
  ├─► setShowOpenWhatYouWantModal(false)
  └─► send({ type: 'CARD_SELECTED' }) → revealing
        └─► The selected card (now at top) will be played automatically

// 5. Machine transitions to revealing and plays the selected card
```

**Key Improvements:**
- **Race condition prevention**: `preRevealProcessed` flag ensures `handlePreReveal()` runs once
- **Separate effect queues**: Pre-reveal effects don't interfere with post-reveal effects
- **Proper React patterns**: No direct `getState()` calls in components
- **Centralized timing**: All animation durations use constants from `animation-timings.ts`

### Another Play Mode (Trackers/Blockers/Launch Stacks)

```typescript
// When tracker/blocker/launch stack is played
if (card.triggersAnotherPlay) {
  setAnotherPlayMode(true)
  setActivePlayer(playedBy)  // Same player goes again
}

// Next card played
playCard(playerId)
  │
  └─► If anotherPlayMode:
        currentTurnValue += card.value  // ADD to existing value
      Else:
        currentTurnValue = card.value   // SET new value

// After second card is played
setAnotherPlayMode(false)  // Reset for next turn
```

---

## Key Patterns & Best Practices

### 1. State Machine Patterns

**Entry Actions for Tooltips:**
```typescript
ready: {
  entry: assign({
    tooltipMessage: 'Tap stack to start!',
  }),
}
```

**Delayed Transitions for Animations:**
```typescript
vs_animation: {
  after: {
    2000: 'ready',
  },
}
```

**Nested States for Complex Flows:**
```typescript
data_war: {
  initial: 'animating',
  states: {
    animating: { /* ... */ },
    reveal_face_down: { /* ... */ },
    reveal_face_up: { /* ... */ },
  },
}
```

**Absolute Targets for Exiting Nested States:**
```typescript
reveal_face_up: {
  on: {
    TAP_DECK: {
      target: '#dataWarGame.comparing',  // Exit data_war, go to comparing
    },
  },
}
```

**Guarded Transitions for Conditional Logic:**
```typescript
on: {
  CHECK_WIN_CONDITION: [
    { target: 'game_over', guard: 'hasWinCondition' },
    { target: 'ready' },
  ],
}
```

### 2. Zustand Patterns

**Get State Outside React:**
```typescript
const state = useGameStore.getState();
state.playCard('player');
```

**Selective Subscriptions:**
```typescript
// Only re-renders when player changes
const player = useGameStore((state) => state.player);

// Only re-renders when these specific fields change
const { isPaused, showMenu } = useGameStore((state) => ({
  isPaused: state.isPaused,
  showMenu: state.showMenu,
}));
```

**Shallow Equality for Objects:**
```typescript
import { useShallow } from 'zustand/shallow';

const uiState = useGameStore(
  useShallow((state) => ({
    isPaused: state.isPaused,
    showMenu: state.showMenu,
  }))
);
```

**Derived State in Actions:**
```typescript
checkWinCondition: () => {
  const { player, cpu, winner } = get();

  // Derive win condition from current state
  if (cpu.deck.length === 0 && cpu.playedCard === null) {
    set({ winner: 'player', winCondition: 'all_cards' });
    return true;
  }

  return false;
}
```

### 3. Integration Patterns

**XState Guards Check Zustand:**
```typescript
guards: {
  hasWinCondition: () => {
    const state = useGameStore.getState();
    return state.winner !== null;
  },
}
```

**React Components Use Both:**
```typescript
function GameBoard() {
  const [state, send] = useMachine(gameFlowMachine);
  const { player, cpu } = useGameStore();

  return (
    <>
      <p>Phase: {state.value}</p>
      <p>Player cards: {player.deck.length}</p>
    </>
  );
}
```

**Game Logic Hook Coordinates:**
```typescript
function useGameLogic() {
  const [state, send] = useMachine(gameFlowMachine);

  useEffect(() => {
    if (state.matches('revealing')) {
      const store = useGameStore.getState();
      store.playCard('player');
      store.playCard('cpu');

      setTimeout(() => send('CARDS_REVEALED'), 1000);
    }
  }, [state.value]);
}
```

### 4. Performance Patterns

**Avoid Re-renders with Selectors:**
```typescript
// Bad: Re-renders on ANY state change
const state = useGameStore();

// Good: Only re-renders when player changes
const player = useGameStore((state) => state.player);
```

**Memoize Derived Values:**
```typescript
const turnValueDisplay = useMemo(() => {
  return `${player.currentTurnValue} vs ${cpu.currentTurnValue}`;
}, [player.currentTurnValue, cpu.currentTurnValue]);
```

**Batch Updates:**
```typescript
set({
  player: updatedPlayer,
  cpu: updatedCpu,
  cardsInPlay: newCardsInPlay,
});
// Single re-render instead of three
```

### 5. Debugging Patterns

**XState Inspector:**
```typescript
import { inspect } from '@xstate/inspect';

inspect({ iframe: false });

const [state, send] = useMachine(gameFlowMachine, {
  devTools: true,
});
```

**Zustand DevTools:**
```typescript
export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({ /* ... */ }),
    { name: 'DataWarGame' }
  )
);
```

**Logging Actions:**
```typescript
playCard: (playerId) => {
  if (import.meta.env.DEV) {
    console.log(`[GameStore] Playing card for ${playerId}`);
  }

  const playerState = get()[playerId];
  // ...
}
```

---

## Summary

**XState Machine (`game-flow-machine.ts`):**
- **13 primary states** (welcome → pre_reveal → ready → game_over)
- **3 nested states** (data_war, special_effect, pre_reveal)
- **43+ events** for transitions (including OWYW events)
- **Guards** for conditional logic (hasWinCondition, isDataWar, hasSpecialEffects, hasPreRevealEffects)
- **Entry actions** for tooltips
- **Delayed transitions** for animations (using centralized constants)
- **Global events** (RESET_GAME, QUIT_GAME)

**Animation Timing (`animation-timings.ts`):**
- **Centralized constants** for all animation durations
- **6 timing constants** (CARD_FLIP, CARD_COMPARISON, WIN_ANIMATION, OWYW_ANIMATION, SPECIAL_EFFECT_DISPLAY, DATA_WAR_REVEAL)
- **Consistent timing** across state machine and components

**Zustand Store (`game-store.ts`):**
- **Player state** (decks, played cards, turn values, active effects)
- **Game state** (cards in play, pendingEffects, preRevealEffects, preRevealProcessed flag, win conditions)
- **OWYW state** (active player, selected cards, modal/animation visibility)
- **Temper Tantrum state** (modal, available cards, selected cards, winner, loser cards, max selections)
- **Collection animation state** (showingWinEffect, collecting) - separated for proper timing
- **UI state** (pause, menu, tooltips, effect badges)
- **60+ actions** for game logic
- **Selector hooks** for performance (including useOpenWhatYouWantState, useTemperTantrumState)
- **DevTools integration** for debugging

**Integration:**
- XState controls flow → Zustand stores data
- XState guards check Zustand state
- Components read from both
- Game logic hook coordinates updates

**Key Principles:**
1. **Separation of Concerns**: Flow vs Data
2. **Single Source of Truth**: Each piece of state has one owner
3. **Predictable Transitions**: Can't enter invalid states
4. **Performance**: Selective re-renders with selectors
5. **Debuggability**: Visual flow + time-travel debugging
6. **Race Condition Prevention**: Flags in store (not refs) prevent duplicate processing
7. **React Best Practices**: No direct `getState()` calls in components, state updates in effects
8. **Centralized Configuration**: Animation timings in dedicated config file

**Recent Improvements:**

**OWYW Implementation:**
- Added `pre_reveal` state system for effects that need to execute before card reveal
- Separated `preRevealEffects` from `pendingEffects` for better timing control
- Fixed race conditions by using store state instead of React refs
- Centralized all animation timing constants for consistency
- Improved accessibility with descriptive alt text for card images
- Cleaned up unused Swiper navigation configuration

**Temper Tantrum Manual Card Selection:**
- Implemented interactive modal for player to select cards to steal
- Added card preservation system (`temperTantrumLoserCards`) to maintain state during modal interaction
- Created proper card distribution logic (loser gets stolen cards ONLY, winner gets rest)
- Separated win effect animation from card collection animation for proper sequencing
- Added visual feedback with scale animations (selected vs unselected cards)
- Implemented automatic CPU selection flow (first 2 cards)
- Proper state cleanup after distribution (turn values, effects, badges)
- Full test coverage with updated unit and integration tests

**Collection Animation Improvements:**
- Separated `showingWinEffect` from `collecting` to prevent simultaneous animations
- Three-stage collection process: win effect → card collection → deck addition
- Each stage has proper timing (1200ms each) for smooth visual flow
- Fixed race conditions in Temper Tantrum by capturing card arrays before animations

**Testing Enhancements:**
- Fixed all existing tests to work with new Temper Tantrum flow
- Added proper fake timer advancement for animation testing
- Updated test expectations to match new card distribution logic
- All 254 tests passing with full coverage

This architecture makes the game maintainable, testable, and extensible while handling complex game logic with confidence.
