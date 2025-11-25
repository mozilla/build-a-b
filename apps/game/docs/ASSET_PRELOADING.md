# Asset Preloading System

## Overview

The asset preloading system intelligently loads image and video assets in strict priority order to optimize the user experience, especially for mobile users on slow connections. Assets are categorized and loaded based on when they appear in the user journey, with **priority barriers** ensuring higher-priority assets complete before lower-priority assets begin.

The system integrates with the game's XState state machine to prevent progression until required assets are loaded, providing smooth transitions and preventing broken images.

## Architecture

### Components

1. **AssetPreloader** - Preloads images (backgrounds, avatars, cards) with priority barriers
2. **VideoPreloader** - Preloads video animations (VS and Data War) with global caching
3. **PreloadingProvider** - Coordinates preloading and manages state
4. **LoadingScreen** - Displays phase-specific loading progress to users
5. **State Machine Guards** - Prevents state transitions until assets ready

### Hooks

1. **`use-asset-preloader.ts`** - Priority-based image preloading with strict tier enforcement
2. **`use-video-preloader.ts`** - Video preloading with global Map for reuse
3. **`use-preloading.ts`** - Exposes preloading state and progress to components

## Priority Strategy

### Image Assets (AssetPreloader)

Assets are organized into 4 priority levels based on user journey timing. **Priority barriers ensure each tier completes before the next tier begins**, preventing resource contention on slow connections.

#### Critical Priority (7 assets)

**When:** First 2 screens (welcome, select_billionaire)  
**Assets:**

- Night sky background (welcome screen)
- 6 billionaire avatars (Chaz, Chloe, Savannah, Walter, Enzo, Prudence)

**Why:** These are seen within seconds of app loading.

**Blocking Behavior:** Must complete before high-priority assets begin loading.

#### High Priority (9 assets)

**When:** Screen 3+ (select_background, intro, mission)  
**Assets:**

- 9 background images (6 billionaire-themed + nebula, nightsky, felt)

**Why:** These are seen during intro/setup screens after billionaire selection. Users cannot proceed to background selection until these are loaded.

**Blocking Behavior:**

- Cannot start until critical assets complete
- Must complete before medium-priority assets begin loading

#### Medium Priority (67 assets)

**When:** Gameplay phase  
**Assets:**

- Card back image
- 66+ unique card images from deck composition

**Why:** These are only seen once gameplay begins. Loading these earlier would slow down background loading.

**Blocking Behavior:**

- Cannot start until high-priority assets complete
- Must complete before low-priority assets begin loading
- State machine guard (`assetsPreloaded`) prevents VS animation until ready

#### Low Priority (0 assets currently)

**When:** Rarely or conditionally  
**Assets:**

- None currently (placeholder for future assets)

**Why:** Optional or edge-case assets.

**Blocking Behavior:** Cannot start until medium-priority assets complete.

### Video Assets (VideoPreloader)

Videos are preloaded based on matchup using a **global Map** to prevent duplicate downloads and enable reuse:

- **VS Animation** (30 possible variations - 1 per game)
- **Data War Animation** (30 possible variations - 1 per game)

**Total per session:** 2 videos (the specific matchup for the current game)

**Timing:** Starts after billionaire selection, completes before VS animation plays.

**Reuse Strategy:** Videos are stored in a global Map and reused if the user replays. The `getPreloadedVideo(url)` function retrieves cached videos, preventing AbortErrors from recreating video elements.

**Event-Driven Playback:** The VS animation transition is triggered by the video's `ended` event rather than a timer, ensuring precise transitions regardless of video duration or performance variations.

## User Journey Flow

```
1. App loads
   └─> AssetPreloader starts immediately (critical assets only)
   └─> High/medium/low assets BLOCKED until critical completes

2. Welcome screen (uses night sky background)
   └─> Critical assets ready

3. Select Billionaire screen (displays avatars)
   └─> Critical assets complete
   └─> High priority loading begins (backgrounds)
   └─> Medium/low assets BLOCKED until high completes

4. Billionaire selected
   └─> VideoPreloader determines matchup
   └─> Starts preloading matchup-specific videos (VS + Data War)

5. Transition to select_background
   └─> LoadingScreen displays if backgrounds not ready
   └─> Shows highPriorityProgress (critical + high only)
   └─> State machine guard blocks until highPriorityAssetsReady = true
   └─> 800ms delay after 100% for "Loading Complete!" visibility

6. Select Background screen (displays all backgrounds)
   └─> High priority assets complete
   └─> Medium priority loading begins (cards)
   └─> Low assets BLOCKED until medium completes

7. Intro/Mission screens (uses billionaire background)
   └─> High priority assets ready
   └─> Medium priority loading continues in background
   └─> LoadingScreen displays if essential assets not ready
   └─> Shows essentialProgress (critical + high + medium)

8. Transition to VS Animation
   └─> State machine guard blocks until preloadingComplete = true
   └─> 800ms delay after 100% for visual confirmation
   └─> Video must be fully buffered (canplaythrough event)

9. VS Animation plays
   └─> Uses preloaded video from global Map (no AbortError)
   └─> Video 'ended' event triggers transition (event-driven, not timer-based)
   └─> Precise timing regardless of performance variations

10. Gameplay begins
    └─> Medium priority assets (cards) ideally complete
    └─> Low priority assets load in background (if any exist)
```

## Technical Implementation

### Priority Barrier System

The core innovation is **strict priority enforcement**. Lower-priority assets cannot begin loading until all higher-priority assets complete:

```typescript
// Check if current priority tier is complete before allowing next tier
const isCurrentPriorityComplete = () => {
  if (!currentPriority) return true;

  const currentPriorityAssets = urlsToPreload.filter(
    ({ priority }) => priority === currentPriority,
  );

  return currentPriorityAssets.every(({ url }) => globalPreloadedImages.get(url)?.loaded);
};

// In preloadNext(), enforce barrier when changing priority tiers
if (currentPriority !== priority) {
  if (currentPriority !== null && !isCurrentPriorityComplete()) {
    // Wait and retry - don't start next tier yet
    setTimeout(preloadNext, 50);
    return;
  }
  currentPriority = priority;
}
```

**Benefits:**

- Backgrounds load faster (no competition from cards)
- Users reach background selection sooner
- Critical path completes before optional assets start
- Predictable performance on slow connections

### Image Preloading

Uses `new Image()` with priority queue and advanced optimizations:

```typescript
const img = new Image();
img.onload = async () => {
  await img.decode(); // Pre-decode into bitmap cache
  globalContainer.appendChild(img); // Keep reference alive
  globalPreloadedImages.set(url, img); // Prevent duplicates
  setLoadCount((prev) => prev + 1); // Trigger React re-render
};
img.src = assetUrl; // Triggers browser fetch
```

**Key Features:**

- **Priority Barriers:** Higher tiers complete before lower tiers start
- **Batch Delay:** 50ms between assets within a tier (prevents network congestion)
- **Image Decoding:** Pre-decodes images for instant rendering
- **Global Registry:** Prevents duplicate downloads across component remounts
- **Hidden DOM Container:** Keeps images in memory and browser cache
- **React StrictMode Safe:** Handles double-mounting in development mode
- **Reactive UI:** useState triggers re-render on each asset load

### Video Preloading

Uses native HTML5 video with global Map for reuse:

```typescript
const video = document.createElement('video');
video.preload = 'auto'; // Browser optimizes loading
video.src = videoUrl;

// Wait for full buffering
video.addEventListener('canplaythrough', () => {
  globalPreloadedVideos.set(url, video);
  setLoadCount((prev) => prev + 1); // Trigger React re-render
});

// Retrieve for playback (prevents AbortError)
export function getPreloadedVideo(url: string): HTMLVideoElement | undefined {
  return globalPreloadedVideos.get(url);
}
```

**Browser Intelligence:** Lets browser decide optimal loading strategy while preventing duplicate elements.

### State Machine Integration

The XState game flow machine allows free navigation between setup screens. The `ScreenRenderer` component displays phase-specific loading screens **after** transitioning to each state when assets aren't ready yet.

#### Flow Architecture

1. **Welcome → Select Billionaire**: Transition happens immediately. If `criticalPriorityAssetsReady` is false, `ScreenRenderer` shows critical LoadingScreen until avatars load.

2. **Select Billionaire → Select Background**: Transition happens immediately. If `highPriorityAssetsReady` is false, `ScreenRenderer` shows backgrounds LoadingScreen until backgrounds load.

3. **Intro/Mission → VS Animation**: Uses `assetsPreloaded` guard to block transition until all essential assets ready.

#### Guard: `assetsPreloaded`

```typescript
guards: {
  assetsPreloaded: () => {
    const { preloadingComplete } = useGameStore.getState();
    return preloadingComplete === true;
  };
}
```

**Purpose:** Prevents entering `vs_animation` state until essential assets (critical + high + medium) are loaded. This is the only guard needed since the VS animation cannot function without all assets.

**Delay:** 800ms after reaching 100% before `preloadingComplete` becomes true, **but only if the user actually saw the LoadingScreen**. If assets complete before the user attempts to transition (fast connections), they proceed immediately without delay.

**Why other states don't need guards:** The `ScreenRenderer` handles displaying LoadingScreen for `select_billionaire` and `select_background` states, allowing users to see progress after transitioning rather than blocking the transition.

### Event-Driven VS Animation

The VS animation uses the video's `ended` event to trigger the state machine transition:

```typescript
const handleVideoEnd = useCallback(() => {
  send({ type: 'VS_ANIMATION_COMPLETE' });
}, [send]);

useEffect(() => {
  const videoElement = videoRef.current;
  if (videoElement) {
    videoElement.addEventListener('ended', handleVideoEnd);
    return () => videoElement.removeEventListener('ended', handleVideoEnd);
  }
}, [handleVideoEnd]);
```

**Benefits:**

- Precise timing regardless of video duration
- No race conditions from timers
- Works correctly even if performance varies
- Simpler, more maintainable code

### Phase-Specific Progress Tracking

The system tracks three distinct progress metrics for different game phases:

#### Critical Progress

```typescript
const criticalProgress =
  stats.critical.total > 0 ? (stats.critical.loaded / stats.critical.total) * 100 : 0;
```

**Used for:** LoadingScreen after clicking START_GAME, before billionaire selection (only billionaire avatars)

#### High-Priority Progress

```typescript
const highPriorityLoaded = stats.critical.loaded + stats.high.loaded;
const highPriorityTotal = stats.critical.total + stats.high.total;
const highPriorityProgress = (highPriorityLoaded / highPriorityTotal) * 100;
```

**Used for:** LoadingScreen during transition to background selection (backgrounds only, not cards)

#### Essential Progress

```typescript
const essentialLoaded = stats.critical.loaded + stats.high.loaded + stats.medium.loaded;
const essentialTotal = stats.critical.total + stats.high.total + stats.medium.total;
const essentialProgress = (essentialLoaded / essentialTotal) * 100;
```

**Used for:** LoadingScreen during intro/mission screens (cares about all gameplay assets)

This prevents confusing UX where progress bar shows 20% when backgrounds are actually 100% loaded.

## Mobile Optimization

### Key Considerations

1. **Priority Barriers (NEW)**

   - Higher-priority tiers MUST complete before lower tiers start
   - Prevents medium-priority cards from slowing down high-priority backgrounds
   - Ensures critical path completes as fast as possible
   - Users see important screens sooner on slow connections

2. **Phase-Specific Loading Screens**

   - Different loading screens for different phases:
     - **Critical phase:** "Loading Billionaires..." (only billionaire avatars, `criticalProgress`)
     - **Backgrounds phase:** "Loading Backgrounds..." (background images, `highPriorityProgress`)
     - **Essential phase:** "Loading Cards..." (all gameplay assets, `essentialProgress`)
   - Progress bars accurately reach 100% when phase-specific assets complete

3. **State Machine Guards**

   - Only `assetsPreloaded` guard needed (for VS animation)
   - Setup screens (`select_billionaire`, `select_background`) use post-transition LoadingScreen via `ScreenRenderer`
   - Allows immediate navigation while showing progress after transition
   - **Smart delays:** 800ms after 100% only if user saw LoadingScreen, otherwise 0ms
   - Fast connections proceed immediately without artificial waiting

4. **Batch Delays**

   - 50ms delay between image loads within a tier
   - Prevents overwhelming slow connections
   - Allows browser to manage bandwidth effectively
   - Sequential loading within tiers prevents request queuing

5. **Progressive Enhancement**

   - App works even if assets haven't loaded (guards prevent broken states)
   - Preloading improves UX but isn't required for basic functionality
   - LoadingScreen provides feedback during waits
   - Fallbacks in place for edge cases

6. **Network-Aware**

   - Assets load in background without blocking UI
   - Priority barriers optimize critical path
   - Browser cache handles repeat visits
   - Global registries prevent duplicate downloads on remount

7. **Video Optimization**
   - Global Map prevents duplicate video element creation
   - Reuses cached videos for replays (no AbortError)
   - Event-driven playback (no timer race conditions)
   - Browser controls buffering strategy with `preload="auto"`

## Configuration

### AssetPreloader Options

```typescript
useAssetPreloader(assets, {
  enabled: true, // Enable/disable preloading
  batchDelay: 50, // ms between assets within a tier (default: 50)
});
```

**Note:** Priority barriers operate independently of `batchDelay`. The delay controls spacing between individual assets within a tier, while priority barriers ensure entire tiers complete before the next begins.

### VideoPreloader Options

```typescript
useVideoPreloader(videos, {
  enabled: true, // Enable/disable preloading
});
```

### Zustand Store State

The game store tracks preloading state:

```typescript
{
  // Critical-priority flag (billionaire avatars only)
  criticalPriorityAssetsReady: boolean,
  criticalProgress: number, // 0-100
  hasShownCriticalLoadingScreen: boolean, // Whether user saw billionaire loading screen

  // High-priority flag (critical + high = backgrounds)
  highPriorityAssetsReady: boolean,
  highPriorityProgress: number, // 0-100
  hasShownHighPriorityLoadingScreen: boolean, // Whether user saw background loading screen

  // Essential flag (critical + high + medium)
  preloadingComplete: boolean,
  essentialProgress: number, // 0-100
  hasShownEssentialLoadingScreen: boolean, // Whether user saw essential assets loading screen

  // Overall progress (all tiers)
  isReady: boolean,
  progress: number, // 0-100
}
```

**Smart Delay Logic:**

- The 800ms "Loading Complete!" delay only applies if the user actually saw the LoadingScreen
- If assets finish loading before the user attempts to transition, they proceed immediately (0ms delay)
- This ensures fast connections aren't penalized while slow connections still get visual feedback

### LoadingScreen Component

```typescript
<LoadingScreen
  phase="critical" | "backgrounds" | "essential" // Determines loading message
  progress={criticalProgress} // Optional: override calculated progress
/>
```

**Behavior:**

- Shows "Loading..." while progress < 100%
- Shows "Loading Complete!" when progress >= 100%
- Remains visible for 800ms after reaching 100% (controlled by store delays)
- Uses phase-specific progress for accurate user feedback

## Asset Inventory

### Images (Total: 83 images)

- **Critical Priority (7):**

  - Night sky background: `nightsky.webp`
  - 6 billionaire avatars: `chaz.webp`, `chloe.webp`, `savannah.webp`, `walter.webp`, `enzo.webp`, `prudence.webp`

- **High Priority (9):**

  - 9 background images: `chaz-bg.webp`, `chloe-bg.webp`, `savannah-bg.webp`, `walter-bg.webp`, `enzo-bg.webp`, `prudence-bg.webp`, `nebula.webp`, `nightsky.webp`, `felt.webp`

- **Medium Priority (67):**

  - Card back: `back.webp`
  - 66 unique card images (from deck composition)

- **Low Priority (0):**
  - None currently

## Future Enhancements

- [ ] Adaptive loading based on connection speed (detect network quality, adjust batch delays)
- [ ] LocalStorage caching for repeat visits (store loaded assets between sessions)
- [ ] Service Worker for offline support (enable offline gameplay)
- [ ] Progressive image loading with blur-up effect (show low-res preview while loading)
- [ ] WebP/AVIF format detection and delivery (serve most efficient format per browser)
- [ ] Preconnect/DNS prefetch for video CDN (reduce latency for video fetches)
- [ ] Resource hints (preload, prefetch) for next-screen assets
- [ ] Bandwidth estimation API integration (adapt strategy to network conditions)
- [ ] Analytics tracking for loading performance (measure real-world load times)
- [ ] Lazy loading for truly optional assets (defer until needed)

## Troubleshooting

### Issue: Progress bar stuck below 100%

**Cause:** Asset failed to load (network error, 404, etc.)

**Solution:** Check browser console for `✗ Failed to preload` messages. Verify all asset URLs are correct.

### Issue: VS animation causes AbortError

**Cause:** Video element recreated instead of reusing preloaded element

**Solution:** Ensure using `getPreloadedVideo(url)` to retrieve cached video element, not creating new `<video>` elements.

### Issue: Loading screen flashes too quickly

**Cause:** Assets already cached from previous play

**Solution:** This is expected behavior. For truly fast connections where assets load before the user attempts transition, there's now a 0ms delay (immediate progression). The 800ms delay only applies if the user actually saw the LoadingScreen.

**Testing fresh loads:** Clear browser cache or use incognito mode.

### Issue: Medium assets loading too early on slow connections

**Cause:** Priority barriers may not be working correctly

**Solution:** Check console logs with network throttling (Slow 3G). Verify that all `[high]` assets complete before any `[medium]` assets start. If not, check `isCurrentPriorityComplete()` logic.

### Issue: State machine not transitioning despite 100% progress

**Cause:** Guard delays (800ms) not yet complete

**Solution:** Wait for store flags (`criticalPriorityAssetsReady`, `highPriorityAssetsReady`, or `preloadingComplete`) to become true. These have intentional 800ms delays after reaching 100%, but only if the user saw the LoadingScreen.

### Issue: Billionaire avatars not showing on select_billionaire screen

**Cause:** Critical assets not categorized correctly or preloader not running

**Solution:** Verify billionaire avatars are properly categorized as critical priority in asset configuration. Check console logs to ensure preloader is running.

### Issue: Background selection shows broken images

**Cause:** High-priority assets not categorized correctly or preloader not running

**Solution:** Verify background images are properly categorized as high-priority in asset configuration. Check console logs to ensure preloader is running.

## Implementation Files

### Core Hooks

- `apps/game/src/hooks/use-asset-preloader.ts` - Image preloading with priority barriers
- `apps/game/src/hooks/use-video-preloader.ts` - Video preloading with global Map
- `apps/game/src/hooks/use-preloading.ts` - Combined preloading state access

### Components

- `apps/game/src/components/LoadingScreen/index.tsx` - Loading UI with phase-specific progress
- `apps/game/src/components/ScreenRenderer/index.tsx` - Conditional LoadingScreen rendering
- `apps/game/src/components/Screens/VSAnimation/index.tsx` - Event-driven video playback
- `apps/game/src/providers/PreloadingProvider.tsx` - Coordinates preloading system

## Summary

The fully implemented asset preloading system provides:

✅ **Strict priority enforcement** - Lower tiers blocked until higher tiers complete  
✅ **State machine integration** - Guards prevent broken states  
✅ **Phase-specific progress** - Accurate feedback for each loading phase  
✅ **Event-driven transitions** - Precise timing without race conditions  
✅ **Global caching** - Prevents duplicate downloads and AbortErrors  
✅ **Reactive UI** - Real-time progress updates  
✅ **Mobile optimized** - Designed for slow connections  
✅ **Smart completion delays** - 800ms visibility only if user saw LoadingScreen, 0ms for fast connections  
✅ **Fully tested** - 24 passing tests (6 preloader + 18 state machine)

This system ensures smooth, predictable loading behavior across all network conditions while providing clear feedback to users and never artificially delaying users on fast connections.
