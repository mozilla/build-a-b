# Mozilla Billionaire Blast-Off

[![Netlify Status](https://api.netlify.com/api/v1/badges/783c3055-df4e-41ee-a9fe-1772db6f3e95/deploy-status)](https://app.netlify.com/projects/build-a-b/deploys)

This is a Next.js 15+ TypeScript monorepo for the Mozilla "Billionaire Blast-Off" microsite. It features a HeroUI component library, Tailwind CSS v4 with a customized plugin, Sanity CMS Studio for content management, and the Flags SDK for feature flags.

## Table ofContents

- [Project Overview](#project-overview)
- [Documentation](#documentation)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Packages Overview](#packages-overview)
- [Available Scripts](#available-scripts)
- [Architecture & Technologies](#architecture-technologies)
- [Quality Gates](#quality-gates)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

**Project name**: Mozilla Billionaire Blast-Off  
**Slack/Comms**: #platform or project channel  
**Live URLs**: preview via Vercel; production via Vercel/AWS (per project)

**Summary:**
"Billionaire Blast-Off" is an interactive microsite designed to promote Firefox’s “Open What You Want” positioning through a satirical, Gen Z–friendly creative lens. Users can build their own billionaire avatar and learn about data privacy in a playful way. The project is built on a white-label Next.js + Sanity starter that provides a production-ready foundation for quickly shipping client sites. The primary goal is to drive awareness, not data collection, with no PII being stored.

**Goals / Success Metrics:**
-   Volume of avatars generated.
-   Engagement with playpen actions.
-   Return rate (users revisiting via hash/URL).
-   Social sharing (tracked via outbound links, not user IDs).

---

## Documentation

For more in-depth information, please see the following documents:

-   [**Product Requirements Document (PRD)**](PRODUCT_REQUIREMENTS.md): Detailed information on campaign goals, user experience flow, success metrics, and constraints.
-   [**Engineering Playbook**](ENGINEERING_PLAYBOOK.md): A comprehensive guide to the technical architecture, database schema, security measures, and deployment process.
-   [**Frontend Documentation**](README.frontend.md)
-   [**CMS Documentation**](README.cms.md)
-   [**Architecture Documentation**](README.architecture.md)
-   [**Environments Documentation**](README.environments.md)

---

## Features

-   **Avatar Builder**: Users can create a custom billionaire avatar by answering a 7-question quiz or get a randomly generated one. Avatars and bios are generated via an LLM API.
-   **Unique Avatar URL**: Each user receives a unique "all-access pass" link (e.g., `/a/{hash}`) to their generated avatar, which they can share.
-   **Interactive Story**: The experience guides users through a narrative about data privacy and corporate accountability.
-   **Avatar Gallery & Playpen**: Users can perform actions with their avatar, such as taking a space selfie or doing a TikTok dance.
-   **Sanity CMS Integration**: Content is managed through a Sanity Studio backend.
-   **Bento Grid Layout**: The site uses a modern bento grid layout for its components.

---

## Prerequisites

* Node.js >= 18.x
* pnpm >= 7.x
* Git CLI

---

## Getting Started

1.  Clone the repository:
    ```bash
    git clone [git@github.com:mozilla/build-a-b.git](git@github.com:mozilla/build-a-b.git)
    cd build-a-b
    ```
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Copy environment variables:
    ```bash
    cp .env.example .env.local
    ```
4.  Update `.env.local` with your Sanity project ID and dataset from `apps/studio/sanity.config.ts`.

---

## Environment Variables

All environment variables are defined in [`.env.example`](.env.example:1). Do not commit secrets; use your hosting provider's secret store for production credentials.

---

## Project Structure

```
build-a-b/
├─ apps/
│  ├─ web/             # Next.js application (frontend)
│  │  └─ .env.example  # Web-level .env is required for build
│  ├─ studio/          # Sanity CMS Studio (content backend)
│  └─ game/            # Vite/React SPA (embedded game)
├─ packages/           # shared packages (ui, config, utils)
├─ .env.example
├─ package.json
└─ README.md
```

---

## Packages Overview

### [`apps/web`](apps/web:1)

-   Next.js (App Router), TypeScript, Turbopack, Tailwind v4, HeroUI.
-   Flags SDK and Sanity for content.

### [`apps/studio`](apps/studio:1)

-   Sanity Studio configured; schemas live in `apps/studio/schemaTypes`.

### [`apps/game`](apps/game:1)

-   Vite/React SPA built with Rolldown for performance.
-   Automatically builds and embeds into the Next.js app at `/assets/game/` during the build process.
-   Accessible via the `/game` route in the deployed Next.js application.

---

## Available Scripts

Root scripts:

```bash
pnpm dev      # Start web and studio (local)
pnpm build    # Build all packages (game builds automatically during web prebuild)
pnpm start    # Start web in production
pnpm lint
pnpm format
pnpm test
```

Web package:

```bash
pnpm --filter web dev
pnpm --filter web build    # Automatically builds game app first via prebuild hook
pnpm --filter web start
pnpm --filter web lint
```

Studio package:

```bash
pnpm --filter studio dev
pnpm --filter studio build
pnpm --filter studio deploy
```

Game package:

```bash
pnpm --filter game dev      # Run game in dev mode at http://localhost:5173
pnpm --filter game build    # Build game (happens automatically during web build)
```

---

## Architecture & Technologies

-   Monorepo: pnpm workspaces + Turbo
-   Frontend: Next.js (App Router), Server Components where applicable
-   Styling: Tailwind v4, HeroUI component wrappers
-   CMS: Sanity (GROQ, next-sanity)
-   Feature flags: Vercel Flags SDK
-   Game: Vite/React SPA with Rolldown (embedded via build process)

### Game Build Integration

The `apps/game` Vite application is automatically integrated into the Next.js build process:

**Local Development:**
- Run `pnpm --filter game dev` to develop the game independently at `http://localhost:5173`
- Game uses base path `/` for local development
- Game is NOT automatically available in the Next.js dev server (run separately)

**Production Build:**
1. When `pnpm build` or `pnpm --filter web build` runs, the web app's `prebuild` hook executes first
2. The game is built with Vite using base path `/assets/game/` (configured in `vite.config.ts`)
3. Build output from `apps/game/dist/` is copied to `apps/web/public/assets/game/`
4. Next.js serves the game as static files
5. Next.js rewrite rules (in `next.config.ts`) make the game accessible at `/game`

**Accessing the Game:**
- Local dev: `http://localhost:5173` (separate Vite server)
- Production/deployed: `https://yourdomain.com/game` (served by Next.js)

All asset URLs (images, JS, CSS) are automatically prefixed with `/assets/game/` in production builds.

---

## Quality Gates

These commands should run successfully in CI for PRs:

1.  Type check: `pnpm typecheck` (tsc --noEmit)
2.  Format: `pnpm format`
3.  Lint: `pnpm lint`
4.  Tests: `pnpm test`
5.  Sanity schema validate: `pnpm -F @apps/studio schema:validate`
6.  Build: `pnpm build`

---

## Contributing

-   Follow Conventional Commits. Fork → feature branch → PR.
-   Include tests, stories, and docs for new components.
-   Use ADRs (`/adr`) for architectural changes.

---

## License

MIT © Mondo Robot
