# Video Asset Preloading System

## Overview

The game uses WebM video animations for VS screens and Data War sequences. To ensure smooth playback without loading delays, we've implemented a background preloading system that intelligently identifies and preloads only the necessary video assets.

## Architecture

### Components

1. **`useVideoPreloader` hook** (`/hooks/use-video-preloader.ts`)

   - Core preloading logic
   - Creates hidden `<video>` elements with `preload="auto"` attribute
   - Tracks loading progress
   - Handles errors gracefully

2. **`VideoPreloader` component** (`/components/VideoPreloader/index.tsx`)

   - React component that uses the hook
   - Automatically determines which videos to preload based on game state
   - Renders nothing (invisible component)

3. **Integration in `App.tsx`**
   - Included at app level to start preloading as early as possible
   - Remains active throughout the game session

## Timing & Strategy

### When Preloading Begins

```
User Flow Timeline:
┌─────────────────┐
│ Welcome Screen  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Select          │  ← Player selects billionaire
│ Billionaire     │  ← CPU opponent is randomly assigned
└────────┬────────┘  ← Both billionaires now known
         │            ← cpuBillionaire state is set
         ▼            ▼ PRELOADING STARTS HERE
┌─────────────────┐
│ Select          │  ← Videos preload in background
│ Background      │  ← User is distracted picking background
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Intro Screen    │  ← preloading window
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Quick Start     │  ← preloading window
│ Guide           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Your Mission    │  ← preloading window
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ VS Animation    │  ◄─── VS asset required for play (already preloaded)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Gameplay        │  ← Data War animation is ready if needed
└─────────────────┘
```

### What Gets Preloaded

For each game session, **2 videos** are preloaded:

1. **VS Animation**: `{player}-vs-{cpu}` matchup (plays once at game start)
2. **Data War Animation**: Same matchup (may play multiple times during ties)

Example:

- Player selects: `chaz`
- CPU randomly assigned: `savannah`
- Preloads:
  - `https://.../R1_Chaz_vs_Savannah.webm` (VS)
  - `https://.../R1_DataWar_Chaz_vs_Savannah.webm` (Data War)

### Why This Timing Works

1. **State Available**: Both billionaires are known after `selectBillionaire()`
2. **Sufficient Time**: ~3-5 screens between selection and VS animation
3. **User Distraction**: User is engaged with UI during the preloading window
4. **No Unnecessary Loading**: Only videos that are essential the game session are preloaded

## Implementation Details

### Video Element Configuration

```typescript
const video = document.createElement('video');
video.src = url;
video.preload = 'auto'; // Download entire video
video.muted = true; // Required for autoplay policies
video.playsInline = true; // Mobile compatibility
```

### Preload Strategies

- **`auto`** (default): Browser downloads entire video
- **`metadata`** (alternative): Only downloads video metadata
- **`none`**: Disabled preloading

### State Dependencies

The preloader watches:

```typescript
const { selectedBillionaire } = useGameStore(); // Player's choice
const cpuBillionaire = useCpuBillionaire(); // CPU opponent
```

When either changes, preloading recalculates. In practice, both are set at once and they don't change until the game resets.

### Character Animation Mapping

Uses existing `getCharacterAnimation()` utility:

```typescript
getCharacterAnimation(
  playerBillionaire,
  cpuBillionaireId,
  'vs', // or 'datawar'
);
```

This handles:

- Bidirectional matchups (chaz-vs-savannah = savannah-vs-chaz)
- Fallback to default if animation missing
- Format preference (WebM preferred, MP4 fallback)

## Benefits

1. **Instant Playback**: Videos play immediately without loading delay
2. **Smooth UX**: No jarring pauses during critical game moments
3. **Background**: Doesn't block UI or user interactions
4. **Resilient**: Gracefully handles missing/failed videos

## Performance Impact

- **Memory**: ~2-4MB per game session (2 preloaded videos)
- **Network**: ~1-4MB download (per session, assuming different billionaires each session)
- **CPU**: Negligible (browser-native video preload)

## Debugging

Enable development logging:

```typescript
// In VideoPreloader component
if (import.meta.env.DEV) {
  console.log(`📹 Video preloader: ${preloadedCount}/${totalCount} videos ready`);
}

// In useVideoPreloader hook
console.log(`✓ Preloaded video: ${url.split('/').pop()}`);
console.error(`✗ Failed to preload video: ${url.split('/').pop()}`);
```

## Testing

Run tests:

```bash
pnpm test use-video-preloader
```

Coverage:

- ✅ Preloads when enabled
- ✅ Skips when disabled
- ✅ Filters undefined URLs
- ✅ Sets correct video properties
- ✅ Tracks loading progress
- ✅ Prevents duplicate preloads
- ✅ Updates when URLs change

## Future Enhancements

Potential improvements:

1. **Priority Preloading**: Preload VS first, then Data War
2. **Connection-Aware**: Adjust strategy based on network speed
3. **Cache Headers**: Leverage HTTP caching for returning players
4. **Service Worker**: Offline support and advanced caching
5. **Metrics**: Track preload success rates and timing

## Troubleshooting

**Console errors:**

- Check video URLs are valid
- Verify CORS headers on video server
- Check browser video format support

**Memory concerns:**

- Preloaded videos are (relatively) small (~500KB-2MB)
- Browser manages memory automatically
- Videos are garbage collected when no longer referenced
