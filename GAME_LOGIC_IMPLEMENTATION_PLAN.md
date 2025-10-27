# Data War - Game Logic Implementation Plan

## Overview

This document outlines the technical implementation plan for the Data War card game logic, including all entities, state management approach, game flow, and architectural decisions.

---

## 1. Core Entities & Data Models

### 1.1 Card Entity

```typescript
type CardValue = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type SpecialCardType =
  // Instant effects (trigger immediately)
  | 'forced_empathy'      // Firewall: Pass decks one position to the right
  | 'tracker_smacker'     // Firewall: Negate opponent Trackers & Moves for turn
  | 'hostile_takeover'    // Move: Instant war against this 6 (ignores Trackers/Blockers/ties)
  // Non-instant effects (queued until end of hand)
  | 'tracker'             // Triggers another play + adds point value to turn total
  | 'blocker'             // Triggers another play + subtracts points from opponent (card has 0 value)
  | 'open_what_you_want'  // Firewall: Look at top 3, arrange them in any order
  | 'mandatory_recall'    // Firewall: If win, opponents shuffle Launch Stacks back into decks
  | 'temper_tantrum'      // Move: If LOSE, steal 2 cards from winner's win pile
  | 'patent_theft'        // Move: If win, steal 1 Launch Stack from opponent
  | 'leveraged_buyout'    // Move: If win, take 2 cards from top of opponent decks
  | 'launch_stack'        // Collect 3 to win (triggers another play)
  | 'data_grab';          // Everyone grabs cards from play area (physical mechanic)

interface Card {
  id: string;                          // Unique identifier (e.g., "CD-1-01", "TR-1-01")
  value: CardValue;                    // Base value 0-6
  isSpecial: boolean;                  // Does this card have special effects?
  specialType?: SpecialCardType;       // Type of special effect (if applicable)
  triggersAnotherPlay?: boolean;       // Does this card trigger another play?
  imageUrl: string;                    // Path to card front image
}
```

**Notes:**
- Each card needs a unique ID for React key props and tracking
- 66 total cards in the game (40 common cards, 26 special cards)
- Special cards have values ranging 0-6 for comparison
- Card back image will be shared across all cards (can be a constant)
- 15 cards trigger another play (6 Trackers + 4 Blockers + 5 Launch Stacks)

### 1.2 Player Entity

```typescript
interface Player {
  id: 'player' | 'cpu';                // Player identifier
  name: string;                        // Display name
  deck: Card[];                        // Cards currently in player's possession
  playedCard: Card | null;             // Card currently played this turn
  currentTurnValue: number;            // Calculated value for current turn (base + modifiers)
  launchStackCount: number;            // Number of launch stacks collected (0-3)
  billionaireCharacter?: string;       // Selected billionaire (player only)
}
```

**Notes:**
- CPU is a simplified player with automated behavior
- `deck` represents all cards in player's possession (both playable and won cards)
- `currentTurnValue` is separate from card value to handle modifiers (e.g., point subtraction)
- Player selects billionaire, CPU gets a default or random one

### 1.3 Game State Entity

```typescript
type GamePhase =
  | 'welcome'         // Welcome screen
  | 'select_billionaire' // Character selection
  | 'billionaire_details' // Billionaire bio drawer
  | 'select_background'   // Background selection
  | 'quick_start_guide'   // Quick launch guide
  | 'vs_animation'    // Head-to-head VS takeover animation
  | 'ready'           // Ready to start turn (tap deck prompt)
  | 'revealing'       // Cards being revealed
  | 'comparing'       // Values being compared
  | 'data_war'        // Data War animation (tie scenario)
  | 'special_effect'  // Special card effect is triggering
  | 'resolving'       // Winner taking cards
  | 'game_over';      // Victory screen with share options

type WinCondition =
  | 'all_cards'       // Player collected all cards
  | 'launch_stacks'   // Player collected 3 launch stacks
  | null;             // No winner yet

interface SpecialEffect {
  type: SpecialCardType;
  playedBy: 'player' | 'cpu';
  card: Card;
  isInstant: boolean;                  // True for instant effects, false for queued
}

interface GameState {
  phase: GamePhase;
  currentTurn: number;                 // Turn counter (hand counter)
  player: Player;
  cpu: Player;
  cardsInPlay: Card[];                 // Cards currently being contested
  activePlayer: 'player' | 'cpu';      // Whose action is expected
  pendingEffects: SpecialEffect[];     // Queue of special effects (in play order)
  trackerSmackerActive: 'player' | 'cpu' | null;  // Who has Tracker Smacker blocking effects
  winner: 'player' | 'cpu' | null;
  winCondition: WinCondition;
  selectedBillionaire: string;         // Selected billionaire character
  selectedBackground: string;          // Background image URL
  isPaused: boolean;
  showMenu: boolean;                   // Menu overlay visible
  showHandViewer: boolean;             // Hand viewer module visible
  handViewerPlayer: 'player' | 'cpu'; // Which hand to show in viewer
  showInstructions: boolean;
  audioEnabled: boolean;
  showTooltip: boolean;                // Dynamic tooltip visible
  tooltipMessage: string;              // Current tooltip text
  dataWarState: {
    isActive: boolean;
    faceDownRevealed: boolean;         // Have 3 face-down cards been revealed?
  };
}
```

**Notes:**
- `phase` drives the UI and what actions are available
- `cardsInPlay` holds cards during ties/war scenarios (traditional "War" mechanic)
- `pendingEffects` queues special effects in play order (instant effects processed immediately, non-instant queued until end of hand)
- `trackerSmackerActive` tracks if Tracker Smacker is blocking opponent effects for the turn
- Game phase transitions guide the game flow

### 1.4 Game Configuration

```typescript
interface GameConfig {
  cardsPerPlayer: number;          // Cards each player starts with (default: 32)
  launchStacksToWin: number;       // 3 launch stacks needed
  deckComposition: CardType[];     // Array of all card types to include
}

interface CardType {
  id: string;                      // Unique identifier (e.g., "common-1", "ls-ai-platform")
  imageUrl: string;                // Path to card image
  value: CardValue;                // Base value 0-6
  isSpecial: boolean;
  specialType?: SpecialCardType;
  triggersAnotherPlay?: boolean;   // Does this card trigger another play?
  count: number;                   // How many copies of this card in the deck
}

// Default configuration - easily modifiable
const DEFAULT_GAME_CONFIG: GameConfig = {
  cardsPerPlayer: 33,  // Total deck = 66 cards (33 per player)
  launchStacksToWin: 3,
  deckComposition: [
    // Common cards (5 unique) - 8 copies each = 40 total
    { id: 'common-1', imageUrl: '/assets/cards/common-1.webp', value: 1, isSpecial: false, count: 8 },
    { id: 'common-2', imageUrl: '/assets/cards/common-2.webp', value: 2, isSpecial: false, count: 8 },
    { id: 'common-3', imageUrl: '/assets/cards/common-3.webp', value: 3, isSpecial: false, count: 8 },
    { id: 'common-4', imageUrl: '/assets/cards/common-4.webp', value: 4, isSpecial: false, count: 8 },
    { id: 'common-5', imageUrl: '/assets/cards/common-5.webp', value: 5, isSpecial: false, count: 8 },

    // Launch Stack cards (5 unique) - 1 of each, value 0, triggers another play
    { id: 'ls-ai-platform', imageUrl: '/assets/cards/ls-ai-platform.webp', value: 0, isSpecial: true, specialType: 'launch_stack', triggersAnotherPlay: true, count: 1 },
    { id: 'ls-energy-grid', imageUrl: '/assets/cards/ls-energy-grid.webp', value: 0, isSpecial: true, specialType: 'launch_stack', triggersAnotherPlay: true, count: 1 },
    { id: 'ls-government', imageUrl: '/assets/cards/ls-government.webp', value: 0, isSpecial: true, specialType: 'launch_stack', triggersAnotherPlay: true, count: 1 },
    { id: 'ls-newspaper', imageUrl: '/assets/cards/ls-newspaper.webp', value: 0, isSpecial: true, specialType: 'launch_stack', triggersAnotherPlay: true, count: 1 },
    { id: 'ls-rocket-company', imageUrl: '/assets/cards/ls-rocket-company.webp', value: 0, isSpecial: true, specialType: 'launch_stack', triggersAnotherPlay: true, count: 1 },

    // Firewall cards (4 unique) - 1 of each, value 6
    { id: 'firewall-empathy', imageUrl: '/assets/cards/firewall-empathy.webp', value: 6, isSpecial: true, specialType: 'forced_empathy', count: 1 },
    { id: 'firewall-open', imageUrl: '/assets/cards/firewall-open.webp', value: 6, isSpecial: true, specialType: 'open_what_you_want', count: 1 },
    { id: 'firewall-recall', imageUrl: '/assets/cards/firewall-recall.webp', value: 6, isSpecial: true, specialType: 'mandatory_recall', count: 1 },
    { id: 'firewall-smacker', imageUrl: '/assets/cards/firewall-smacker.webp', value: 6, isSpecial: true, specialType: 'tracker_smacker', count: 1 },

    // Move cards (4 unique) - 1 of each, value 6
    { id: 'move-buyout', imageUrl: '/assets/cards/move-buyout.webp', value: 6, isSpecial: true, specialType: 'leveraged_buyout', count: 1 },
    { id: 'move-takeover', imageUrl: '/assets/cards/move-takeover.webp', value: 6, isSpecial: true, specialType: 'hostile_takeover', count: 1 },
    { id: 'move-tantrum', imageUrl: '/assets/cards/move-tantrum.webp', value: 6, isSpecial: true, specialType: 'temper_tantrum', count: 1 },
    { id: 'move-theft', imageUrl: '/assets/cards/move-theft.webp', value: 6, isSpecial: true, specialType: 'patent_theft', count: 1 },

    // Tracker cards (3 unique) - 2 copies each, triggers another play
    { id: 'tracker-1', imageUrl: '/assets/cards/tracker-1.webp', value: 1, isSpecial: true, specialType: 'tracker', triggersAnotherPlay: true, count: 2 },
    { id: 'tracker-2', imageUrl: '/assets/cards/tracker-2.webp', value: 2, isSpecial: true, specialType: 'tracker', triggersAnotherPlay: true, count: 2 },
    { id: 'tracker-3', imageUrl: '/assets/cards/tracker-3.webp', value: 3, isSpecial: true, specialType: 'tracker', triggersAnotherPlay: true, count: 2 },

    // Blocker cards (2 unique) - 2 copies each, value 0, triggers another play
    { id: 'blocker-1', imageUrl: '/assets/cards/blocker-1.webp', value: 0, isSpecial: true, specialType: 'blocker', triggersAnotherPlay: true, count: 2 },
    { id: 'blocker-2', imageUrl: '/assets/cards/blocker-2.webp', value: 0, isSpecial: true, specialType: 'blocker', triggersAnotherPlay: true, count: 2 },

    // Data Grab cards (3 copies) - physical mechanic, skip for MVP or adapt for digital
    { id: 'data-grab', imageUrl: '/assets/cards/data-grab.webp', value: 0, isSpecial: true, specialType: 'data_grab', count: 3 },
  ],
};
```

**Deck Composition Calculation:**
- Common cards: 8+8+8+8+8 = **40 cards**
- Launch stack cards: 5×1 = **5 cards**
- Firewall cards: 4×1 = **4 cards**
- Move cards: 4×1 = **4 cards**
- Tracker cards: 3×2 = **6 cards**
- Blocker cards: 2×2 = **4 cards**
- Data Grab: 3×1 = **3 cards**
- **Total: 40 + 5 + 4 + 4 + 6 + 4 + 3 = 66 cards ✓**
- Each player gets: **33 cards**

**Notes:**
- **Flexible Configuration**: Change `cardsPerPlayer` to easily adjust deck size
- **Easy to Update**: Modify `count` property on any card type to adjust deck composition
- **Future-Proof**: Add new card types or change special effects by updating the config
- **Testing-Friendly**: Can create test configs with fewer cards
- **Source of Truth**: All values and effects confirmed from CARDS.md documentation
- **Cards that trigger another play**: Trackers (6), Blockers (4), Launch Stacks (5) = 15 total

---

## 2. State Management Approach

### Recommendation: Zustand + XState

**Why Zustand + XState?**

The game has **12 distinct phases** with complex state transitions, animation timing, and special effect queuing. This is a perfect use case for combining:

1. **XState (State Machine)**: Manages game flow, phases, and transitions
   - Visual state machine with 12 game phases
   - Prevention of impossible state transitions
   - Built-in support for delayed transitions (animations, CPU turns)
   - Parallel states (e.g., tooltip + gameplay)
   - Guarded transitions (win conditions)
   - Nested state machines (Data War substates)

2. **Zustand (State Store)**: Manages game data (cards, players, scores, UI)
   - Lightweight (~1KB) with no provider overhead
   - Better performance than Context (no re-render issues)
   - Redux DevTools integration
   - Middleware support (persistence, logging)
   - Simple API with less boilerplate

**Separation of Concerns:**
- **XState**: Controls *when* things happen (game flow/behavior)
- **Zustand**: Controls *what* data exists (game state/data)

### State Architecture

#### XState Machine (Game Flow)

```typescript
import { createMachine, assign } from 'xstate';

export const gameFlowMachine = createMachine({
  id: 'dataWarGame',
  initial: 'welcome',
  context: {
    currentTurn: 0,
    trackerSmackerActive: null,
    tooltipMessage: '',
  },
  states: {
    welcome: {
      on: {
        START_GAME: 'select_billionaire',
      },
    },
    select_billionaire: {
      on: {
        SELECT_BILLIONAIRE: 'select_background',
      },
    },
    select_background: {
      on: {
        SELECT_BACKGROUND: 'quick_start_guide',
      },
    },
    quick_start_guide: {
      on: {
        SKIP_GUIDE: 'vs_animation',
        SHOW_GUIDE: 'quick_start_guide',
      },
    },
    vs_animation: {
      after: {
        2000: 'ready', // Auto-transition after 2s animation
      },
      entry: assign({
        tooltipMessage: 'Get ready for battle!',
      }),
    },
    ready: {
      entry: assign({
        tooltipMessage: 'Tap stack to start!',
      }),
      on: {
        REVEAL_CARDS: 'revealing',
      },
    },
    revealing: {
      after: {
        1000: 'comparing', // Wait for flip animations
      },
    },
    comparing: {
      on: {
        TIE: 'data_war',
        SPECIAL_EFFECT: 'special_effect',
        RESOLVE_TURN: 'resolving',
      },
    },
    data_war: {
      initial: 'animating',
      states: {
        animating: {
          after: {
            2000: 'reveal_face_down',
          },
        },
        reveal_face_down: {
          on: {
            TAP_DECK: 'reveal_face_up',
          },
        },
        reveal_face_up: {
          on: {
            TAP_DECK: {
              target: '#dataWarGame.comparing',
              actions: assign({ currentTurn: (ctx) => ctx.currentTurn + 1 }),
            },
          },
        },
      },
    },
    special_effect: {
      initial: 'showing',
      states: {
        showing: {
          on: {
            DISMISS_EFFECT: 'processing',
          },
        },
        processing: {
          after: {
            500: '#dataWarGame.resolving',
          },
        },
      },
    },
    resolving: {
      on: {
        CHECK_WIN_CONDITION: [
          {
            target: 'game_over',
            cond: 'hasWinCondition',
          },
          {
            target: 'ready',
          },
        ],
      },
    },
    game_over: {
      type: 'final',
    },
  },
},
{
  guards: {
    hasWinCondition: (context, event) => {
      // Check win conditions from Zustand store
      return false; // Placeholder
    },
  },
});
```

#### Zustand Store (Game Data)

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Card, Player, SpecialEffect } from './types';

interface GameStore {
  // Player State
  player: Player;
  cpu: Player;

  // Game State
  cardsInPlay: Card[];
  activePlayer: 'player' | 'cpu';
  pendingEffects: SpecialEffect[];
  winner: 'player' | 'cpu' | null;
  winCondition: 'all_cards' | 'launch_stacks' | null;

  // UI State
  selectedBillionaire: string;
  selectedBackground: string;
  isPaused: boolean;
  showMenu: boolean;
  showHandViewer: boolean;
  handViewerPlayer: 'player' | 'cpu';
  showInstructions: boolean;
  audioEnabled: boolean;
  showTooltip: boolean;

  // Actions - Game Logic
  initializeGame: () => void;
  playCard: (playerId: 'player' | 'cpu') => void;
  collectCards: (winnerId: 'player' | 'cpu', cards: Card[]) => void;
  addLaunchStack: (playerId: 'player' | 'cpu') => void;
  swapDecks: () => void;
  stealCards: (from: 'player' | 'cpu', to: 'player' | 'cpu', count: number) => void;

  // Actions - UI
  selectBillionaire: (billionaire: string) => void;
  selectBackground: (background: string) => void;
  togglePause: () => void;
  toggleMenu: () => void;
  toggleHandViewer: (player?: 'player' | 'cpu') => void;
  toggleAudio: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      player: {
        id: 'player',
        name: 'Player',
        deck: [],
        playedCard: null,
        currentTurnValue: 0,
        launchStackCount: 0,
      },
      cpu: {
        id: 'cpu',
        name: 'CPU',
        deck: [],
        playedCard: null,
        currentTurnValue: 0,
        launchStackCount: 0,
      },
      cardsInPlay: [],
      activePlayer: 'player',
      pendingEffects: [],
      winner: null,
      winCondition: null,
      selectedBillionaire: '',
      selectedBackground: '',
      isPaused: false,
      showMenu: false,
      showHandViewer: false,
      handViewerPlayer: 'player',
      showInstructions: false,
      audioEnabled: true,
      showTooltip: false,

      // Game Logic Actions
      initializeGame: () => {
        const { playerDeck, cpuDeck } = initializeGameDeck();
        set({
          player: { ...get().player, deck: playerDeck },
          cpu: { ...get().cpu, deck: cpuDeck },
          cardsInPlay: [],
          winner: null,
          winCondition: null,
        });
      },

      playCard: (playerId) => {
        const playerState = get()[playerId];
        const [card, ...remainingDeck] = playerState.deck;

        set({
          [playerId]: {
            ...playerState,
            playedCard: card,
            deck: remainingDeck,
            currentTurnValue: card.value,
          },
          cardsInPlay: [...get().cardsInPlay, card],
        });
      },

      collectCards: (winnerId, cards) => {
        const winner = get()[winnerId];
        set({
          [winnerId]: {
            ...winner,
            deck: [...winner.deck, ...cards],
          },
          cardsInPlay: [],
        });
      },

      addLaunchStack: (playerId) => {
        const player = get()[playerId];
        const newCount = player.launchStackCount + 1;

        set({
          [playerId]: {
            ...player,
            launchStackCount: newCount,
          },
        });

        // Check win condition
        if (newCount >= 3) {
          set({ winner: playerId, winCondition: 'launch_stacks' });
        }
      },

      swapDecks: () => {
        const { player, cpu } = get();
        set({
          player: { ...player, deck: cpu.deck },
          cpu: { ...cpu, deck: player.deck },
        });
      },

      stealCards: (from, to, count) => {
        const fromPlayer = get()[from];
        const toPlayer = get()[to];
        const stolenCards = fromPlayer.deck.slice(0, count);
        const remainingCards = fromPlayer.deck.slice(count);

        set({
          [from]: { ...fromPlayer, deck: remainingCards },
          [to]: { ...toPlayer, deck: [...toPlayer.deck, ...stolenCards] },
        });
      },

      // UI Actions
      selectBillionaire: (billionaire) => set({ selectedBillionaire: billionaire }),
      selectBackground: (background) => set({ selectedBackground: background }),
      togglePause: () => set({ isPaused: !get().isPaused }),
      toggleMenu: () => set({ showMenu: !get().showMenu, isPaused: !get().showMenu }),
      toggleHandViewer: (player) => set({
        showHandViewer: !get().showHandViewer,
        handViewerPlayer: player || get().handViewerPlayer,
      }),
      toggleAudio: () => set({ audioEnabled: !get().audioEnabled }),
      resetGame: () => {
        get().initializeGame();
        // Reset will be handled by XState machine
      },
    }),
    { name: 'DataWarGame' }
  )
);
```

**File Structure:**
```
apps/game/src/
├── machines/
│   ├── gameFlowMachine.ts       // XState machine for game phases
│   └── gameFlowMachine.test.ts  // Tests for state transitions
├── stores/
│   ├── gameStore.ts             // Zustand store for game data
│   └── gameStore.test.ts        // Tests for store actions
├── hooks/
│   ├── useGameMachine.ts        // Hook to use XState machine
│   ├── useGameStore.ts          // Re-exported Zustand hook
│   └── useCPUPlayer.ts          // CPU automation logic
├── utils/
│   ├── deckBuilder.ts           // Creates initial deck
│   ├── cardComparison.ts        // Compare card values, handle ties
│   ├── specialEffects.ts        // Special card effect implementations
│   └── winConditionChecker.ts   // Check win conditions
└── providers/
    └── GameProvider.tsx         // Combines XState + Zustand
```

---

## 3. Game Flow & Turn System

### 3.1 Turn Sequence

```
1. READY phase
   ↓
2. Player clicks deck → REVEALING phase
   - Player card flips face up
   - CPU card flips face up (automated after delay)
   ↓
3. COMPARING phase
   - Calculate turn values (base + modifiers)
   - Determine winner
   - Check for special cards
   ↓
4. SPECIAL_EFFECT phase (if applicable)
   - Show modal explaining effect
   - Apply effect to game state
   - Handle effect-specific logic
   ↓
5. RESOLVING phase
   - Winner collects all cards in play
   - Update card counts
   - Check win conditions
   ↓
6. Back to READY phase (or GAME_OVER)
```

### 3.2 Tie Handling (Traditional "War")

When cards have equal value:
1. Each player adds 3 more cards face down to `cardsInPlay`
2. Each player plays 1 more card face up
3. Compare the new face-up cards
4. Winner takes ALL cards in play
5. If tie again, repeat

**Implementation Note:** This is a traditional War rule—ensure it's confirmed with design team.

### 3.3 Special Card Timing

- **Play Again**: Immediately after resolving current turn, player draws again
- **Point Subtraction**: Applied during COMPARING phase before winner determination
- **Forced Empathy**: Immediate swap, then continue to next turn
- **Launch Stack**: Icon animation triggers, counter updates, check if 3 collected

---

## 4. Special Effects Implementation

### 4.1 Tracker (Play Again + Add Points)

```typescript
function applyTracker(state: GameState, playerId: 'player' | 'cpu', trackerValue: 1 | 2 | 3): GameState {
  // Tracker adds its point value to the turn total and triggers another play
  return {
    ...state,
    [playerId]: {
      ...state[playerId],
      currentTurnValue: state[playerId].currentTurnValue + trackerValue,
    },
    phase: 'ready', // Trigger another play for this player
    activePlayer: playerId, // Same player goes again
  };
}
```

### 4.2 Blocker (Point Subtraction)

```typescript
function applyBlocker(state: GameState, blockerValue: 1 | 2, target: 'player' | 'cpu'): GameState {
  // Blocker cards have 0 value themselves and subtract from opponent
  return {
    ...state,
    [target]: {
      ...state[target],
      currentTurnValue: Math.max(0, state[target].currentTurnValue - blockerValue),
    },
    // Blocker also triggers another play for the player who played it
  };
}
```

### 4.3 Forced Empathy (Deck Swap)

```typescript
function applyForcedEmpathy(state: GameState): GameState {
  // In multiplayer: "pass decks one position to the right"
  // In 1v1: swap decks between player and CPU
  return {
    ...state,
    player: {
      ...state.player,
      deck: state.cpu.deck, // Swap decks
    },
    cpu: {
      ...state.cpu,
      deck: state.player.deck, // Swap decks
    },
  };
}
```

### 4.4 Launch Stack

```typescript
function applyLaunchStack(state: GameState, player: 'player' | 'cpu'): GameState {
  const newCount = state[player].launchStackCount + 1;

  return {
    ...state,
    [player]: {
      ...state[player],
      launchStackCount: newCount,
    },
    // Trigger win check if count reaches 3
    ...(newCount >= 3 && {
      phase: 'game_over',
      winner: player,
      winCondition: 'launch_stacks',
    }),
  };
}
```

---

## 5. Win Condition System

### 5.1 Check After Each Turn Resolution

```typescript
function checkWinConditions(state: GameState): GameState {
  const playerCards = state.player.deck.length;
  const cpuCards = state.cpu.deck.length;

  // Check all cards collected (66 total cards)
  if (playerCards >= 66) {
    return {
      ...state,
      phase: 'game_over',
      winner: 'player',
      winCondition: 'all_cards',
    };
  }

  if (cpuCards >= 66) {
    return {
      ...state,
      phase: 'game_over',
      winner: 'cpu',
      winCondition: 'all_cards',
    };
  }

  // Check launch stacks (already handled in applyLaunchStack)
  // Need 3 different Launch Stacks to win

  return state;
}
```

---

## 6. CPU Player Logic

### 6.1 Simple Automation (No AI Needed)

```typescript
// Hook that automatically plays CPU turns
function useCPUPlayer(gameState: GameState, dispatch: Dispatch<GameAction>) {
  useEffect(() => {
    if (gameState.activePlayer === 'cpu' && gameState.phase === 'ready') {
      // Add realistic delay for UX
      const timer = setTimeout(() => {
        dispatch({ type: 'REVEAL_CARDS' });
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, [gameState.activePlayer, gameState.phase, dispatch]);
}
```

**Notes:**
- No strategic decision-making required
- Just automated card playing with timing delays
- Makes game feel more natural

---

## 7. Deck Management

### 7.1 Initial Deck Creation

```typescript
function createInitialDeck(): Card[] {
  const deck: Card[] = [];

  // Add common cards based on GameConfig
  // Add special cards based on GameConfig
  // Assign unique IDs

  return shuffleDeck(deck);
}

function shuffleDeck(deck: Card[]): Card[] {
  // Fisher-Yates shuffle algorithm
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function dealCards(deck: Card[]): { playerDeck: Card[]; cpuDeck: Card[] } {
  const mid = Math.floor(deck.length / 2);
  return {
    playerDeck: deck.slice(0, mid),
    cpuDeck: deck.slice(mid),
  };
}
```

### 7.2 Card Transfer

```typescript
function transferCards(
  winner: Player,
  loser: Player,
  cardsInPlay: Card[]
): { winner: Player; loser: Player } {
  return {
    winner: {
      ...winner,
      deck: [...winner.deck, ...cardsInPlay], // Add won cards to bottom of deck
    },
    loser,
  };
}
```

---

## 8. Animation Orchestration

### 8.1 Animation Phases

The game logic should coordinate with animations:

```typescript
// Animations trigger at specific phase transitions
useEffect(() => {
  if (state.phase === 'revealing') {
    // Trigger card flip animations
    // Wait for animations to complete before moving to 'comparing'
  }

  if (state.phase === 'special_effect') {
    // Show special effect modal
    // Play Lottie animation
    // Wait for user to dismiss before moving to 'resolving'
  }

  if (state.phase === 'game_over') {
    // Trigger victory animation
    // Show billionaire launch sequence
  }
}, [state.phase]);
```

### 8.2 Animation Timing Hook

```typescript
function useAnimationTiming(phase: GamePhase, duration: number, onComplete: () => void) {
  useEffect(() => {
    const timer = setTimeout(onComplete, duration);
    return () => clearTimeout(timer);
  }, [phase, duration, onComplete]);
}
```

---

## 9. UI State Integration

### 9.1 Components That Need Game State

```
Board (container)
├── Header
│   ├── PauseButton → dispatch({ type: 'TOGGLE_PAUSE' })
│   └── MenuButton → dispatch({ type: 'SHOW_INSTRUCTIONS' })
├── LaunchStackIndicator → state.player.launchStackCount
├── PlayerDeckArea
│   ├── DeckPile → state.player.deck.length
│   ├── PlayedCard → state.player.playedCard
│   └── CardCounter → state.player.deck.length
├── OpponentDeckArea
│   ├── DeckPile → state.cpu.deck.length
│   ├── PlayedCard → state.cpu.playedCard
│   └── CardCounter → state.cpu.deck.length
├── TurnValueDisplay → state.player.currentTurnValue / state.cpu.currentTurnValue
└── EffectModal → state.pendingEffects
```

### 9.2 User Interactions

- **Player clicks deck**: `dispatch({ type: 'REVEAL_CARDS' })`
- **Player clicks pause**: `dispatch({ type: 'TOGGLE_PAUSE' })`
- **Player dismisses special effect modal**: Continue to next phase
- **Player clicks "Play Again"**: `dispatch({ type: 'RESET_GAME' })`

---

## 10. Testing Strategy

### 10.1 Unit Tests (Priority)

- Reducer pure functions
- Card comparison logic
- Special effect implementations
- Win condition checks
- Deck shuffling/dealing

### 10.2 Integration Tests

- Full turn sequence
- Special card triggering
- Win condition triggering
- Tie/war scenario

### 10.3 Manual Testing Scenarios

- Play until all cards collected
- Play until 3 launch stacks collected
- Trigger each special effect
- Test tie scenarios
- Test rapid play-again chains

---

## 11. Implementation Phases

### Phase 1: Setup & Dependencies (Day 1)
- [ ] Install Zustand and XState packages
- [ ] Set up XState visualizer for debugging
- [ ] Create basic type definitions
- [ ] Set up file structure (machines/, stores/, hooks/)
- [ ] Configure Redux DevTools for Zustand

### Phase 2: Core State Management (Days 2-3)
- [ ] Create XState machine with all 12 game phases
- [ ] Implement Zustand store with player/game data
- [ ] Create deck builder utility
- [ ] Implement shuffle and deal functions
- [ ] Test state machine transitions with XState visualizer
- [ ] Create useGameMachine and useGameStore hooks

### Phase 3: Game Setup Flow (Day 4)
- [ ] Implement welcome → billionaire selection → background → VS animation flow
- [ ] Connect UI components to XState transitions
- [ ] Add animation timing with XState delayed transitions
- [ ] Implement tooltip system with machine context
- [ ] Test setup flow end-to-end

### Phase 4: Basic Turn System (Days 5-6)
- [ ] Implement ready → revealing → comparing → resolving flow
- [ ] Create card comparison logic
- [ ] Implement turn resolution in Zustand store
- [ ] Connect XState machine to Zustand actions
- [ ] Implement CPU automation with useCPUPlayer
- [ ] Test basic turn sequence

### Phase 5: Data War (Tie Scenario) (Day 7)
- [ ] Implement nested Data War state machine
- [ ] Add face-down and face-up card reveals
- [ ] Create Data War animation coordination
- [ ] Test complex tie scenarios (multiple wars in sequence)

### Phase 6: Special Effects (Days 8-9)
- [ ] Implement special effect queue in Zustand
- [ ] Create nested special_effect state machine
- [ ] Implement instant effects (Forced Empathy, Tracker Smacker, Hostile Takeover)
- [ ] Implement non-instant effects (Trackers, Blockers, Steal cards)
- [ ] Add special effect animations and transitions
- [ ] Test each effect in isolation and combination

### Phase 7: Win Conditions (Day 10)
- [ ] Implement win condition guards in XState
- [ ] Add launch stack tracking in Zustand
- [ ] Implement game_over state
- [ ] Create victory sequence trigger
- [ ] Test both win paths (all cards + 3 launch stacks)

### Phase 8: UI Integration (Day 11)
- [ ] Connect all UI components to XState state
- [ ] Implement pause/resume functionality
- [ ] Add menu system with XState parallel states
- [ ] Implement hand viewer module
- [ ] Add audio toggle integration

### Phase 9: Polish & Testing (Days 12-13)
- [ ] Add animation coordination with XState
- [ ] Optimize performance (memoization, selective re-renders)
- [ ] Comprehensive testing of all game flows
- [ ] Test edge cases (rapid play, special effect chains)
- [ ] Bug fixes and refinements

### Phase 10: DevTools & Debugging (Day 14)
- [ ] Configure XState Inspector for visual debugging
- [ ] Set up Redux DevTools time-travel debugging
- [ ] Create debug panel for testing specific scenarios
- [ ] Document state machine diagram
- [ ] Final QA pass

---

## 12. Card Asset Analysis & Deck Composition

Based on the card assets in `/apps/game/src/assets/cards/`, the deck contains:

### Card Types (27 unique card designs)

1. **Common Cards (5)**: `common-1.webp` through `common-5.webp`
   - Base value cards (1-5)
   - These are the standard numbered cards

2. **Launch Stack Cards (5)**: `ls-*.webp`
   - `ls-ai-platform.webp`
   - `ls-energy-grid.webp`
   - `ls-government.webp`
   - `ls-newspaper.webp`
   - `ls-rocket-company.webp`
   - Special win condition cards (collect 3 to win)

3. **Firewall Cards (4)**: `firewall-*.webp`
   - `firewall-empathy.webp` - Likely "Forced Empathy" (deck swap)
   - `firewall-open.webp`
   - `firewall-recall.webp`
   - `firewall-smacker.webp`

4. **Move Cards (4)**: `move-*.webp`
   - `move-buyout.webp`
   - `move-takeover.webp`
   - `move-tantrum.webp`
   - `move-theft.webp`

5. **Tracker Cards (3)**: `tracker-*.webp`
   - `tracker-1.webp`
   - `tracker-2.webp`
   - `tracker-3.webp`
   - Likely the special effect tracking cards

6. **Blocker Cards (2)**: `blocker-*.webp`
   - `blocker-1.webp`
   - `blocker-2.webp`

7. **Other Special Cards (2)**:
   - `data-grab.webp`
   - `win.webp`

8. **Card Backs (2)**:
   - `card-back.webp` (primary)
   - `card-back-alt.webp` (alternative)

### Deck Composition Questions

**NEEDS CLARIFICATION:**
- Total deck size: The README mentions ~74 cards, but we have 27 unique card types
- How many copies of each card type exist in the full deck?
- Which cards map to which special effects (Play Again, Point Subtraction, etc.)?

### Mapping Special Effects to Cards

Based on the README's 4 special effects, we need to map:
1. **Play Again** → Likely one of the `move-*` or `tracker-*` cards?
2. **Point Subtraction** → Likely `blocker-*` cards? (defensive)
3. **Forced Empathy (Deck Swap)** → `firewall-empathy.webp` ✓ (confirmed)
4. **Launch Stack** → `ls-*` cards ✓ (confirmed)

---

## 13. Clarified Game Rules (from Instructions Page)

Based on https://billionaireblastoff.firefox.com/datawar/instructions:

### Card Types & Values

1. **Common Data Cards (1-5)**: ✅ Provide points to player's total for comparison
2. **Trackers (value varies)**: ✅ "Boosts point total" - Player plays another card and adds Tracker value
3. **Firewalls (value 6)**: ✅ Special action cards with "chaotic-good" effects (conditional)
4. **Billionaire Moves (value 6)**: ✅ "Chaotic-evil" mandatory effects when played
5. **Data Grab**: ✅ Triggers scramble - "all players grab cards from play area"
6. **Launch Stacks (no value)**: ✅ Must collect 3 + 1 Billionaire to purchase win card
7. **Billionaires**: Collectible with special powers (instant effect, return to bottom of deck)
8. **Win Card ("One Way Ticket to Space")**: ✅ Purchasable for 1 Billionaire + 3 Launch Stacks
9. **Blockers**: ✅ "Subtract Blocker value from all opponent plays"

### Key Mechanics Clarified

✅ **Tie Handling (Data War)**: 3 cards face down + 1 face up. Winner takes all or continues war.

✅ **Card Values**:
   - Common: 1-5
   - Trackers: Boost value (additive)
   - Firewalls: 6
   - Moves: 6
   - Blockers: Subtract from opponent

✅ **Win Conditions**:
   - Collect 1 Billionaire + 3 Launch Stacks to purchase win card
   - OR collect all cards (traditional War)

✅ **Billionaire Powers**: Take effect instantly, card returns to bottom of deck

### Updated Special Effect Mapping

From the original README's 4 effects, we now understand:

1. **Play Again** → Likely **Tracker cards** (play another card + add tracker value)
2. **Point Subtraction** → **Blocker cards** ✓ (subtract from opponent plays)
3. **Forced Empathy** → Likely one of the **Firewall cards** (deck swap is "chaotic-good")
4. **Launch Stack** → **Launch Stack cards** ✓ (collect 3 for win condition)

**New card types discovered:**
- **Billionaire Moves**: Mandatory chaotic effects (like move-buyout, move-takeover, etc.)
- **Data Grab**: Special scramble mechanic
- **Win Card**: The actual victory card to purchase
- **Billionaires**: Character cards with instant powers

## 14. Complete Special Card Effects (from Figma Animations)

### ✅ **All Special Card Effects Defined:**

#### Firewall Cards (Chaotic-Good, Conditional)

1. **Firewall: Forced Empathy** (`firewall-empathy.webp`)
   - Value: 6
   - Effect: "All players immediately pass their decks one position to the right (instant)"
   - Animation: Card stacks swap positions
   - Note: For 1v1, this means swap decks with opponent

2. **Firewall: Open What You Want** (`firewall-open.webp`)
   - Value: 6
   - Effect: "On your next play, look at the top 3 cards of your deck and arrange them in any order (exclude face-down War cards)"
   - Animation: Show 3 cards, player arranges them
   - Note: Gives control and knowledge, not immediate play

3. **Firewall: Mandatory Recall** (`firewall-recall.webp`)
   - Value: 6
   - Effect: "If you win this hand, all opponents shuffle Launch Stacks back into their decks"
   - Animation: Launch Stack icons return to deck
   - Note: Major disruption to opponent win condition

4. **Firewall: Tracker Smacker** (`firewall-smacker.webp`)
   - Value: 6
   - Effect: "Negate all opponent Tracker and Billionaire Move effects for the remainder of this turn (instant)"
   - Animation: Defensive shield/block indicator

#### Billionaire Moves (Chaotic-Evil, Mandatory)

5. **Billionaire Moves: Hostile Takeover** (`move-takeover.webp`)
   - Value: 6
   - Effect: "All opponents instantly go to WAR against this 6; winner takes all. Ignores Trackers, Blockers, and ties on original play"
   - Animation: Immediate Data War sequence triggered
   - Note: High risk, high reward aggressive play

6. **Billionaire Moves: Temper Tantrum** (`move-tantrum.webp`)
   - Value: 6
   - Effect: "If you LOSE this hand, steal 2 cards from the winner's win pile before they collect them"
   - Animation: Two cards fly from winner back to loser
   - Note: Bad loser behavior - punishes the winner

7. **Billionaire Moves: Patent Theft** (`move-theft.webp`)
   - Value: 6
   - Effect: "If you win this hand, steal 1 Launch Stack card from any opponent"
   - Animation: Launch Stack flies from opponent to player
   - Note: Directly attacks opponent win condition

8. **Billionaire Moves: Leveraged Buyout** (`move-buyout.webp`)
   - Value: 6
   - Effect: "If you win this hand, take 2 cards from the top of all opponent decks and add them to yours"
   - Animation: Two cards fly from opponent deck to player
   - Note: Weakens opponent while strengthening yourself

#### Tracker Cards

9. **Trackers** (`tracker-1.webp`, `tracker-2.webp`, `tracker-3.webp`)
   - Value: 1, 2, 3 respectively (2 copies each)
   - Effect: Triggers another play + adds the tracker's point value to turn total
   - Special Action Details:
     - Tracker-1 (value 1): "Add 1 point to the value of your play"
     - Tracker-2 (value 2): "Add 2 points to the value of your play"
     - Tracker-3 (value 3): "Add 3 points to the value of your play"
   - Animation: Additional card flip sequence, Turn Value updates dynamically

#### Blocker Cards

10. **Blockers** (`blocker-1.webp`, `blocker-2.webp`)
    - Value: 0 (these cards have no point value themselves)
    - Count: 2 copies each
    - Effect: Triggers another play + subtracts from opponent's turn value
    - Special Action Details:
      - Blocker-1: "Subtract 1 point from the value of all opponent plays (this card has no value)"
      - Blocker-2: "Subtract 2 points from the value of all opponent plays (this card has no value)"
    - Animation: Opponent turn value decreases, player plays another card

#### Launch Stack Cards

11. **Launch Stacks** (5 types: ai-platform, energy-grid, government, newspaper, rocket-company)
    - Value: 0 (no point value)
    - Count: 1 of each (5 total)
    - Effect: Collect 3 different Launch Stacks to win the game + triggers another play
    - Animation: Rocket icon flies into launch stack indicator around avatar
    - Note: Automatically loses the hand comparison but collects toward win condition

### Special Card Interaction Levels & Timing

**Three-Level Animation System:**

1. **Card + Event Log Burst**: Particle burst when special card is placed on tableau
2. **Event Takeover**: Brief takeover animation signaling major effect about to occur
3. **Event Conclusion**: The actual effect execution (see specific effects above)

**Critical Timing Rules:**

✅ **Instant Cards** (trigger immediately within the hand):
- Forced Empathy (deck swap)
- Tracker Smacker (block effects)
- Hostile Takeover (instant war)

✅ **Non-Instant Cards** (queued until end of hand):
- All other special effects
- Event Takeover and Event Conclusion trigger at hand end

✅ **Multiple Special Cards in One Hand**:
- Takeovers and conclusions trigger **sequentially**
- Order: **In the order cards were played** (player card first, then opponent, or vice versa)
- Regardless of which player played them

**Example Sequence:**
```
1. Player plays Tracker → particle burst
2. Opponent plays Mandatory Recall → particle burst
3. Cards compared, winner determined
4. Event Takeover (Tracker) → Event Conclusion (play again)
5. Event Takeover (Mandatory Recall) → Event Conclusion (steal 2 cards)
6. Continue to next hand
```

### Key Animation Sequences

1. **Deck Deal**: Brief animation at game start, deck splits and deals between players
2. **Card Play**: Smooth card flip from deck when tapped
3. **Turn Value Update**: Dynamic update as cards are played
4. **Win Hand**: "WIN" banner + confetti burst over avatar
5. **Card Collection**: Winning cards fly to winner's deck
6. **Launch Stack Collection**: Rocket icon flies to indicator
7. **Data War** (Tier 3 Animation - High Energy):
   - Triggered on tie
   - Head-to-head takeover animation
   - Both characters slide in from opposite sides
   - Bold "DATA WAR" text surges between them
   - Speed lines and energy bursts pulse across frame
   - Gameplay resumes:
     - First tap: 3 face-down cards flip
     - Second tap: 1 face-up card reveals outcome
   - Winner takes all cards in play
   - Note: "More ties means more war, which means more cards to the winner, which means more Launch Stacks!"
8. **Special Card Sequence**: Particle burst → Event Takeover → Event Conclusion

### Win Condition (Clarified)

✅ **Simplified for MVP**: Collect **3 Launch Stacks** to win (OR collect all cards)

### Game Setup Flow (from Figma)

1. **Welcome Screen**: "Some people learn by reading instructions. Other people learn by playing. We got both you nerds covered."
   - Options: Jump in and play / Quick Start Guide

2. **Select Billionaire**: "Whose little face is going to space?"
   - Character lineup with avatars
   - Tap character to see bio drawer
   - Confirm selection

3. **Billionaire Details Drawer**: Shows bio and personality for selected character

4. **Select Background**: "Which one do you want to play on?"
   - Multiple background options (asteroid, felt, nightsky, etc.)
   - Note: Can change from menu anytime
   - Each background reflects billionaire's personality

5. **Quick Launch Guide** (optional): "How do I play?"
   - Shows card types and basic rules
   - Can skip or access from menu later

6. **VS Animation**: Head-to-head cinematic takeover
   - Billionaires fly in from left and right
   - Bold "VS" with lightning and speed lines
   - Sets tone for the battle

7. **Game Start**: First hand tooltip
   - "Tap stack to start!"
   - Dynamic tooltips guide first few hands
   - Tooltips disappear after concept demonstrated

### UI Components & Features

**In-Game Menu** (accessed via pause button):
- Restart game
- Quit game
- Change background (scroll selector)
- Quick Start Guide access
- Audio toggle (ON/OFF)
- Full Instructions link

**Hand Viewer Module**:
- Opens to show detailed view of cards in play
- Shows active effects and conditions
- Can access anytime, but affordances appear for special cards
- Toggle between "Your Hand" and "Opponent's Hand"
- Swipe to see all cards from current turn

**Tooltips & Teaching**:
- Dynamic tooltips at key moments
- Visual pulses highlight important actions
- "Tap to see effect" prompts for special cards
- Smart first-hand logic (controlled randomizer ensures variety)

**End Screen**: "One down, plenty more to go..."
- Victory animation (billionaire rockets to space)
- Three enlarged rockets pulse with confetti
- "Share with Friends" button
- "Play Again" button
- "Download Firefox" CTA
- Playful, celebratory tone

**Desktop View**:
- Mobile gameplay screen centered
- Space background with star field, comets, light trails
- OR 3D grid background slowly advancing
- Ambient motion, doesn't compete with gameplay

## 15. Additional Clarifications from Figma (Game Flow & UI)

### ✅ Complete Game Flow Defined:
1. Welcome → Select Billionaire → Billionaire Details → Select Background → Quick Start Guide → VS Animation → Gameplay → End Screen
2. All phases now mapped in GamePhase enum
3. Menu system clearly defined (pause button access)
4. Hand Viewer module for detailed card inspection
5. Tooltip system for onboarding ("teaching through play")
6. Desktop view with ambient backgrounds

### ✅ Data War Animation Details:
- High-energy Tier 3 takeover animation
- Characters slide in, "DATA WAR" text, speed lines
- Two-tap interaction: 3 face-down, then 1 face-up
- Strategic depth: More wars = more cards at stake

### ✅ Smart First-Hand Logic:
- Controlled randomizer ensures variety in first few hands
- Players see different card types early
- Ensures a few wins for confidence building
- Tooltips guide but don't interrupt

## 16. Remaining Questions & MVP Assumptions

**Status**: We have enough information to start implementation! The questions below have reasonable MVP assumptions that can be refined later.

### ✅ Clarified from Figma:
- **Instant vs Non-Instant**: Forced Empathy, Tracker Smacker, Hostile Takeover are instant
- **Effect Queue**: Non-instant effects trigger sequentially at end of hand in play order
- **Multiple Special Cards**: Yes, both can play in same turn, resolved in play order

### ✅ Confirmed from CARDS.md:

1. **Tracker Values**: ✓ Confirmed
   - tracker-1 = value 1 (2 copies)
   - tracker-2 = value 2 (2 copies)
   - tracker-3 = value 3 (2 copies)

2. **Blocker Values**: ✓ Confirmed
   - blocker-1 = value 0, subtracts 1 from opponent (2 copies)
   - blocker-2 = value 0, subtracts 2 from opponent (2 copies)

3. **Launch Stack Values**: ✓ Confirmed
   - All Launch Stacks = value 0 (auto-lose hand)
   - Trigger another play
   - Collect 3 different ones to win

4. **Open What You Want**: ✓ Confirmed
   - "Look at top 3 and arrange them in any order"
   - Doesn't play immediately, just reorders

5. **Hostile Takeover**: ✓ Confirmed
   - "Instant war against this 6"
   - "Ignores Trackers, Blockers, and ties on original play"

6. **Tracker Smacker Duration**: ✓ Confirmed
   - "Negate all opponent Tracker and Billionaire Move effects for the remainder of this turn"
   - Entire turn (could be multiple hands)

### ❓ Still Need Answers:

1. **Card Reordering**: Do won cards go to bottom of deck, top of deck, or shuffled back in?
   - Assumption for MVP: Bottom of deck (traditional War rules)

2. **Leveraged Buyout**: "Take 2 cards from the top of all opponent decks"
   - In 1v1: Take 2 from top of opponent's deck

3. **Temper Tantrum**: "Steal 2 cards from winner's win pile before they collect them"
   - Does this take from the cards about to be won, or from previously won cards?
   - Assumption for MVP: From the cards about to be collected in current hand

4. **Data Grab Card**: "Everyone grabs as many cards from the play area as possible"
   - Physical dexterity mechanic - how to implement digitally?
   - Assumption for MVP: Skip this card or replace with "random distribution of cards in play"

5. **Multiplayer vs 1v1**: CARDS.md mentions "all opponents" and passing decks "to the right"
   - For MVP: Adapt all "all opponents" effects to work in 1v1 (player vs CPU)
   - Forced Empathy: "pass decks right" = swap decks in 1v1

---

## 13. Additional Observations

### Performance Considerations
- Use `useMemo` for derived values (card counts, can-act state)
- Use `useCallback` for action creators passed to child components
- Consider `React.memo` for Card components to prevent unnecessary re-renders
- Animation performance: Use CSS transforms (not position changes) and `will-change`

### Accessibility
- Keyboard navigation for clicking deck
- Screen reader announcements for turn results
- Reduced motion preference for animations
- Clear visual feedback for all game states

### Error Boundaries
- Wrap game in error boundary to handle unexpected state corruption
- Provide "Reset Game" option if error occurs

### Debug Mode
- Consider adding a debug panel (dev mode only) to:
  - Manually trigger specific game states
  - Force specific cards to be drawn
  - Skip to game over state
  - View full game state JSON

### Mobile Performance
- Optimize for 60fps animations on mobile devices
- Minimize re-renders during animation phases
- Consider using `requestAnimationFrame` for complex animations
- Test on lower-end Android devices

---

## 17. Integrating XState + Zustand

### How They Work Together

**XState** manages the game flow (when things happen):
```typescript
// XState sends events to trigger Zustand actions
const [state, send] = useMachine(gameFlowMachine, {
  actions: {
    playPlayerCard: () => useGameStore.getState().playCard('player'),
    playCpuCard: () => useGameStore.getState().playCard('cpu'),
    resolveWinner: () => {
      const { player, cpu } = useGameStore.getState();
      // Determine winner and collect cards
    },
  },
});
```

**Zustand** manages the data (what exists):
```typescript
// Zustand provides data to XState guards
const gameFlowMachine = createMachine({
  // ...
  guards: {
    hasWinCondition: () => {
      const { winner, winCondition } = useGameStore.getState();
      return winner !== null && winCondition !== null;
    },
    isTie: () => {
      const { player, cpu } = useGameStore.getState();
      return player.playedCard?.value === cpu.playedCard?.value;
    },
  },
});
```

### Example: Complete Turn Flow

```typescript
// 1. Component renders based on XState state
function GameBoard() {
  const [state, send] = useMachine(gameFlowMachine);
  const { player, cpu, cardsInPlay } = useGameStore();

  // 2. User interaction
  const handleDeckTap = () => {
    if (state.matches('ready')) {
      send('REVEAL_CARDS'); // XState transition
    }
  };

  // 3. XState handles the flow
  useEffect(() => {
    if (state.matches('revealing')) {
      // Play cards (Zustand action)
      useGameStore.getState().playCard('player');
      useGameStore.getState().playCard('cpu');

      // XState auto-transitions to 'comparing' after delay
    }

    if (state.matches('comparing')) {
      const store = useGameStore.getState();

      // Check for tie
      if (store.player.playedCard?.value === store.cpu.playedCard?.value) {
        send('TIE'); // Go to data_war state
      } else {
        send('RESOLVE_TURN'); // Go to resolving state
      }
    }

    if (state.matches('resolving')) {
      // Determine winner and collect cards (Zustand)
      const store = useGameStore.getState();
      const winner = store.player.currentTurnValue > store.cpu.currentTurnValue
        ? 'player'
        : 'cpu';

      store.collectCards(winner, store.cardsInPlay);

      // Check win condition (XState guard)
      send('CHECK_WIN_CONDITION');
    }
  }, [state.value]);

  return (
    <div>
      <p>Phase: {state.value}</p>
      <DeckPile onClick={handleDeckTap} disabled={!state.matches('ready')} />
      {/* ... */}
    </div>
  );
}
```

### Benefits of This Architecture

1. **Clear Separation**: XState = behavior, Zustand = data
2. **Visual Debugging**: XState Inspector shows state transitions in real-time
3. **Time Travel**: Redux DevTools lets you replay game states
4. **Impossible States Eliminated**: XState prevents invalid transitions
5. **Easy Testing**: Test XState machine and Zustand actions independently

### Installation

```bash
# Install XState
pnpm add xstate @xstate/react

# Install Zustand
pnpm add zustand

# Optional: XState Inspector for visual debugging
pnpm add -D @statelyai/inspect
```

### DevTools Setup

**XState Inspector:**
```typescript
import { createBrowserInspector } from '@statelyai/inspect';

const inspector = createBrowserInspector();

const [state, send] = useMachine(gameFlowMachine, {
  inspect: inspector.inspect,
});
```

**Zustand DevTools:**
```typescript
import { devtools } from 'zustand/middleware';

export const useGameStore = create(
  devtools(
    (set) => ({ /* ... */ }),
    { name: 'DataWarGame' }
  )
);
```

---

## Conclusion

This plan provides a comprehensive roadmap for implementing the Data War game logic. The architecture is designed to be:

- **Modular**: Clear separation of concerns (XState for flow, Zustand for data, utilities for logic)
- **Testable**: State machines and store actions can be tested independently
- **Maintainable**: TypeScript types ensure correctness, visual state machine diagrams
- **Performant**: Zustand's minimal re-renders + XState's optimized transitions
- **Extensible**: Easy to add new phases, card types, or modify rules
- **Debuggable**: XState Inspector + Redux DevTools provide powerful debugging

The **Zustand + XState** approach is ideal for this complex card game, providing structure for both state management and game flow without unnecessary overhead.
