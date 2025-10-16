# Analytics Documentation

## Overview

This document provides a comprehensive list of all analytics events tracked in the Build-a-Billionaire application. The application uses Google Analytics 4 (GA4) to track user interactions and page views.

## Analytics Setup

### Google Analytics Configuration

- **Tracking ID**: uses `NEXT_PUBLIC_GA_ID` environment variable
- **Implementation**: Google Tag Manager (gtag.js)
- **Location**: `/apps/web/src/app/layout.tsx`

### Core Analytics Files

- **Event Tracking**: `/apps/web/src/utils/helpers/track-event.ts` - Centralized event tracking function
- **GA Helper**: `/apps/web/src/utils/helpers/gtag.ts` - Low-level Google Analytics integration
- **Analytics Listener**: `/apps/web/src/components/AnalyticsListener/index.tsx` - Automatic pageview tracking

## Event Categories

All events are organized into five main categories:

1. **Avatar Generator** - Events related to the avatar creation flow
2. **Homepage** - Events specific to the homepage
3. **TwitchCon** - Events on the TwitchCon page
4. **Data War** - Events related to Data War card game features
5. **Navigation** - Site-wide navigation and UI interaction events

## Events Reference

### 1. Avatar Generator Events

**Category**: `avatar_generator`

| Event Name | Description | Location | Platform Support |
|------------|-------------|----------|------------------|
| `click_get_started_cta` | User clicks any "Get Started" CTA button to begin avatar creation | Various pages, GetStarted component | All |
| `click_build_billionaire_footer` | User clicks "Build a Billionaire" CTA in footer | Footer component | All |
| `click_build_billionaire_mobile_nav` | User clicks "Build a Billionaire" in mobile navigation | Mobile menu | Mobile only |
| `click_build_billionaire_countdown` | User clicks "Build a Billionaire" in countdown section | TwitchCon page | All |
| `click_start_custom_avatar` | User chooses to start creating a custom avatar (not random) | Intro flow | All |
| `click_create_random_avatar` | User chooses to create a random avatar | Intro flow | All |
| `click_restart_avatar` | User clicks to restart/reset the avatar creation process | Playpen restart modal | All |
| `click_save_avatar` | User saves their created avatar | Vault, ActionMenu components | All |
| `click_share_avatar` | User initiates sharing their avatar | ActionMenu, share hooks | All |
| `click_download_avatar` | User downloads their avatar image | ActionMenu component | All |
| `click_view_selfie` | User opens the vault to see a selfie | GalleryBentoLarge & GalleryBentoSmall components | All |

**Components that fire these events:**
- `/apps/web/src/components/PrimaryFlow/GetStarted/index.tsx`
- `/apps/web/src/components/PrimaryFlow/Intro/index.tsx`
- `/apps/web/src/components/PrimaryFlow/AvatarBentoV2/ActionMenu.tsx`
- `/apps/web/src/components/PlaypenPopup/PlaypenRestart.tsx`
- `/apps/web/src/components/Vault/index.tsx`
- `/apps/web/src/hooks/useNavigatorShareAction.ts`
- `/apps/web/src/components/Footer/index.tsx`
- `/apps/web/src/components/MobileMenu/index.tsx`
- `/apps/web/src/components/GalleryBentoLarge/index.tsx`
- `/apps/web/src/components/GalleryBentoSmall/index.tsx`

---

### 2. Homepage Events

**Category**: `homepage`

| Event Name | Description | Location | Platform Support |
|------------|-------------|----------|------------------|
| `click_twitchcon_details_cta` | User clicks CTA to learn more about TwitchCon | Homepage | All |
| `click_space_launch_details_cta` | User clicks CTA to learn more about Space Launch | Homepage | All |
| `click_firefox_owyw_logo` | User clicks the Firefox "Own Your Web" logo | Homepage | All |

**Components that fire these events:**
- `/apps/web/src/app/page.tsx`

---

### 3. TwitchCon Events

**Category**: `twitchcon`

| Event Name | Description | Location | Platform Support |
|------------|-------------|----------|------------------|
| `click_get_twitchcon_tickets` | User clicks to get TwitchCon tickets | TwitchCon page | All |

**Components that fire these events:**
- `/apps/web/src/app/twitchcon/page.tsx`

---

### 4. Data War Events

**Category**: `datawar`

| Event Name | Description | Location | Platform Support |
|------------|-------------|----------|------------------|
| `click_download_deck_datawar_hero` | User downloads the Data War deck from hero section | Data War page (hero) | All |
| `click_download_deck_datawar_twitchcon` | User downloads the Data War deck from TwitchCon section | Data War page (TwitchCon) | All |
| `click_download_deck_datawar_diy` | User downloads the Data War deck from DIY section | Data War page (DIY) | All |
| `click_download_deck_instructions` | User downloads the deck from instructions page | Instructions page | All |
| `click_want_physical_deck` | User expresses interest in a physical deck | Data War page | All |
| `click_go_to_datawar` | User clicks on a CTA which takes user to Data War page | Home & Twitchcon pages | All |
| `click_go_to_instructions` | User clicks on a CTA which takes user to Data War Instructions page | Data War page | All |

**Components that fire these events:**
- `/apps/web/src/app/page.tsx`
- `/apps/web/src/app/datawar/page.tsx`
- `/apps/web/src/app/datawar/instructions/page.tsx`
- `/apps/web/src/components/DataWar/PhysicalDeckButton/index.tsx`

---

### 5. Navigation Events

**Category**: `navigation`

| Event Name | Description | Location | Platform Support |
|------------|-------------|----------|------------------|
| `click_bbo_logo_header` | User clicks Build-a-Billionaire logo in header | Header | All |
| `click_bbo_logo_footer` | User clicks Build-a-Billionaire logo in footer | Footer | All |
| `click_home_header` | User clicks Home link in header navigation | Header | All |
| `click_home_footer` | User clicks Home link in footer navigation | Footer | All |
| `click_twitchcon_header` | User clicks TwitchCon link in header navigation | Header | All |
| `click_twitchcon_footer` | User clicks TwitchCon link in footer navigation | Footer | All |
| `click_datawar_header` | User clicks Data War link in header navigation | Header | All |
| `click_datawar_footer` | User clicks Data War link in footer navigation | Footer | All |
| `click_firefox_footer_logo` | User clicks Firefox logo in footer | Footer | All |
| `click_social_icon_header` | User clicks a social media icon in header | Header | All |
| `click_social_icon_footer` | User clicks a social media icon in footer | Footer | All |
| `click_social_icon_datawar` | User clicks a social media icon on Data War page | Data War page | All |

**Note**: Social icon events include a `platform` parameter (e.g., `twitter`, `discord`, `instagram`) that gets appended to the event label.

**Components that fire these events:**
- `/apps/web/src/components/Header/index.tsx`
- `/apps/web/src/components/HeaderMenu/index.tsx`
- `/apps/web/src/components/Footer/index.tsx`
- `/apps/web/src/components/MobileMenu/index.tsx`
- `/apps/web/src/components/SocialNetwork/index.tsx`
- `/apps/web/src/app/layout.tsx` (navigation configuration)

---

## Page View Tracking

In addition to custom events, the application automatically tracks page views using the `AnalyticsListener` component.

**Implementation**: `/apps/web/src/components/AnalyticsListener/index.tsx`

Page views are tracked automatically when:
- User navigates to any page
- URL parameters change
- User lands on the site from external sources

## How to Track a New Event

### 1. Define the Event

Add your event to the appropriate array in `/apps/web/src/utils/helpers/track-event.ts`:

```typescript
const avatarEvents = [
  // ... existing events
  'click_your_new_event',
] as const;
```

### 2. Use the trackEvent Function

Import and use the `trackEvent` function in your component:

```typescript
import { trackEvent } from '@/utils/helpers/track-event';

function MyComponent() {
  const handleClick = () => {
    trackEvent({ action: 'click_your_new_event' });
    // ... rest of your logic
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

### 3. For Social/Platform-Specific Events

If your event needs to track which platform/social network was clicked:

```typescript
trackEvent({ 
  action: 'click_social_icon_header', 
  platform: 'twitter' 
});
```

### 4. For Link Buttons

Use the `LinkButton` component which has built-in tracking support:

```typescript
<LinkButton
  href="https://example.com"
  trackableEvent="click_your_event"
  trackablePlatform="optional_platform"
>
  Click Me
</LinkButton>
```

## Event Data Structure

Each event sent to Google Analytics includes:

- **action**: The event name (e.g., `click_get_started_cta`)
- **category**: The event category (e.g., `avatar_generator`, `homepage`, `navigation`)
- **label**: A cleaned version of the action without the `click_` prefix
- **platform** (optional): For social media events, includes the platform name

Example GA4 event payload:
```javascript
{
  action: 'click_social_icon_header',
  event_category: 'navigation',
  event_label: 'social_icon_header_twitter',
}
```

## Testing Events

### Manual Testing

1. Open browser developer tools
2. Go to Network tab
3. Filter by "google-analytics.com" or "analytics"
4. Perform actions that should trigger events
5. Verify events are being sent

### Unit Tests

Event tracking has unit tests in:
- `/apps/web/src/utils/helpers/__tests__/track-event.test.ts`
- `/apps/web/src/utils/helpers/__tests__/gtag.test.ts`

Run tests with:
```bash
pnpm test
```

## Best Practices

1. **Naming Convention**: Use `click_` prefix for click events
2. **Be Specific**: Event names should clearly describe the action and location
3. **Consistent Categories**: Keep related events in the same category
4. **Document New Events**: Update this README when adding new events
5. **Test Before Deploy**: Always test events in development before pushing to production
6. **Avoid PII**: Never track personally identifiable information in events

## Environment Variables

- `NEXT_PUBLIC_GA_ID`: Google Analytics tracking ID (defaults to `G-GBTX3GFPFP`)

Set this in your `.env.local` file:
```bash
NEXT_PUBLIC_GA_ID=G-YOUR-TRACKING-ID
```

## Debugging

To see which events would be fired without sending them to GA:

1. Check the browser console for warnings about unhandled events
2. Events that don't match any category will log: `Unhandled GA event: {action}`
3. Use React Developer Tools to inspect component props and state

## Summary Statistics

**Total Events Tracked**: 30

**By Category**:
- Avatar Generator: 10 events
- Homepage: 3 events  
- TwitchCon: 1 event
- Data War: 5 events
- Navigation: 11 events

**Components with Tracking**: 15+ components
**Event Handler Functions**: 2 (`trackEvent`, `pageview`)

