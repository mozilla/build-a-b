# mondolite-lite-boilerplate

A Next.js 15+ TypeScript monorepo starter kit featuring:
- HeroUI component library
- Tailwind CSS v4 with customized plugin
- Sanity CMS Studio for content management
- NextAuth for authentication (GitHub OAuth)
- LaunchDarkly feature flags
- Localization and internationalization support
- Performance best practices (Turbopack, caching, ISR)

## Table of Contents
- [Project overview](#project-overview)
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

## Project overview
**Project name**: Mondo Lite  
**Owners**: Platform / Project Owner (fill in CODEOWNERS)  
**Slack/Comms**: #platform or project channel  
**Live URLs**: preview via Vercel; production via Vercel/AWS (per project)

Summary:
Mondo Lite is a white‑label Next.js + Sanity starter that provides a production‑ready foundation (routing, CMS, design system, theming, CI, auth stubs) for quickly shipping client sites. The repository is opinionated about stack choices and quality gates so teams can move fast while keeping consistency.

Goals / success metrics:
- Setup time: < 60 minutes
- First page + CMS sync: < 15 minutes
- Predictable CI checks and passing Quality Gates on PRs

Where to find detailed docs:
- [`README.frontend.md`](README.frontend.md:1)
- [`README.cms.md`](README.cms.md:1)
- [`README.architecture.md`](README.architecture.md:1)
- [`README.environments.md`](README.environments.md:1)

## Prerequisites
- Node.js >= 18.x
- pnpm >= 7.x
- Git CLI

## Getting Started
1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/mondolite-boilerplate.git
   cd mondolite-boilerplate
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Update `.env.local` with credentials (see `.env.example`)

## Environment Variables
All environment variables are defined in [`.env.example`](.env.example:1). Do not commit secrets; use your hosting provider's secret store for production credentials.

## Project Structure
```
mondolite-boilerplate/
├─ apps/
│  ├─ web/     # Next.js application (frontend)
│  └─ studio/  # Sanity CMS Studio (content backend)
├─ packages/   # shared packages (ui, config, utils)
├─ .env.example
├─ package.json
└─ README.md
```

## Packages Overview
### [`packages/web`](packages/web:1)
- Next.js (App Router), TypeScript, Turbopack, Tailwind v4, HeroUI.
- Integrates NextAuth, LaunchDarkly and Sanity for content.

### [`packages/studio`](packages/studio:1)
- Sanity Studio configured; schemas live in `packages/studio/schemaTypes`.

## Available Scripts
Root scripts:
```bash
pnpm dev      # Start web and studio (local)
pnpm build    # Build all packages
pnpm start    # Start web in production
pnpm lint
pnpm format
pnpm test
```

Web package:
```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web start
pnpm --filter web lint
```

Studio package:
```bash
pnpm --filter studio dev
pnpm --filter studio build
pnpm --filter studio deploy
```

## Architecture & Technologies
- Monorepo: pnpm workspaces + Turbo
- Frontend: Next.js (App Router), Server Components where applicable
- Styling: Tailwind v4, HeroUI component wrappers
- CMS: Sanity (GROQ, next-sanity)
- Auth: NextAuth (GitHub provider stub)
- Feature flags: LaunchDarkly

## Quality Gates
These commands should run successfully in CI for PRs:
1. Type check: `pnpm typecheck` (tsc --noEmit)
2. Format: `pnpm format`
3. Lint: `pnpm lint`
4. Tests: `pnpm test`
5. Sanity schema validate: `pnpm -F @apps/studio schema:validate`
6. Build: `pnpm build`

## Contributing
- Follow Conventional Commits. Fork → feature branch → PR.
- Include tests, stories, and docs for new components.
- Use ADRs (`/adr`) for architectural changes.

## License
MIT © Mondo Robot
