# Frontend — BBO Microsite

This document describes frontend conventions, patterns and commands for the BBO Microsite starter (Next.js + TypeScript + Tailwind + HeroUI).

## Language & conventions

- TypeScript strict mode everywhere. Use path aliases in `tsconfig.json` for shared packages.
- React: prefer Server Components where possible; opt into Client Components (`"use client"`) only for interactive code.
- Co-locate component, styles, tests and stories in the same folder.
- Keep components small and framework-friendly; prefer composition (slots, asChild) over large prop APIs.

## Styling & UI

- Tailwind CSS v4 (utility-first, token-driven). Keep tokens (colors, spacing, radii) in `packages/ui`.
- HeroUI is the UI kit; wrap or extend reusable patterns in `packages/ui/components`.
- Avoid hard-coded colors; consume CSS variables / tokens.

## Next.js specifics (apps/web)

- Routing: App Router under [`apps/web/app`](apps/web/app:1) (segment layouts + server components).
- Data fetching: prefer server fetches in server components. Use ISR via `export const revalidate = <seconds>` or tag revalidation for dynamic content.
- Image & font optimization: use Next built-in image and font handling (`next/image`, `next/font`).
- Hosting is managed by Netlify.

## File layout (recommended)

- `apps/web/src/components/*` — presentational & small composed components
- `apps/web/src/app/*` — route segments, layouts, pages
- `apps/web/src/lib/*` — utilities, data-fetching helpers, GROQ query wrappers
- `packages/ui/*` — design tokens, presets, shared components

## Testing & stories

- Unit / component tests: Jest / React Testing Library or Vitest depending on workspace config. Place tests alongside code with `__tests__` or `.test.tsx`.
- Storybook (if enabled): include a story for new components.

## Commands (root / workspace)

- Install: `pnpm install`
- Dev (web): `pnpm --filter ./apps/web dev` (or `pnpm dev` from root if root orchestrates)
- Build (web): `pnpm --filter ./apps/web build`
- Start (web prod): `pnpm --filter ./apps/web start`
- Lint: `pnpm --filter ./apps/web lint` or `pnpm lint` from root
- Typecheck: `pnpm --filter ./apps/web typecheck` or `pnpm typecheck` from root
- Test: `pnpm --filter ./apps/web test` or `pnpm test` from root

## Default AI/integrator instructions (frontend)

- Produce minimal diffs. Respect lint/format/type rules.
- Do not add new UI libs or big dependencies without an ADR.
- New components must include: a small unit test, a usage example (story or example page), and a short a11y note.

## Quick links

- Web app: [`apps/web`](apps/web:1)
- Shared UI: [`packages/ui`](packages/ui:1) (if present)