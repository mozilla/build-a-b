# Game Store Functions

This directory contains the game store functions organized by domain/responsibility. Each file groups related functions that manage a specific aspect of the game.

## Directory Structure

### Core Game Flow
- **`player-actions.ts`** - Player state management (setActivePlayer, setAnotherPlayMode)
- **`card-collection.ts`** - Card collection and distribution logic (collectCards, stealCards)
- **`game-lifecycle.ts`** - Game initialization, reset, win conditions, and turn resolution

### Special Card Types
- **`data-war.ts`** - Data War detection and logic
- **`data-grab.ts`** - Data Grab mini-game state and logic
- **`owyw.ts`** - Open What You Want (OWYW) card selection
- **`temper-tantrum.ts`** - Temper Tantrum card selection modal
- **`launch-stacks.ts`** - Launch Stack management, theft, and reordering
- **`forced-empathy.ts`** - Forced Empathy deck swapping

### Effects System
- **`special-effects.ts`** - Special effect processing pipeline (trackers, blockers, clearActiveEffects)
- **`effect-notifications.ts`** - Effect notification badges, modals, and accumulation
- **`pre-reveal.ts`** - Pre-reveal effects (effects that trigger before card reveal)

### Animation & UI
- **`animations.ts`** - Animation queue management and special card animations
- **`ui-actions.ts`** - UI state management (billionaire/background selection, pause/menu toggles, audio toggles)
- **`tooltips.ts`** - Tooltip display management and play trigger tracking
- **`audio-manager.ts`** - Comprehensive audio playback system (music/SFX channels, volume, fading)
- **`asset-preloading.ts`** - Asset preloading progress tracking and loading screen state

### Utilities
- **`helpers.ts`** - Helper functions (createInitialPlayer)
- **`debug.ts`** - Debug logging and game speed control

## Module Summary

| Module | Functions Count | Dependencies |
|--------|----------------|--------------|
| player-actions | 2 | Minimal |
| game-lifecycle | 4 | helpers, deck-builder |
| card-collection | 4 | animations |
| special-effects | 9+ | Most modules (central coordinator) |
| data-war | 1 | card-collection |
| data-grab | 5 | card-collection |
| owyw | 5 | Minimal |
| temper-tantrum | 4 | card-collection, launch-stacks |
| launch-stacks | 6 | game-lifecycle |
| forced-empathy | 2 | Minimal |
| animations | 10+ | Minimal |
| effect-notifications | 15+ | Minimal |
| pre-reveal | 4 | Minimal |
| tooltips | 10 | Minimal |
| ui-actions | 10 | audio-manager |
| audio-manager | 9 | audio-config, audio-preloader |
| asset-preloading | 4 | animation-timings |
| debug | 2 | Minimal |

## Function Organization Principles

1. **Single Responsibility** - Each file handles one domain/feature
2. **Type Safety** - All functions use proper TypeScript types from `../types.ts`
3. **Factory Pattern** - Functions are created using factory functions that receive `set` and `get`
4. **Clear Naming** - Function names clearly indicate their purpose
5. **No Circular Dependencies** - Modules are organized to avoid circular imports

## Usage Example

```typescript
// In game-store.ts
import { createPlayerActions } from './functions/player-actions';
import { createCardCollectionActions } from './functions/card-collection';
import { createGameLifecycleActions } from './functions/game-lifecycle';
// ... other imports

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      player: createInitialPlayer('player'),
      cpu: createInitialPlayer('cpu'),
      // ... other state

      // Spread extracted function modules
      ...createPlayerActions(set),
      ...createGameLifecycleActions(set, get),
      ...createCardCollectionActions(set, get),
      // ... other function groups
    }),
    { name: 'DataWarGame' },
  ),
);
```

## Factory Function Signatures

Most modules follow these patterns:

- **No parameters**: `createAudioActions()` - No access to store needed
- **Set only**: `createPlayerActions(set)` - Only needs to update state
- **Set + Get**: `createCardCollectionActions(set, get)` - Needs to read and update state

## Dependencies Between Modules

**High-level modules** (depend on many others):
- `special-effects` - Central coordinator for effect processing
- `card-collection` - Depends on animations, player state
- `game-lifecycle` - Depends on helpers, deck-builder

**Mid-level modules** (some dependencies):
- `data-grab` - Depends on card-collection, effect-notifications
- `temper-tantrum` - Depends on card-collection, launch-stacks
- `ui-actions` - Depends on audio-manager

**Low-level modules** (minimal dependencies):
- `player-actions`, `forced-empathy`, `tooltips`, `animations`

When adding new functions, consider:
1. Where does this function logically belong?
2. What other modules does it depend on?
3. Could this create a circular dependency?
4. Does it need access to `set` only, or both `set` and `get`?

## State Management Best Practices

### ✅ Correct Usage

```typescript
// Always call get() at runtime, not at initialization
someAction: () => {
  const currentState = get();  // ✅ Fresh state
  const player = get().player;  // ✅ Current player
}

// Call other actions via get()
someAction: () => {
  get().playAudio(TRACKS.WHOOSH);  // ✅ Works across modules
}
```

### ❌ Incorrect Usage

```typescript
// Don't cache get() results at initialization
const state = get();  // ❌ Stale state
return {
  someAction: () => state.player  // ❌ Always returns initial state
}

// Don't try to call functions that aren't added to store yet
hasSeenAllPlayTriggers: () => { /* ... */ },
shouldShow: () => {
  return get().hasSeenAllPlayTriggers();  // ❌ Not available yet
}
```

## Testing

Each module can be tested independently by mocking the Zustand `set` and `get` functions:

```typescript
import { createPlayerActions } from './player-actions';

describe('player-actions', () => {
  it('sets active player', () => {
    const set = jest.fn();
    const actions = createPlayerActions(set);

    actions.setActivePlayer('cpu');

    expect(set).toHaveBeenCalledWith({ activePlayer: 'cpu' });
  });
});
```

## Migration Notes

This refactoring reduced `game-store.ts` from ~1100 lines to ~217 lines by extracting all functions into 18 logical modules. The store behavior remains identical - all functions are spread into the same store object with the same closure semantics.
