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
- The frontend is hosted on Netlify, which handles CI/CD and preview builds.
- Supabase is used for the Postgres database (billionaire and user data) and for storing generated images.

## Data flow
1. The web app (apps/web) serves pages with static HTML (SSG) with ISR or full SSR where needed.
2. User interactions (like creating a billionaire) trigger API calls to a backend that interacts with Supabase.
3. CI runs builds and deploys previews to Netlify; production deploys to Netlify.

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
- Theming: put shared tokens and presets in `packages/ui` and load presets at the root layout.
- ADRs: use `/adr/NNN-title.md` for any stack or heavy dependency changes.

## Anti-patterns (avoid)
- Large, untyped Client Components that contain most application logic.
- Scattering ad-hoc fetch logic across pages instead of centralized modules.
- Adding heavy third-party libraries without an ADR and owner sign-off.

## Non-functional considerations
- Performance: follow budgets for LCP / CLS / TTFB (define specific numbers in README.performance.md).
- Accessibility: AA baseline; add automated checks in CI and manual testing for major features.
- Security: dependency audits in CI; fail on high severity vulnerabilities.

## Operational notes
- Backups & migrations: document migration steps in `/docs/migrations` or `/infra`.
- Monitoring: integrate Sentry/Datadog or the provider chosen by the project (per-client).

## Quick links
- Web app: [`apps/web`](apps/web:1)
- Shared UI tokens/components: [`packages/ui`](packages/ui:1) (create if missing)
- Root scripts & CI: see [`package.json`](package.json:1)

## Missing SQL functions

- upsert_user_with_avatar
- get_selfie_for_user_avatar
- get_available_selfies
- remove_avatar_by_user
