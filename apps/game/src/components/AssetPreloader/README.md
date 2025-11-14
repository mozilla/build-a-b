# AssetPreloader Component

Automatically preloads all game image assets in priority order for optimal mobile performance.

## Usage

```tsx
import { AssetPreloader } from '@/components';

function App() {
  return (
    <div>
      {/* Renders nothing, triggers background preloading */}
      <AssetPreloader />

      {/* Your app content */}
    </div>
  );
}
```

## Props

| Prop         | Type      | Default | Description               |
| ------------ | --------- | ------- | ------------------------- |
| `enabled`    | `boolean` | `true`  | Enable/disable preloading |
| `batchDelay` | `number`  | `50`    | Delay between assets (ms) |

## Priority Strategy

Assets are automatically organized by when they appear in the user journey:

### Critical (Loads First)

- Night sky background
- All 6 billionaire avatars

### High (Loads Second)

- All 9 background options

### Medium (Loads Third)

- Card back image
- All card images from deck

### Low (Loads Last)

- Currently none

## Example: Custom Configuration

```tsx
// Faster loading (may overwhelm slow connections)
<AssetPreloader batchDelay={10} />

// Slower loading (safer for very slow connections)
<AssetPreloader batchDelay={100} />

// Disable preloading
<AssetPreloader enabled={false} />
```

## Development Logging

In development mode, the component logs progress to console:

```
🖼️  Asset preloader: 5/75 (7%) | Critical: 5/7 | High: 0/9 | Medium: 0/66
🖼️  Asset preloader: 16/75 (21%) | Critical: 7/7 | High: 9/9 | Medium: 0/66
🖼️  Asset preloader: 75/75 (100%) | Critical: 7/7 | High: 9/9 | Medium: 66/66
```

## Asset Sources

Assets are pulled from:

- `BILLIONAIRES` config (avatars)
- Background imports (9 backgrounds)
- `DEFAULT_GAME_CONFIG.deckComposition` (cards)
- `CARD_BACK_IMAGE` constant

## Performance

- **Total Assets:** ~75 images
- **Critical Path:** 7 images (~500KB)
- **Full Load:** ~10-15MB
- **Batch Delay:** Reduces network congestion on slower connections

## Related

- [use-asset-preloader.ts](../../hooks/use-asset-preloader.ts) - Hook implementation
- [ASSET_PRELOADING.md](../../docs/ASSET_PRELOADING.md) - System documentation
- [VideoPreloader](../VideoPreloader/) - Video preloading component
