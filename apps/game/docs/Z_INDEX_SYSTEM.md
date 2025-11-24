# Z-Index System Documentation

## Overview

This document describes the centralized z-index system for the game application. The system provides semantic, well-organized z-index values to ensure consistent layering across all components.

## Location

The z-index system is defined in: `/src/styles/z-index.css`

It's automatically imported via `globals.css` and available throughout the application.

## Layer Hierarchy

The z-index system is organized into 10 distinct layers, from lowest to highest priority:

### 1. Base Layer (0 to 19)
Background elements and containers.

- `--z-base: 0` - Default base layer
- `--z-behind: -10` - Elements that should appear behind others

### 2. Card Layer (20 to 500)
Game cards in various states.

- `--z-card-settled: 20` - Cards that have landed on the tableau
- `--z-card-settled-max: 100` - Maximum z-index for settled cards
- `--z-card-in-flight: 500` - Cards being played or animated

### 3. Collection Layer (150 to 200)
Card collection animations at end of round.

- `--z-collection-loser: 150` - Loser's cards during collection
- `--z-collection-winner: 200` - Winner's cards during collection

### 4. UI Element Layer (20 to 99, except deck interaction at 550)
Interactive UI elements and controls.

- `--z-deck-interaction: 550` - Deck interaction zones (must be above in-flight cards at 500)
- `--z-ui-element: 30` - General UI elements
- `--z-badge: 50` - Badges and indicators

### 5. Overlay Layer (100 to 499)
Tooltips, popovers, and dropdowns.

- `--z-tooltip-base: 48` - Base tooltip layer
- `--z-tooltip: 100` - Standard tooltips
- `--z-popover: 150` - Popovers and dropdowns
- `--z-screen-transition: 100` - Screen transition overlays

### 6. Menu Layer (2000 to 2099)
Menu overlays and navigation.

- `--z-menu-backdrop: 2000` - Menu backdrop overlay
- `--z-menu-content: 2001` - Menu content
- `--z-menu-modal-backdrop: 2002` - Modal within menu backdrop
- `--z-menu-modal-bg: 2003` - Modal within menu background
- `--z-menu-modal-content: 2004` - Modal within menu content

### 7. Modal & Dialog Layer (500 to 600)
Modals, dialogs, and critical overlays.

- `--z-modal-backdrop: 500` - Modal backdrops
- `--z-modal-content: 550` - Modal content
- `--z-loading-screen: 580` - Loading screen
- `--z-critical: 600` - Critical overlays (Temper Tantrum, notifications, etc.)

### 8. Special Animation Layer (700 to 800)
Full-screen animations and game cinematics.

- `--z-game-over-screen: 700` - Game over screen (revealed when winner animation fades)
- `--z-special-animation: 750` - Special card animations, Data Grab mini-game, Data War
- `--z-winner-animation: 800` - Winner animation screen (highest priority animation)

### 9. Debug Layer (9000+)
Development and testing tools (always on top).

- `--z-debug-panel: 9000` - Debug panels
- `--z-debug-tooltip: 9100` - Debug tooltips

### 10. Maximum Layer (10000+)
Reserved for extreme edge cases.

- `--z-max: 10000` - Highest possible z-index

## Usage

### Using CSS Variables (Recommended)

Use CSS variables in inline styles for maximum compatibility:

```tsx
<div style={{ zIndex: 'var(--z-winner-animation)' }}>
  Winner Animation
</div>
```

### Using Tailwind Utilities (If Generated)

If Tailwind generates utility classes from the theme values:

```tsx
<div className="z-winner-animation">
  Winner Animation
</div>
```

### In Styled Components or CSS

```css
.my-component {
  z-index: var(--z-tooltip);
}
```

## Migration Guide

### Before (Anti-pattern)

```tsx
// ❌ Arbitrary z-index values
<div className="z-[150]">...</div>
<div style={{ zIndex: 9999 }}>...</div>
<Tooltip classNames={{ base: ['z-[48]'] }} />
```

### After (Best Practice)

```tsx
// ✅ Semantic z-index values
<div style={{ zIndex: 'var(--z-popover)' }}>...</div>
<div style={{ zIndex: 'var(--z-modal-content)' }}>...</div>
<Tooltip style={{ zIndex: 'var(--z-tooltip)' }} />
```

## Common Use Cases

### Cards on the Tableau
```tsx
// Cards that have landed
style={{ zIndex: 'var(--z-card-settled)' }}

// Cards in flight
style={{ zIndex: 'var(--z-card-in-flight)' }}
```

### Tooltips
```tsx
<Tooltip style={{ zIndex: 'var(--z-tooltip)' }}>
  Tooltip content
</Tooltip>
```

### Modals
```tsx
<Modal
  classNames={{
    backdrop: 'z-modal-backdrop',
    wrapper: 'z-modal-content',
    base: 'z-modal-content',
  }}
>
  Modal content
</Modal>
```

### Full-Screen Animations
```tsx
<div style={{ zIndex: 'var(--z-winner-animation)' }}>
  Winner Animation
</div>

<div style={{ zIndex: 'var(--z-special-animation)' }}>
  Data Grab Mini Game
</div>
```

### Debug Panels
```tsx
<div style={{ zIndex: 'var(--z-debug-panel)' }}>
  Debug UI
</div>
```

## Best Practices

1. **Always use semantic z-index variables** instead of arbitrary numbers
2. **Never use inline numeric z-index values** unless absolutely necessary for dynamic calculations
3. **Document any deviations** from the standard system in code comments
4. **Add new layers to z-index.css** if you need a new semantic layer
5. **Keep related elements in the same layer** for easier maintenance

## Troubleshooting

### Element Not Appearing Above Another

1. Check that you're using the correct layer for each element
2. Verify the z-index CSS variable is being applied (inspect in DevTools)
3. Ensure parent elements don't have `position: relative` or lower z-index that creates a new stacking context
4. Check if elements are in different stacking contexts (created by transform, opacity, etc.)

### Z-Index Not Working

Common causes:
- Element doesn't have `position` set (`relative`, `absolute`, `fixed`, or `sticky`)
- Parent element creates a new stacking context
- CSS variable not imported (should be automatic via globals.css)

## Current Component Mapping

Components using the new system:

- ✅ `DeckInteractionZone` - Uses `--z-deck-interaction` (550)
- ✅ `WinnerAnimation` - Uses `--z-winner-animation` (800)
- ✅ `GameOver` - Uses `--z-game-over-screen` (700)

Components to migrate:
- Tooltip - Currently uses z-[48] and inline 100 → Migrate to `--z-tooltip` (100)
- SpecialCardAnimation - Currently uses z-[9998] → Migrate to `--z-special-animation` (750)
- DataWarAnimation - Currently uses z-[9998] → Migrate to `--z-special-animation` (750)
- DataGrabMiniGame - Currently uses z-[9998] → Migrate to `--z-special-animation` (750)
- Modals (various) - Currently use z-[9999] → Migrate to `--z-modal-content` (550) or `--z-critical` (600)
- Menu - Currently uses z-2000 to z-2004 → Already aligned with `--z-menu-*` (2000-2004)
- Debug panels - Currently use z-[999] and z-[9999] → Migrate to `--z-debug-panel` (9000) and `--z-debug-tooltip` (9100)

## Adding New Z-Index Values

If you need a new semantic z-index value:

1. Open `/src/styles/z-index.css`
2. Add the new variable to the appropriate layer in the `@theme` block
3. Update this documentation with the new value
4. Use the new variable in your component

Example:
```css
@theme {
  /* Add to appropriate layer */
  --z-my-new-layer: 250;
}
```

## Questions?

If you have questions about which z-index layer to use for a component, refer to the layer hierarchy above or consult with the team.

