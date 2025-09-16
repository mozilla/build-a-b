# BBO Microsite — Product Requirements Document (PRD) v1.0

_(Draft, Sep 2025)_

## 1. Executive Overview

### Campaign Goals

-   Promote Firefox’s “Open What You Want” positioning via satirical, Gen Z–friendly creative.
-   Drive awareness, not data collection (no PII stored).
-   Anchor campaign activations (TwitchCon booth, influencer streams, Data War game) on a central microsite.

### User Experience Flow

1.  **Landing Page** — Campaign branding, ticker, hero banner.
2.  **Avatar Creation Modal**
    -   Users answer 7 multiple-choice questions (5 options each).
    -   Avatar + bio generated via LLM API.
3.  **Avatar URL Assigned** — User receives unique “all access pass” link (e.g. `/a/{hash}`).
4.  **Avatar Gallery & Playpen**
    -   Actions: space selfie, TikTok dance, etc.
    -   Unlocks stored per-avatar, but experienced individually per user.
5.  **Return Visits**
    -   Cookie auto-routes returning users to their avatar.
    -   These URLs allow users to view/modify avatars (**no authentication required**).

### Success Metrics

-   Volume of avatars generated.
-   Engagement with playpen actions.
-   Return rate (users revisiting via hash/URL).
-   Social sharing (tracked via outbound links, not user IDs).

### Constraints

-   No email collection or CRM tie-in (legal constraint).
-   Must function on mobile + desktop with infinite scaling (no breakpoints).
-   Runs at least through the end of 2025, possibly extended for a card game.