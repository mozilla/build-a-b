# Architecture — BBO Microsite

This document captures the high-level architecture, goals, constraints and recommended patterns for the BBO Microsite. It is intentionally concise so engineers can get started quickly and find links to deeper details.

## Goals & constraints
- White-label starter: make branding/theming pluggable via token presets; avoid hard-coded styles.
- Fast and accessible: aim for good Core Web Vitals and WCAG AA baseline.
- Predictable builds and CI: reproducible static builds with clear quality gates.
- Small surface area: keep dependencies minimal; prefer small focused packages.
- Security & privacy: no secrets in repo; follow principle of least privilege for integrations.

## System diagram (high level)
```
Editor (Sanity Studio) → Sanity Content Lake (API)
                                    │
                                    ▼
                            Apps / CDN / Edge
                          (Next.js on Netlify)
                                    ▲
                                    │
                          Netlify Previews / Prod
                                    ▲
                                    │
                        ┌───────────┴───────────┐
                        │                       │
                        ▼                       ▼
                   Supabase (DB)         Supabase (Storage)
```

Notes:
- Sanity is the content source of truth. Web app fetches via server components (GROQ / next-sanity / @sanity/client).
- The frontend is hosted on Netlify, which handles CI/CD and preview builds.
- Supabase is used for the Postgres database (billionaire and user data) and for storing generated images.
- Preview environments use Sanity webhooks + Next draft mode or preview handlers.

## Data flow
1. Content editors author content in Sanity Studio (apps/studio).
2. Sanity Content Lake exposes content via GROQ/API.
3. The web app (apps/web) queries content from server components; pages generate static HTML (SSG) with ISR or full SSR where needed.
4. User interactions (like creating an billionaire) trigger API calls to a backend that interacts with Supabase.
5. CI runs builds and deploys previews to Netlify; production deploys to Netlify.

## Deployment & environments
- Branch → environment:
  - `main` → production (Netlify)
  - PR branches → Netlify preview
- Secrets stored in hosting provider (Netlify), GitHub secrets, or cloud secret managers.
- Invalidate CDN caches or rely on Next revalidation/tag revalidation for freshness.

## Patterns to follow
- Server-first rendering: prefer Server Components and fetch on server where possible.
- Islands for interactivity: only hydrate client code where required.
- Co-locate: component, styles, tests, and stories in the same folder.
- Centralize queries and types:
  - Place GROQ queries in `packages/web/src/lib/sanity/queries.ts`.
  - Keep content type definitions / zod schemas in `packages/web/src/lib/sanity/types.ts`.
- Theming: put shared tokens and presets in `packages/ui` and load presets at the root layout.
- ADRs: use `/adr/NNN-title.md` for any stack or heavy dependency changes.

## Anti-patterns (avoid)
- Fetching Sanity content directly from client components.
- Large, untyped Client Components that contain most application logic.
- Scattering ad-hoc fetch logic across pages instead of centralized query modules.
- Adding heavy third-party libraries without an ADR and owner sign-off.

## Non-functional considerations
- Performance: follow budgets for LCP / CLS / TTFB (define specific numbers in README.performance.md).
- Accessibility: AA baseline; add automated checks in CI and manual testing for major features.
- Security: dependency audits in CI; fail on high severity vulnerabilities.

## Operational notes
- Schema changes: propose via PR with migration notes and dataset backup instructions. Validate schemas with `pnpm -F @apps/studio schema:validate` before merging.
- Backups & migrations: document migration steps in `/docs/migrations` or `/infra`.
- Monitoring: integrate Sentry/Datadog or the provider chosen by the project (per-client).

## Quick links
- Web app: [`apps/web`](apps/web:1)
- Sanity Studio: [`apps/studio`](apps/studio:1)
- Shared UI tokens/components: [`packages/ui`](packages/ui:1) (create if missing)
- Root scripts & CI: see [`package.json`](package.json:1)

## Missing SQL functions

- upsert_user_with_avatar
- get_selfie_for_user_avatar
- get_available_selfies
- remove_avatar_by_user