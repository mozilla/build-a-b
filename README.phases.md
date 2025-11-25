# Phased Rollout - Mozilla Billionaire Blast-Off

This document provides comprehensive documentation of the phased rollout strategy for the "Billionaire Blast-Off" microsite campaign, detailing how features are progressively released across different phases.

## Table of Contents

- [Overview](#overview)
- [Phase Architecture](#phase-architecture)
- [Phase Timeline](#phase-timeline)
- [Detailed Phase Breakdown](#detailed-phase-breakdown)
  - [Phase 1a: Initial Launch](#phase-1a-initial-launch-pre-twitchcon)
  - [Phase 1b: Pre-Event](#phase-1b-pre-event)
  - [Phase 2a: Launch Announcement](#phase-2a-launch-announcement-pre-twitchcon)
  - [Phase 2b: Live Event](#phase-2b-live-event-during-twitchcon)
  - [Phase 2c: Post-Event Recap](#phase-2c-post-event-recap-post-twitchcon)
  - [Phase 4: Post-Campaign](#phase-4-post-campaign-end-of-year)
- [Phase Flag System](#phase-flag-system)
- [Phase Transition Guide](#phase-transition-guide)
- [Release Branch Strategy](#release-branch-strategy)
- [Testing Phases](#testing-phases)

---

## Overview

The Billionaire Blast-Off campaign uses a **phased rollout strategy** to progressively introduce features as the campaign evolves from launch through TwitchCon and beyond. This approach allows:

- **Controlled feature releases** tied to real-world events
- **Progressive enhancement** of the user experience
- **Marketing alignment** with campaign milestones
- **Risk mitigation** through gradual rollouts
- **Content freshness** through timely updates

The campaign is structured around **TwitchCon San Diego (October 18-20, 2024)** as a central event, with phases designed to build anticipation, provide live engagement, and extend the campaign post-event.

---

## Phase Architecture

### Phase Hierarchy

The phased rollout follows this progression:

```
Phase 1a (Initial Launch)
    ↓
Phase 1b (Pre-Event Growth)
    ↓
Phase 2a (Launch Announcement) ← First feature flag
    ↓
Phase 2b (Live Event) ← Second feature flag
    ↓
Phase 2c (Post-Event Recap) ← Third feature flag
    ↓
Phase 4 (Post-Campaign) ← Fourth feature flag
```

### Phase Categories

**Phase 1 (1a, 1b)**: 
- No feature flags required
- Base functionality always available
- Core avatar builder and sharing features

**Phase 2 (2a, 2b, 2c)**:
- Progressive sub-phases controlled by `FLAG_SHOW_PHASE`
- Each phase builds on previous phases
- Tied to TwitchCon event timeline
- Uses special `evaluatePhase2Flag()` helper for progressive enhancement

**Phase 4**:
- Post-campaign phase
- Curated content and condensed experience
- End-of-year/archive mode
- Separate from Phase 2 progression

---

## Phase Timeline

| Phase | Timeframe | Primary Goal | Key Features |
|-------|-----------|--------------|--------------|
| **1a** | Sep-Oct 2024 | Initial launch, avatar generation | Base site, avatar builder, sharing |
| **1b** | Pre-TwitchCon | Build user base, social buzz | Avatar playpen actions, gallery |
| **2a** | ~Oct 1-17, 2024 | Announce rocket launch | Countdown timer, launch teaser |
| **2b** | Oct 18-20, 2024 | Live event engagement | Livestream embed, real-time updates |
| **2c** | Oct 21+, 2024 | Post-event recap | Launch recording, TwitchCon highlights |
| **4** | Nov 2024+ | Long-term archive mode | Curated gallery, condensed UX |

---

## Detailed Phase Breakdown

### Phase 1a: Initial Launch (Pre-TwitchCon)

**Timeframe**: Campaign launch through early October 2024

**Feature Flags**: None (base functionality)

**Environment Variable**: None required

#### Purpose
Establish the core campaign experience and begin building the user base. Users can create and share billionaire avatars, building awareness of the "Open What You Want" positioning.

#### Features Included

**Core Avatar Builder**:
- 7-question quiz flow with 5 options per question
- LLM-generated avatar and biography
- Unique shareable URL (`/a/{hash}`)
- Cookie-based user persistence
- Avatar gallery display

**Home Page**:
- Campaign hero/branding
- Ticker with campaign messaging
- Avatar bento display
- Basic navigation

**Sharing & Return Visits**:
- Unique avatar URLs for sharing
- Cookie-based user recognition
- Avatar retrieval via URL or cookie

**Data Privacy Education**:
- Satirical billionaire narratives
- Privacy-focused messaging
- Firefox CTA integration

#### Technical Implementation

No feature flags required - all Phase 1 functionality is part of the base application:

```typescript
// No conditional rendering needed
<AvatarBentoV2 
  avatar={avatarData}
/>
```

#### User Flow
1. User lands on homepage
2. Clicks "Build a Billionaire" CTA
3. Answers 7 quiz questions
4. Avatar generates (4-second LLM process)
5. Receives unique shareable URL
6. Can return via cookie or URL

---

### Phase 1b: Pre-Event

**Timeframe**: Mid-October 2024 (pre-TwitchCon)

**Feature Flags**: 
- `showAvatarPlaypenButtons` (optional)
- `showDataWar` (optional, pre-announcement)

**Environment Variables**:
```bash
FLAG_SHOW_AVATAR_PLAYPEN_BUTTONS=true
FLAG_SHOW_DATA_WAR=false  # Not yet announced
```

#### Purpose
Expand engagement with interactive playpen actions and continue building user base before the TwitchCon event.

#### Features Added

**Avatar Playpen Actions**:
- Space selfie generation (up to 4 selfies)
- Cooldown timer between selfies
- Selfie gallery/vault
- Sharing selfies to social media

**Selfie System**:
- Maximum 4 regular selfies per avatar
- Cooldown period between generations
- Server-side image generation
- Gallery display with carousel
- Download and share functionality

**TikTok Dance (if available)**:
- Additional playpen interaction
- Animated avatar content

#### Technical Implementation

```typescript
const showPlaypenButtons = await evaluateFlag('showAvatarPlaypenButtons');

// Conditionally render playpen actions
{showPlaypenButtons && (
  <BentoPlaypenSelfie 
    avatarData={avatarData}
  />
)}
```

#### Selfie Availability States

The selfie system uses a state machine:

| State | Description | Trigger |
|-------|-------------|---------|
| `AVAILABLE` | Can generate selfie | User has available selfies |
| `COOL_DOWN_PERIOD` | Waiting for cooldown | Just generated a selfie |
| `COMING_SOON` | No selfies available | Reached limit, no easter egg |
| `EASTER_EGG` | Special bonus available | 4 selfies + flag enabled |
| `CAMERA_ROLL_FULL` | All done | Easter egg generated |

---

### Phase 2a: Launch Announcement (Pre-TwitchCon)

**Timeframe**: ~October 1-17, 2024

**Feature Flag**: `showPhase2aFeatures`

**Environment Variable**:
```bash
FLAG_SHOW_PHASE=2a
```

#### Purpose
Build anticipation for the TwitchCon rocket launch event. Announce that billionaire avatars will be physically launched into the stratosphere.

#### Features Added

**Countdown Timer**:
- Prominent countdown to October 18th launch
- "Billionaire Blast-Off" branding
- Event announcement messaging
- CTA to build avatars before launch

**Launch Announcement Module**:
- Rocket imagery and "send to space" messaging
- TwitchCon event details
- Call to action: "Build your billionaire to get in on the joke"
- Follow @firefox messaging

**Rocket Bento Card**:
- Flippable card with rocket image
- Front: Teaser about sending billionaires to space
- Back: Detailed explanation of TwitchCon event
- "Let's send these Billionaires to actual, for real-real space"

**#BillionaireBlastOff Hashtag**:
- Social media integration
- Campaign hashtag promotion
- Twitter/X follow prompts

#### Technical Implementation

```typescript
const isPhase2A = await evaluateFlag('showPhase2aFeatures');
const isAtLeastPhase2A = await evaluatePhase2Flag('a');

// Show countdown
{isPhase2A && !isPhase4 && (
  <CountDown isPhase2B={false} isPhase2C={false} />
)}

// Show launch announcement bento
{isPhase2A && (
  <BentoDual
    effect="flip"
    image="/assets/images/rocket.webp"
    back={/* Launch details */}
  >
    <h1>Let's send these Billionaires to actual, for real-real space.</h1>
  </BentoDual>
)}

// BBOOWYW (Build Billionaires Open What You Want) card
{isPhase2A && (
  <BentoDual effect="flip" back={<OrangeCard />}>
    <h4>#BillionaireBlastOff</h4>
    <p>Billionaires go to space on rockets fueled by your data...</p>
  </BentoDual>
)}
```

#### Page Changes

**Home Page** (`/apps/web/src/app/page.tsx`):
- Countdown timer at top
- Rocket bento replaces previous content
- Updated ticker messaging
- #BillionaireBlastOff hashtag promotion

**Layout Updates**:
- Navigation remains same (no Data War yet)
- Footer updated with event messaging

#### Progressive Enhancement

Phase 2a uses `evaluatePhase2Flag('a')` which returns `true` for phases 2a, 2b, OR 2c:

```typescript
// Show to anyone in Phase 2 or later
{isAtLeastPhase2ALive && (
  <DataWarComingSoon />
)}
```

This allows content to persist through future phases unless explicitly hidden.

---

### Phase 2b: Live Event (During TwitchCon)

**Timeframe**: October 18-20, 2024

**Feature Flag**: `showPhase2bFeatures`

**Environment Variables**:
```bash
FLAG_SHOW_PHASE=2b
FLAG_SHOW_DATA_WAR=true
FLAG_SHOW_SOCIAL_FEED=true
```

#### Purpose
Provide live engagement during the TwitchCon event. Show livestream of the booth and rocket launch, enable Data War access, and showcase social media activity.

#### Features Added

**Livestream Component**:
- Embedded live video stream from TwitchCon
- Real-time event coverage
- Booth activity and rocket launch stream
- Replaces countdown timer

**Data War Enabled**:
- `/datawar` route becomes accessible
- Data War page and instructions available
- Navigation link added for "Data War"
- Game announcement and CTA

**Social Feed**:
- EmbedSocial hashtag feed
- Live #BillionaireBlastOff posts
- "TwitchCon behind the scenes" messaging
- @firefox social links
- Real-time campaign activity

**Updated Countdown**:
- Still shows but with updated copy
- "Launch in progress" messaging
- Directs users to livestream

#### Technical Implementation

```typescript
const isPhase2B = await evaluateFlag('showPhase2bFeatures');
const showDataWar = await evaluateFlag('showDataWar');
const showSocialFeed = await evaluateFlag('showSocialFeed');

// Show livestream during event
{isPhase2B && <Livestream />}

// Enable Data War
{showDataWar && (
  <DataWarModule />
)}

// Show social feed
{showSocialFeed && (
  <SocialFeed 
    title="TwitchCon behind the scenes"
    refId={FEED_REF_ID}
    src={FEED_SRC}
  />
)}
```

#### Data War Integration

**Navigation Addition**:
```typescript
const dataWarLink = {
  href: '/datawar',
  label: 'Data War',
  title: 'Play our game Data War',
  trackableEvent: 'click_datawar',
};
const links = isDataWarEnabled ? [...baseLinks, dataWarLink] : baseLinks;
```

**Route Protection**:
```typescript
// /datawar/page.tsx
const isDataWarEnabled = await evaluateFlag('showDataWar');
if (!isDataWarEnabled) {
  notFound(); // Returns 404
}
```

**Data War Features**:
- Full game instructions page
- Character lineup showcase
- PDF download for physical deck
- Game gallery with images
- CTA to play digital game (coming November)

#### Page Changes

**Home Page**:
- Livestream replaces countdown at top
- Data War announcement module added
- Social feed embedded
- Updated messaging for live event

**TwitchCon Page** (`/apps/web/src/app/twitchcon/page.tsx`):
- Enhanced with live content
- Social feed integration
- Real-time event updates

**Data War Pages** Now Accessible:
- `/datawar` - Main Data War landing page
- `/datawar/instructions` - Full game rules and instructions

---

### Phase 2c: Post-Event Recap (Post-TwitchCon)

**Timeframe**: October 21, 2024+

**Feature Flag**: `showPhase2cFeatures`

**Environment Variables**:
```bash
FLAG_SHOW_PHASE=2c
FLAG_SHOW_DATA_WAR=true
FLAG_SHOW_SOCIAL_FEED=true
FLAG_EASTER_EGG=true  # Optional
```

#### Purpose
Celebrate the successful launch event, showcase highlights, and continue engagement post-TwitchCon with launch recording and Data War promotion.

#### Features Added

**Launch Recording**:
- Recorded video of the rocket launch
- Replaces livestream component
- "TwitchCon was a blast!" messaging
- Replay of the stratosphere launch

**TwitchCon Recap Content**:
- Launch highlights and photos
- Event recap gallery
- "Two launches in one" messaging (rocket + Data War)
- Link to full TwitchCon page

**Updated Ticker**:
- Post-event messaging
- "Launch completed" announcements
- Data War now available
- Digital game coming soon

**Data War Emphasis**:
- Prominent Data War module
- "Just Dropped!" badge
- Physical deck interest CTA
- Digital version announcement (November release)

**Social Feed Update**:
- Changed to "TwitchCon highlights" (past tense)
- Curated best moments
- Continued #BillionaireBlastOff activity

**Orange BBOOWYW Card**:
- No longer behind flip
- Direct display of "Open What You Want" messaging
- Campaign positioning front and center

#### Technical Implementation

```typescript
const isPhase2C = await evaluateFlag('showPhase2cFeatures');
const isLaunchCompleted = await evaluatePhase2Flag('c');

// Show launch recording
{isPhase2C && <LaunchRecording />}

// TwitchCon recap bento
{isPhase2C && (
  <BentoDual
    image="/assets/images/recap-twitchcon.webp"
    back={/* Recap details */}
  >
    <h1>TwitchCon was a blast!</h1>
    <p>Thanks for everything, San Diego.</p>
  </BentoDual>
)}

// Direct orange card (no flip)
{isPhase2C && <OrangeCard />}

// Data War "Just Dropped" module
{isLaunchCompleted && (
  <DataWarModule badge="JUST DROPPED!" />
)}

// Updated social feed
{showSocialFeed && (
  <SocialFeed title="TwitchCon highlights" />
)}
```

#### Easter Egg Feature (Optional)

If `FLAG_EASTER_EGG=true`, users who have generated 4 selfies can unlock a 5th "easter egg" selfie:

```typescript
const isEasterEggEnabled = await evaluateFlag('showEasterEgg');

// Easter egg logic in PrimaryFlowContext
if (avatarData.selfies.length === MAX_SELFIES && isEasterEggEnabled) {
  setSelfieAvailabilityState('EASTER_EGG');
}
```

**Easter Egg Flow**:
1. User generates 4 regular selfies
2. Cooldown expires
3. Special easter egg button appears
4. Generates random Data War card as bonus selfie
5. Camera roll marked as complete

#### Progressive Enhancement Pattern

Phase 2c is the "completion" of Phase 2, so we can use:

```typescript
// isLaunchCompleted is true ONLY for Phase 2c
const isLaunchCompleted = await evaluatePhase2Flag('c');

// Use for content that should ONLY show after launch
{isLaunchCompleted && !isPhase4 && (
  <PostLaunchContent />
)}
```

#### Page Changes

**Home Page**:
- Launch recording at top (replaces livestream)
- TwitchCon recap bento
- Data War "Just Dropped" prominence
- Direct orange card display
- Post-event ticker messages

**TwitchCon Page**:
- Full recap gallery
- Launch video embed
- Event photos and highlights
- Data War physical deck CTA

**Data War Pages**:
- "Want the physical deck?" CTA
- Digital version announcement
- Updated messaging for post-event

---

### Phase 4: Post-Campaign (End of Year)

**Timeframe**: November 2024 through end of campaign

**Feature Flag**: `showPhase4Features`

**Environment Variables**:
```bash
FLAG_SHOW_PHASE=4
FLAG_SHOW_DATA_WAR=true
FLAG_EASTER_EGG=true
```

#### Purpose
Transition to an archive/showcase mode featuring curated content and a condensed user experience. Emphasizes Data War game and showcases best community-generated content.

#### Features Added

**Curated Selfies Gallery**:
- 141 pre-selected "best of" selfies from campaign
- Replaces user-generated gallery on homepage
- Professional curation for showcase quality
- Server-side loading from `/assets/images/galleries/curated_selfies/`

**Data War Launch Hero**:
- Replaces avatar builder as primary hero
- "Play Data War" main CTA
- Digital game now live (November release)
- Prominent game imagery and branding

**Condensed Layout**:
- Grid changes from 6 rows to 5 rows
- Tighter, more focused design
- Removes countdown timer
- Streamlined content modules

**"Bye Bye Billionaires" Module**:
- Condensed version of the campaign story
- Archive of the campaign journey
- "Where are they now?" positioning
- Historical context for visitors

**Updated Navigation CTA**:
- Changes from "Build a Billionaire" to "Play Data War"
- CTA link goes directly to `/datawar/game`
- Shifts focus to game as primary action

**TwitchCon Recap Bento (Phase 4 Version)**:
- Compact recap of event
- Historical perspective
- Links to full TwitchCon page
- Archive presentation

**Updated Ticker**:
- Phase 4-specific messages
- Game-focused content
- End-of-campaign messaging

#### Technical Implementation

```typescript
const isPhase4 = await evaluateFlag('showPhase4Features');

// Load curated selfies server-side
const curatedSelfies = isPhase4 ? getCuratedSelfies().map(s => s.path) : [];

// Pass to providers for vault access
<Providers 
  isPhase4={isPhase4}
  curatedSelfies={curatedSelfies}
>

// Data War hero replaces avatar builder
{isPhase4 ? (
  <DataWarLaunchHero />
) : (
  <AvatarBentoV2 avatar={avatarData} />
)}

// Condensed grid layout
<main className={`
  landscape:grid landscape:grid-cols-12 
  ${isPhase4 ? 'landscape:grid-rows-5' : 'landscape:grid-rows-6'}
  landscape:gap-8
`}>

// Curated gallery replaces user galleries
{isPhase4 ? (
  <>
    <CuratedGalleryLarge image={curatedSelfiesForGallery[0]?.path} />
    <CuratedGallerySmall image={curatedSelfiesForGallery[1]?.path} />
    {/* ... more curated galleries */}
  </>
) : (
  <>
    {/* User selfie galleries */}
  </>
)}

// Phase 4 ticker messages
<Ticker 
  items={isPhase4 ? tickerDataPhase4 : tickerData}
  isPhase4={isPhase4}
/>

// Condensed "Bye Bye Billionaires"
{isPhase4 && (
  <Bento>
    <h2>Bye bye, Billionaires</h2>
    <p>Where are they now? Offline. Off-world...</p>
  </Bento>
)}

// TwitchCon recap (condensed)
{isPhase4 && <TwitchConRecapBento version="phase4" />}

// No countdown timer in Phase 4
{!isPhase4 && <CountDown />}
```

#### Curated Selfies System

**Server-Side Loading**:
```typescript
// apps/web/src/utils/helpers/get-curated-selfies.ts
export function getCuratedSelfies(): CuratedSelfie[] {
  const curatedSelfiesDir = path.join(
    process.cwd(),
    'public/assets/images/galleries/curated_selfies'
  );
  
  const files = fs.readdirSync(curatedSelfiesDir);
  const webpFiles = files.filter(file => file.endsWith('.webp'));
  
  return webpFiles.map(filename => ({
    filename,
    path: `/assets/images/galleries/curated_selfies/${filename}`,
  }));
}
```

**Random Selection**:
```typescript
export function getRandomCuratedSelfies(count: number): CuratedSelfie[] {
  const allSelfies = getCuratedSelfies();
  const shuffled = [...allSelfies].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
```

**Vault Integration**:
```typescript
// Vault component detects Phase 4 and uses curated selfies
const { curatedSelfies, isPhase4 } = useVaultContext();

const sortedSelfies = useMemo(() => {
  if (isPhase4 && curatedSelfies && curatedSelfies.length > 0) {
    return curatedSelfies.map((path, index) => ({
      id: index,
      asset: path,
    }));
  }
  
  // Default: Use user selfies
  return avatarData?.selfies || [];
}, [isPhase4, curatedSelfies, avatarData?.selfies]);
```

**Gallery Display**:
- Large featured gallery (row-span-2)
- 4 smaller gallery tiles
- "+X more" counter on last tile
- All link to vault with curated content

#### Navigation Changes

**Main CTA Update**:
```typescript
const navigationData = {
  ctaLabel: isPhase4 ? 'Play Data War' : 'Build a Billionaire',
  ctaLink: isPhase4 ? '/datawar/game' : undefined,
};
```

**Focus Shift**:
- Primary action becomes playing the game
- Avatar builder still available but de-emphasized
- Curated gallery showcases campaign legacy

#### Layout Changes

**Grid Structure**:
```
Phase 1-2c Layout:          Phase 4 Layout:
6 rows × 12 columns         5 rows × 12 columns
                           (more condensed)

┌─────────┬──────┐         ┌─────────┬──────┐
│ Avatar  │Rocket│         │DataWar  │Recap │
│ Builder │      │         │  Hero   │ Bento│
│         │      │         ├─────────┴──────┤
├─────────┴──────┤         │BBOOWYW + Bye   │
│   Galleries    │         ├────────────────┤
│                │         │  Curated       │
├────────────────┤         │  Galleries     │
│  Data War      │         │                │
└────────────────┘         └────────────────┘
```

**Content Density**:
- Removes empty/spacer content
- Focuses on game and curated content
- More efficient use of screen space
- Better for archive/reference mode

#### User Experience Changes

**For New Visitors**:
- Primary CTA directs to Data War game
- Can still build avatars (de-emphasized)
- See curated "best of" content
- Understand campaign is completed

**For Returning Users**:
- Their avatars still accessible via cookie/URL
- Personal selfies still in their vault
- Can generate more selfies (if under limit)
- Experience their content alongside curated showcase

**Vault Behavior**:
- New users without avatars: See only curated selfies
- Users with avatars: See their own selfies
- Curated content shown in homepage gallery only
- Personal content remains personal and accessible

#### Page Changes

**Home Page**:
- Data War hero (largest element)
- TwitchCon recap (condensed)
- BBOOWYW card + "Bye Bye Billionaires"
- Curated selfies gallery (5 tiles)
- Phase 4-specific ticker
- No countdown timer

**Data War Pages**:
- Digital game now live at `/datawar/game`
- Full game accessible (November launch)
- Instructions and rules available
- Physical deck still available

**TwitchCon Page**:
- Full archive of event
- Historical perspective
- Link from condensed bento on homepage

#### Technical Considerations

**Performance**:
- Curated selfies loaded server-side (one-time)
- 141 images cached in public directory
- No database queries for curated content
- Faster page loads for gallery

**State Management**:
- Phase 4 flag passed through providers
- Curated selfies loaded in layout
- Vault context handles Phase 4 mode
- User avatars still persist normally

**Backwards Compatibility**:
- User avatars remain accessible
- Personal URLs still work
- Cookie-based auth unchanged
- Database queries only for user data

---

## Phase Flag System

### Environment Variable Design

All phase flags are controlled by a single environment variable:

```bash
FLAG_SHOW_PHASE=<phase_value>
```

**Valid Values**:
- `'2a'` - Phase 2a (launch announcement)
- `'2b'` - Phase 2b (live event)
- `'2c'` - Phase 2c (post-event recap)
- `'4'` - Phase 4 (post-campaign)
- Unset or other value = Phase 1

### Phase Flag Definitions

```typescript
// apps/web/src/app/flags.ts
showPhase2aFeatures: flag({
  key: 'show-phase-2a-features',
  description: 'Display phase 2A changes',
  defaultValue: false,
  decide() {
    return process.env.FLAG_SHOW_PHASE === '2a';
  },
}),

showPhase2bFeatures: flag({
  key: 'show-phase-2b-features',
  description: 'Display phase 2B changes',
  defaultValue: false,
  decide() {
    return process.env.FLAG_SHOW_PHASE === '2b';
  },
}),

showPhase2cFeatures: flag({
  key: 'show-phase-2c-features',
  description: 'Display phase 2C changes',
  defaultValue: false,
  decide() {
    return process.env.FLAG_SHOW_PHASE === '2c';
  },
}),

showPhase4Features: flag({
  key: 'show-phase-4-features',
  description: 'Display phase 4 changes',
  defaultValue: false,
  decide() {
    return process.env.FLAG_SHOW_PHASE === '4';
  },
}),
```

### Progressive Enhancement Helper

The `evaluatePhase2Flag()` helper enables progressive enhancement logic:

```typescript
// apps/web/src/utils/helpers/evaluate-phase2-flag.ts
export async function evaluatePhase2Flag(min: 'a' | 'b' | 'c'): Promise<boolean> {
  const [a, b, c] = await Promise.all([
    evaluateFlag('showPhase2aFeatures'),
    evaluateFlag('showPhase2bFeatures'),
    evaluateFlag('showPhase2cFeatures'),
  ]);

  switch (min) {
    case 'a':
      return a || b || c;  // True if ANY Phase 2 sub-phase is active
    case 'b':
      return b || c;       // True if Phase 2b or 2c is active
    case 'c':
      return c;            // True only if Phase 2c is active
    default:
      return false;
  }
}
```

**Usage Pattern**:
```typescript
// Check if at least Phase 2a
const isAtLeastPhase2A = await evaluatePhase2Flag('a');

// Content that should show in Phase 2a, 2b, AND 2c
{isAtLeastPhase2A && <PersistentContent />}

// Content that should show ONLY in Phase 2b
{isPhase2B && <LiveEventContent />}

// Content that should show in Phase 2b OR 2c
{(isPhase2B || isPhase2C) && <EventRelatedContent />}
```

### Common Evaluation Patterns

```typescript
// Typical page setup
const [
  isPhase2A,
  isPhase2B, 
  isPhase2C,
  isAtLeastPhase2A,
  isLaunchCompleted,
  isPhase4,
] = await Promise.all([
  evaluateFlag('showPhase2aFeatures'),
  evaluateFlag('showPhase2bFeatures'),
  evaluateFlag('showPhase2cFeatures'),
  evaluatePhase2Flag('a'),
  evaluatePhase2Flag('c'),
  evaluateFlag('showPhase4Features'),
]);

// Common conditional patterns:

// Show only in Phase 2a
{isPhase2A && !isPhase2B && !isPhase2C && <Phase2AOnly />}

// Show in Phase 2a or 2b (but not 2c)
{(isPhase2A || isPhase2B) && !isPhase2C && <PreLaunchContent />}

// Show in any Phase 2 but not Phase 4
{isAtLeastPhase2A && !isPhase4 && <Phase2Content />}

// Show only after launch completion
{isLaunchCompleted && <PostLaunchContent />}

// Show in Phase 4 only
{isPhase4 && <Phase4Content />}
```

---

## Phase Transition Guide

### Transitioning Between Phases

To transition from one phase to another:

1. **Update Environment Variable** (Netlify or `.env.local`):
   ```bash
   FLAG_SHOW_PHASE=2b  # Change from 2a to 2b
   ```

2. **Verify Associated Flags**:
   ```bash
   FLAG_SHOW_DATA_WAR=true      # Enable if needed for phase
   FLAG_SHOW_SOCIAL_FEED=true   # Enable if needed for phase
   FLAG_EASTER_EGG=true          # Enable if desired for phase
   ```

3. **Rebuild/Redeploy**:
   - Environment variables take effect on next build
   - For immediate changes, trigger manual deployment
   - Verify changes in Netlify deploy preview

4. **Test Transition**:
   - Check countdown timer updates
   - Verify new content appears
   - Confirm old phase content hides appropriately
   - Test navigation links
   - Validate conditional routes

### Rollback Procedure

If a phase has issues, rollback is simple:

1. **Revert Environment Variable**:
   ```bash
   FLAG_SHOW_PHASE=2a  # Roll back from 2b to 2a
   ```

2. **Trigger Deployment**:
   - Manual deploy or push to branch
   - Previous phase content automatically restores

3. **No Code Changes Required**:
   - All phase logic is flag-based
   - Instant rollback capability

### Phase Verification Checklist

Before promoting a phase to production:

- [ ] Countdown timer shows correct date/message
- [ ] Phase-specific content renders correctly
- [ ] Previous phase content hides appropriately
- [ ] Navigation links are correct
- [ ] Routes are accessible (Data War, etc.)
- [ ] Ticker messages are appropriate
- [ ] Social feed (if enabled) displays correctly
- [ ] Mobile and desktop layouts work
- [ ] Share functionality works
- [ ] Analytics tracking updated

---

## Release Branch Strategy

### Branch-to-Environment Mapping

Each phase has a dedicated release branch for isolated testing:

| Branch | Environment | Phase Flag | Netlify Deploy |
|--------|-------------|------------|----------------|
| `prod` | Production | Current live phase | Yes (production) |
| `main` | Staging | Next phase testing | Yes (staging) |
| `release/2a` | Preview | `FLAG_SHOW_PHASE=2a` | Yes (preview) |
| `release/2b` | Preview | `FLAG_SHOW_PHASE=2b` | Yes (preview) |
| `release/2c` | Preview | `FLAG_SHOW_PHASE=2c` | Yes (preview) |

### Release Branch Workflow

**1. Phase Development**:
```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/phase-2b-livestream

# Develop phase-specific features
# Commit changes
git commit -am "Add livestream component for Phase 2b"

# Push and create PR to main
git push origin feature/phase-2b-livestream
```

**2. Testing in Release Branch**:
```bash
# Merge to phase-specific release branch
git checkout release/2b
git pull origin release/2b
git merge feature/phase-2b-livestream

# Push to trigger Netlify deploy with Phase 2b flags
git push origin release/2b

# Test at preview URL: https://release-2b--build-a-b.netlify.app
```

**3. Promotion to Staging**:
```bash
# Once validated, merge to main for staging
git checkout main
git pull origin main
git merge release/2b
git push origin main

# Test at staging URL before production
```

**4. Production Deployment**:
```bash
# Merge to prod when ready for production
git checkout prod
git pull origin prod
git merge main
git push origin prod

# Update production environment variable:
# FLAG_SHOW_PHASE=2b
```

### Environment Variable Setup per Branch

**`release/2a` Branch (Netlify)**:
```bash
FLAG_SHOW_PHASE=2a
FLAG_SHOW_DATA_WAR=false
FLAG_SHOW_SOCIAL_FEED=false
FLAG_EASTER_EGG=false
FLAG_SHOW_AVATAR_PLAYPEN_BUTTONS=true
```

**`release/2b` Branch (Netlify)**:
```bash
FLAG_SHOW_PHASE=2b
FLAG_SHOW_DATA_WAR=true
FLAG_SHOW_SOCIAL_FEED=true
FLAG_EASTER_EGG=false
FLAG_SHOW_AVATAR_PLAYPEN_BUTTONS=true
```

**`release/2c` Branch (Netlify)**:
```bash
FLAG_SHOW_PHASE=2c
FLAG_SHOW_DATA_WAR=true
FLAG_SHOW_SOCIAL_FEED=true
FLAG_EASTER_EGG=true
FLAG_SHOW_AVATAR_PLAYPEN_BUTTONS=true
```

**`prod` Branch (Netlify Production)**:
```bash
# Set to current live phase
FLAG_SHOW_PHASE=2c  # (or current phase)
FLAG_SHOW_DATA_WAR=true
FLAG_SHOW_SOCIAL_FEED=true
FLAG_EASTER_EGG=true
FLAG_SHOW_AVATAR_PLAYPEN_BUTTONS=true
```

### Benefits of Release Branch Strategy

1. **Isolated Testing**: Test each phase independently
2. **Stakeholder Review**: Share phase-specific preview URLs
3. **QA Validation**: Test phase transitions before production
4. **Risk Mitigation**: Validate before promoting to main/prod
5. **Parallel Development**: Work on multiple phases simultaneously
6. **Easy Rollback**: Revert by changing environment variables

---

## Testing Phases

### Local Development Testing

Test phases locally by modifying `.env.local`:

**Phase 1 (Base)**:
```bash
# No phase flags needed
FLAG_SHOW_AVATAR_PLAYPEN_BUTTONS=true
FLAG_SHOW_DATA_WAR=false
FLAG_SHOW_SOCIAL_FEED=false
FLAG_EASTER_EGG=false
```

**Phase 2a**:
```bash
FLAG_SHOW_PHASE=2a
FLAG_SHOW_AVATAR_PLAYPEN_BUTTONS=true
FLAG_SHOW_DATA_WAR=false
FLAG_SHOW_SOCIAL_FEED=false
FLAG_EASTER_EGG=false
```

**Phase 2b**:
```bash
FLAG_SHOW_PHASE=2b
FLAG_SHOW_AVATAR_PLAYPEN_BUTTONS=true
FLAG_SHOW_DATA_WAR=true
FLAG_SHOW_SOCIAL_FEED=true
FLAG_EASTER_EGG=false
```

**Phase 2c**:
```bash
FLAG_SHOW_PHASE=2c
FLAG_SHOW_AVATAR_PLAYPEN_BUTTONS=true
FLAG_SHOW_DATA_WAR=true
FLAG_SHOW_SOCIAL_FEED=true
FLAG_EASTER_EGG=true
```

**Phase 4**:
```bash
FLAG_SHOW_PHASE=4
FLAG_SHOW_AVATAR_PLAYPEN_BUTTONS=true
FLAG_SHOW_DATA_WAR=true
FLAG_SHOW_SOCIAL_FEED=false
FLAG_EASTER_EGG=true
```

Remember to restart dev server after changing environment variables:
```bash
pnpm dev
```

### Phase Testing Checklist

For each phase transition, verify:

#### Visual Elements
- [ ] Countdown timer shows correct message
- [ ] Hero/primary content updates correctly
- [ ] Ticker messages are appropriate
- [ ] Layout/grid structure is correct
- [ ] Images load properly
- [ ] Colors/branding consistent

#### Functionality
- [ ] Navigation links work
- [ ] CTAs go to correct destinations
- [ ] Routes are accessible/protected correctly
- [ ] Forms submit properly
- [ ] Modals open/close correctly
- [ ] Animations work smoothly

#### Content
- [ ] Copy is appropriate for phase
- [ ] Dates are correct
- [ ] Links go to correct pages
- [ ] Social media links work
- [ ] Hashtags are correct

#### Responsive Design
- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works
- [ ] Portrait/landscape orientations work
- [ ] Touch interactions work on mobile

#### Performance
- [ ] Page loads quickly
- [ ] Images are optimized
- [ ] No console errors
- [ ] No infinite loops
- [ ] Smooth animations

#### Analytics
- [ ] Events track correctly
- [ ] Page views logged
- [ ] CTA clicks tracked
- [ ] Social shares tracked

---

## Related Documentation

- [README.feature_flags.md](./README.feature_flags.md) - Detailed feature flag documentation
- [README.environments.md](./README.environments.md) - Environment and deployment configuration
- [README.product_requirements.md](./README.product_requirements.md) - Product requirements and goals
- [README.architecture.md](./README.architecture.md) - System architecture overview

---

**Last Updated**: November 2024
**Maintainers**: Mozilla Platform Team

