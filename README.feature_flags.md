# Feature Flags - Mozilla Billionaire Blast-Off

This document provides comprehensive documentation of all feature flags used in the "Billionaire Blast-Off" microsite, including their purposes, implementation details, and usage patterns.

## Table of Contents

- [Overview](#overview)
- [Feature Flag System Architecture](#feature-flag-system-architecture)
- [Available Feature Flags](#available-feature-flags)
- [Environment Variables](#environment-variables)
- [Usage Patterns](#usage-patterns)
- [Testing & Deployment](#testing--deployment)
- [Helper Functions](#helper-functions)

---

## Overview

The Billionaire Blast-Off microsite uses the **Vercel Flags SDK** (`flags/next`) for feature flag management. This enables controlled rollouts of features across different deployment environments without requiring code changes.

**Key Benefits:**
- **Environment-based control**: Different features in development, staging, and production
- **Phased rollouts**: Progressive feature enablement across release branches
- **Quick rollbacks**: Disable problematic features instantly via environment variables
- **A/B testing capability**: Test features with subsets of users (via release branches)

---

## Feature Flag System Architecture

### Core Implementation

Feature flags are defined in `/apps/web/src/app/flags.ts` using the Flags SDK:

```typescript
import { FlagType } from '@/types';
import { flag } from 'flags/next';

const flags = {
  flagName: flag({
    key: 'flag-key',
    description: 'What this flag does',
    defaultValue: false,
    decide() {
      return process.env.FLAG_ENV_VAR === 'true';
    },
  }),
} as const;
```

### Type Safety

The system includes TypeScript types for compile-time safety:

```typescript
export type FlagKey = keyof typeof flags;
```

This ensures that only valid flag keys can be referenced throughout the codebase.

### Evaluation Functions

Two primary functions handle flag evaluation:

1. **`evaluateFlag(flagKey: FlagKey)`**: Evaluates a single flag
2. **`getAllFlags()`**: Returns all flags and their current values

---

## Available Feature Flags

### 1. `showAvatarPlaypenButtons`

**Purpose**: Controls the visibility of interactive "playpen" action buttons in the billionaire avatar display.

**Environment Variable**: `FLAG_SHOW_AVATAR_PLAYPEN_BUTTONS`

**Implementation**:
```typescript
showAvatarPlaypenButtons: flag({
  key: 'show-avatar-playpen-buttons',
  description: 'Shows the billionaire playpen buttons when billionaire is generated',
  defaultValue: false,
  decide() {
    return process.env.FLAG_SHOW_AVATAR_PLAYPEN_BUTTONS === 'true';
  },
})
```

**Usage Locations**:
- `/apps/web/src/app/page.tsx` - Home page avatar display
- Conditionally renders playpen action buttons when user has generated an avatar

**When to Enable**:
- ✅ When playpen actions (space selfie, TikTok dance, etc.) are ready for user interaction
- ❌ During initial testing or when playpen features need to be temporarily disabled

---

### 2. `showDataWar`

**Purpose**: Enables the Data War card game page and all related functionality.

**Environment Variable**: `FLAG_SHOW_DATA_WAR`

**Implementation**:
```typescript
showDataWar: flag({
  key: 'show-data-war',
  description: 'Shows the DataWar page and related functionality',
  defaultValue: false,
  decide() {
    return process.env.FLAG_SHOW_DATA_WAR === 'true';
  },
})
```

**Usage Locations**:
- `/apps/web/src/app/layout.tsx` - Conditionally adds "Data War" link to navigation
- `/apps/web/src/app/datawar/page.tsx` - Returns 404 if flag is disabled
- `/apps/web/src/app/datawar/instructions/page.tsx` - Returns 404 if flag is disabled

**What It Controls**:
- Navigation menu item for Data War
- Access to `/datawar` and `/datawar/instructions` routes
- Data War-related content sections on various pages

**When to Enable**:
- ✅ When Data War game is ready for public access
- ✅ During TwitchCon and post-event phases
- ❌ Pre-launch when game is still in development

---

### 3. `showSocialFeed`

**Purpose**: Controls the display of the embedded social media feed component showing TwitchCon highlights and campaign activity.

**Environment Variable**: `FLAG_SHOW_SOCIAL_FEED`

**Implementation**:
```typescript
showSocialFeed: flag({
  key: 'show-social-feed',
  description: 'Shows the social feed',
  defaultValue: false,
  decide() {
    return process.env.FLAG_SHOW_SOCIAL_FEED === 'true';
  },
})
```

**Usage Locations**:
- `/apps/web/src/app/twitchcon/page.tsx` - TwitchCon page social feed
- `/apps/web/src/app/datawar/page.tsx` - Data War page social feed
- Uses EmbedSocial widget to display hashtag feeds

**What It Controls**:
- `<SocialFeed>` component rendering on TwitchCon and Data War pages
- EmbedSocial hashtag feed integration
- Social media engagement section with @firefox and #BillionaireBlastOff

**When to Enable**:
- ✅ During Phase 2B+ when there's active social media content
- ✅ When social media campaign is live
- ❌ Pre-launch or when social feed content is not ready

---

### 4. `showPhase2aFeatures`

**Purpose**: Enables Phase 2A features - the pre-TwitchCon launch announcement phase.

**Environment Variable**: `FLAG_SHOW_PHASE` (must equal `'2a'`)

**Implementation**:
```typescript
showPhase2aFeatures: flag({
  key: 'show-phase-2a-features',
  description: 'Display phase 2A changes',
  defaultValue: false,
  decide() {
    return process.env.FLAG_SHOW_PHASE === '2a';
  },
})
```

**Usage Pattern**: Works with `evaluatePhase2Flag()` helper for progressive enhancement.

**See**: [README.phases.md](./README.phases.md) for detailed phase information.

---

### 5. `showPhase2bFeatures`

**Purpose**: Enables Phase 2B features - the during-TwitchCon live event phase.

**Environment Variable**: `FLAG_SHOW_PHASE` (must equal `'2b'`)

**Implementation**:
```typescript
showPhase2bFeatures: flag({
  key: 'show-phase-2b-features',
  description: 'Display phase 2B changes',
  defaultValue: false,
  decide() {
    return process.env.FLAG_SHOW_PHASE === '2b';
  },
})
```

**Usage Pattern**: Works with `evaluatePhase2Flag()` helper for progressive enhancement.

**See**: [README.phases.md](./README.phases.md) for detailed phase information.

---

### 6. `showPhase2cFeatures`

**Purpose**: Enables Phase 2C features - the post-TwitchCon recap phase with launch recording.

**Environment Variable**: `FLAG_SHOW_PHASE` (must equal `'2c'`)

**Implementation**:
```typescript
showPhase2cFeatures: flag({
  key: 'show-phase-2c-features',
  description: 'Display phase 2C changes',
  defaultValue: false,
  decide() {
    return process.env.FLAG_SHOW_PHASE === '2c';
  },
})
```

**Usage Pattern**: Works with `evaluatePhase2Flag()` helper for progressive enhancement.

**See**: [README.phases.md](./README.phases.md) for detailed phase information.

---

### 7. `showPhase4Features`

**Purpose**: Enables Phase 4 features - the post-campaign phase with curated content gallery and condensed experience.

**Environment Variable**: `FLAG_SHOW_PHASE` (must equal `'4'`)

**Implementation**:
```typescript
showPhase4Features: flag({
  key: 'show-phase-4-features',
  description: 'Display phase 4 changes',
  defaultValue: false,
  decide() {
    return process.env.FLAG_SHOW_PHASE === '4';
  },
})
```

**See**: [README.phases.md](./README.phases.md) for detailed phase information.

---

### 8. `showEasterEgg`

**Purpose**: Enables a special "easter egg" selfie generation feature for users who have generated the maximum number of regular selfies.

**Environment Variable**: `FLAG_EASTER_EGG`

**Implementation**:
```typescript
showEasterEgg: flag({
  key: 'show-easter-egg',
  description: 'Enable easter egg selfie generation',
  defaultValue: false,
  decide() {
    return process.env.FLAG_EASTER_EGG === 'true';
  },
})
```

**Usage Locations**:
- `/apps/web/src/app/layout.tsx` - Passed to providers
- `/apps/web/src/components/PrimaryFlow/PrimaryFlowContext.tsx` - Controls easter egg availability logic
- `/apps/web/src/components/BentoPlaypenSelfie/index.tsx` - Renders special easter egg selfie button
- `/apps/web/src/utils/actions/store-easter-egg.ts` - Handles easter egg generation

**How It Works**:
1. User generates 4 regular selfies (MAX_SELFIES)
2. Cooldown period expires
3. If `showEasterEgg` is enabled, special "easter egg" button appears instead of regular selfie button
4. Easter egg generates a random Data War card image as a bonus selfie
5. Once generated, user's camera roll is marked as "full"

**State Flow**:
```
Normal Selfies (1-3) → AVAILABLE
4th Selfie Generated → COOL_DOWN_PERIOD
Cooldown Expires + Flag Enabled → EASTER_EGG
Easter Egg Generated → CAMERA_ROLL_FULL
Max Reached → COMING_SOON
```

**When to Enable**:
- ✅ Post-launch as a surprise engagement feature
- ✅ When Data War card assets are ready
- ❌ During initial launch phases
- ❌ When you want to keep selfie generation straightforward

**Technical Implementation**:
- Uses `store_easter_egg` RPC function in Supabase
- Randomly selects from available Data War card images
- Marks avatar with `hasEasterEgg: true` flag
- Easter egg selfie gets ID of `-1` for special handling

---

## Environment Variables

All feature flags are controlled via environment variables set in your deployment environment:

### Format

```bash
# Boolean flags (true/false)
FLAG_SHOW_AVATAR_PLAYPEN_BUTTONS=true
FLAG_SHOW_DATA_WAR=true
FLAG_SHOW_SOCIAL_FEED=true
FLAG_EASTER_EGG=true

# Phase flag (string value)
FLAG_SHOW_PHASE=2a  # or '2b', '2c', '4'
```

### Configuration Locations

**Local Development**:
```bash
# .env.local
FLAG_SHOW_PHASE=2c
FLAG_SHOW_DATA_WAR=true
FLAG_SHOW_SOCIAL_FEED=true
FLAG_EASTER_EGG=false
FLAG_SHOW_AVATAR_PLAYPEN_BUTTONS=true
```

**Netlify Deployments**:
- Set in Netlify Dashboard → Site Settings → Environment Variables
- Can be scoped to specific deploy contexts (Production, Deploy Previews, Branch deploys)
- Each release branch can have its own environment variable configuration

**Release Branch Examples**:
- `release/2a` → `FLAG_SHOW_PHASE=2a`
- `release/2b` → `FLAG_SHOW_PHASE=2b`
- `release/2c` → `FLAG_SHOW_PHASE=2c`
- `prod` → `FLAG_SHOW_PHASE=4` (or whatever is live)

---

## Usage Patterns

### Server-Side Evaluation (Recommended)

Most flags are evaluated server-side in Server Components for optimal performance:

```typescript
// apps/web/src/app/page.tsx
export default async function Home() {
  // Evaluate flags at page load (server-side)
  const [isPhase2B, showDataWar, showSocialFeed] = await Promise.all([
    evaluateFlag('showPhase2bFeatures'),
    evaluateFlag('showDataWar'),
    evaluateFlag('showSocialFeed'),
  ]);

  return (
    <>
      {isPhase2B && <Livestream />}
      {showDataWar && <DataWarModule />}
      {showSocialFeed && <SocialFeed />}
    </>
  );
}
```

### Client-Side Evaluation

For client components that need flag access, flags are evaluated server-side and passed as props:

```typescript
// apps/web/src/app/layout.tsx
export default async function RootLayout({ children }) {
  const isDataWarEnabled = await evaluateFlag('showDataWar');
  const isEasterEggEnabled = await evaluateFlag('showEasterEgg');
  
  return (
    <Providers 
      isEasterEggEnabled={isEasterEggEnabled}
    >
      {/* Navigation uses isDataWarEnabled for conditional links */}
      {children}
    </Providers>
  );
}
```

### Route Protection

Feature flags protect routes from unauthorized access:

```typescript
// apps/web/src/app/datawar/page.tsx
export default async function Page() {
  const isDataWarEnabled = await evaluateFlag('showDataWar');
  
  if (!isDataWarEnabled) {
    notFound(); // Returns 404
  }
  
  return <DataWarPage />;
}
```

### Conditional Navigation

Navigation items are conditionally added based on flags:

```typescript
// apps/web/src/app/layout.tsx
const baseLinks = [
  { href: '/', label: 'Home' },
  { href: '/twitchcon', label: 'Twitchcon' },
];

const dataWarLink = {
  href: '/datawar',
  label: 'Data War',
};

const links = isDataWarEnabled ? [...baseLinks, dataWarLink] : baseLinks;
```

---

## Helper Functions

### `evaluateFlag(flagKey: FlagKey)`

Evaluates a single feature flag and returns its boolean value.

**Location**: `/apps/web/src/app/flags.ts`

**Usage**:
```typescript
const isEnabled = await evaluateFlag('showDataWar');
```

**Returns**: `Promise<boolean>`

---

### `getAllFlags()`

Retrieves all feature flags and their current values.

**Location**: `/apps/web/src/app/flags.ts`

**Usage**:
```typescript
const flags = await getAllFlags();
// Returns: { showDataWar: true, showPhase2aFeatures: false, ... }
```

**Returns**: `Promise<Record<FlagKey, boolean>>`

**Use Case**: Debugging, admin dashboards, or comprehensive flag state logging.

---

### `evaluatePhase2Flag(min: 'a' | 'b' | 'c')`

Special helper for evaluating Phase 2 sub-phases with progressive enhancement logic.

**Location**: `/apps/web/src/utils/helpers/evaluate-phase2-flag.ts`

**Purpose**: Determines if the current phase meets a minimum phase requirement. Phase 2 has three sub-phases (2a, 2b, 2c) that progressively build on each other.

**Logic**:
- Phase 2c includes all features from 2b and 2a
- Phase 2b includes all features from 2a
- Phase 2a is the minimum

**Implementation**:
```typescript
export async function evaluatePhase2Flag(min: 'a' | 'b' | 'c'): Promise<boolean> {
  const [a, b, c] = await Promise.all([
    evaluateFlag('showPhase2aFeatures'),
    evaluateFlag('showPhase2bFeatures'),
    evaluateFlag('showPhase2cFeatures'),
  ]);

  switch (min) {
    case 'a':
      return a || b || c;  // True if ANY phase 2 is active
    case 'b':
      return b || c;       // True if 2b or 2c is active
    case 'c':
      return c;            // True only if 2c is active
    default:
      return false;
  }
}
```

**Usage Examples**:
```typescript
// Check if at least Phase 2a is live (any Phase 2)
const isAtLeastPhase2A = await evaluatePhase2Flag('a');

// Check if Phase 2b or later (2b, 2c)
const isAtLeastPhase2B = await evaluatePhase2Flag('b');

// Check if specifically Phase 2c
const isLaunchCompleted = await evaluatePhase2Flag('c');
```

**Common Patterns**:
```typescript
// Show countdown if Phase 2a+ but not Phase 4
{isAtLeastPhase2A && !isPhase4 && <CountDown />}

// Show content only during Phase 2b
{isPhase2B && <Livestream />}

// Show content only after launch (Phase 2c)
{isLaunchCompleted && <LaunchRecording />}
```

---

## Testing & Deployment

### Local Testing

Test different flag combinations locally by modifying `.env.local`:

```bash
# Test Phase 2a
FLAG_SHOW_PHASE=2a
FLAG_SHOW_DATA_WAR=true

# Test Phase 2b
FLAG_SHOW_PHASE=2b
FLAG_SHOW_DATA_WAR=true
FLAG_SHOW_SOCIAL_FEED=true

# Test Phase 2c (launch completed)
FLAG_SHOW_PHASE=2c
FLAG_SHOW_DATA_WAR=true
FLAG_SHOW_SOCIAL_FEED=true

# Test Phase 4
FLAG_SHOW_PHASE=4
FLAG_SHOW_DATA_WAR=true
FLAG_EASTER_EGG=true
```

Restart your dev server after changing environment variables:
```bash
pnpm dev
```

### Release Branch Testing

Each release branch has its own Netlify deployment with phase-specific flags:

- **`release/2a`** → Deploys with `FLAG_SHOW_PHASE=2a`
- **`release/2b`** → Deploys with `FLAG_SHOW_PHASE=2b`
- **`release/2c`** → Deploys with `FLAG_SHOW_PHASE=2c`

This allows isolated testing of each phase before promoting to production.

### Staging & Production

**Staging (`main` branch)**:
- Test flag combinations before production release
- Validate phase transitions
- QA new features behind flags

**Production (`prod` branch)**:
- Set flags for current public-facing phase
- Quick rollbacks by changing env vars (no code deploy needed)
- Monitor feature impact with current flag configuration

### Best Practices

1. **Test flag combinations**: Always test both enabled and disabled states
2. **Verify route protection**: Ensure disabled features return 404
3. **Check navigation**: Confirm conditional nav links appear/disappear correctly
4. **Test phase transitions**: Validate smooth transitions between phases
5. **Document changes**: Update this file when adding new flags
6. **Use type safety**: Always use `FlagKey` type for flag references
7. **Server-side first**: Prefer server-side evaluation for better performance
8. **Progressive enhancement**: Design features to gracefully degrade if flags change

---

## Debugging

### Checking Current Flag Values

Add this to any server component for debugging:

```typescript
const allFlags = await getAllFlags();
console.log('Current flags:', allFlags);
```

### Common Issues

**Flag not updating**:
- ✅ Restart dev server after changing `.env.local`
- ✅ Clear browser cache
- ✅ Verify environment variable is set correctly in Netlify
- ✅ Check if you're using the correct environment variable name

**Feature not showing**:
- ✅ Verify flag is enabled: `console.log(await evaluateFlag('flagName'))`
- ✅ Check if route protection is blocking access
- ✅ Ensure parent components pass flag values to children
- ✅ Verify conditional rendering logic

**Phase not working**:
- ✅ Use `evaluatePhase2Flag()` helper for Phase 2 sub-phases
- ✅ Check if multiple phase flags are set (only one should be active)
- ✅ Verify `FLAG_SHOW_PHASE` value exactly matches expected string

---

## Future Considerations

### Potential New Flags

Consider adding flags for:
- **A/B Testing**: Different UX variations
- **Performance Experiments**: Alternative loading strategies
- **Beta Features**: New experimental functionality
- **Regional Features**: Geography-specific content
- **User Segments**: Different experiences for different user types

### Migration to Advanced Flag System

For more complex flag requirements, consider migrating to:
- **LaunchDarkly**: Advanced targeting, gradual rollouts, experimentation
- **Split.io**: Feature delivery and experimentation platform
- **Unleash**: Open-source feature toggle service
- **PostHog**: Feature flags combined with analytics

---

## Related Documentation

- [README.phases.md](./README.phases.md) - Detailed phase rollout information
- [README.environments.md](./README.environments.md) - Environment and deployment configuration
- [README.architecture.md](./README.architecture.md) - System architecture overview

---

**Last Updated**: November 2024
**Maintainers**: Mozilla Platform Team

