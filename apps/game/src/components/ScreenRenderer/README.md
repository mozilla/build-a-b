# Screen Renderer

The ScreenRenderer is responsible for displaying intro/setup screens and their backgrounds. During actual gameplay, the Game component handles rendering.

## Architecture

### Two-Layer Background System

Backgrounds are **split between two components** for proper separation of concerns:

**1. ScreenRenderer/Background** (this component)

- Handles: Night sky and billionaire backgrounds
- Active during: Setup, selection, and intro screens
- Returns `null` during gameplay states

**2. Game/Board** (in `components/Game`)

- Handles: User-selected gameplay backgrounds
- Active during: All gameplay states (`ready`, `revealing`, `comparing`, etc.)
- Always rendered behind ScreenRenderer in DOM

This ensures:

- ✅ No conflicting background renders
- ✅ Clear responsibility boundaries
- ✅ Game owns gameplay visuals
- ✅ ScreenRenderer owns intro visuals

## Components

### `ScreenRenderer` (index.tsx)

Main component that renders the appropriate screen component for the current game phase.

**Structure:**

1. `ScreenBackground` - Rendered first (behind)
2. Screen Component - Rendered second (in front)

This DOM order naturally handles z-indexing without explicit z-index styles.

### `ScreenBackground` (Background.tsx)

Manages background images for intro/setup phases only. Backgrounds change based on:

- Current game state/phase
- Selected billionaire (for intro/mission screens)

**Note**: This component returns `null` during gameplay states - the Game component handles those backgrounds.

## Background System

### Backgrounds Handled by ScreenRenderer

**1. Night Sky** (`color_nightsky.webp`)

- Used for: Setup and selection screens
- States: `welcome`, `select_billionaire`, `select_background`, `quick_start_guide`
- Styling: Full-screen, no blur

**2. Billionaire Backgrounds**

- Used for: Intro and mission screens
- States: `intro`, `your_mission`, `vs_animation`
- Styling: Blurred (2px) with dark overlay
- Dynamic: Changes based on `selectedBillionaire` from game store
- Available characters:
  - Chaz (`color_chaz.webp`)
  - Chloe (`color_chloe2.webp`)
  - Savannah (`color_savannah.webp`)
  - Walter (`color_walter.webp`)
  - Poindexter (`color_poindexter.webp`)
  - Prudence (`color_prudence.webp`)

### Backgrounds Handled by Game Component

**Gameplay Backgrounds** - See `components/Game/index.tsx`

- Used for: Active card gameplay
- States: `ready`, `revealing`, `comparing`, `data_war`, `special_effect`, `resolving`, `game_over`
- Dynamic: Changes based on `selectedBackground` from game store
- Available backgrounds:
  - Blue (`color_blue.webp`) - Default
  - Felt (`color_felt.webp`)
  - Table (`color_table.webp`)
  - Nebula (`color_nebula.webp`)
  - Orange (`color_orange.webp`)
  - Black (`color_black.webp`)

### Background Effects

#### Blur Filter

Applied to backgrounds during:

- Intro screens (to focus on content)
- Mission screen
- VS animation

#### Dark Overlay

20% dark gradient applied with blur to increase text contrast

#### Grid Overlay

Accent-colored glow effect (`#53ffbc`) applied during:

- Quick Start Guide (creates a game board aesthetic)

## State-to-Background Mapping

```typescript
const STATE_BACKGROUND_CONFIG = {
  // Setup - Night Sky
  welcome: { variant: 'night-sky' },
  select_billionaire: { variant: 'night-sky' },
  select_background: { variant: 'night-sky' },

  // Intro - Blurred Billionaire
  intro: { variant: 'billionaire', blur: true, overlay: true },
  your_mission: { variant: 'billionaire', blur: true, overlay: true },

  // Guide - Grid Overlay (still uses night sky, grid is just a visual effect)
  quick_start_guide: { variant: 'night-sky', gridOverlay: true },

  // VS Animation - Blurred Billionaire
  vs_animation: { variant: 'billionaire', blur: true, overlay: true },

  // Gameplay states - Returns null, Game/Board handles background
  // ready, revealing, comparing, data_war, special_effect, resolving, game_over
};
```

ready: { variant: 'gameplay' },
revealing: { variant: 'gameplay' },
comparing: { variant: 'gameplay' },
data_war: { variant: 'gameplay' },
special_effect: { variant: 'gameplay' },
resolving: { variant: 'gameplay' },
game_over: { variant: 'gameplay' },
};

````

## Usage

The ScreenRenderer is used in the main App component:

```tsx
import { ScreenRenderer } from '@/components/ScreenRenderer';

function App() {
  return <ScreenRenderer />;
}
````

Backgrounds are automatically managed - no props needed. The component:

1. Reads current phase from the game machine (`useGameMachine`)
2. Reads selected billionaire/background from game store (`useGameStore`)
3. Applies appropriate background with effects based on configuration

## Adding New Screens

To add a new screen:

1. Create the screen component in `components/Screens/`
2. Add it to `SCREEN_REGISTRY` in `index.tsx`
3. Add background configuration in `Background.tsx` `STATE_BACKGROUND_CONFIG`
4. Add the state to the game flow machine (`gameFlowMachine.ts`)

## Background Assets

All backgrounds are WebP format and located in:

```
src/assets/backgrounds/
```

Images are imported at build time (not loaded dynamically) for optimal performance.
