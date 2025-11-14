# Asset Preloading System

## Overview

The asset preloading system intelligently loads image and video assets in priority order to optimize the user experience, especially for mobile users on slow connections. Assets are categorized and loaded based on when they appear in the user journey.

## Architecture

### Components

1. **AssetPreloader** - Preloads images (backgrounds, avatars, cards)
2. **VideoPreloader** - Preloads video animations (VS and Data War)

### Hooks

1. **`use-asset-preloader.ts`** - Priority-based image preloading with batch delays
2. **`use-video-preloader.ts`** - Video preloading using native browser optimization

## Priority Strategy

### Image Assets (AssetPreloader)

Assets are organized into 4 priority levels based on user journey timing:

#### Critical Priority

**When:** First 2 screens (welcome, select_billionaire)  
**Assets:**

- Night sky background (welcome screen)
- 6 billionaire avatars (Chaz, Chloe, Savannah, Walter, Enzo, Prudence)

**Why:** These are seen within seconds of app loading.

#### High Priority

**When:** Screen 3+ (select_background, intro, mission)  
**Assets:**

- 9 background images (6 billionaire-themed + nebula, nightsky, felt)

**Why:** These are seen during intro/setup screens after billionaire selection.

#### Medium Priority

**When:** Gameplay phase  
**Assets:**

- Card back image
- 66+ unique card images from deck composition

**Why:** These are only seen once gameplay begins.

#### Low Priority

**When:** Rarely or conditionally  
**Assets:**

- None currently (placeholder for future assets)

**Why:** Optional or edge-case assets.

### Video Assets (VideoPreloader)

Videos are preloaded based on matchup:

- **VS Animation** (30 possible variations - 1 per game)
- **Data War Animation** (30 possible variations - 1 per game)

**Total per session:** 2 videos (the specific matchup for the current game)

**Timing:** Starts after billionaire selection, completes before VS animation plays.

## User Journey Flow

```
1. App loads
   └─> AssetPreloader starts immediately (critical assets)

2. Welcome screen (uses night sky background)
   └─> Critical assets ready

3. Select Billionaire screen (displays avatars)
   └─> Critical assets ready
   └─> High priority loading begins

4. Billionaire selected
   └─> VideoPreloader determines matchup
   └─> Starts preloading matchup-specific videos (VS + Data War)

5. Select Background screen (displays all backgrounds)
   └─> High priority assets ideally ready
   └─> Medium priority loading begins

6. Intro/Mission screens (uses billionaire background)
   └─> High priority assets ideally ready

7. VS Animation plays
   └─> Video preloaded and ready

8. Gameplay begins
   └─> Medium priority assets (cards) ideally already complete
```

## Technical Implementation

### Image Preloading

Uses `new Image()` with priority queue and advanced optimizations:

```typescript
const img = new Image();
img.onload = async () => {
  await img.decode(); // Pre-decode into bitmap cache
  globalContainer.appendChild(img); // Keep reference alive
  globalPreloadedImages.set(url, img); // Prevent duplicates
};
img.src = assetUrl; // Triggers browser fetch
```

**Key Features:**

- **Batch Delay:** 50ms between assets (prevents network congestion)
- **Image Decoding:** Pre-decodes images for instant rendering
- **Global Registry:** Prevents duplicate downloads across component remounts
- **Hidden DOM Container:** Keeps images in memory and browser cache
- **React StrictMode Safe:** Handles double-mounting in development mode

### Video Preloading

Uses native HTML5 video with `preload="auto"`:

```typescript
const video = document.createElement('video');
video.preload = 'auto'; // Browser optimizes loading
video.src = videoUrl;
```

**Browser Intelligence:** Lets browser decide optimal loading strategy.

## Mobile Optimization

### Key Considerations

1. **Priority-Based Loading**

   - Critical assets load first
   - Non-essential assets load in background
   - User sees important content immediately

2. **Batch Delays**

   - 50ms delay between image loads
   - Prevents overwhelming slow connections
   - Allows browser to manage bandwidth

3. **Progressive Enhancement**

   - App works even if assets haven't loaded
   - Preloading improves UX but isn't required
   - Fallbacks in place for missing assets

4. **Network-Aware**
   - Assets load in background without blocking UI
   - Sequential loading prevents request queuing
   - Browser cache handles repeat visits

## Configuration

### AssetPreloader

```typescript
<AssetPreloader
  enabled={true} // Enable/disable preloading
  batchDelay={50} // ms between assets (higher = slower but safer)
/>
```

### VideoPreloader

```typescript
<VideoPreloader
  enabled={true} // Enable/disable preloading
/>
```

## Asset Inventory

### Images

- **Billionaire Avatars:** WebP images (~50-100KB each)
- **Backgrounds:** WebP images (~200-500KB each)
- **Cards:** WebP images (~50-150KB each)
- **Card Back:** WebP image

**Estimated Total:** ~10-15MB of images

## Mobile Constraints

- Batch delays prevent network overload
- Priority ensures important assets first

## Future Enhancements

- [ ] Adaptive loading based on connection speed
- [ ] LocalStorage caching for repeat visits
- [ ] Service Worker for offline support
- [ ] Progressive image loading (blur-up)
- [ ] WebP/AVIF format detection
- [ ] Lazy loading for low-priority assets
