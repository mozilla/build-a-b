# BBO Microsite — Engineering Playbook v1.0

_(Draft, Sep 2025)_

## 1. Engineering Playbook (TDD)

### Tech Stack

-   **Frontend**: Next.js (on Netlify), Tailwind CSS, HeroUI (limited).
-   **Database**: Supabase (Postgres) → avatar/user mapping + playpen action flags.
-   **Image Storage**:
    -   LLM returns avatar/playpen images.
    -   Store originals in **Supabase Storage** (private bucket).
    -   Serve via CDN with signed URLs for caching + performance.
-   **Hosting**: Netlify (fast deploy, preview builds).
-   **Version Control**: GitHub (Mozilla enterprise repo).

---

### System Architecture

**Flow**:

1.  User submits choices → API → LLM generates avatar image + bio.
2.  API stores result in Supabase:
    -   `Avatars` table - one row per unique avatar, up to N rows per choice combination.
    -   `Users` table - one row per unique hash.
3.  Avatar/playpen images stored in Supabase Storage → cached CDN delivery.
4.  User gets unique hash in URL + cookie for return visits.

---

### Database Schema (Proposed)

**Table: Avatars**

-   `id` (PK, UUID)
-   `combination_key` (string: concatenated 7 answers, eg. '5324153')
-   `image_url` (string, Supabase storage path)
-   `bio_text` (text)
-   `playpen_selfie_url` (string, nullable)
-   `playpen_tiktok_url` (string, nullable)
-   `created_at` (timestamp)

**Table: Users**

-   `id` (PK, UUID / hash)
-   `avatar_id` (FK → Avatars.id)
-   `cookie_id` (string, optional for return routing)
-   `playpen_selfie_unlocked` (boolean)
-   `playpen_tiktok_unlocked` (boolean)
-   `created_at` (timestamp)

---

### Avatar Generation & Memoization Logic

-   Each combination of answers = deterministic `combination_key`.
-   On first N requests:
    -   Generate avatar via LLM.
    -   Insert into `Avatars` (up to N variants allowed per combination).
-   On subsequent requests (N+1):
    -   Randomly select from existing Avatars for that combination.
    -   Create new User pointing to that randomly assigned Avatar.

**Playpen actions**:

-   If **avatar doesn’t have action** → LLM generates asset, stored in `Avatars` table.
-   If **avatar already has action** → user experience references stored asset.
-   User table tracks whether they have “unlocked” the action (boolean).

---

### Security & Privacy

-   No PII collected.
-   User hashes = UUID or salted hash (timestamp + choices + random).
-   Hash must be unguessable to prevent brute-force enumeration.
-   Images stored in private buckets → accessed via signed CDN URLs.
-   Cookies store only `user_id` hash, no sensitive data.

---

### Deployment & Infra

-   Netlify handles build + deploy (Next.js SSR where needed).
-   Supabase (DB + storage) = single source of truth.
-   CDN caching for images.
-   Monitoring/observability: Netlify Analytics + Supabase logs.

---

### Initial Dev Tasks

1.  **Scaffolding**
    -   Next.js project setup in Mozilla GitHub.
    -   Tailwind + HeroUI baseline setup.
2.  **Core Components**
    -   Header (nav, logo, social links).
    -   Footer.
    -   Bento grid + ticker.
    -   Card wrapper component (consistent styling).
3.  **Avatar Flow**
    -   Modal for 7-question quiz.
    -   API call to LLM + Supabase insert.
    -   Hash + cookie handling.
4.  **Playpen Actions**
    -   Selfie + TikTok endpoints.
    -   DB + storage logic for memoization.
    -   UI for unlocking actions.
5.  **Routing & Persistence**
    -   `/a/{hash}` pages.
    -   Cookie-based return logic.
6.  **Performance & Testing**
    -   CDN image caching.
    -   Accessibility (clickable CTAs, keyboard nav).
    -   QA on infinite scaling design.

---

## 2. Open Questions

-   N value for memoization (10? 20?).
-   CDN choice: Supabase’s built-in vs Netlify Blob.
-   Easter egg unlocks (Data War cards) → DB design needed.
-   Sunset plan for 2026: archive vs ongoing maintenance.